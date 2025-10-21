import { supabase } from './supabase';
import {
  Item,
  Supplier,
  PendingOrder,
  CurrentOrderMetadata,
  OrderItem
} from '@/types';

export class SupabaseSync {
  private static syncInProgress = false;

  static async syncItems(items: Item[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      for (const item of items) {
        const { error } = await supabase
          .from('items')
          .upsert({
            id: item.id,
            name: item.name,
            khmer_name: item.khmerName,
            supplier: item.supplier,
            measure_unit: item.measureUnit,
            unit_price: item.unitPrice,
            last_ordered: item.lastOrdered,
            order_count: item.orderCount,
            last_held: item.lastHeld,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  static async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      khmerName: row.khmer_name,
      supplier: row.supplier,
      measureUnit: row.measure_unit,
      unitPrice: row.unit_price,
      lastOrdered: row.last_ordered,
      orderCount: row.order_count,
      lastHeld: row.last_held
    }));
  }

  static async syncSuppliers(suppliers: Supplier[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      for (const supplier of suppliers) {
        const { error } = await supabase
          .from('suppliers')
          .upsert({
            id: supplier.id,
            name: supplier.name,
            contact: supplier.contact,
            telegram_id: supplier.telegramId,
            default_payment_method: supplier.defaultPaymentMethod,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  static async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      telegramId: row.telegram_id,
      defaultPaymentMethod: row.default_payment_method
    }));
  }

  static async syncPendingOrders(orders: PendingOrder[]): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      for (const order of orders) {
        const { error } = await supabase
          .from('pending_orders')
          .upsert({
            id: order.id,
            supplier: order.supplier,
            items: order.items,
            status: order.status,
            store_tag: order.storeTag,
            payment_method: order.paymentMethod || 'CASH ON DELIVERY',
            contact_person: order.contactPerson,
            notes: order.notes,
            invoice_url: order.invoiceUrl,
            amount: order.amount,
            is_received: order.isReceived,
            is_paid: order.isPaid,
            completed_at: order.completedAt?.toISOString(),
            created_at: order.createdAt.toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  static async getPendingOrders(): Promise<PendingOrder[]> {
    const { data, error } = await supabase
      .from('pending_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      supplier: row.supplier,
      items: row.items || [],
      status: row.status,
      storeTag: row.store_tag,
      paymentMethod: row.payment_method,
      contactPerson: row.contact_person,
      notes: row.notes,
      invoiceUrl: row.invoice_url,
      amount: row.amount,
      isReceived: row.is_received,
      isPaid: row.is_paid,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  static async syncCurrentOrder(items: OrderItem[], metadata: CurrentOrderMetadata): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const { data: existing } = await supabase
        .from('current_order')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('current_order')
          .update({
            items: items,
            payment_method: metadata.paymentMethod,
            store: metadata.store,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('current_order')
          .insert({
            items: items,
            payment_method: metadata.paymentMethod,
            store: metadata.store
          });

        if (error) throw error;
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  static async getCurrentOrder(): Promise<{ items: OrderItem[]; metadata: CurrentOrderMetadata }> {
    const { data, error } = await supabase
      .from('current_order')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        items: [],
        metadata: { paymentMethod: 'CASH ON DELIVERY' }
      };
    }

    return {
      items: data.items || [],
      metadata: {
        paymentMethod: data.payment_method,
        store: data.store
      }
    };
  }

  static async deletePendingOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('pending_orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  }

  static async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  }

  static async deleteSupplier(supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (error) throw error;
  }
}

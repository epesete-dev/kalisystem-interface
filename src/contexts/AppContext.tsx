import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Supplier, OrderItem, CompletedOrder, PendingOrder, PendingOrderItem, CurrentOrderMetadata } from '@/types';
import { storage } from '@/lib/storage';
import type { StorageData } from '@/lib/storage';
import { parseDefaultData } from '@/lib/dataParser';
import { nanoid } from 'nanoid';
import defaultDataJson from '@/default-data-new.json';
import { SupabaseSync } from '@/lib/supabaseSync';

interface AppContextType {
  items: Item[];
  suppliers: Supplier[];
  currentOrder: OrderItem[];
  currentOrderMetadata: CurrentOrderMetadata;
  completedOrders: CompletedOrder[];
  pendingOrders: PendingOrder[];

  addItem: (item: Omit<Item, 'id'>, customId?: string) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addToOrder: (item: Item, quantity: number, storeTag?: string) => void;
  updateOrderItem: (itemId: string, quantity: number, storeTag?: string) => void;
  removeFromOrder: (itemId: string, storeTag?: string) => void;
  updateOrderMetadata: (metadata: Partial<CurrentOrderMetadata>) => void;
  clearOrder: () => void;
  completeOrder: () => void;

  addPendingOrder: (order: Omit<PendingOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePendingOrder: (id: string, order: Partial<PendingOrder>) => void;
  deletePendingOrder: (id: string) => void;

  exportData: () => any;
  importData: (data: any) => void;
  loadDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [currentOrderMetadata, setCurrentOrderMetadata] = useState<CurrentOrderMetadata>({
    paymentMethod: 'CASH ON DELIVERY',
  });
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [
          dbItems,
          dbSuppliers,
          dbPendingOrders,
          dbCurrentOrder
        ] = await Promise.all([
          SupabaseSync.getItems(),
          SupabaseSync.getSuppliers(),
          SupabaseSync.getPendingOrders(),
          SupabaseSync.getCurrentOrder()
        ]);

        if (dbItems.length > 0) {
          setItems(dbItems);
          setSuppliers(dbSuppliers);
          setPendingOrders(dbPendingOrders);
          setCurrentOrder(dbCurrentOrder.items);
          setCurrentOrderMetadata(dbCurrentOrder.metadata);
        } else {
          loadDefaultData();
        }
      } catch (error) {
        console.error('Failed to load from database:', error);
        loadDefaultData();
      }
      setInitialized(true);
    };

    initializeData();
  }, []);

  // Auto-save to database when data changes
  useEffect(() => {
    if (initialized) {
      SupabaseSync.syncItems(items).catch(console.error);
    }
  }, [items, initialized]);

  useEffect(() => {
    if (initialized) {
      SupabaseSync.syncSuppliers(suppliers).catch(console.error);
    }
  }, [suppliers, initialized]);

  useEffect(() => {
    if (initialized) {
      SupabaseSync.syncPendingOrders(pendingOrders).catch(console.error);
    }
  }, [pendingOrders, initialized]);

  useEffect(() => {
    if (initialized) {
      SupabaseSync.syncCurrentOrder(currentOrder, currentOrderMetadata).catch(console.error);
    }
  }, [currentOrder, currentOrderMetadata, initialized]);

  const loadDefaultData = () => {
    try {
      const parsed = parseDefaultData(defaultDataJson);

      setItems(parsed.items);
      setSuppliers(parsed.suppliers);
    } catch (error) {
      console.error('Failed to load default data:', error);
    }
  };

  // Items
  const addItem = (item: Omit<Item, 'id'>, customId?: string) => {
    setItems(prev => [...prev, { ...item, id: customId || nanoid() }]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    SupabaseSync.deleteItem(id).catch(console.error);
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: nanoid(),
      defaultPaymentMethod: supplier.defaultPaymentMethod || 'CASH ON DELIVERY',
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(sup => sup.id === id ? { ...sup, ...updates } : sup));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(sup => sup.id !== id));
    SupabaseSync.deleteSupplier(id).catch(console.error);
  };

  // Order
  const addToOrder = (item: Item, quantity: number, storeTag?: string) => {
    setCurrentOrder(prev => {
      const existing = prev.find(oi => oi.item.id === item.id && oi.storeTag === storeTag);
      if (existing) {
        return prev.map(oi =>
          oi.item.id === item.id && oi.storeTag === storeTag
            ? { ...oi, quantity: oi.quantity + quantity }
            : oi
        );
      }
      return [...prev, { item, quantity, storeTag }];
    });
  };

  const updateOrderItem = (itemId: string, quantity: number, storeTag?: string) => {
    setCurrentOrder(prev =>
      prev.map(oi => oi.item.id === itemId && oi.storeTag === storeTag ? { ...oi, quantity } : oi)
    );
  };

  const removeFromOrder = (itemId: string, storeTag?: string) => {
    setCurrentOrder(prev => prev.filter(oi => !(oi.item.id === itemId && oi.storeTag === storeTag)));
  };

  const updateOrderMetadata = (metadata: Partial<CurrentOrderMetadata>) => {
    setCurrentOrderMetadata(prev => ({ ...prev, ...metadata }));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setCurrentOrderMetadata({ paymentMethod: 'CASH ON DELIVERY' });
  };

  const completeOrder = () => {
    if (currentOrder.length === 0) return;

    const storeTags = Array.from(new Set(currentOrder.map(oi => oi.storeTag).filter(Boolean))) as string[];

    const completedOrder: CompletedOrder = {
      id: nanoid(),
      items: currentOrder,
      supplier: currentOrder[0]?.item.supplier || '',
      completedAt: new Date(),
      createdAt: new Date(),
    };

    setCompletedOrders(prev => [...prev, completedOrder]);
    setCurrentOrder([]);
    setCurrentOrderMetadata({ paymentMethod: 'CASH ON DELIVERY' });
  };

  // Pending Orders
  const addPendingOrder = (order: Omit<PendingOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingOrder = pendingOrders.find(
      po =>
        po.supplier === order.supplier &&
        po.storeTag === order.storeTag &&
        (po.status === 'pending' || po.status === 'processing')
    );

    if (existingOrder) {
      const mergedItems = [...existingOrder.items];

      order.items.forEach(newItem => {
        const existingItemIndex = mergedItems.findIndex(
          mi => mi.item.id === newItem.item.id
        );

        if (existingItemIndex >= 0) {
          mergedItems[existingItemIndex] = {
            ...mergedItems[existingItemIndex],
            quantity: mergedItems[existingItemIndex].quantity + newItem.quantity
          };
        } else {
          mergedItems.push(newItem);
        }
      });

      updatePendingOrder(existingOrder.id, {
        items: mergedItems,
        updatedAt: new Date()
      });

      return existingOrder.id;
    } else {
      const newOrder: PendingOrder = {
        ...order,
        id: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPendingOrders(prev => [...prev, newOrder]);
      return newOrder.id;
    }
  };

  const updatePendingOrder = (id: string, orderUpdate: Partial<PendingOrder>) => {
    setPendingOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ...orderUpdate, updatedAt: new Date() } : order
      )
    );
  };

  const deletePendingOrder = (id: string) => {
    setPendingOrders(prev => prev.filter(order => order.id !== id));
    SupabaseSync.deletePendingOrder(id).catch(console.error);
  };

  // Import/Export
  const exportData = () => {
    return {
      items,
      suppliers,
      completedOrders,
      pendingOrders,
      currentOrder,
      currentOrderMetadata,
    };
  };

  const importData = (data: StorageData) => {
    if (data.items) setItems(data.items);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.completedOrders) setCompletedOrders(data.completedOrders);
    if (data.pendingOrders) setPendingOrders(data.pendingOrders);
  };

  return (
    <AppContext.Provider
      value={{
        items,
        suppliers,
        currentOrder,
        currentOrderMetadata,
        completedOrders,
        pendingOrders,
        addItem,
        updateItem,
        deleteItem,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addToOrder,
        updateOrderItem,
        removeFromOrder,
        updateOrderMetadata,
        clearOrder,
        completeOrder,
        addPendingOrder,
        updatePendingOrder,
        deletePendingOrder,
        exportData,
        importData,
        loadDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

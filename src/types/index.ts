export type StoreTag = 'cv2' | 'o2' | 'wb' | 'sti' | 'myym' | 'leo';
export const STORE_TAGS: StoreTag[] = ['cv2', 'o2', 'wb', 'sti', 'myym', 'leo'];


export interface Item {
  id: string;
  name: string;
  khmerName?: string | null;
  supplier: string;
  measureUnit?: string | null;
  unitPrice?: number | null;
  lastOrdered?: string | null;
  orderCount?: number;
  lastHeld?: string | null;
}



export const PAYMENT_METHODS = ['CASH ON DELIVERY', 'Aba', 'TrueMoney', 'BANK'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  telegramId?: string | null;
  defaultPaymentMethod?: PaymentMethod;
}


export interface OrderItem {
  item: Item;
  quantity: number;
  storeTag?: StoreTag | string | null;
  isNewItem?: boolean;
}

export interface PendingOrderItem {
  item: Item;
  quantity: number;
  isNewItem?: boolean;
}

export interface PendingOrder {
  id: string;
  supplier: string;
  items: PendingOrderItem[];
  status?: 'pending' | 'processing' | 'completed' | string;
  storeTag?: StoreTag | string | null;
  paymentMethod?: PaymentMethod | null;
  contactPerson?: string | null;
  notes?: string | null;
  invoiceUrl?: string | null;
  amount?: number | null;
  isReceived?: boolean;
  isPaid?: boolean;
  completedAt?: Date | undefined;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CompletedOrder {
  id: string;
  items: PendingOrderItem[];
  supplier: string;
  amount?: number;
  invoiceUrl?: string | null;
  paymentMethod?: PaymentMethod | null;
  contactPerson?: string | null;
  notes?: string | null;
  isReceived?: boolean;
  isPaid?: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CurrentOrderMetadata {
  paymentMethod?: PaymentMethod | null;
  store?: StoreTag | string | null;
}


export type Store = {
  id: string;
  name: string;
  tag: StoreTag;
  isActive: boolean;
}

export const MEASURE_UNITS = ['kg', 'pc', 'can', 'L', 'bt', 'pk', 'jar', 'bag', 'small', 'big'] as const;

export type MeasureUnit = typeof MEASURE_UNITS[number];


export type PendingOrderStatus = 'pending' | 'processing' | 'completed';

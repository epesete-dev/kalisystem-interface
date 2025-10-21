import { Item, Supplier, Store, CompletedOrder, PendingOrder, OrderItem, CurrentOrderMetadata } from '@/types';

export interface StorageData {
  items?: Item[];
  suppliers?: Supplier[];
  completedOrders?: CompletedOrder[];
  pendingOrders?: PendingOrder[];
  stores?: Store[];
}

class StorageManager {
  public exportData(): StorageData {
    return {};
  }

  importData(data: StorageData): void {
  }
}

export const storage = new StorageManager();

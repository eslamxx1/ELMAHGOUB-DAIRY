
import { toast } from '@/components/ui/sonner';

interface DBConfig {
  name: string;
  version: number;
  stores: { name: string; keyPath: string }[];
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbConfig: DBConfig;
  private isInitializing: boolean = false;
  private initPromise: Promise<boolean> | null = null;

  constructor(dbConfig: DBConfig) {
    this.dbConfig = dbConfig;
  }

  /**
   * تهيئة قاعدة البيانات
   */
  async init(): Promise<boolean> {
    if (this.db) {
      return true; // قاعدة البيانات مهيأة بالفعل
    }

    if (this.isInitializing) {
      return this.initPromise as Promise<boolean>;
    }

    this.isInitializing = true;

    this.initPromise = new Promise<boolean>((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbConfig.name, this.dbConfig.version);

        request.onerror = (event) => {
          console.error('خطأ في فتح قاعدة البيانات:', event);
          this.isInitializing = false;
          reject(new Error('فشل في فتح قاعدة البيانات'));
        };

        request.onsuccess = (event) => {
          const target = event.target as IDBOpenDBRequest;
          this.db = target.result;
          console.log('تم فتح قاعدة البيانات بنجاح');
          this.isInitializing = false;
          resolve(true);
        };

        request.onupgradeneeded = (event) => {
          const target = event.target as IDBOpenDBRequest;
          this.db = target.result;

          // إنشاء مخازن البيانات (stores) حسب التكوين
          this.dbConfig.stores.forEach(store => {
            if (!this.db?.objectStoreNames.contains(store.name)) {
              this.db?.createObjectStore(store.name, { keyPath: store.keyPath });
              console.log(`تم إنشاء مخزن البيانات: ${store.name}`);
            }
          });
        };
      } catch (error) {
        console.error('خطأ أثناء تهيئة قاعدة البيانات:', error);
        this.isInitializing = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * حفظ عنصر في مخزن بيانات محدد
   */
  async saveItem<T>(storeName: string, item: T): Promise<boolean> {
    try {
      await this.init();

      return new Promise<boolean>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('قاعدة البيانات غير مهيأة'));
          return;
        }

        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`خطأ في حفظ العنصر في ${storeName}:`, event);
          reject(new Error(`فشل في حفظ العنصر في ${storeName}`));
        };
      });
    } catch (error) {
      console.error(`خطأ أثناء حفظ العنصر في ${storeName}:`, error);
      return false;
    }
  }

  /**
   * استرجاع جميع العناصر من مخزن بيانات محدد
   */
  async getAllItems<T>(storeName: string): Promise<T[]> {
    try {
      await this.init();

      return new Promise<T[]>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('قاعدة البيانات غير مهيأة'));
          return;
        }

        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result as T[]);
        };

        request.onerror = (event) => {
          console.error(`خطأ في استرجاع العناصر من ${storeName}:`, event);
          reject(new Error(`فشل في استرجاع العناصر من ${storeName}`));
        };
      });
    } catch (error) {
      console.error(`خطأ أثناء استرجاع العناصر من ${storeName}:`, error);
      return [];
    }
  }

  /**
   * استرجاع عنصر محدد بواسطة المفتاح
   */
  async getItem<T>(storeName: string, key: string | number): Promise<T | null> {
    try {
      await this.init();

      return new Promise<T | null>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('قاعدة البيانات غير مهيأة'));
          return;
        }

        const transaction = this.db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result as T || null);
        };

        request.onerror = (event) => {
          console.error(`خطأ في استرجاع العنصر من ${storeName}:`, event);
          reject(new Error(`فشل في استرجاع العنصر من ${storeName}`));
        };
      });
    } catch (error) {
      console.error(`خطأ أثناء استرجاع العنصر من ${storeName}:`, error);
      return null;
    }
  }

  /**
   * حذف عنصر من مخزن بيانات محدد بواسطة المفتاح
   */
  async deleteItem(storeName: string, key: string | number): Promise<boolean> {
    try {
      await this.init();

      return new Promise<boolean>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('قاعدة البيانات غير مهيأة'));
          return;
        }

        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          console.error(`خطأ في حذف العنصر من ${storeName}:`, event);
          reject(new Error(`فشل في حذف العنصر من ${storeName}`));
        };
      });
    } catch (error) {
      console.error(`خطأ أثناء حذف العنصر من ${storeName}:`, error);
      return false;
    }
  }

  /**
   * حفظ مجموعة من العناصر في مخزن بيانات محدد (مع مسح المخزن أولاً)
   */
  async saveItems<T>(storeName: string, items: T[]): Promise<boolean> {
    try {
      await this.init();

      return new Promise<boolean>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('قاعدة البيانات غير مهيأة'));
          return;
        }

        const transaction = this.db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // مسح المخزن أولاً
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // حفظ العناصر الجديدة
          let counter = 0;
          items.forEach((item, index) => {
            const request = store.add(item);
            
            request.onsuccess = () => {
              counter++;
              if (counter === items.length) {
                resolve(true);
              }
            };
            
            request.onerror = (event) => {
              console.error(`خطأ في حفظ العنصر ${index} في ${storeName}:`, event);
            };
          });
          
          if (items.length === 0) {
            resolve(true);
          }
        };
        
        clearRequest.onerror = (event) => {
          console.error(`خطأ في مسح مخزن ${storeName}:`, event);
          reject(new Error(`فشل في مسح مخزن ${storeName}`));
        };
      });
    } catch (error) {
      console.error(`خطأ أثناء حفظ العناصر في ${storeName}:`, error);
      return false;
    }
  }

  /**
   * استيراد مجموعة بيانات من ملف JSON
   */
  async importFromJson(jsonData: any): Promise<boolean> {
    try {
      await this.init();
      
      const stores = this.dbConfig.stores.map(store => store.name);
      const promises: Promise<boolean>[] = [];
      
      for (const storeName of stores) {
        if (jsonData[storeName] && Array.isArray(jsonData[storeName])) {
          promises.push(this.saveItems(storeName, jsonData[storeName]));
        }
      }
      
      await Promise.all(promises);
      toast.success('تم استيراد البيانات بنجاح');
      return true;
    } catch (error) {
      console.error('خطأ أثناء استيراد البيانات:', error);
      toast.error('فشل في استيراد البيانات');
      return false;
    }
  }

  /**
   * تصدير جميع البيانات إلى كائن JSON
   */
  async exportToJson(): Promise<{ [key: string]: any }> {
    try {
      await this.init();
      
      const result: { [key: string]: any } = {};
      const stores = this.dbConfig.stores.map(store => store.name);
      
      for (const storeName of stores) {
        result[storeName] = await this.getAllItems(storeName);
      }
      
      return result;
    } catch (error) {
      console.error('خطأ أثناء تصدير البيانات:', error);
      toast.error('فشل في تصدير البيانات');
      return {};
    }
  }
}

// تكوين قاعدة البيانات
const dbConfig: DBConfig = {
  name: 'AlmahgoubDairyDB',
  version: 1,
  stores: [
    { name: 'products', keyPath: 'id' },
    { name: 'routes', keyPath: 'id' },
    { name: 'customers', keyPath: 'id' },
    { name: 'employees', keyPath: 'id' },
    { name: 'salesRecords', keyPath: 'id' },
  ]
};

// إنشاء كائن واحد من خدمة IndexedDB للاستخدام في جميع أنحاء التطبيق
export const indexedDBService = new IndexedDBService(dbConfig);

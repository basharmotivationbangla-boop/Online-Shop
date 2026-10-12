import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  SiteSettings,
  Category,
  Product,
  Order,
  OrderStatus,
  UserProfile,
  AdminStats,
} from '../types/index.ts';

// Default initial settings if not yet saved in Firestore
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  website_name: 'Bashar Shop',
  logo_url: '/src/assets/images/store_logo_mark_1791816215370.jpg',
  store_tagline: 'প্রিমিয়াম লাইফস্টাইল ও বিশ্বস্ত অনলাইন শপিং',
  contact_phone: '+880 1700-000000',
  contact_email: 'support@basharshop.com',
  store_address: 'ঢাকা, বাংলাদেশ',
  delivery_fee: 70,
  banner_title: 'বাশার শপ - আভিজাত্য ও বিশ্বাসের মেলবন্ধন',
  banner_subtitle: 'প্রিমিয়াম কোয়ালিটি পণ্য ও শতভাগ ক্যাশ অন ডেলিভারি সুবিধা সারা বাংলাদেশে। পণ্য হাতে পেয়ে নিশ্চিত হয়ে মূল্য পরিশোধ করুন।',
  banner_active: true,
  announcement: 'স্বাগতম বাশার শপ-এ! ক্যাশ অন ডেলিভারিতে দ্রুততম হোম ডেলিভারি সারা দেশে।',
};

// ================= SITE SETTINGS =================
export async function getSiteSettings(): Promise<SiteSettings> {
  const path = 'site_settings/global';
  try {
    const docRef = doc(db, 'site_settings', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (error) {
    console.warn('Failed to fetch site settings, using defaults:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const path = 'site_settings/global';
  try {
    const docRef = doc(db, 'site_settings', 'global');
    const existing = await getSiteSettings();
    const updated: SiteSettings = {
      ...existing,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    await setDoc(docRef, updated, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= CATEGORIES =================
export async function getCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const colRef = collection(db, 'categories');
    const snap = await getDocs(colRef);
    const list: Category[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Category);
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<string> {
  const path = 'categories';
  try {
    const id = doc(collection(db, 'categories')).id;
    const newCat: Category = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    await setDoc(doc(db, 'categories', id), newCat);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const path = `categories/${id}`;
  try {
    await updateDoc(doc(db, 'categories', id), {
      ...data,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= PRODUCTS =================
export async function getProducts(onlyActive = true): Promise<Product[]> {
  const path = 'products';
  try {
    const colRef = collection(db, 'products');
    let q;
    if (onlyActive) {
      q = query(colRef, where('is_active', '==', true));
    } else {
      q = colRef;
    }
    const snap = await getDocs(q);
    const list: Product[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Product);
    });
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const path = `products/${id}`;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createProduct(data: Omit<Product, 'id' | 'created_at'>): Promise<string> {
  const path = 'products';
  try {
    const id = doc(collection(db, 'products')).id;
    const newProduct: Product = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };
    await setDoc(doc(db, 'products', id), newProduct);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    await updateDoc(doc(db, 'products', id), {
      ...data,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= ORDERS =================
export function generateOrderNumber(): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BS-${random}`;
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'order_number' | 'status' | 'created_at'>
): Promise<{ orderId: string; orderNumber: string }> {
  const path = 'orders';
  const orderNumber = generateOrderNumber();
  const orderId = doc(collection(db, 'orders')).id;

  try {
    // Perform transaction to safely deduct stock and record order
    await runTransaction(db, async (transaction) => {
      // 1. Check stock for each ordered item
      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.product_id);
        const prodSnap = await transaction.get(productRef);
        if (prodSnap.exists()) {
          const currentStock = prodSnap.data().stock_quantity || 0;
          if (currentStock < item.quantity) {
            throw new Error(`পণ্য '${item.product_name_snapshot}' এর পর্যাপ্ত স্টক নেই (বর্তমান স্টক: ${currentStock})`);
          }
          const newStock = Math.max(0, currentStock - item.quantity);
          transaction.update(productRef, {
            stock_quantity: newStock,
            updated_at: new Date().toISOString(),
          });
        }
      }

      // 2. Create the order
      const newOrder: Order = {
        ...orderData,
        id: orderId,
        order_number: orderNumber,
        status: 'Pending',
        created_at: new Date().toISOString(),
      };

      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, newOrder);
    });

    return { orderId, orderNumber };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, 'orders'));
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Order);
    });
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const path = 'orders';
  try {
    const q = query(
      collection(db, 'orders'),
      where('customer_id', '==', customerId)
    );
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Order);
    });
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ================= CUSTOMER PROFILES =================
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `profiles/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Profile fetch warning:', error);
    return null;
  }
}

export async function saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const path = `profiles/${uid}`;
  try {
    await setDoc(
      doc(db, 'profiles', uid),
      {
        ...data,
        id: uid,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= STATS FOR ADMIN =================
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [prodSnap, orderSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders')),
    ]);

    let totalProducts = 0;
    let publishedProducts = 0;
    prodSnap.forEach((d) => {
      totalProducts++;
      const data = d.data();
      if (data.is_active) publishedProducts++;
    });

    let totalOrders = 0;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;

    orderSnap.forEach((d) => {
      totalOrders++;
      const o = d.data() as Order;
      if (o.status === 'Pending') pendingOrders++;
      else if (o.status === 'Confirmed') confirmedOrders++;
      else if (o.status === 'Delivered') {
        deliveredOrders++;
        totalRevenue += o.total_amount || 0;
      } else if (o.status === 'Cancelled') cancelledOrders++;
    });

    return {
      totalProducts,
      publishedProducts,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return {
      totalProducts: 0,
      publishedProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
    };
  }
}

import type { CartItem } from "@/types/product";

export interface LocalUser {
  name: string;
  phone: string;
  instansi?: string;
  address?: string;
  updatedAt: string;
}

export interface LocalOrder {
  invoiceNumber: string;
  customerName: string;
  phoneNumber: string;
  instansi?: string;
  address: string;
  isShipping: boolean;
  designNote?: string;
  promoCode?: string;
  promoDiscount: number;
  total: number;
  subtotal: number;
  cartItems: CartItem[];
  timestamp: string;
  status: 'unpaid' | 'paid';
  whatsappUrl: string;
}

const LOCAL_USER_KEY = 'tidurlah_local_user';
const LOCAL_ORDERS_KEY = 'tidurlah_local_orders';

/**
 * Retrieve saved local user profile.
 */
export function getLocalUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('[localOrders] Failed to parse local user:', err);
    return null;
  }
}

/**
 * Save or update local user profile.
 */
export function saveLocalUser(user: Omit<LocalUser, 'updatedAt'>): void {
  try {
    const data: LocalUser = {
      ...user,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[localOrders] Failed to save local user:', err);
  }
}

/**
 * Retrieve saved local orders list (sorted newest first).
 */
export function getLocalOrders(): LocalOrder[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.error('[localOrders] Failed to parse local orders:', err);
    return [];
  }
}

/**
 * Add a new order to the local storage list.
 */
export function addLocalOrder(order: LocalOrder): void {
  try {
    const current = getLocalOrders();
    // Prepend new order, remove duplicate if invoice matches
    const filtered = current.filter((o) => o.invoiceNumber !== order.invoiceNumber);
    const updated = [order, ...filtered];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[localOrders] Failed to save local order:', err);
  }
}

/**
 * Clear all local order history.
 */
export function clearLocalOrders(): void {
  try {
    localStorage.removeItem(LOCAL_ORDERS_KEY);
  } catch (err) {
    console.error('[localOrders] Failed to clear local orders:', err);
  }
}

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Reservation {
  id: number;
  user_id: number;
  date: string;           // "YYYY-MM-DD"
  time: string;           // "HH:MM:SS"
  guests: number;         // 1–4
  status: 'pending' | 'confirmed' | 'canceled';
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationPayload {
  date: string;           // "YYYY-MM-DD"
  time: string;           // "HH:MM"
  guests: number;
  special_requests?: string;
}

export interface Plate {
  id: number;
  name: string;
  short_desc: string;
  desc: string | null;
  old_price: number | null;
  price: number;
  discount: number;
  image_path: string | null;
  image_url: string | null;
  status: boolean;
  category_id: number;
}

export interface PlateWithCategory extends Plate {
  category: {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

export interface ToggleFavoriteResponse {
  plate_id: number;
  is_favorite: boolean;
}

// ─── Order Types & Endpoints ──────────────────────────────────────────────────

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing'
  | 'out_for_delivery' | 'delivered' | 'cancelled';

export type PaymentMethod  = 'stripe' | 'cod';
export type PaymentStatus  = 'pending' | 'paid' | 'failed';

export interface OrderPlateItem {
  id: number;
  order_id: number;
  plate_id: number | null;
  plate_name: string;
  category_name: string | null;
  plate_price: number;
  plate_old_price: number | null;
  discount: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  delivery_address: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  shipping: number;
  final_total: number;
  plates: OrderPlateItem[];
  created_at: string;
  updated_at: string;
}

export interface PlaceOrderPayload {
  delivery_address: string;
  payment_method: PaymentMethod;
  stripe_payment_intent_id?: string;
  items: { plate_id: number; quantity: number }[];
}


export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// ─── Reservation endpoint ──────────────────────────────────────────────────────────────────

export const reservationApi = {
  /** GET /user/reservations — authenticated user's reservations */
  getMyReservations: () =>
    api.get<ApiResponse<Reservation[]>>('/user/reservations').then(r => r.data),

  /** POST /user/reservations */
  store: (payload: ReservationPayload) =>
    api.post<ApiResponse<Reservation>>('/user/reservations', payload).then(r => r.data),

  /** DELETE /user/reservations/{id} — cancels the reservation */
  cancel: (id: number) =>
    api.delete<ApiResponse<null>>(`/user/reservations/${id}`).then(r => r.data),
};

// ─── favorites Endpoints ───────────────────────────────────────────────

export const favoritesApi = {
  /** GET /user/favorites — returns the authenticated user's favorite plates */
  getAll: () =>
    api.get<ApiResponse<PlateWithCategory[]>>('/user/favorites').then(r => r.data),

  /** POST /user/favorites/toggle — add or remove a plate */
  toggle: (plateId: number) =>
    api.post<ApiResponse<ToggleFavoriteResponse>>('/user/favorites/toggle', { plate_id: plateId }).then(r => r.data),
};

// ─── Order Endpoints ───────────────────────────────────────────────

export const orderApi = {
  /** POST /user/orders/payment-intent */
  createPaymentIntent: (amount: number) =>
    api.post<ApiResponse<{ client_secret: string }>>('/user/orders/payment-intent', { amount }).then(r => r.data),

  /** POST /user/orders */
  place: (payload: PlaceOrderPayload) =>
    api.post<ApiResponse<Order>>('/user/orders', payload).then(r => r.data),

  /** GET /user/orders */
  getAll: () =>
    api.get<ApiResponse<Order[]>>('/user/orders').then(r => r.data),

  /** GET /user/orders/:id */
  getOne: (id: number) =>
    api.get<ApiResponse<Order>>(`/user/orders/${id}`).then(r => r.data),
};

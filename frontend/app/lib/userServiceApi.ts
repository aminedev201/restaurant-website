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
  plate: { image_url: string | null } | null; 
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

export interface User {
  id: number;
  fullname: string;
  email: string;
  email_verified_at: string | null;
  phone: string;
  role: 'user' | 'admin';
  status: boolean;
  avatar_path: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Stats Types ──────────────────────────────────────────────────────────────
// Add these types alongside the existing ones in userServiceApi.ts

export interface UpcomingReservation {
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed';
}

export interface RecentReservation {
  id: number;
  date: string;
  time: string;
  guests: number;
  status: string;
  special_requests: string | null;
}

export interface DashboardStats {
  reservations: {
    total: number;
    upcoming: UpcomingReservation | null;
    recent: RecentReservation[];
  };
  orders: {
    active: number;
    total: number;
    spent: number;
  };
}

export interface Testimonial {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    fullname: string;
    avatar_url: string | null;
  };
}

export interface ApiResponse<T> {
  status: boolean;
  success:boolean;
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

// ─── Favorite Endpoints ───────────────────────────────────────────────

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

// ─── Profile Endpoints ───────────────────────────────────────────────

export const profileApi = {
  /** GET /admin/profile */
  get: () =>
    api.get<ApiResponse<User>>('/user/profile').then(r => r.data),

  /** POST /user/profile (_method=PUT multipart workaround) */
  update: (formData: FormData) => {
    formData.append('_method', 'PUT');
    return api.post<ApiResponse<User>>('/user/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  /** POST /user/change-avatar (_method=PATCH multipart workaround) */
  changeAvatar: (formData: FormData) => {
    formData.append('_method', 'PATCH');
    return api.post<ApiResponse<User>>('/user/profile/change-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** PUT /user/profile/change-password */
  changePassword: (current_password: string, password: string, password_confirmation: string) =>
    api.put<ApiResponse<null>>('/user/profile/change-password', {
      current_password,
      password,
      password_confirmation,
    }).then(r => r.data),

  /** DELETE /user/profile */
  deleteAccount: () =>
    api.delete<ApiResponse<null>>('/user/profile').then(r => r.data),
  /** DELETE /user/profile/delete-avatar */
  deleteAvatar: () =>
    api.delete<ApiResponse<null>>('/user/profile/delete-avatar').then(r => r.data),
};

// ─── Stats Endpoint ───────────────────────────────────────────────────────────

export const statsApi = {
  /** GET /user/stats */
  getDashboard: () =>
    api.get<ApiResponse<DashboardStats>>('/user/stats').then(r => r.data),
};

// ─── Testimonials Endpoint ───────────────────────────────────────────────────────────
export const testimonialsApi = {
  /** POST /user/testimonials — authenticated user submits review */
  store: (payload: { rating: number; comment: string }) =>
    api.post<ApiResponse<Testimonial>>('/user/testimonials', payload).then(r => r.data),
  mine: () =>
    api.get<ApiResponse<{ exists: boolean }>>('/user/testimonials/mine').then(r => r.data),
};
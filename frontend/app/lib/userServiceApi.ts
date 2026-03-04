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

// lib/adminServiceApi.ts

import api from './api';


// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkingDay {
  open: string;   // "09:00"
  close: string;  // "18:00"
  closed?: boolean;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  logo: string | null;
  logo_url: string | null;
  address: string | null;
  location_url: string | null;
  phones: string[] | null;
  emails: string[] | null;
  working_datetime: Record<string, WorkingDay> | null;
  social_media?: Record<string, string> | string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  status: boolean;
  description: string | null;
  image_path: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Plate {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  short_desc: string | null;
  desc: string | null;
  old_price: number | null;
  price: number;
  discount: number | null;
  image_path: string;
  image_url: string;
  status: boolean;
  created_at: string;
  updated_at: string;
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


export interface ReservationWithUser extends Reservation {
  user: {
    id: number;
    fullname: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Category endpoints ───────────────────────────────────────────────────────

export const categoryApi = {
  /** GET /admin/categories */
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/admin/categories').then(r => r.data),

  /** GET /admin/categories/active-cats */
  getActiveCats: () =>
    api.get<ApiResponse<Category[]>>('/admin/categories/active-cats').then(r => r.data),

  /** GET /admin/categories/:id */
  getOne: (id: number) =>
    api.get<ApiResponse<Category>>(`/admin/categories/${id}`).then(r => r.data),

  /** POST /admin/categories (multipart/form-data) */
  create: (formData: FormData) =>
    api.post<ApiResponse<Category>>('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** POST /admin/categories/:id  (_method=PUT multipart workaround) */
  update: (id: number, formData: FormData) => {
    formData.append('_method', 'PUT');
    return api.post<ApiResponse<Category>>(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** DELETE /admin/categories/:id */
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/categories/${id}`).then(r => r.data),

  /** DELETE /admin/categories/all */
  deleteAll: () =>
    api.delete<ApiResponse<null>>('/admin/categories/all').then(r => r.data),

  /** DELETE /admin/categories/selected */
  deleteSelected: (ids: number[]) =>
    api.delete<ApiResponse<{ deleted_count: number }>>('/admin/categories/selected', {
      data: { ids },
    }).then(r => r.data),
};

// ─── Plate endpoints ──────────────────────────────────────────────────────────

export const plateApi = {
  /** GET /admin/plates */
  getAll: () =>
    api.get<ApiResponse<Plate[]>>('/admin/plates').then(r => r.data),

  /** GET /admin/plates/:id */
  getOne: (id: number) =>
    api.get<ApiResponse<Plate>>(`/admin/plates/${id}`).then(r => r.data),

  /** POST /admin/plates (multipart/form-data) */
  create: (formData: FormData) =>
    api.post<ApiResponse<Plate>>('/admin/plates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** POST /admin/plates/:id  (_method=PUT multipart workaround) */
  update: (id: number, formData: FormData) => {
    formData.append('_method', 'PUT');
    return api.post<ApiResponse<Plate>>(`/admin/plates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** DELETE /admin/plates/:id */
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/plates/${id}`).then(r => r.data),

  /** DELETE /admin/plates/all */
  deleteAll: () =>
    api.delete<ApiResponse<null>>('/admin/plates/all').then(r => r.data),

  /** DELETE /admin/plates/selected */
  deleteSelected: (ids: number[]) =>
    api.delete<ApiResponse<{ deleted_count: number }>>('/admin/plates/selected', {
      data: { ids },
    }).then(r => r.data),
};

// ─── User endpoints ───────────────────────────────────────────────────────────

export const userApi = {
  /** GET /admin/users — returns all users with role=user */
  getAll: () =>
    api.get<ApiResponse<User[]>>('/admin/users').then(r => r.data),

  /** PATCH /admin/users/:id/status — toggle active/inactive */
  updateStatus: (id: number, status: boolean) =>
    api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status }).then(r => r.data),
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const adminApi = {
  /** GET /admin/admins — returns all admins (excludes currently logged-in admin) */
  getAll: () =>
    api.get<ApiResponse<User[]>>('/admin/admins').then(r => r.data),

  /** GET /admin/admins/:id */
  getOne: (id: number) =>
    api.get<ApiResponse<User>>(`/admin/admins/${id}`).then(r => r.data),

  /** POST /admin/admins (multipart/form-data) */
  create: (formData: FormData) =>
    api.post<ApiResponse<User>>('/admin/admins', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** POST /admin/admins/:id (_method=PUT multipart workaround) */
  update: (id: number, formData: FormData) => {
    formData.append('_method', 'PUT');
    return api.post<ApiResponse<User>>(`/admin/admins/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** PATCH /admin/admins/:id/status — toggle active/inactive */
  updateStatus: (id: number, status: boolean) =>
    api.patch<ApiResponse<User>>(`/admin/admins/${id}/status`, { status }).then(r => r.data),

  /** PUT /admin/admins/:id/change-password */
  changePassword: (id: number, password: string, password_confirmation: string) =>
    api.put<ApiResponse<null>>(`/admin/admins/${id}/change-password`, {
      password,
      password_confirmation,
    }).then(r => r.data),

  /** DELETE /admin/admins/:id */
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/admins/${id}`).then(r => r.data),

  /** DELETE /admin/admins/all */
  deleteAll: () =>
    api.delete<ApiResponse<null>>('/admin/admins/all').then(r => r.data),

  /** DELETE /admin/admins/selected */
  deleteSelected: (ids: number[]) =>
    api.delete<ApiResponse<{ deleted_count: number }>>('/admin/admins/selected', {
      data: { ids },
    }).then(r => r.data),
};

// ─── Profile endpoints (logged-in admin's own account) ────────────────────────

export const profileApi = {
  /** GET /admin/profile */
  get: () =>
    api.get<ApiResponse<User>>('/admin/profile').then(r => r.data),

  /** POST /admin/profile (_method=PUT multipart workaround) */
  update: (formData: FormData) => {
    formData.append('_method', 'PUT');
    return api.post<ApiResponse<User>>('/admin/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  /** POST /admin/change-avatar (_method=PATCH multipart workaround) */
  changeAvatar: (formData: FormData) => {
    formData.append('_method', 'PATCH');
    return api.post<ApiResponse<User>>('/admin/profile/change-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  /** PUT /admin/profile/change-password */
  changePassword: (current_password: string, password: string, password_confirmation: string) =>
    api.put<ApiResponse<null>>('/admin/profile/change-password', {
      current_password,
      password,
      password_confirmation,
    }).then(r => r.data),

  /** DELETE /admin/profile */
  deleteAccount: () =>
    api.delete<ApiResponse<null>>('/admin/profile').then(r => r.data),
  /** DELETE /admin/profile/delete-avatar */
  deleteAvatar: () =>
    api.delete<ApiResponse<null>>('/admin/profile/delete-avatar').then(r => r.data),
};

// ─── Company endpoints ────────────────────────────────────────────────────────

export const companyApi = {
  /** GET /admin/company */
  get: () =>
    api.get<ApiResponse<Company | null>>('/admin/company').then(r => r.data),

  /** POST /admin/company (create or update — single row) */
  save: (formData: FormData) =>
    api.post<ApiResponse<Company>>('/admin/company', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** POST /admin/company/logo — replace logo only */
  changeLogo: (formData: FormData) =>
    api.post<ApiResponse<Company>>('/admin/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** DELETE /admin/company/logo — remove logo */
  deleteLogo: () =>
    api.delete<ApiResponse<Company>>('/admin/company/logo').then(r => r.data),
};

// ─── Contact Message endpoints ────────────────────────────────────────────────────────

export const contactMessagesApi = {
  /** GET /admin/contact-messages */
  getAll: () =>
    api.get<ApiResponse<ContactMessage[]>>('/admin/contact-messages').then(r => r.data),

  /** GET /admin/contact-messages/{id}/read */
  read: (id: number) =>
    api.post<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}/read`).then(r => r.data),

  /** GET /admin/contact-messages/{id}*/
  show: (id: number) =>
    api.get<ApiResponse<ContactMessage>>(`/admin/contact-messages/${id}`).then(r => r.data),

  /** DELETE /admin/contact-messages/{id} */
  destroy: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/contact-messages/${id}`).then(r => r.data),

  /** DELETE /admin/contact-messages/destroy-selected */
  destroySelected: (ids: number[]) =>
    api.delete<ApiResponse<{ deleted_count: number }>>('/admin/contact-messages/destroy-selected', {
      data: { ids },
    }).then(r => r.data),
};

// ─── Reservation endpoints ────────────────────────────────────────────────────────

export const ReservationApi = {
  /** GET /admin/reservations */
  getAll: (params?: { status?: string; date?: string }) =>
    api.get<ApiResponse<ReservationWithUser[]>>('/admin/reservations', { params }).then(r => r.data),

  /** GET /admin/reservations/{id} */
  show: (id: number) =>
    api.get<ApiResponse<ReservationWithUser>>(`/admin/reservations/${id}`).then(r => r.data),

  /** PATCH /admin/reservations/{id} */
  update: (id: number, data: Partial<ReservationPayload & { status: Reservation['status'] }>) =>
    api.patch<ApiResponse<ReservationWithUser>>(`/admin/reservations/${id}`, data).then(r => r.data),

  /** DELETE /admin/reservations/{id} */
  destroy: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/reservations/${id}`).then(r => r.data),

  /** DELETE /admin/reservations/destroy-selected */
  destroySelected: (ids: number[]) =>
    api.delete<ApiResponse<{ deleted_count: number }>>('/admin/reservations/destroy-selected', {
      data: { ids },
    }).then(r => r.data),

};
import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkingDay {
  open: string;
  close: string;
  closed?: boolean;
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

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
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

// ─── Menu Types ───────────────────────────────────────────────────────────────

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

export interface MenuCategory {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  image_path: string | null;
  image_url: string | null;
  plates: Plate[];
}

// ─── Settings Types & Endpoints ───────────────────────────────────────────────

export interface Settings {
  id: number;
  shipping: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// ─── Company endpoints ────────────────────────────────────────────────────────

export const companyApi = {
  /** GET /public/company */
  get: () =>
    api.get<ApiResponse<Company | null>>('/public/company').then(r => r.data),
};

// ─── Contact message endpoint ─────────────────────────────────────────────────

export const contactApi = {
  /** POST /public/contact */
  send: (payload: ContactMessagePayload) =>
    api.post<ApiResponse<ContactMessage>>('/public/contact', payload).then(r => r.data),
};

// ─── Menu endpoints ───────────────────────────────────────────────────────────

export const menuApi = {
  /** GET /public/menu — returns all active categories with their active plates */
  getMenu: () =>
    api.get<ApiResponse<MenuCategory[]>>('/public/menu').then(r => r.data),

  /** GET /public/menu/:id — returns a single plate with its category */
  getPlateDetails: (id: number) =>
    api.get<ApiResponse<PlateWithCategory>>(`/public/menu/${id}`).then(r => r.data),
};

// ─── Settings Endpoints ───────────────────────────────────────────────

export const settingsApi = {
  /** GET /public/settings */
  get: () =>
    api.get<ApiResponse<Settings>>('/public/settings').then(r => r.data),
};
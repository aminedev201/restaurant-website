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

export interface Settings {
  id: number;
  shipping: number;
  created_at: string;
  updated_at: string;
}



export interface PublicChef {
  id:           number;
  fullname:     string;
  position:     string;
  image_url:    string | null;
  short_desc:   string | null;
  social_media: Record<string, string> | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  status: boolean;
  image_path: string | null;
  image_url: string | null;
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
  message: string;
  data: T;
}

// ─── Categories endpoints ────────────────────────────────────────────────────────

export const categoriesApi = {
  /** GET /public/categories */
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/public/categories').then(r => r.data),
};

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

// ─── Chef endpoints ───────────────────────────────────────────────────────────

export const chefsApi = {
  /** GET /public/chefs */
  getAll: () =>
    api.get<ApiResponse<PublicChef[]>>('/public/chefs').then(r => r.data),
};

// ─── Latest plates endpoint ───────────────────────────────────────────────────

export const latestPlatesApi = {
  /** GET /public/plates/latest */
  get: () =>
    api.get<ApiResponse<PlateWithCategory[]>>('/public/plates/latest').then(r => r.data),
};

export const testimonialsApi = {
  /** GET /public/testimonials — last 9 approved */
  getAll: () =>
    api.get<ApiResponse<Testimonial[]>>('/public/testimonials').then(r => r.data),
};
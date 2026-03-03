export interface User {
  id: number;
  fullname: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: boolean;
  role: 'admin' | 'user';
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  badge?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  table_number?: number;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  reservation_id?: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  email_verified?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
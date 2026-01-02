export type Orders = {
  id_order?: string;
  created_at?: string; // VIENEN CREADOS DESDE LA BASE DE DATOS
  payment_method: string;
  delivery_mode: string;
  price: number;
  status: string;
  order_notes?: string | null;
  local: string;
  name: string;
  phone: number;
  email: string;
  address: string | null;
  coupon?: string | null;
  fries?: string | null;
  drinks?: string | null;
  products: string[] // Puede venir como array de strings, array de objetos, o string JSON
  dailySequenceNumber?: number; // Número secuencial diario para pedidos en preparación
};

export type ProductsOrder = {
  name?: string;
  nombre?: string;
  product_name?: string;
  quantity?: number;
  sin?: string[];
  fries?: string;
  price?: number;
  size?: string;
  selectedOptions?: string[];
  selected_options?: string[];
};

export type SessionUser = {
  id: string;
  username: string;
  local: string;
  rol: string;
};

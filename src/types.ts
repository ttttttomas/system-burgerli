export type Order = {
  id: string;
  combo?: string;
  user_client: string;
  payment_method: string;
  delivery_mode: string;
  price: number;
  status: string;
  coupon?: string;
  order_notes?: string;
  local: string;
  burgers: string;
  fries: string;
  drinks: string;
  sin: string;
  extras: string;
};

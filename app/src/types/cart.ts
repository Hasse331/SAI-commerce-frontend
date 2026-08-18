export interface Money {
  amount: string;
  currencyCode: string;
}

export interface CartLine {
  id: string;
  merchandiseId: string;
  quantity: number;
  title: string;
  slug: string;
  image: { src: string; alt: string } | null;
  unitPrice: Money;
  totalPrice: Money;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
}

export type PublicCart = Omit<Cart, "id">;

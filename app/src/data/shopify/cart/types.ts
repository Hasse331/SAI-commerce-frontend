export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
  };
  merchandise: ShopifyProductVariant;
}

export interface ShopifyProductVariant {
  id: string;
  price: ShopifyMoney;
  image: {
    url: string;
    altText: string | null;
  } | null;
  product: {
    handle: string;
    title: string;
  };
}

export interface ShopifyCartUserError {
  code: string | null;
  message: string;
}

export interface ShopifyCartMutationPayload {
  cart: ShopifyCart | null;
  userErrors: ShopifyCartUserError[];
}

import type { Cart, CartLine, Money } from "@/types/cart";
import type { ShopifyCart, ShopifyMoney } from "./types";

function mapMoney(money: ShopifyMoney): Money {
  return {
    amount: money.amount,
    currencyCode: money.currencyCode,
  };
}

function mapShopifyCartLine(cartLine: ShopifyCart["lines"]["nodes"][number]): CartLine {
  const variant = cartLine.merchandise;

  return {
    id: cartLine.id,
    merchandiseId: variant.id,
    quantity: cartLine.quantity,
    title: variant.product.title,
    slug: variant.product.handle,
    image: variant.image
      ? {
          src: variant.image.url,
          alt: variant.image.altText ?? "",
        }
      : null,
    unitPrice: mapMoney(variant.price),
    totalPrice: mapMoney(cartLine.cost.totalAmount),
  };
}

export function mapShopifyCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    subtotal: mapMoney(cart.cost.subtotalAmount),
    total: mapMoney(cart.cost.totalAmount),
    lines: cart.lines.nodes.map(mapShopifyCartLine),
  };
}

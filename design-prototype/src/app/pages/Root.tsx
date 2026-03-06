import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { CartProvider } from "../context/CartContext";

export function Root() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

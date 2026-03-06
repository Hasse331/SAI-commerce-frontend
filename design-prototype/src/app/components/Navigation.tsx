import { Link, useLocation } from "react-router";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navigation() {
  const location = useLocation();
  const { items, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/configure", label: "Configure" },
    { to: "/craft", label: "The Craft" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-primary border border-primary/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#b8975f] to-primary opacity-70"></div>
            </div>
            <span className="text-xl tracking-[0.2em] font-light">RESONANCE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm tracking-[0.15em] uppercase transition-all hover:text-primary relative group ${
                  location.pathname === link.to
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-primary transition-all ${
                  location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/30"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/30"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary/30 bg-black/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm tracking-[0.15em] uppercase transition-colors ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

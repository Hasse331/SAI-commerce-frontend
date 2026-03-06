import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, total } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-primary/30 z-50 shadow-2xl flex flex-col"
          >
            {/* Decorative line */}
            <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-primary/30 relative">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg tracking-wider uppercase">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-primary/10 rounded-sm transition-colors border border-transparent hover:border-primary/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm tracking-wider">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 pb-6 border-b border-primary/20 last:border-0">
                      <div className="relative">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover border border-primary/20"
                        />
                        <div className="absolute inset-0 border border-primary/0 hover:border-primary/40 transition-all pointer-events-none" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm mb-1 truncate">{item.product.name}</h3>
                        <p className="text-sm text-primary mb-3">
                          ${item.product.price.toLocaleString()} <span className="text-xs text-muted-foreground">{item.product.currency}</span>
                        </p>
                        
                        {/* Customization */}
                        {item.customization && (
                          <div className="text-xs text-muted-foreground mb-3 space-y-1 bg-secondary/30 p-2 border border-primary/10">
                            {Object.entries(item.customization).map(([key, value]) => (
                              value && (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                                  <span className="capitalize">{key}:</span>
                                  <span className="text-foreground/80">{value}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-primary/10 border border-primary/30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-primary/10 border border-primary/30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors tracking-wider uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-primary/30 p-6 space-y-4 relative bg-gradient-to-t from-black/30 to-transparent">
                {/* Decorative line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm tracking-wider uppercase text-muted-foreground">Total</span>
                  <span className="text-2xl text-primary">${total.toLocaleString()} <span className="text-sm text-muted-foreground">USD</span></span>
                </div>
                <Button className="w-full vintage-glow" size="lg">
                  Proceed to Checkout
                </Button>
                <p className="text-xs text-center text-muted-foreground tracking-wider">
                  Shipping and taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

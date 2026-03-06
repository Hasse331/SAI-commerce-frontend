import { useParams, Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Check, Wand2, ShoppingCart, Zap } from "lucide-react";
import { getProductById } from "../data/products";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = id ? getProductById(id) : undefined;
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Product Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden border border-primary/20 mb-6 group"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] md:h-[650px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/40 transition-all duration-500" />
              
              {/* Vintage corner decorations */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/40"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/40"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40"></div>
            </motion.div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative overflow-hidden border transition-all ${
                      selectedImage === index
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-primary/20 opacity-60 hover:opacity-100 hover:border-primary/40"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-xs text-primary mb-4 tracking-[0.2em] uppercase flex items-center gap-2">
              <Zap className="w-3 h-3" />
              {product.category}
            </div>
            <h1 className="text-4xl md:text-6xl mb-6 leading-tight">{product.name}</h1>
            <p className="text-2xl text-foreground/70 mb-8 font-light italic">
              {product.tagline}
            </p>
            
            <div className="mb-10 pb-8 border-b border-primary/30">
              <div className="text-sm text-muted-foreground mb-2 tracking-wider uppercase">Starting at</div>
              <div className="text-5xl text-primary mb-2">
                ${product.price.toLocaleString()}
              </div>
              <span className="text-lg text-muted-foreground">{product.currency}</span>
            </div>

            <div className="flex flex-col gap-4 mb-10">
              <Button
                size="lg"
                className="w-full text-base px-8 vintage-glow"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                Add to Cart
              </Button>
              {product.customizable && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full text-base px-8"
                >
                  <Link to="/configure">
                    <Wand2 className="mr-2 w-5 h-5" />
                    Customize This Product
                  </Link>
                </Button>
              )}
            </div>

            <div className="border-t border-b border-primary/30 py-8 mb-10">
              <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl mb-6 tracking-wide flex items-center gap-2">
                <div className="w-1 h-6 bg-primary"></div>
                Key Features
              </h3>
              <ul className="space-y-4 bg-secondary/30 p-6 border border-primary/10">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* The Story */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-8">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">The Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-8">Crafted with Purpose</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {product.story}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <div className="inline-block mb-8">
                <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Specifications</span>
              </div>
              <h2 className="text-4xl md:text-5xl mb-4">Technical Details</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {product.specs.map((spec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="flex justify-between items-center p-6 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all"
                >
                  <span className="text-sm text-muted-foreground tracking-wider">{spec.label}</span>
                  <span className="font-medium text-foreground/90">{spec.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl mb-8">Explore More</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover our complete collection of handcrafted audio components
            </p>
            <Button asChild size="lg" variant="outline" className="px-10">
              <Link to="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

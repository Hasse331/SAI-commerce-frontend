import { Link } from "react-router";
import { motion } from "motion/react";
import { products } from "../data/products";
import { ArrowRight, Zap } from "lucide-react";

export function Products() {
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="min-h-screen py-24 px-4 relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-6">
            <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Complete Range</span>
          </div>
          <h1 className="text-5xl md:text-7xl mb-8">Our Collection</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each piece represents countless hours of research, development, and meticulous craftsmanship—
            a perfect union of vintage soul and modern precision
          </p>
        </motion.div>

        {/* Products by Category */}
        {categories.map((category, categoryIndex) => {
          const categoryProducts = products.filter((p) => p.category === category);
          
          return (
            <section key={category} className="mb-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <div className="mb-12 pb-6 border-b border-primary/30 relative">
                  <div className="absolute bottom-0 left-0 w-24 h-[2px] bg-primary"></div>
                  <h2 className="text-3xl md:text-5xl text-primary tracking-tight flex items-center gap-3">
                    <Zap className="w-8 h-8" />
                    {category}
                  </h2>
                </div>

                <div className="space-y-20">
                  {categoryProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/products/${product.id}`}
                        className="grid md:grid-cols-5 gap-8 md:gap-12 items-start group"
                      >
                        {/* Image - Takes 3 columns */}
                        <div className="md:col-span-3 relative overflow-hidden border border-primary/20">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-[400px] md:h-[550px] object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/40 transition-all duration-500" />
                          
                          {/* Vintage corner decorations */}
                          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {product.customizable && (
                            <div className="absolute top-6 right-6 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 border border-primary/40 text-xs tracking-[0.15em] uppercase">
                              Customizable
                            </div>
                          )}
                        </div>

                        {/* Content - Takes 2 columns */}
                        <div className="md:col-span-2 md:pt-4">
                          <h3 className="text-3xl md:text-4xl mb-4 group-hover:text-primary transition-colors leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-xl text-foreground/70 mb-6 font-light italic">
                            {product.tagline}
                          </p>
                          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Key Specs */}
                          <div className="space-y-3 mb-8 bg-secondary/30 p-4 border border-primary/10">
                            {product.specs.slice(0, 3).map((spec) => (
                              <div key={spec.label} className="flex justify-between py-2 border-b border-primary/20 last:border-0">
                                <span className="text-sm text-muted-foreground tracking-wider">{spec.label}</span>
                                <span className="text-sm text-foreground/90">{spec.value}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1 tracking-wider uppercase">Starting at</div>
                              <div className="text-3xl text-primary">
                                ${product.price.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {product.currency}
                              </div>
                            </div>
                            <span className="flex items-center text-primary group-hover:translate-x-2 transition-transform text-sm tracking-wider uppercase">
                              View Details
                              <ArrowRight className="ml-2 w-5 h-5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

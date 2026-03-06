import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Wand2, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { products } from "../data/products";

export function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#0f0a06] to-black">
        {/* Vintage-inspired noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
        
        {/* Vintage audio equipment backdrop */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1744907529553-dc603ead4d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VuZCUyMHdhdmVzJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzcyNTc3NjI2fDA&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Glowing accent lines */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center px-4 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-8"
          >
            <div className="inline-block px-6 py-2 border border-primary/40 rounded-sm bg-primary/5 backdrop-blur-sm">
              <span className="text-primary text-sm tracking-[0.2em] uppercase">Est. 2026</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 tracking-tight vintage-text-shadow"
          >
            Where Vintage Soul
            <br />
            <span className="text-primary">Meets Modern Precision</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-lg sm:text-xl md:text-2xl mb-12 text-foreground/70 max-w-3xl mx-auto leading-relaxed"
          >
            Handcrafted audio electronics where artisanal craftsmanship meets cutting-edge engineering
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-lg px-10 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 vintage-glow">
              <Link to="/products">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-10 border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary">
              <Link to="/configure">
                <Wand2 className="mr-2 w-5 h-5" />
                Custom Build
              </Link>
            </Button>
          </motion.div>

          {/* Decorative vintage elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="tracking-wider">Handcrafted</span>
            </div>
            <div className="w-px h-4 bg-primary/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="tracking-wider">Limited Edition</span>
            </div>
            <div className="w-px h-4 bg-primary/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="tracking-wider">Portland, USA</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Decorative border */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Our Philosophy</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-8 leading-tight">Timeless Design,<br/>Uncompromising Quality</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              At Resonance, we believe that audio equipment should be more than just functional—it should be 
              an object of desire, a piece of art, and a lifelong companion in your musical journey.
            </p>
            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              Every component is meticulously crafted in our Portland workshop, combining time-honored techniques 
              with modern innovation. We use vintage-inspired aesthetics with contemporary technology to create 
              pieces that stand the test of time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 relative">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-6">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Signature Collection</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-6">Featured Products</h2>
            <p className="text-xl text-muted-foreground">
              Discover our masterfully crafted audio components
            </p>
          </motion.div>

          <div className="space-y-32">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Link
                  to={`/products/${product.id}`}
                  className="grid md:grid-cols-2 gap-8 md:gap-16 items-center group"
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden border border-primary/20 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-[500px] object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/40 transition-all duration-500" />
                    
                    {/* Vintage corner decorations */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Content */}
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    <div className="text-xs text-primary mb-4 tracking-[0.2em] uppercase flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      {product.category}
                    </div>
                    <h3 className="text-4xl md:text-5xl mb-6 group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-2xl text-foreground/80 mb-6 font-light italic">
                      {product.tagline}
                    </p>
                    <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-primary/20">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1 tracking-wider uppercase">Starting at</div>
                        <span className="text-3xl text-primary">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">{product.currency}</span>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mt-20"
          >
            <Button asChild size="lg" variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 hover:text-primary px-10">
              <Link to="/products">
                View Complete Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Custom Build CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden border border-primary/30 bg-gradient-to-br from-card via-card to-black p-12 md:p-20"
          >
            {/* Vintage texture */}
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
              }}
            />
            
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1723536995929-02f231c2de6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdHNtYW5zaGlwJTIwd29ya3Nob3AlMjBlbGVjdHJvbmljc3xlbnwxfHx8fDE3NzI2NTEzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40"></div>
            
            <div className="relative z-10 text-center">
              <Wand2 className="w-16 h-16 mx-auto mb-8 text-primary" />
              <h2 className="text-4xl md:text-6xl mb-6">Design Your Dream System</h2>
              <p className="text-xl md:text-2xl mb-10 text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                Work directly with our master craftsmen to create a bespoke audio component tailored 
                to your exact specifications and aesthetic preferences.
              </p>
              <Button asChild size="lg" className="text-lg px-10 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/40 vintage-glow">
                <Link to="/configure">
                  Start Configuring
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

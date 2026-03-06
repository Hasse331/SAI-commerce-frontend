import { motion } from "motion/react";
import { Wrench, Award, Users, Heart, Zap } from "lucide-react";

export function Craft() {
  const values = [
    {
      icon: Wrench,
      title: "Master Craftsmanship",
      description: "Every component is assembled by hand in our Portland workshop. We don't chase volume—we pursue perfection.",
    },
    {
      icon: Award,
      title: "Uncompromising Quality",
      description: "From aerospace-grade aluminum to NOS vacuum tubes, we source only the finest materials available.",
    },
    {
      icon: Users,
      title: "Personal Service",
      description: "When you buy from Resonance, you're not just a customer—you're part of our community of audio enthusiasts.",
    },
    {
      icon: Heart,
      title: "Built to Last",
      description: "We design for generations, not quarters. Our lifetime warranty on transformers isn't marketing—it's our promise.",
    },
  ];

  const timeline = [
    {
      year: "2018",
      title: "The Beginning",
      description: "Founded in a small Portland garage by audio engineer Marcus Chen, driven by frustration with mass-produced equipment.",
    },
    {
      year: "2020",
      title: "First Production",
      description: "Launched the Signature Tube Amplifier. Limited to 50 units in the first year, each personally delivered by Marcus.",
    },
    {
      year: "2022",
      title: "Workshop Expansion",
      description: "Moved to a dedicated 5,000 sq ft workshop. Welcomed master craftsman Elena Rodriguez to lead custom builds.",
    },
    {
      year: "2024",
      title: "International Recognition",
      description: "Precision DAC wins 'Best Digital Source' at the Tokyo Audio Show. Orders from 23 countries.",
    },
    {
      year: "2026",
      title: "Today",
      description: "A team of 12 dedicated craftspeople producing some of the world's finest audio equipment, one piece at a time.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1723536995929-02f231c2de6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFmdHNtYW5zaGlwJTIwd29ya3Nob3AlMjBlbGVjdHJvbmljc3xlbnwxfHx8fDE3NzI2NTEzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-4 max-w-5xl"
        >
          <div className="inline-block mb-8">
            <span className="text-primary text-sm tracking-[0.2em] uppercase border border-primary/40 px-6 py-2 bg-primary/5 backdrop-blur-sm">Handcrafted Excellence</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 tracking-tight vintage-text-shadow">
            The Craft of <span className="text-primary">Sound</span>
          </h1>
          <p className="text-xl md:text-3xl text-foreground/70 font-light">
            Where passion, precision, and artistry converge
          </p>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="py-32 px-4 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-8">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Our Philosophy</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-8">Built with Soul</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              In an age of planned obsolescence and mass production, we believe there's still room 
              for products built with soul. Every Resonance component is a labor of love, designed 
              to deliver decades of musical enjoyment while aging gracefully alongside your collection.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all relative group"
              >
                {/* Corner decoration */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                
                <value.icon className="w-12 h-12 mb-6 text-primary" />
                <h3 className="text-2xl mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-8">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">The Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-6">Meticulous Creation</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building a Resonance component takes time. Typically 4-6 weeks from order to delivery. 
              Here's why.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Design & Planning",
                description: "Each build begins with a detailed review of specifications and customization options. For custom builds, this includes a personal consultation.",
              },
              {
                step: "02",
                title: "Precision Assembly",
                description: "Point-to-point wiring, hand-matched components, and meticulous soldering. No shortcuts, no compromises.",
              },
              {
                step: "03",
                title: "Testing & Burn-In",
                description: "Every unit undergoes 72 hours of burn-in and comprehensive electrical testing before it leaves our workshop.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="text-center relative p-8 border border-primary/20 bg-secondary/10"
              >
                <div className="text-8xl font-light text-primary/20 mb-6 leading-none">{step.step}</div>
                <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 px-4 relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block mb-8">
              <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Our Journey</span>
            </div>
            <h2 className="text-4xl md:text-6xl">From Garage to Glory</h2>
          </motion.div>

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-8 items-start"
              >
                <div className="text-5xl text-primary min-w-[120px] tracking-tight">
                  {item.year}
                </div>
                <div className="flex-1 pb-12 border-l-2 border-primary/30 pl-8 relative last:border-0">
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-2 shadow-lg shadow-primary/50" />
                  <h3 className="text-2xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-card via-black to-card"></div>
        
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/30"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/30"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/30"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/30"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-12">
              <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
            </div>
            <blockquote className="text-3xl md:text-5xl mb-12 leading-relaxed font-light italic text-foreground/90">
              "We don't make audio equipment. We craft instruments for experiencing music 
              the way it was meant to be heard."
            </blockquote>
            <div className="mb-8">
              <div className="w-16 h-1 bg-primary mx-auto"></div>
            </div>
            <cite className="text-xl text-primary not-italic tracking-wider">
              Marcus Chen
            </cite>
            <div className="text-sm text-muted-foreground mt-2 tracking-[0.15em] uppercase">
              Founder & Master Craftsman
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";
import { motion } from "motion/react";
import { Wand2, Check, ShoppingCart, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { products } from "../data/products";

const configurableProduct = products.find((p) => p.customizable);

export function Configure() {
  const { addToCart } = useCart();
  const [config, setConfig] = useState({
    finish: "black-anodized",
    tubes: "nos-matched",
    faceplate: "brushed-aluminum",
    knobs: "machined-brass",
  });

  const options = {
    finish: [
      { value: "black-anodized", label: "Black Anodized", price: 0 },
      { value: "silver-anodized", label: "Silver Anodized", price: 0 },
      { value: "bronze-patina", label: "Bronze Patina", price: 200 },
      { value: "custom-color", label: "Custom Color", price: 350 },
    ],
    tubes: [
      { value: "standard", label: "Standard Matched Tubes", price: 0 },
      { value: "nos-matched", label: "NOS Matched Quad", price: 400 },
      { value: "premium-nos", label: "Premium NOS Selection", price: 800 },
    ],
    faceplate: [
      { value: "brushed-aluminum", label: "Brushed Aluminum", price: 0 },
      { value: "polished-brass", label: "Polished Brass", price: 300 },
      { value: "carbon-fiber", label: "Carbon Fiber", price: 450 },
      { value: "exotic-wood", label: "Exotic Wood Veneer", price: 600 },
    ],
    knobs: [
      { value: "aluminum", label: "Machined Aluminum", price: 0 },
      { value: "machined-brass", label: "Machined Brass", price: 150 },
      { value: "ebony-wood", label: "Ebony Wood", price: 250 },
    ],
  };

  const basePrice = configurableProduct?.price || 4500;
  const additionalCost = 
    options.finish.find((o) => o.value === config.finish)!.price +
    options.tubes.find((o) => o.value === config.tubes)!.price +
    options.faceplate.find((o) => o.value === config.faceplate)!.price +
    options.knobs.find((o) => o.value === config.knobs)!.price;
  const totalPrice = basePrice + additionalCost;

  const handleAddToCart = () => {
    if (configurableProduct) {
      const customProduct = {
        ...configurableProduct,
        price: totalPrice,
      };
      addToCart(customProduct, {
        finish: options.finish.find((o) => o.value === config.finish)?.label,
        tubes: options.tubes.find((o) => o.value === config.tubes)?.label,
        faceplate: options.faceplate.find((o) => o.value === config.faceplate)?.label,
        knobs: options.knobs.find((o) => o.value === config.knobs)?.label,
      });
      toast.success("Custom configuration added to cart");
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-8">
            <Wand2 className="w-16 h-16 mx-auto text-primary vintage-glow" />
          </div>
          <div className="inline-block mb-8">
            <span className="text-primary text-sm tracking-[0.2em] uppercase border-b border-primary/40 pb-2">Custom Build</span>
          </div>
          <h1 className="text-5xl md:text-7xl mb-8">Design Your Dream Amplifier</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Customize every aspect of your Signature Tube Amplifier. Each option is carefully 
            curated to enhance both aesthetics and performance.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Configuration Options */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            {/* Finish */}
            <div>
              <Label className="text-xl mb-6 block tracking-wide flex items-center gap-2">
                <div className="w-1 h-6 bg-primary"></div>
                Chassis Finish
              </Label>
              <RadioGroup
                value={config.finish}
                onValueChange={(value) => setConfig({ ...config, finish: value })}
              >
                {options.finish.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-5 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all cursor-pointer relative group"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer flex justify-between"
                    >
                      <span>{option.label}</span>
                      {option.price > 0 && (
                        <span className="text-primary">+${option.price}</span>
                      )}
                    </Label>
                    {/* Subtle corner accent */}
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Tubes */}
            <div>
              <Label className="text-xl mb-6 block tracking-wide flex items-center gap-2">
                <div className="w-1 h-6 bg-primary"></div>
                Vacuum Tubes
              </Label>
              <RadioGroup
                value={config.tubes}
                onValueChange={(value) => setConfig({ ...config, tubes: value })}
              >
                {options.tubes.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-5 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all cursor-pointer relative group"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer flex justify-between"
                    >
                      <span>{option.label}</span>
                      {option.price > 0 && (
                        <span className="text-primary">+${option.price}</span>
                      )}
                    </Label>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Faceplate */}
            <div>
              <Label className="text-xl mb-6 block tracking-wide flex items-center gap-2">
                <div className="w-1 h-6 bg-primary"></div>
                Faceplate Material
              </Label>
              <RadioGroup
                value={config.faceplate}
                onValueChange={(value) => setConfig({ ...config, faceplate: value })}
              >
                {options.faceplate.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-5 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all cursor-pointer relative group"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer flex justify-between"
                    >
                      <span>{option.label}</span>
                      {option.price > 0 && (
                        <span className="text-primary">+${option.price}</span>
                      )}
                    </Label>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Knobs */}
            <div>
              <Label className="text-xl mb-6 block tracking-wide flex items-center gap-2">
                <div className="w-1 h-6 bg-primary"></div>
                Control Knobs
              </Label>
              <RadioGroup
                value={config.knobs}
                onValueChange={(value) => setConfig({ ...config, knobs: value })}
              >
                {options.knobs.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-5 border border-primary/20 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30 transition-all cursor-pointer relative group"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer flex justify-between"
                    >
                      <span>{option.label}</span>
                      {option.price > 0 && (
                        <span className="text-primary">+${option.price}</span>
                      )}
                    </Label>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/40 transition-all"></div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="lg:sticky lg:top-24">
              <div className="border border-primary/30 p-8 bg-gradient-to-br from-card via-card to-black relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/40"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/40"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40"></div>
                
                <div className="flex items-center gap-2 mb-8">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl tracking-wide">Your Configuration</h2>
                </div>
                
                <div className="space-y-6 mb-8 bg-secondary/20 p-6 border border-primary/10">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Finish</div>
                      <div className="text-foreground/90">{options.finish.find((o) => o.value === config.finish)?.label}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tubes</div>
                      <div className="text-foreground/90">{options.tubes.find((o) => o.value === config.tubes)?.label}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Faceplate</div>
                      <div className="text-foreground/90">{options.faceplate.find((o) => o.value === config.faceplate)?.label}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Knobs</div>
                      <div className="text-foreground/90">{options.knobs.find((o) => o.value === config.knobs)?.label}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-primary/30 pt-6 mb-8 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span className="tracking-wider uppercase text-sm">Base Price</span>
                    <span>${basePrice.toLocaleString()}</span>
                  </div>
                  {additionalCost > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span className="tracking-wider uppercase text-sm">Customization</span>
                      <span className="text-primary">+${additionalCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-3xl pt-4 border-t border-primary/20">
                    <span className="text-sm tracking-wider uppercase text-muted-foreground self-end mb-1">Total</span>
                    <span className="text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4 vintage-glow" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Add to Cart
                </Button>

                <p className="text-xs text-center text-muted-foreground tracking-wider">
                  Est. build time: 6-8 weeks
                </p>
              </div>

              <div className="mt-6 p-6 bg-secondary/20 border border-primary/20 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/30"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/30"></div>
                
                <h3 className="text-sm mb-3 tracking-wider uppercase text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  White Glove Service
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every custom build includes a personal consultation with our master craftsman, 
                  detailed build photos, and a hand-signed certificate of authenticity.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

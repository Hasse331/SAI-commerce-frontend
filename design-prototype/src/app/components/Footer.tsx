import { Link } from "react-router";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-primary/30 mt-auto relative">
      {/* Vintage decorative line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary border border-primary/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#b8975f] to-primary opacity-70"></div>
              </div>
              <span className="text-xl tracking-[0.2em] font-light">RESONANCE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Handcrafted audio electronics for the discerning listener.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm mb-4 tracking-[0.1em] uppercase text-primary">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  Amplifiers
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  Source Components
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  Headphone Amplifiers
                </Link>
              </li>
              <li>
                <Link to="/configure" className="hover:text-primary transition-colors">
                  Custom Builds
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm mb-4 tracking-[0.1em] uppercase text-primary">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/craft" className="hover:text-primary transition-colors">
                  The Craft
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Warranty
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm mb-4 tracking-[0.1em] uppercase text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 text-primary/70" />
                <span>hello@resonance.audio</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 text-primary/70" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary/70" />
                <span>Portland, Oregon, USA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-sm text-center text-muted-foreground">
          <p>&copy; 2026 Resonance Audio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
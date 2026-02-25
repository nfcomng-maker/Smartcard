import { Link } from "react-router-dom";
import { Smartphone, Instagram, Twitter, MessageCircle, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-6 h-6 text-gold" />
              <span className="text-xl font-display font-bold">SMARTCARD</span>
            </div>
            <p className="text-sm text-light/60 leading-relaxed">
              The ultimate NFC business landing page platform. Connect your physical world to your digital presence seamlessly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-light/40 hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-light/40 hover:text-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://tiktok.com/@smartcard.app" className="text-light/40 hover:text-gold transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-light/60">
              <li><Link to="/" className="hover:text-gold">Home</Link></li>
              <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
              <li><Link to="/services" className="hover:text-gold">Services</Link></li>
              <li><Link to="/blog" className="hover:text-gold">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-light/60">
              <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-gold">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold">Terms of Service</Link></li>
              <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-light/60">
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-gold" />
                <span>+2348100764154</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-gold" />
                <span>vickthor.dennis@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Instagram size={16} className="text-gold" />
                <span>@smartcard.app</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-light/40">
          <p>© {new Date().getFullYear()} SMARTCARD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

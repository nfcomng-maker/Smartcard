import { motion } from "framer-motion";
import { Smartphone, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { TestimonialSlider } from "../components/TestimonialSlider";

export function Home() {
  return (
    <>
      <Helmet>
        <title>SMARTCARD | The Ultimate NFC Business Landing Page</title>
        <meta name="description" content="Create your professional NFC business page in seconds. Connect your physical cards to a beautiful, high-converting digital presence." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-6">
              Next-Gen Networking
            </span>
            <h1 className="text-5xl md:text-8xl font-display font-bold mb-8 leading-[0.9] tracking-tighter">
              The Last Business <br />
              <span className="text-gold">Card You'll Ever Need.</span>
            </h1>
            <p className="text-lg md:text-2xl text-light/60 max-w-3xl mx-auto mb-12 leading-relaxed">
              SMARTCARD combines premium NFC hardware with a powerful digital landing page to help you close deals, grow your following, and network like a pro—all with a single tap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link to="/login" className="btn-primary w-full sm:w-auto px-12 py-5 text-lg">
                Create Your Free Page
              </Link>
              <Link to="/services" className="btn-secondary w-full sm:w-auto px-12 py-5 text-lg">
                Explore NFC Cards
              </Link>
            </div>

            {/* Social Proof / Trusted By */}
            <div className="pt-8 border-t border-white/5 max-w-2xl mx-auto">
              <p className="text-[10px] uppercase tracking-[0.2em] text-light/30 font-bold mb-6">Trusted by industry leaders at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="font-display font-black text-xl italic">TECHFLOW</span>
                <span className="font-display font-black text-xl italic">NEXUS</span>
                <span className="font-display font-black text-xl italic">VANTAGE</span>
                <span className="font-display font-black text-xl italic">ORBIT</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            <div className="glass rounded-2xl p-4 shadow-2xl">
              <img
                src="https://picsum.photos/seed/smartcard/1200/800"
                alt="Dashboard Preview"
                className="rounded-xl w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Slider Section */}
      <section className="bg-dark">
        <TestimonialSlider />
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SMARTCARD?</h2>
            <p className="text-light/60">Everything you need to scale your professional network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-gold" />,
                title: "Instant Tap",
                desc: "Share your profile instantly with NFC-enabled cards or devices."
              },
              {
                icon: <Shield className="text-gold" />,
                title: "Secure & Private",
                desc: "You control what you share. Enterprise-grade security for your data."
              },
              {
                icon: <Globe className="text-gold" />,
                title: "Global Reach",
                desc: "Your digital business card works anywhere in the world, 24/7."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="glass p-8 rounded-2xl border-white/5"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-light/60 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8">Trusted by 10,000+ Professionals</h2>
              <p className="text-light/60 mb-8">
                "SMARTCARD has completely changed how I network at conferences. No more paper cards, just one tap and they have everything they need."
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="https://picsum.photos/seed/user1/100/100"
                  alt="User"
                  className="w-12 h-12 rounded-full"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold">Sarah Jenkins</p>
                  <p className="text-xs text-gold">Founder @ TechFlow</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://picsum.photos/seed/p1/400/500" className="rounded-2xl" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/p2/400/300" className="rounded-2xl" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://picsum.photos/seed/p3/400/300" className="rounded-2xl" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/p4/400/500" className="rounded-2xl" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gold-gradient rounded-3xl p-12 text-center text-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Smartphone size={200} />
            </div>
            <h2 className="text-4xl font-bold mb-6">Ready to upgrade your networking?</h2>
            <p className="text-lg mb-10 opacity-80 max-w-xl mx-auto">
              Join thousands of businesses already using SMARTCARD to grow their digital presence.
            </p>
            <Link to="/login" className="bg-dark text-gold font-bold py-4 px-10 rounded-full inline-flex items-center space-x-2 hover:scale-105 transition-transform">
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

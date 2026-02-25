import { motion } from "framer-motion";
import { Smartphone, CreditCard, BarChart3, Palette, Zap, Shield } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "NFC Smart Cards",
      desc: "Premium physical cards made from metal, wood, or recycled plastic with embedded NTAG213 chips.",
      price: "Starting at $29"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Digital Landing Pages",
      desc: "Fully customizable, high-converting landing pages for your professional profile and social links.",
      price: "Free / $5 mo"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      desc: "Track every tap, click, and interaction. Understand your audience with detailed geographic data.",
      price: "Included in Pro"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Custom Branding",
      desc: "White-label solutions for enterprises. Use your own domain and custom design system.",
      price: "Custom Quote"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Updates",
      desc: "Change your links or info in real-time. Your physical card always points to the latest data.",
      price: "Included"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      desc: "SSO integration, team management, and advanced privacy controls for large organizations.",
      price: "Custom Quote"
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-light/60 max-w-2xl mx-auto">
            We provide the hardware and software you need to revolutionize your professional networking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-3xl border-white/5 flex flex-col"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-8">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-light/60 mb-8 flex-grow leading-relaxed">
                {service.desc}
              </p>
              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-gold font-bold">{service.price}</span>
                <button className="text-sm font-bold hover:text-gold transition-colors">Learn More →</button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-16">Choose Your Plan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 px-4 font-bold">Feature</th>
                  <th className="py-6 px-4 font-bold text-gold">Free</th>
                  <th className="py-6 px-4 font-bold text-gold">Pro</th>
                  <th className="py-6 px-4 font-bold text-gold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-light/60">
                {[
                  ["Custom Links", "Unlimited", "Unlimited", "Unlimited"],
                  ["Analytics", "Basic", "Advanced", "Full Suite"],
                  ["Themes", "3 Presets", "Unlimited", "Custom CSS"],
                  ["NFC Support", "Yes", "Yes", "Yes"],
                  ["Custom Domain", "No", "Yes", "Yes"],
                  ["Team Management", "No", "No", "Yes"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-light">{row[0]}</td>
                    <td className="py-4 px-4">{row[1]}</td>
                    <td className="py-4 px-4">{row[2]}</td>
                    <td className="py-4 px-4">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

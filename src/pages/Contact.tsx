import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hcaptchaToken) {
      alert("Please complete the captcha");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, hcaptchaToken }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | SMARTCARD</title>
      </Helmet>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-light/60 max-w-2xl mx-auto">
              Have questions about our NFC cards or platform? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 md:p-12 rounded-[3rem]"
            >
              {status === "success" ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gold mb-4">Message Sent!</h2>
                  <p className="text-light/60">We'll get back to you as soon as possible.</p>
                  <button onClick={() => setStatus("idle")} className="btn-secondary mt-8">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Message</label>
                    <textarea
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-gold resize-none"
                      placeholder="Tell us more..."
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-center">
                    <HCaptcha
                      sitekey="10000000-ffff-ffff-ffff-000000000001" // Demo sitekey
                      onVerify={(token) => setHcaptchaToken(token)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === "loading"}
                    className="w-full btn-primary py-4 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{status === "loading" ? "Sending..." : "Send Message"}</span>
                    <Send size={18} />
                  </button>
                  {status === "error" && <p className="text-red-500 text-center text-xs">Failed to send message. Please try again.</p>}
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Email Us</h4>
                      <p className="text-light/60">vickthor.dennis@gmail.com</p>
                      <p className="text-xs text-gold mt-1">Response within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Call Us</h4>
                      <p className="text-light/60">+2348100764154</p>
                      <p className="text-xs text-gold mt-1">Mon - Fri, 9am - 6pm</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold shrink-0">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Visit Us</h4>
                      <p className="text-light/60">Lagos, Nigeria</p>
                      <p className="text-xs text-gold mt-1">By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="glass p-8 rounded-3xl">
                <h4 className="font-bold mb-6">Follow Our Journey</h4>
                <div className="flex space-x-4">
                  {['Instagram', 'Twitter', 'TikTok', 'LinkedIn'].map((social) => (
                    <button key={social} className="py-2 px-4 bg-white/5 rounded-lg text-xs font-bold hover:bg-gold hover:text-dark transition-all">
                      {social}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}

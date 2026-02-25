import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Globe, Instagram, Twitter, Linkedin, Github, Youtube, Send, Music } from "lucide-react";
import { Link, Profile } from "../types";
import { cn } from "../lib/utils";

const iconMap: Record<string, any> = {
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
};

export function UserPage() {
  const { username } = useParams();
  const [data, setData] = useState<{ profile: Profile; links: Link[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadStatus, setLeadStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadData, setLeadData] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username]);

  const handleLeadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLeadStatus("loading");
    try {
      await fetch(`/api/profile/${username}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      setLeadStatus("success");
      setLeadData({ name: "", email: "", message: "" });
      setTimeout(() => setLeadStatus("idle"), 3000);
    } catch (error) {
      setLeadStatus("idle");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark text-light">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
          <p className="text-light/60">The profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const { profile, links } = data;

  const themes: Record<string, string> = {
    default: "bg-dark text-light",
    gold: "bg-[#121212] text-white",
    light: "bg-white text-dark",
    vibrant: "bg-gradient-to-br from-purple-900 to-black text-white",
  };

  return (
    <div className={cn("min-h-screen py-20 px-4 relative overflow-hidden", themes[profile.theme] || themes.default)}>
      {/* Background Video */}
      {profile.background_video_url && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src={profile.background_video_url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="max-w-xl mx-auto text-center relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative inline-block mb-6">
            <img
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
              alt={profile.name}
              className="w-24 h-24 rounded-full border-4 border-gold shadow-xl"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-gold rounded-full flex items-center justify-center border-2 border-dark">
              <div className="w-2 h-2 bg-dark rounded-full" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
          <p className="text-sm opacity-60 max-w-xs mx-auto">{profile.bio}</p>
        </motion.div>

        {/* Music Player */}
        {profile.music_embed_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 glass rounded-2xl overflow-hidden"
          >
            <div className="p-2 flex items-center space-x-2 text-xs font-bold text-gold uppercase tracking-widest border-b border-white/5">
              <Music size={12} />
              <span>Now Playing</span>
            </div>
            <iframe
              src={profile.music_embed_url}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="bg-transparent"
            />
          </motion.div>
        )}

        {/* Links List */}
        <div className="space-y-4 mb-12">
          {links.map((link, index) => {
            const Icon = iconMap[link.icon] || Globe;
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] group",
                  profile.theme === "light" 
                    ? "bg-dark/5 border-dark/10 hover:bg-dark/10" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold mr-4">
                  <Icon size={20} />
                </div>
                <span className="flex-grow text-left font-medium">{link.title}</span>
                <ExternalLink size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </motion.a>
            );
          })}
        </div>

        {/* Contact Form */}
        {profile.enable_contact_form === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-2xl text-left mb-12"
          >
            <h3 className="font-bold mb-6 flex items-center space-x-2">
              <Send size={18} className="text-gold" />
              <span>Get in Touch</span>
            </h3>
            {leadStatus === "success" ? (
              <div className="text-center py-4 text-gold font-bold">
                Thanks! I'll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                  required
                />
                <textarea
                  placeholder="Message"
                  value={leadData.message}
                  onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold h-24"
                  required
                />
                <button
                  type="submit"
                  disabled={leadStatus === "loading"}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {leadStatus === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* Branding */}
        <div className="mt-20">
          <a
            href="/"
            className="inline-flex items-center space-x-2 text-xs opacity-40 hover:opacity-100 transition-opacity"
          >
            <span className="font-bold">SMARTCARD</span>
            <span>Create your own page</span>
          </a>
        </div>
      </div>
    </div>
  );
}

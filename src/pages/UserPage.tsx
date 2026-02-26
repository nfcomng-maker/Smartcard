import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, Globe, Instagram, Twitter, Linkedin, Github, Youtube, 
  Send, Music, Share2, Facebook, MessageCircle, Copy, Check, X,
  ChevronLeft, ChevronRight, ShoppingBag, Mail, Phone, Camera,
  MapPin, Briefcase, Video, FileText, Calendar, FolderOpen, Image, File
} from "lucide-react";
import { Link, Profile, Product } from "../types";
import { cn } from "../lib/utils";

const iconMap: Record<string, any> = {
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Youtube,
  Mail,
  Phone,
  MessageCircle,
  Music,
  ShoppingBag,
  Video,
  Camera,
  MapPin,
  Briefcase,
};

export function UserPage() {
  const { username } = useParams();
  const [data, setData] = useState<{ 
    profile: Profile; 
    links: Link[];
    portfolio: any[];
    assets: any[];
    appointments: any[];
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [leadStatus, setLeadStatus] = useState<"idle" | "loading" | "success">("idle");
  const [leadData, setLeadData] = useState({ name: "", email: "", message: "" });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch(`/api/profile/${username}`);
        const profileData = await res.json();
        
        if (profileData.profile) {
          const userId = profileData.profile.user_id;
          
          // Fetch additional data
          const [portfolioRes, assetsRes, appointmentsRes] = await Promise.all([
            fetch(`/api/portfolio/${userId}`),
            fetch(`/api/assets/${userId}`),
            fetch(`/api/appointments/${userId}`)
          ]);
          
          const portfolio = await portfolioRes.json();
          const assets = await assetsRes.json();
          const appointments = await appointmentsRes.json();
          
          setData({
            ...profileData,
            portfolio,
            assets,
            appointments
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchProfileData();

    fetch("/api/products")
      .then((res) => res.json())
      .then((res) => setProducts(res))
      .catch(() => {});
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

  const openShareModal = (url: string, title: string) => {
    setShareUrl(url);
    setShareTitle(title);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-[#1DA1F2]",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-[#0A66C2]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

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

  const { profile, links, portfolio, assets, appointments } = data;
  const pageUrl = window.location.href;

  const themes: Record<string, string> = {
    default: "bg-dark text-light",
    gold: "bg-[#121212] text-white",
    light: "bg-white text-dark",
    vibrant: "bg-gradient-to-br from-purple-900 to-black text-white",
  };

  return (
    <div className={cn("min-h-screen py-20 px-4 relative overflow-hidden", themes[profile.theme] || themes.default)}>
      {/* Custom CSS */}
      {profile.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: profile.custom_css }} />
      )}

      {/* Background Image */}
      {(profile as any).background_image_url && !profile.background_video_url && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={(profile as any).background_image_url} 
            className="w-full h-full object-cover opacity-30" 
            alt="Background"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

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
          className="mb-12 relative"
        >
          <button 
            onClick={() => openShareModal(pageUrl, `Check out ${profile.name}'s SMARTCARD profile!`)}
            className="absolute top-0 right-0 p-3 glass rounded-full hover:scale-110 transition-transform"
            title="Share Profile"
          >
            <Share2 size={20} className="text-gold" />
          </button>

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
            const isCustomIcon = link.icon?.startsWith('data:image');
            const Icon = !isCustomIcon ? (iconMap[link.icon] || Globe) : null;
            
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]",
                    profile.theme === "light" 
                      ? "bg-dark/5 border-dark/10 hover:bg-dark/10" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold mr-4 overflow-hidden">
                    {isCustomIcon ? (
                      <img src={link.icon} className="w-full h-full object-cover" alt="" />
                    ) : (
                      Icon && <Icon size={20} />
                    )}
                  </div>
                  <span className="flex-grow text-left font-medium">{link.title}</span>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </a>
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openShareModal(link.url, `Check out this link from ${profile.name}: ${link.title}`);
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold"
                  title="Share Link"
                >
                  <Share2 size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Portfolio Section */}
        {portfolio && portfolio.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-left"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <Briefcase size={18} className="text-gold" />
              <span>Featured Work</span>
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {portfolio.map((item) => (
                <div key={item.id} className="glass rounded-2xl overflow-hidden group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-xs opacity-60 mb-4 line-clamp-2">{item.description}</p>
                    {item.link_url && (
                      <a href={item.link_url} target="_blank" className="inline-flex items-center space-x-2 text-gold font-bold text-[10px] uppercase tracking-widest hover:underline">
                        <span>View Project</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Documents Section */}
        {assets && assets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-left"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <FolderOpen size={18} className="text-gold" />
              <span>Documents & Media</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {assets.map((asset) => (
                <a 
                  key={asset.id} 
                  href={asset.url} 
                  target="_blank" 
                  className="glass p-4 rounded-xl flex items-center space-x-3 hover:bg-white/10 transition-all border border-white/5"
                >
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                    {asset.type === 'cv' && <FileText size={20} />}
                    {asset.type === 'document' && <File size={20} />}
                    {asset.type === 'picture' && <Image size={20} />}
                    {asset.type === 'music' && <Music size={20} />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold truncate">{asset.title}</p>
                    <p className="text-[8px] opacity-40 uppercase font-black tracking-widest">{asset.type}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Appointments Section */}
        {appointments && appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-left"
          >
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <Calendar size={18} className="text-gold" />
              <span>Available Slots</span>
            </h3>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="glass p-4 rounded-xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-lg flex flex-col items-center justify-center text-gold">
                      <span className="text-[8px] font-black uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(appt.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{appt.title}</h4>
                      <p className="text-[10px] opacity-40">{appt.time} • {appt.duration}m</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gold text-dark text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-transform shadow-lg shadow-gold/20">
                    Book
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

        {/* NFC Products Carousel */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center space-x-2">
                <ShoppingBag size={18} className="text-gold" />
                <span>Get Your SMARTCARD</span>
              </h3>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentProductIndex(prev => (prev === 0 ? products.length - 1 : prev - 1))}
                  className="p-2 glass rounded-full hover:bg-gold/10 hover:text-gold transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentProductIndex(prev => (prev === products.length - 1 ? 0 : prev + 1))}
                  className="p-2 glass rounded-full hover:bg-gold/10 hover:text-gold transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2.5rem] glass border-white/5 aspect-[4/3]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProductIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 p-8 flex flex-col"
                >
                  <div className="flex-grow relative mb-6">
                    <img 
                      src={products[currentProductIndex].image_url} 
                      alt={products[currentProductIndex].name}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-bold">{products[currentProductIndex].name}</h4>
                      <span className="text-gold font-bold">₦{products[currentProductIndex].price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-light/40 mb-6 line-clamp-2">{products[currentProductIndex].description}</p>
                    <button className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 group">
                      <span>Buy Now</span>
                      <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center space-x-2 mt-6">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentProductIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentProductIndex === i ? "bg-gold w-6" : "bg-white/10"
                  )}
                />
              ))}
            </div>
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

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass p-8 rounded-[2.5rem] shadow-2xl"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-6 right-6 text-light/40 hover:text-light transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-bold mb-6">Share</h3>
              
              <div className="grid grid-cols-4 gap-4 mb-8">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110",
                      link.color
                    )}>
                      <link.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 group-hover:opacity-100 transition-opacity">
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-light/40 ml-1">Copy Link</p>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 pl-4">
                  <span className="flex-grow text-xs truncate opacity-60 mr-4">{shareUrl}</span>
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      copied ? "bg-green-500 text-white" : "bg-gold text-dark hover:scale-105"
                    )}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

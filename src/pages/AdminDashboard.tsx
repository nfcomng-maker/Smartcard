import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, GripVertical, Settings, Layout, Link as LinkIcon, 
  LogOut, BarChart3, QrCode, Save, Users, Video, Music as MusicIcon, 
  MessageSquare, ShoppingBag, Globe, Monitor, CreditCard, DollarSign,
  TrendingUp, Clock, Package, UserPlus, Zap, ExternalLink, Copy, Check
} from "lucide-react";
import { Link, User, Profile, SiteSettings, Product, Order } from "../types";
import { VoiceAssistant } from "../components/VoiceAssistant";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../lib/utils";

type TabType = "links" | "appearance" | "analytics" | "qrcode" | "leads" | "users" | "shop" | "settings";

export function AdminDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<{ views: number; clicks: number; recentViews: any[] } | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "Globe" });
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [activeTab, setActiveTab] = useState<TabType>("links");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Initial data fetch
    fetchLinks(parsedUser.id);
    fetchProfile(parsedUser.username);
    fetchAnalytics(parsedUser.id);
    fetchLeads(parsedUser.id);
    
    if (parsedUser.role === 'admin') {
      fetchUsers();
      fetchStats();
      fetchSiteSettings();
      fetchProducts();
    }
  }, [navigate]);

  const fetchLinks = async (userId: number) => {
    const res = await fetch(`/api/admin/links/${userId}`);
    const data = await res.json();
    setLinks(data);
  };

  const fetchProfile = async (username: string) => {
    const res = await fetch(`/api/profile/${username}`);
    const data = await res.json();
    setProfile(data.profile);
  };

  const fetchAnalytics = async (userId: number) => {
    const res = await fetch(`/api/admin/analytics/${userId}`);
    const data = await res.json();
    setAnalytics(data);
  };

  const fetchLeads = async (userId: number) => {
    const res = await fetch(`/api/admin/leads/${userId}`);
    const data = await res.json();
    setLeads(data);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data);
  };

  const fetchSiteSettings = async () => {
    const res = await fetch("/api/site-settings");
    const data = await res.json();
    setSiteSettings(data);
  };

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const handleAddLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newLink, user_id: user.id }),
    });
    setNewLink({ title: "", url: "", icon: "Globe" });
    fetchLinks(user.id);
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
      fetchStats();
      alert("User created successfully!");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettings),
    });
    alert("Settings updated!");
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    if (user) fetchLinks(user.id);
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, user_id: user.id }),
    });
    alert("Profile updated!");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userPageUrl = `${window.location.origin}/u/${user?.username}`;

  const isAdmin = user?.role === 'admin';

  const sidebarVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  };

  const navItems = [
    { id: "links", label: "Links", icon: LinkIcon, group: "Personal" },
    { id: "appearance", label: "Appearance", icon: Layout, group: "Personal" },
    { id: "analytics", label: "Analytics", icon: BarChart3, group: "Personal" },
    { id: "leads", label: "Leads", icon: MessageSquare, group: "Personal" },
    { id: "qrcode", label: "QR Code", icon: QrCode, group: "Personal" },
    { id: "users", label: "Users", icon: Users, group: "Management", adminOnly: true },
    { id: "shop", label: "Shop", icon: ShoppingBag, group: "Management", adminOnly: true },
    { id: "settings", label: "Site Settings", icon: Monitor, group: "Management", adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-light flex flex-col md:flex-row selection:bg-gold/30">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/5 p-6 flex flex-col h-screen sticky top-0 bg-[#0D0D0D]">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gold rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Zap className="text-dark" size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight">SMARTCARD</span>
            <span className="text-[10px] text-gold font-bold uppercase tracking-widest opacity-50">Dashboard</span>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="mb-8 p-4 glass rounded-2xl border-gold/10">
          <p className="text-[10px] font-bold text-light/30 uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setActiveTab("links")}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold transition-all group"
            >
              <Plus size={16} className="mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Add Link</span>
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold transition-all group"
            >
              {copied ? <Check size={16} className="mb-1 text-green-500" /> : <Copy size={16} className="mb-1 group-hover:scale-110 transition-transform" />}
              <span className="text-[10px] font-bold">{copied ? "Copied!" : "Copy URL"}</span>
            </button>
          </div>
        </div>

        <nav className="flex-grow space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {["Personal", "Management"].map((group) => {
            const items = navItems.filter(item => item.group === group && (!item.adminOnly || isAdmin));
            if (items.length === 0) return null;
            
            return (
              <div key={group} className="space-y-1">
                <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-3 ml-3">{group}</p>
                {items.map((item, idx) => (
                  <motion.button 
                    key={item.id}
                    variants={sidebarVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group relative",
                      activeTab === item.id 
                        ? "bg-gold/10 text-gold shadow-sm shadow-gold/5" 
                        : "hover:bg-white/5 text-light/50 hover:text-light"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={18} className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="active-pill"
                        className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(242,125,38,0.8)]"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center space-x-3 mb-6 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-dark font-bold text-xs">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[120px]">{user?.username}</span>
              <span className="text-[10px] text-light/30 capitalize">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 lg:p-14 overflow-y-auto bg-[#0A0A0A]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Dashboard</span>
              <span className="text-light/20">/</span>
              <span className="text-[10px] font-black text-light/40 uppercase tracking-[0.3em]">{activeTab}</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={userPageUrl}
              target="_blank"
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all group"
            >
              <span>View Live</span>
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <button className="p-2.5 bg-gold text-dark rounded-xl hover:scale-105 transition-transform shadow-lg shadow-gold/20">
              <Zap size={18} fill="currentColor" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
          <div className="space-y-8">
            {activeTab === "links" && (
              <>
                <form onSubmit={handleAddLink} className="glass p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <Plus size={18} className="text-gold" />
                    <span>Add New Link</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                      required
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary py-3">
                    Add Link
                  </button>
                </form>

                <div className="space-y-4">
                  {links.map((link) => (
                    <motion.div
                      key={link.id}
                      layout
                      className="glass p-4 rounded-xl flex items-center space-x-4 group"
                    >
                      <div className="cursor-grab text-light/20">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm">{link.title}</h4>
                        <p className="text-xs text-light/40 truncate max-w-[200px]">{link.url}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-light/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "appearance" && profile && (
              <form onSubmit={handleUpdateProfile} className="glass p-8 rounded-2xl space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold h-24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Theme</label>
                  <select
                    value={profile.theme}
                    onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                  >
                    <option value="default">Default Dark</option>
                    <option value="gold">Premium Gold</option>
                    <option value="light">Clean Light</option>
                    <option value="vibrant">Vibrant Gradient</option>
                  </select>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <h4 className="font-bold flex items-center space-x-2">
                    <Settings size={16} className="text-gold" />
                    <span>Advanced Features</span>
                  </h4>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
                      <Video size={14} />
                      <span>Background Video URL (MP4)</span>
                    </label>
                    <input
                      type="url"
                      value={profile.background_video_url || ""}
                      onChange={(e) => setProfile({ ...profile, background_video_url: e.target.value })}
                      placeholder="https://example.com/video.mp4"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
                      <MusicIcon size={14} />
                      <span>Music Embed URL (Spotify/SoundCloud)</span>
                    </label>
                    <input
                      type="url"
                      value={profile.music_embed_url || ""}
                      onChange={(e) => setProfile({ ...profile, music_embed_url: e.target.value })}
                      placeholder="https://open.spotify.com/embed/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass rounded-xl">
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={18} className="text-gold" />
                      <div>
                        <p className="font-bold text-sm">Contact Collection Form</p>
                        <p className="text-xs text-light/40">Allow visitors to leave their info</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.enable_contact_form === 1}
                      onChange={(e) => setProfile({ ...profile, enable_contact_form: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 accent-gold"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </form>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-8">
                {isAdmin && stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Total Users", value: stats.userCount, icon: Users, trend: "+12%", color: "text-gold" },
                      { label: "Total Orders", value: stats.orderCount, icon: ShoppingBag, trend: "+5%", color: "text-blue-500" },
                      { label: "Revenue", value: `₦${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+18%", color: "text-green-500" },
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-[2rem] border-white/5 hover:border-gold/20 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-bold text-light/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : analytics && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[2.5rem] text-center border-white/5 hover:border-gold/20 transition-all group">
                      <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Monitor size={24} />
                      </div>
                      <p className="text-xs text-light/30 uppercase font-black tracking-widest mb-2">Total Views</p>
                      <p className="text-5xl font-bold text-gold tracking-tighter">{analytics.views}</p>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] text-center border-white/5 hover:border-gold/20 transition-all group">
                      <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                      </div>
                      <p className="text-xs text-light/30 uppercase font-black tracking-widest mb-2">Link Clicks</p>
                      <p className="text-5xl font-bold text-gold tracking-tighter">{analytics.clicks}</p>
                    </div>
                  </div>
                )}
                
                <div className="glass p-8 rounded-[2.5rem] border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center space-x-3">
                      <TrendingUp size={20} className="text-gold" />
                      <span>Live Activity</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-light/40 uppercase tracking-widest">Real-time</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {isAdmin && stats ? stats.recentOrders.map((order: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Order #{order.id}</p>
                            <p className="text-[10px] text-light/40">{new Date(order.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gold">₦{order.total_amount.toLocaleString()}</span>
                      </div>
                    )) : analytics?.recentViews.map((view, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                            <Globe size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{view.ip_address}</p>
                            <p className="text-[10px] text-light/40">{new Date(view.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Visitor</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && isAdmin && (
              <div className="space-y-8">
                <form onSubmit={handleCreateUser} className="glass p-8 rounded-[2.5rem] space-y-6 border-white/5">
                  <h3 className="text-xl font-bold flex items-center space-x-3">
                    <UserPlus size={20} className="text-gold" />
                    <span>Create New User Page</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-light/30 uppercase tracking-widest ml-1">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. johndoe"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-light/30 uppercase tracking-widest ml-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-light/30 uppercase tracking-widest ml-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all appearance-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full btn-primary py-4 rounded-2xl font-bold">
                    Create User Page
                  </button>
                </form>

                <div className="glass rounded-[2.5rem] overflow-hidden border-white/5">
                  <div className="p-8 border-b border-white/5">
                    <h3 className="text-xl font-bold">Manage Users</h3>
                    <p className="text-xs text-light/40">Total registered profiles: {users.length}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-6 font-black text-light/20 uppercase text-[10px] tracking-[0.2em]">User</th>
                          <th className="p-6 font-black text-light/20 uppercase text-[10px] tracking-[0.2em]">Role</th>
                          <th className="p-6 font-black text-light/20 uppercase text-[10px] tracking-[0.2em]">Joined</th>
                          <th className="p-6 font-black text-light/20 uppercase text-[10px] tracking-[0.2em]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-all group">
                            <td className="p-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gold font-bold text-xs">
                                  {u.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold">{u.username}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                u.role === 'admin' ? "bg-gold/10 text-gold" : "bg-white/5 text-light/40"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-6 text-xs text-light/40">{new Date(u.created_at || '').toLocaleDateString()}</td>
                            <td className="p-6">
                              <a 
                                href={`/u/${u.username}`} 
                                target="_blank" 
                                className="inline-flex items-center space-x-1 text-gold hover:text-gold/80 font-bold text-xs transition-colors"
                              >
                                <span>View Profile</span>
                                <ExternalLink size={12} />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shop" && isAdmin && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold mb-4 flex items-center space-x-2">
                      <Package size={18} className="text-gold" />
                      <span>Products</span>
                    </h3>
                    <div className="space-y-3">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center space-x-3 p-2 border-b border-white/5">
                          <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div className="flex-grow">
                            <p className="text-sm font-bold">{p.name}</p>
                            <p className="text-xs text-light/40">₦{p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="font-bold mb-4 flex items-center space-x-2">
                      <CreditCard size={18} className="text-gold" />
                      <span>Recent Orders</span>
                    </h3>
                    <div className="space-y-3">
                      {stats?.recentOrders.map((o: any) => (
                        <div key={o.id} className="p-3 bg-white/5 rounded-xl text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-gold">Order #{o.id}</span>
                            <span>₦{o.total_amount.toLocaleString()}</span>
                          </div>
                          <p className="text-light/40">{new Date(o.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && isAdmin && siteSettings && (
              <form onSubmit={handleUpdateSettings} className="glass p-8 rounded-2xl space-y-6">
                <h3 className="font-bold mb-4 flex items-center space-x-2">
                  <Monitor size={18} className="text-gold" />
                  <span>Global Site Settings</span>
                </h3>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={siteSettings.hero_title}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Hero Subtitle</label>
                  <textarea
                    value={siteSettings.hero_subtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={siteSettings.contact_email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">Currency Symbol</label>
                    <input
                      type="text"
                      value={siteSettings.currency_symbol}
                      onChange={(e) => setSiteSettings({ ...siteSettings, currency_symbol: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>Update Site Settings</span>
                </button>
              </form>
            )}

            {activeTab === "leads" && (
              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="glass p-12 rounded-2xl text-center text-light/40">
                    No leads collected yet.
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div key={lead.id} className="glass p-6 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold">{lead.name}</h4>
                        <span className="text-[10px] text-light/20 uppercase tracking-widest">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gold">{lead.email}</p>
                      <p className="text-sm text-light/60 italic">"{lead.message}"</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "qrcode" && (
              <div className="glass p-12 rounded-2xl flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-2xl mb-8">
                  <QRCodeSVG value={userPageUrl} size={200} />
                </div>
                <h3 className="text-xl font-bold mb-2">Your Profile QR Code</h3>
                <p className="text-sm text-light/40 mb-8">Download and print this QR code to share your profile offline.</p>
                <button 
                  onClick={() => window.print()}
                  className="btn-secondary py-3 px-8"
                >
                  Print QR Code
                </button>
              </div>
            )}
          </div>

          {/* Preview (Mobile Frame) */}
          <div className="hidden lg:flex justify-center items-start">
            <div className="sticky top-10">
              <div className="w-[300px] h-[600px] border-[10px] border-[#1A1A1A] rounded-[3rem] overflow-hidden relative bg-dark shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                <iframe
                  src={userPageUrl}
                  className="w-full h-full border-none"
                  key={activeTab} // Force reload on tab change to show updates
                  title="Preview"
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#1A1A1A] rounded-b-2xl" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full" />
              </div>
              <p className="text-center mt-6 text-[10px] font-bold text-light/20 uppercase tracking-[0.2em]">Live Preview</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <VoiceAssistant />
    </main>
    </div>
  );
}

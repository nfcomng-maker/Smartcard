import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, GripVertical, Settings, Layout, Link as LinkIcon, 
  LogOut, BarChart3, QrCode, Save, Users, Video, Music as MusicIcon, 
  MessageSquare, ShoppingBag, Globe, Monitor, CreditCard, DollarSign,
  TrendingUp, Clock, Package, UserPlus, Zap, ExternalLink, Copy, Check,
  Image as ImageIcon, Upload, Code, Menu, X, ChevronRight, Bell,
  Instagram, Twitter, Facebook, Linkedin, Github, Youtube, Mail, Phone,
  MessageCircle, Camera, MapPin, Briefcase, Search, ArrowLeft
} from "lucide-react";
import { Link, User, Profile, SiteSettings, Product, Order } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type TabType = "links" | "appearance" | "analytics" | "qrcode" | "leads" | "users" | "shop" | "settings";

const SortableLinkItem = ({ 
  link, 
  getIconComponent, 
  handleDeleteLink 
}: { 
  link: Link; 
  getIconComponent: (name: string) => React.ReactNode;
  handleDeleteLink: (id: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="mr-4 text-light/20 hover:text-gold cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={20} />
      </div>
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold mr-4 overflow-hidden">
        {getIconComponent(link.icon)}
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-sm">{link.title}</h4>
        <p className="text-xs text-light/40 truncate max-w-[200px]">{link.url}</p>
      </div>
      <button
        onClick={() => handleDeleteLink(link.id)}
        className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

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
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const iconLibrary = [
    { name: "Globe", icon: Globe },
    { name: "Instagram", icon: Instagram },
    { name: "Twitter", icon: Twitter },
    { name: "Facebook", icon: Facebook },
    { name: "Linkedin", icon: Linkedin },
    { name: "Github", icon: Github },
    { name: "Youtube", icon: Youtube },
    { name: "Mail", icon: Mail },
    { name: "Phone", icon: Phone },
    { name: "MessageCircle", icon: MessageCircle },
    { name: "Music", icon: MusicIcon },
    { name: "ShoppingBag", icon: ShoppingBag },
    { name: "Video", icon: Video },
    { name: "Camera", icon: Camera },
    { name: "MapPin", icon: MapPin },
    { name: "Briefcase", icon: Briefcase },
  ];

  const filteredIcons = iconLibrary.filter(i => 
    i.name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    if (iconName.startsWith('data:image')) {
      return <img src={iconName} className="w-5 h-5 rounded-md object-cover" alt="" />;
    }
    const found = iconLibrary.find(i => i.name === iconName);
    const IconComp = found ? found.icon : Globe;
    return <IconComp size={20} />;
  };
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [managingUser, setManagingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("links");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((i) => i.id === active.id);
      const newIndex = links.findIndex((i) => i.id === over.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      
      // Update order_index for all links
      const updatedLinks = newLinks.map((link, index) => ({
        ...link,
        order_index: index
      }));

      setLinks(updatedLinks);

      // Save to backend
      try {
        await fetch("/api/admin/links/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: updatedLinks.map(l => ({ id: l.id, order_index: l.order_index }))
          })
        });
        const targetUser = managingUser || user;
        if (targetUser) fetchLinks(targetUser.id);
      } catch (error) {
        console.error("Failed to save link order:", error);
      }
    }
  };
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    
    if (parsedUser.role !== 'admin') {
      navigate("/dashboard");
      return;
    }
    
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

  useEffect(() => {
    if (managingUser) {
      fetchLinks(managingUser.id);
      fetchProfile(managingUser.username);
      fetchAnalytics(managingUser.id);
      fetchLeads(managingUser.id);
      setActiveTab("links");
    } else if (user) {
      fetchLinks(user.id);
      fetchProfile(user.username);
      fetchAnalytics(user.id);
      fetchLeads(user.id);
    }
  }, [managingUser]);

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
    const targetUser = managingUser || user;
    if (!targetUser) return;
    await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newLink, user_id: targetUser.id }),
    });
    setNewLink({ title: "", url: "", icon: "Globe" });
    fetchLinks(targetUser.id);
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

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user and all their data? This action cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== id));
      fetchStats();
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
    const targetUser = managingUser || user;
    if (targetUser) fetchLinks(targetUser.id);
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    const targetUser = managingUser || user;
    if (!targetUser || !profile) return;
    await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, user_id: targetUser.id }),
    });
    alert("Profile updated!");
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background' | 'link-icon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'link-icon') {
        setNewLink({ ...newLink, icon: base64String });
        setShowIconPicker(false);
      } else if (profile) {
        if (type === 'avatar') {
          setProfile({ ...profile, avatar_url: base64String });
        } else {
          setProfile({ ...profile, background_image_url: base64String } as any);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userPageUrl = `${window.location.origin}/u/${managingUser?.username || user?.username}`;

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
    <div className="min-h-screen bg-[#050505] text-light flex flex-col md:flex-row selection:bg-gold/30 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-white/5 sticky top-0 z-[60]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gold rounded-xl flex items-center justify-center">
            <Zap className="text-dark" size={16} fill="currentColor" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">SMARTCARD</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-light/60 hover:text-light"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#0A0A0A] border-r border-white/5 p-6 flex flex-col z-[80] transition-transform duration-500 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gold rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20">
            <Zap className="text-dark" size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight">SMARTCARD</span>
            <span className="text-[10px] text-gold font-bold uppercase tracking-widest opacity-50">Dashboard</span>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="mb-8 p-5 bg-white/5 rounded-[2rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold/5 blur-2xl -mr-10 -mt-10 group-hover:bg-gold/10 transition-colors" />
          <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setActiveTab("links"); setIsSidebarOpen(false); }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-gold text-light/60 hover:text-dark transition-all group/btn"
            >
              <Plus size={16} className="mb-1 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Add Link</span>
            </button>
            <button 
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-gold text-light/60 hover:text-dark transition-all group/btn"
            >
              {copied ? <Check size={16} className="mb-1 text-green-500" /> : <Copy size={16} className="mb-1 group-hover/btn:scale-110 transition-transform" />}
              <span className="text-[10px] font-bold">{copied ? "Copied!" : "Copy URL"}</span>
            </button>
          </div>
        </div>

        <nav className="flex-grow space-y-8 overflow-y-auto custom-scrollbar pr-2">
          {["Personal", "Management"].map((group) => {
            const items = navItems.filter(item => item.group === group && (!item.adminOnly || isAdmin));
            if (items.length === 0) return null;
            
            return (
              <div key={group} className="space-y-2">
                <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-4 ml-3">{group}</p>
                {items.map((item, idx) => (
                  <motion.button 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group relative",
                      activeTab === item.id 
                        ? "bg-gold text-dark shadow-xl shadow-gold/20 font-bold" 
                        : "hover:bg-white/5 text-light/40 hover:text-light"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={18} className={cn("transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {activeTab === item.id ? (
                      <ChevronRight size={14} />
                    ) : (
                      <div className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-gold transition-colors" />
                    )}
                  </motion.button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-dark font-bold text-sm shadow-lg shadow-gold/10">
                {user?.username?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold truncate max-w-[100px]">{user?.username}</span>
                <span className="text-[10px] text-light/30 capitalize">{user?.role}</span>
              </div>
            </div>
            <button className="p-2 text-light/20 hover:text-gold transition-colors">
              <Bell size={18} />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all group font-bold text-xs uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-16 overflow-y-auto bg-[#050505]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 bg-white/[0.02] p-6 md:p-10 rounded-[3rem] border border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="flex items-center space-x-8 relative z-10">
            <div className="md:hidden w-12 h-12 bg-gold rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="text-dark" size={24} />
            </div>
            <div className="hidden md:flex w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-[2.5rem] border border-white/10 items-center justify-center group/logo hover:border-gold/30 transition-all shadow-2xl">
              <Zap className="text-gold group-hover/logo:scale-110 transition-transform duration-500" size={40} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-gold/20">
                  {activeTab}
                </div>
                <span className="text-light/10">/</span>
                <span className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em]">Overview</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter capitalize leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6 relative z-10">
            <div className="flex items-center space-x-4 bg-white/5 p-2 pr-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group/user cursor-pointer">
              <div className="relative">
                <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-gold to-orange-500 flex items-center justify-center text-dark font-bold text-xl shadow-lg shadow-gold/10 group-hover/user:scale-105 transition-transform duration-500">
                  {user?.username?.[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#050505] rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">{user?.username}</span>
                <span className="text-[10px] text-light/40 uppercase tracking-widest font-black">{user?.role}</span>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end px-4 border-r border-white/10">
              <p className="text-[10px] font-black text-light/20 uppercase tracking-widest">Profile Status</p>
              <p className="text-xs font-bold text-green-500">Online & Active</p>
            </div>

            <div className="flex items-center space-x-3">
              {managingUser && (
                <button
                  onClick={() => setManagingUser(null)}
                  className="flex items-center space-x-3 px-8 py-5 bg-white/5 text-gold border border-gold/30 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gold hover:text-dark"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Admin</span>
                </button>
              )}
              <a
                href={userPageUrl}
                target="_blank"
                className="hidden sm:flex items-center space-x-3 px-8 py-5 bg-gold text-dark rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-gold/20"
              >
                <span>View Profile</span>
                <ExternalLink size={14} />
              </a>
              <button className="p-5 bg-white/5 text-light/40 hover:text-gold rounded-[1.5rem] border border-white/10 hover:border-gold/30 transition-all">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
          <div className="lg:col-span-7 space-y-12">
            {activeTab === "links" && (
              <div className="space-y-10">
                <form onSubmit={handleAddLink} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <h3 className="text-xl font-bold flex items-center space-x-3">
                      <Plus size={20} className="text-gold" />
                      <span>Add New Link</span>
                    </h3>
                    <div className="p-2 bg-gold/10 rounded-xl text-gold">
                      <LinkIcon size={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Link Title</label>
                      <input
                        type="text"
                        placeholder="e.g. My Portfolio"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Destination URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Link Icon</label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(!showIconPicker)}
                        className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-gold transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          {getIconComponent(newLink.icon)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">Select Icon</p>
                          <p className="text-[10px] text-light/40 uppercase tracking-widest">Library or Custom</p>
                        </div>
                      </button>
                      
                      <label className="cursor-pointer flex items-center space-x-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-gold transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-light/40 group-hover:text-gold transition-all">
                          <Upload size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">Upload Custom</p>
                          <p className="text-[10px] text-light/40 uppercase tracking-widest">PNG, JPG, SVG</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'link-icon')} />
                      </label>
                    </div>

                    <AnimatePresence>
                      {showIconPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-dark/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl"
                        >
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-light/20" size={16} />
                            <input
                              type="text"
                              placeholder="Search icons..."
                              value={iconSearch}
                              onChange={(e) => setIconSearch(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-gold transition-all text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
                            {filteredIcons.map((i) => (
                              <button
                                key={i.name}
                                type="button"
                                onClick={() => {
                                  setNewLink({ ...newLink, icon: i.name });
                                  setShowIconPicker(false);
                                }}
                                className={cn(
                                  "p-3 rounded-xl flex items-center justify-center transition-all",
                                  newLink.icon === i.name ? "bg-gold text-dark" : "bg-white/5 text-light/40 hover:bg-white/10 hover:text-light"
                                )}
                                title={i.name}
                              >
                                <i.icon size={20} />
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button type="submit" className="w-full btn-primary py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs relative z-10 shadow-xl shadow-gold/10">
                    Add Link to Profile
                  </button>
                </form>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] ml-4 mb-4">Your Links</p>
                  {links.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LinkIcon size={24} className="text-light/20" />
                      </div>
                      <p className="text-sm text-light/40">No links added yet. Start by adding one above!</p>
                    </div>
                  ) : (
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={links.map(l => l.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {links.map((link) => (
                            <SortableLinkItem 
                              key={link.id} 
                              link={link} 
                              getIconComponent={getIconComponent}
                              handleDeleteLink={handleDeleteLink}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            )}

            {activeTab === "appearance" && profile && (
              <form onSubmit={handleUpdateProfile} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Profile Avatar</label>
                    <div className="flex items-center space-x-6 bg-white/5 p-4 rounded-[2rem] border border-white/5">
                      <div className="relative group">
                        <img 
                          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                          className="w-20 h-20 rounded-[1.5rem] border-2 border-gold/20 object-cover group-hover:border-gold transition-all shadow-xl shadow-gold/5" 
                          alt="Avatar" 
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <ImageIcon size={20} className="text-white" />
                        </div>
                      </div>
                      <label className="cursor-pointer bg-gold text-dark py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/10">
                        <div className="flex items-center space-x-2">
                          <Upload size={14} />
                          <span>Change Image</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Hero Background</label>
                    <div className="flex items-center space-x-6 bg-white/5 p-4 rounded-[2rem] border border-white/5">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                        {(profile as any).background_image_url ? (
                          <img src={(profile as any).background_image_url} className="w-full h-full object-cover" alt="BG" />
                        ) : (
                          <ImageIcon size={24} className="text-light/10" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <ImageIcon size={20} className="text-white" />
                        </div>
                      </div>
                      <label className="cursor-pointer bg-white/10 text-light py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                        <div className="flex items-center space-x-2">
                          <Upload size={14} />
                          <span>Set Background</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'background')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Display Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all text-lg font-bold tracking-tight"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Short Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all h-32 resize-none text-sm leading-relaxed"
                      placeholder="Tell the world about yourself..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Visual Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'default', label: 'Dark', color: 'bg-[#0A0A0A]' },
                        { id: 'gold', label: 'Premium', color: 'bg-gold' },
                        { id: 'light', label: 'Light', color: 'bg-white' },
                        { id: 'vibrant', label: 'Vibrant', color: 'bg-gradient-to-br from-purple-600 to-blue-600' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setProfile({ ...profile, theme: t.id })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all text-center group",
                            profile.theme === t.id ? "border-gold bg-gold/5" : "border-white/5 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div className={cn("w-full h-12 rounded-xl mb-3 shadow-inner", t.color)} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", profile.theme === t.id ? "text-gold" : "text-light/40")}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">
                      <Code size={14} />
                      <span>Custom CSS Overrides</span>
                    </label>
                    <textarea
                      value={(profile as any).custom_css || ""}
                      onChange={(e) => setProfile({ ...profile, custom_css: e.target.value })}
                      placeholder="/* Add your custom styles here */\n.profile-card { border: 2px solid gold; }"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all h-40 font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>
                
                <div className="pt-10 border-t border-white/5 space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-[0.3em] flex items-center space-x-3 text-light/40">
                    <Settings size={16} className="text-gold" />
                    <span>Advanced Configuration</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">
                        <Video size={14} />
                        <span>Background Video (MP4)</span>
                      </label>
                      <input
                        type="url"
                        value={profile.background_video_url || ""}
                        onChange={(e) => setProfile({ ...profile, background_video_url: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">
                        <MusicIcon size={14} />
                        <span>Music Embed URL</span>
                      </label>
                      <input
                        type="url"
                        value={profile.music_embed_url || ""}
                        onChange={(e) => setProfile({ ...profile, music_embed_url: e.target.value })}
                        placeholder="https://open.spotify.com/embed/..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-gold/20 transition-all">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Lead Generation Form</p>
                        <p className="text-[10px] text-light/30 uppercase font-black tracking-widest mt-1">Collect visitor contact info</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.enable_contact_form === 1}
                        onChange={(e) => setProfile({ ...profile, enable_contact_form: e.target.checked ? 1 : 0 })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gold text-dark py-5 rounded-[2rem] flex items-center justify-center space-x-3 font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-gold/20">
                  <Save size={20} />
                  <span>Commit Changes</span>
                </button>
              </form>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-12">
                {isAdmin && stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-gold/20 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                            <stat.icon size={24} />
                          </div>
                          <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <p className="text-4xl font-bold tracking-tighter">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-10 rounded-[3rem] text-center border border-white/5 hover:border-gold/20 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16" />
                      <div className="w-16 h-16 bg-gold/10 rounded-[1.5rem] flex items-center justify-center text-gold mx-auto mb-6 group-hover:scale-110 transition-transform relative z-10">
                        <Monitor size={32} />
                      </div>
                      <p className="text-[10px] text-light/20 uppercase font-black tracking-[0.3em] mb-3">Total Views</p>
                      <p className="text-7xl font-bold text-gold tracking-tighter leading-none">{analytics.views}</p>
                    </div>
                    <div className="bg-white/5 p-10 rounded-[3rem] text-center border border-white/5 hover:border-gold/20 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16" />
                      <div className="w-16 h-16 bg-gold/10 rounded-[1.5rem] flex items-center justify-center text-gold mx-auto mb-6 group-hover:scale-110 transition-transform relative z-10">
                        <Zap size={32} />
                      </div>
                      <p className="text-[10px] text-light/20 uppercase font-black tracking-[0.3em] mb-3">Link Clicks</p>
                      <p className="text-7xl font-bold text-gold tracking-tighter leading-none">{analytics.clicks}</p>
                    </div>
                  </div>
                )}

                {/* Chart Section */}
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-bold tracking-tight">Traffic Overview</h3>
                    <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-gold">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Mon', views: 400 },
                        { name: 'Tue', views: 300 },
                        { name: 'Wed', views: 600 },
                        { name: 'Thu', views: 800 },
                        { name: 'Fri', views: 500 },
                        { name: 'Sat', views: 900 },
                        { name: 'Sun', views: 1100 },
                      ]}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#ffffff20" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#F27D26', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#F27D26" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorViews)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-bold flex items-center space-x-3 tracking-tight">
                      <TrendingUp size={24} className="text-gold" />
                      <span>Live Activity</span>
                    </h3>
                    <div className="flex items-center space-x-3 bg-green-500/10 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Real-time</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {isAdmin && stats ? stats.recentOrders.map((order: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5 group">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Order #{order.id}</p>
                            <p className="text-[10px] text-light/40 uppercase tracking-widest font-black mt-1">{new Date(order.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gold tracking-tight">₦{order.total_amount.toLocaleString()}</span>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Completed</p>
                        </div>
                      </div>
                    )) : analytics?.recentViews.map((view, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5 group">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                            <Globe size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{view.ip_address}</p>
                            <p className="text-[10px] text-light/40 uppercase tracking-widest font-black mt-1">{new Date(view.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-xl">
                          <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                          <span className="text-[10px] font-black text-light/40 uppercase tracking-widest">Visitor</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && isAdmin && (
              <div className="space-y-10">
                <form onSubmit={handleCreateUser} className="bg-white/5 p-10 rounded-[3rem] space-y-8 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-colors" />
                  <h3 className="text-2xl font-bold flex items-center space-x-4 relative z-10">
                    <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                      <UserPlus size={24} />
                    </div>
                    <span>Provision New User</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. johndoe"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-light/20 uppercase tracking-widest ml-1">Account Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-gold transition-all appearance-none font-bold"
                      >
                        <option value="user">Standard User</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gold text-dark py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs relative z-10 shadow-2xl shadow-gold/20 hover:scale-[1.01] transition-transform">
                    Create User Profile
                  </button>
                </form>

                <div className="bg-white/5 rounded-[3rem] overflow-hidden border border-white/5">
                  <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">User Directory</h3>
                      <p className="text-[10px] text-light/20 uppercase font-black tracking-widest mt-2">{users.length} Active Profiles</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl">
                      <Users size={16} className="text-gold" />
                      <span className="text-xs font-bold">Manage All</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="p-8 font-black text-light/20 uppercase text-[10px] tracking-[0.3em]">Identity</th>
                          <th className="p-8 font-black text-light/20 uppercase text-[10px] tracking-[0.3em]">Access Level</th>
                          <th className="p-8 font-black text-light/20 uppercase text-[10px] tracking-[0.3em]">Registration</th>
                          <th className="p-8 font-black text-light/20 uppercase text-[10px] tracking-[0.3em]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-white/5 transition-all group">
                            <td className="p-8">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center text-gold font-bold text-sm border border-white/5 group-hover:border-gold/20 transition-all">
                                  {u.username[0].toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-lg tracking-tight">{u.username}</span>
                                  <p className="text-[10px] text-light/20 uppercase tracking-widest font-black mt-0.5">Active Member</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                              <span className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                u.role === 'admin' ? "bg-gold/10 text-gold border-gold/20" : "bg-white/5 text-light/30 border-white/10"
                              )}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center space-x-2 text-light/40">
                                <Clock size={14} />
                                <span className="text-xs font-bold">{new Date(u.created_at || '').toLocaleDateString()}</span>
                              </div>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center space-x-3">
                                <a 
                                  href={`/u/${u.username}`} 
                                  target="_blank" 
                                  className="inline-flex items-center space-x-2 bg-white/5 hover:bg-gold hover:text-dark px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                  <span>Live Profile</span>
                                  <ExternalLink size={12} />
                                </a>
                                <button 
                                  onClick={() => setManagingUser(u)}
                                  className="inline-flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                  <Settings size={12} />
                                  <span>Manage Page</span>
                                </button>
                                {u.id !== user?.id && (
                                  <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-2.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
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
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-bold flex items-center space-x-4">
                        <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                          <Package size={24} />
                        </div>
                        <span>Inventory</span>
                      </h3>
                      <button className="p-3 bg-white/5 rounded-2xl text-light/40 hover:text-gold transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center space-x-5 p-4 rounded-3xl bg-white/5 hover:bg-white/[0.08] transition-all group border border-transparent hover:border-white/10">
                          <img src={p.image_url} className="w-16 h-16 rounded-2xl object-cover shadow-xl" alt="" />
                          <div className="flex-grow">
                            <p className="text-lg font-bold tracking-tight">{p.name}</p>
                            <p className="text-xs text-gold font-bold mt-1">₦{p.price.toLocaleString()}</p>
                          </div>
                          <button className="p-3 text-light/10 hover:text-light transition-colors">
                            <Settings size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-bold flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                          <CreditCard size={24} />
                        </div>
                        <span>Sales Flow</span>
                      </h3>
                      <div className="px-4 py-2 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Live
                      </div>
                    </div>
                    <div className="space-y-4">
                      {stats?.recentOrders.map((o: any) => (
                        <div key={o.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-lg font-bold tracking-tighter">Order #{o.id}</span>
                              <p className="text-[10px] text-light/20 uppercase font-black tracking-widest mt-1">{new Date(o.created_at).toLocaleString()}</p>
                            </div>
                            <span className="text-xl font-bold text-blue-500 tracking-tighter">₦{o.total_amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-[10px] font-black text-light/40 uppercase tracking-widest">Paid & Confirmed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && isAdmin && siteSettings && (
              <form onSubmit={handleUpdateSettings} className="bg-white/5 p-12 rounded-[3rem] border border-white/5 space-y-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-3xl font-bold flex items-center space-x-5 tracking-tighter">
                    <div className="p-4 bg-gold/10 rounded-[1.5rem] text-gold">
                      <Monitor size={32} />
                    </div>
                    <span>Platform Settings</span>
                  </h3>
                  <div className="p-4 bg-white/5 rounded-2xl text-light/20">
                    <Settings size={24} />
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-light/20 ml-2">Main Hero Headline</label>
                    <input
                      type="text"
                      value={siteSettings.hero_title}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-gold transition-all text-xl font-bold tracking-tight"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-light/20 ml-2">Hero Description</label>
                    <textarea
                      value={siteSettings.hero_subtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_subtitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-gold transition-all h-32 resize-none text-sm leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-light/20 ml-2">Support Email</label>
                      <input
                        type="email"
                        value={siteSettings.contact_email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-gold transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-light/20 ml-2">Global Currency</label>
                      <input
                        type="text"
                        value={siteSettings.currency_symbol}
                        onChange={(e) => setSiteSettings({ ...siteSettings, currency_symbol: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-gold transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gold text-dark py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-gold/20 hover:scale-[1.01] transition-transform">
                  Update Global Configuration
                </button>
              </form>
            )}

            {activeTab === "leads" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold tracking-tighter">Collected Leads</h3>
                  <div className="px-4 py-2 bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest rounded-full">
                    {leads.length} Total
                  </div>
                </div>
                {leads.length === 0 ? (
                  <div className="bg-white/5 p-20 rounded-[3rem] text-center border border-dashed border-white/10">
                    <MessageSquare size={40} className="mx-auto mb-4 text-light/10" />
                    <p className="text-sm text-light/40">No leads collected yet. Share your profile to start collecting!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-gold/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                              {lead.name[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{lead.name}</h4>
                              <p className="text-xs text-gold font-bold">{lead.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-light/20 uppercase tracking-widest">
                            {new Date(lead.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                          <p className="text-sm text-light/60 leading-relaxed italic">"{lead.message}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "qrcode" && (
              <div className="bg-white/5 p-12 rounded-[3rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32" />
                <div className="bg-white p-8 rounded-[3rem] mb-10 shadow-2xl shadow-gold/20 relative z-10">
                  <QRCodeSVG value={userPageUrl} size={220} />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tighter relative z-10">Your Digital Identity</h3>
                <p className="text-sm text-light/40 mb-10 max-w-md relative z-10">Download and print this QR code to share your SMARTCARD profile offline. Perfect for business cards or physical displays.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md relative z-10">
                  <button 
                    onClick={() => window.print()}
                    className="w-full py-5 bg-gold text-dark rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all"
                  >
                    Print QR Code
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-light rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
                  >
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5 space-y-12">
            <div className="sticky top-16">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold tracking-tighter">Live Preview</h3>
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-light/40 uppercase tracking-widest">Synced</span>
                </div>
              </div>
              
              <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] bg-[#0A0A0A] rounded-[3rem] border-[8px] border-[#1A1A1A] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-3xl z-50" />
                
                {/* Mock Content */}
                <div className="h-full overflow-y-auto custom-scrollbar p-6 pt-12 space-y-8">
                  <div className="text-center space-y-4">
                    <img 
                      src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                      className="w-24 h-24 rounded-[2rem] mx-auto border-2 border-gold shadow-2xl" 
                      alt="" 
                    />
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{profile?.name || user?.username}</h2>
                      <p className="text-[10px] text-light/40 mt-1">{profile?.bio || "No bio set yet..."}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {links.map((l, i) => (
                      <div key={i} className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-sm font-bold">
                        {l.title}
                      </div>
                    ))}
                    {links.length === 0 && (
                      <div className="space-y-3 opacity-20">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-full h-12 bg-white/10 rounded-2xl" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-10 p-8 bg-white/5 rounded-[3rem] border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[10px] font-black text-light/20 uppercase tracking-widest">Profile QR Code</p>
                  <QrCode size={16} className="text-gold" />
                </div>
                <div className="flex justify-center p-6 bg-white rounded-[2rem]">
                  <QRCodeSVG value={userPageUrl} size={140} />
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
                >
                  <Copy size={14} />
                  <span>{copied ? "Link Copied!" : "Copy Profile URL"}</span>
                </button>
              </div>
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/5 p-4 flex justify-around items-center z-[100]">
        {navItems.filter(item => !item.adminOnly || isAdmin).slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={cn(
              "p-3 rounded-2xl transition-all",
              activeTab === item.id ? "bg-gold text-dark scale-110 shadow-lg shadow-gold/20" : "text-light/20"
            )}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, GripVertical, Settings, Layout, Link as LinkIcon, 
  LogOut, BarChart3, QrCode, Save, MessageSquare, Zap, ExternalLink, 
  Copy, Check, Image as ImageIcon, Upload, Code, Menu, X, Bell,
  Instagram, Twitter, Facebook, Linkedin, Github, Youtube, Mail, Phone,
  MessageCircle, Camera, MapPin, Briefcase, Search, Globe, TrendingUp,
  Music as MusicIcon, ShoppingBag, Video, FileText, Calendar, FolderOpen,
  Music, Image, File
} from "lucide-react";
import { Link, User, Profile } from "../types";
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

type TabType = "links" | "appearance" | "analytics" | "qrcode" | "leads" | "portfolio" | "appointments" | "assets";

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

export function UserDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<{ views: number; clicks: number; recentViews: any[] } | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [portfolio, setPortfolioItems] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("links");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role === 'admin') {
      navigate("/admin");
      return;
    }

    fetchData(parsedUser.id, parsedUser.username);
  }, [navigate]);

  const fetchData = async (userId: number, username: string) => {
    try {
      const linksRes = await fetch(`/api/admin/links/${userId}`);
      const linksData = await linksRes.json();
      setLinks(linksData);

      const profileRes = await fetch(`/api/profile/${username}`);
      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      const analyticsRes = await fetch(`/api/admin/analytics/${userId}`);
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      const leadsRes = await fetch(`/api/admin/leads/${userId}`);
      const leadsData = await leadsRes.json();
      setLeads(leadsData);

      const portfolioRes = await fetch(`/api/portfolio/${userId}`);
      const portfolioData = await portfolioRes.json();
      setPortfolioItems(portfolioData);

      const appointmentsRes = await fetch(`/api/appointments/${userId}`);
      const appointmentsData = await appointmentsRes.json();
      setAppointments(appointmentsData);

      const assetsRes = await fetch(`/api/assets/${userId}`);
      const assetsData = await assetsRes.json();
      setAssets(assetsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleAddLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLink = {
      user_id: user?.id,
      title: formData.get("title"),
      url: formData.get("url"),
      icon: formData.get("icon"),
    };

    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLink),
    });

    if (res.ok) {
      fetchData(user!.id, user!.username);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    const res = await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);

      // Update order in DB
      await fetch("/api/admin/links/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links: newLinks.map((l, i) => ({ id: l.id, order_index: i }))
        }),
      });
    }
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, user_id: user?.id }),
    });
    if (res.ok) {
      alert("Profile updated successfully!");
    }
  };

  const handleAddPortfolio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      user_id: user?.id,
      title: formData.get("title"),
      description: formData.get("description"),
      image_url: formData.get("image_url"),
      link_url: formData.get("link_url"),
    };

    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (res.ok) {
      fetchData(user!.id, user!.username);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    if (!confirm("Delete this portfolio item?")) return;
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPortfolioItems(portfolio.filter(p => p.id !== id));
    }
  };

  const handleAddAsset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAsset = {
      user_id: user?.id,
      type: formData.get("type"),
      title: formData.get("title"),
      url: formData.get("url"),
    };

    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAsset),
    });

    if (res.ok) {
      fetchData(user!.id, user!.username);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteAsset = async (id: number) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleAddAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAppt = {
      user_id: user?.id,
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      time: formData.get("time"),
      duration: parseInt(formData.get("duration") as string),
    };

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppt),
    });

    if (res.ok) {
      fetchData(user!.id, user!.username);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!confirm("Delete this appointment?")) return;
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/u/${user?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIconComponent = (name: string) => {
    const iconMap: Record<string, any> = {
      Instagram, Twitter, Facebook, Linkedin, Github, Youtube, Mail, Phone,
      MessageCircle, Globe, Music: MusicIcon, ShoppingBag, Video, Camera, MapPin, Briefcase
    };
    const Icon = iconMap[name] || Globe;
    return <Icon size={20} />;
  };

  const userPageUrl = `/u/${user?.username}`;

  const navItems = [
    { id: "links", label: "Links", icon: LinkIcon, group: "Personal" },
    { id: "portfolio", label: "Portfolio", icon: Briefcase, group: "Personal" },
    { id: "assets", label: "Documents", icon: FolderOpen, group: "Personal" },
    { id: "appointments", label: "Appointments", icon: Calendar, group: "Personal" },
    { id: "appearance", label: "Appearance", icon: Layout, group: "Personal" },
    { id: "analytics", label: "Analytics", icon: BarChart3, group: "Personal" },
    { id: "leads", label: "Leads", icon: MessageSquare, group: "Personal" },
    { id: "qrcode", label: "QR Code", icon: QrCode, group: "Personal" },
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
            <span className="text-[10px] text-gold font-bold uppercase tracking-widest opacity-50">User Portal</span>
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
          <div className="space-y-2">
            <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-4 ml-3">Personal</p>
            {navItems.map((item, idx) => (
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
                  <item.icon size={18} className={cn(
                    "transition-transform duration-500",
                    activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </div>
                {activeTab === item.id && (
                  <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-dark rounded-full" />
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
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
                <span className="text-[10px] text-light/40 uppercase tracking-widest font-black">User</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
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

        <div className="max-w-6xl">
          <AnimatePresence mode="wait">
            {activeTab === "links" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                <div className="lg:col-span-7 space-y-12">
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
                      <Plus className="text-gold" size={20} />
                      <span>Add New Link</span>
                    </h3>
                    <form onSubmit={handleAddLink} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Link Title</label>
                          <input 
                            name="title" 
                            placeholder="e.g. My Portfolio" 
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Icon Name</label>
                          <select 
                            name="icon" 
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all appearance-none"
                          >
                            <option value="Globe">Globe</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Linkedin">Linkedin</option>
                            <option value="Github">Github</option>
                            <option value="Youtube">Youtube</option>
                            <option value="Mail">Mail</option>
                            <option value="Phone">Phone</option>
                            <option value="MessageCircle">MessageCircle</option>
                            <option value="Music">Music</option>
                            <option value="ShoppingBag">ShoppingBag</option>
                            <option value="Video">Video</option>
                            <option value="Camera">Camera</option>
                            <option value="MapPin">MapPin</option>
                            <option value="Briefcase">Briefcase</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">URL</label>
                        <input 
                          name="url" 
                          placeholder="https://..." 
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" 
                          required 
                        />
                      </div>
                      <button type="submit" className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                        Add Link to Profile
                      </button>
                    </form>
                  </div>

                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
                      <LinkIcon className="text-gold" size={20} />
                      <span>Your Links</span>
                    </h3>
                    {links.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
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

                <div className="lg:col-span-5">
                  <div className="sticky top-12">
                    <div className="bg-white/5 p-4 rounded-[3.5rem] border border-white/10 shadow-2xl">
                      <div className="bg-[#050505] rounded-[3rem] aspect-[9/19] overflow-hidden relative border border-white/5">
                        <iframe 
                          src={userPageUrl} 
                          className="w-full h-full border-none"
                          title="Preview"
                        />
                        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                      </div>
                    </div>
                    <p className="text-center mt-6 text-[10px] font-black text-light/20 uppercase tracking-[0.2em]">Live Preview</p>
                  </div>
                </div>
              </motion.div>
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
                          className="w-24 h-24 rounded-3xl object-cover border-2 border-white/10 group-hover:border-gold transition-all" 
                          alt="Avatar" 
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Upload size={20} className="text-gold" />
                        </div>
                      </div>
                      <div className="flex-grow space-y-2">
                        <input 
                          value={profile.avatar_url || ""} 
                          onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                          placeholder="Avatar URL" 
                          className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-xs outline-none focus:border-gold" 
                        />
                        <p className="text-[10px] text-light/20">Paste an image URL or use our generator</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Display Name</label>
                    <input 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-gold transition-all font-bold" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Bio / Description</label>
                  <textarea 
                    value={profile.bio} 
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-3xl p-6 outline-none focus:border-gold transition-all h-32 resize-none" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Theme</label>
                    <select 
                      value={profile.theme} 
                      onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-gold appearance-none"
                    >
                      <option value="default">Default Dark</option>
                      <option value="gold">Premium Gold</option>
                      <option value="light">Clean Light</option>
                      <option value="vibrant">Vibrant Purple</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Background Video (MP4)</label>
                    <input 
                      value={profile.background_video_url || ""} 
                      onChange={(e) => setProfile({ ...profile, background_video_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-gold" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Music Embed (Spotify/SC)</label>
                    <input 
                      value={profile.music_embed_url || ""} 
                      onChange={(e) => setProfile({ ...profile, music_embed_url: e.target.value })}
                      placeholder="Embed URL"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 outline-none focus:border-gold" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-all relative cursor-pointer",
                      profile.enable_contact_form === 1 ? "bg-gold" : "bg-white/10"
                    )} onClick={() => setProfile({ ...profile, enable_contact_form: profile.enable_contact_form === 1 ? 0 : 1 })}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        profile.enable_contact_form === 1 ? "left-7" : "left-1"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Enable Lead Capture Form</p>
                      <p className="text-[10px] text-light/20 uppercase tracking-widest">Allow visitors to message you</p>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary py-4 px-10 rounded-2xl text-xs font-black uppercase tracking-widest">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "analytics" && analytics && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: "Total Views", value: analytics.views, icon: Globe, color: "text-blue-500" },
                    { label: "Link Clicks", value: analytics.clicks, icon: TrendingUp, color: "text-green-500" },
                    { label: "CTR", value: analytics.views > 0 ? ((analytics.clicks / analytics.views) * 100).toFixed(1) + "%" : "0%", icon: Zap, color: "text-gold" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon size={80} />
                      </div>
                      <p className="text-[10px] font-black text-light/20 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                      <h4 className={cn("text-5xl font-bold tracking-tighter", stat.color)}>{stat.value}</h4>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <h3 className="text-xl font-bold mb-10 flex items-center space-x-3">
                    <TrendingUp className="text-gold" size={20} />
                    <span>Traffic Overview</span>
                  </h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Mon', views: 400 },
                        { name: 'Tue', views: 300 },
                        { name: 'Wed', views: 600 },
                        { name: 'Thu', views: 800 },
                        { name: 'Fri', views: 500 },
                        { name: 'Sat', views: 900 },
                        { name: 'Sun', views: analytics.views },
                      ]}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4A017" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '16px' }}
                          itemStyle={{ color: '#D4A017' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#D4A017" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "leads" && (
              <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                <h3 className="text-xl font-bold mb-10 flex items-center space-x-3">
                  <MessageSquare className="text-gold" size={20} />
                  <span>Recent Leads</span>
                </h3>
                {leads.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-sm text-light/40">No leads captured yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{lead.name}</h4>
                            <p className="text-sm text-gold">{lead.email}</p>
                          </div>
                          <span className="text-[10px] text-light/20 font-black uppercase tracking-widest">
                            {new Date(lead.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-light/60 bg-black/20 p-4 rounded-2xl border border-white/5 italic">
                          "{lead.message}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="space-y-12">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
                    <Briefcase className="text-gold" size={20} />
                    <span>Add Portfolio Project</span>
                  </h3>
                  <form onSubmit={handleAddPortfolio} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Project Title</label>
                        <input name="title" placeholder="Project Name" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Project Link (Optional)</label>
                        <input name="link_url" placeholder="https://..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Description</label>
                      <textarea name="description" placeholder="Describe your work..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all h-24 resize-none" required />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Image URL</label>
                      <input name="image_url" placeholder="https://..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                    </div>
                    <button type="submit" className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Add to Portfolio
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {portfolio.map((item) => (
                    <div key={item.id} className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-gold/30 transition-all">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <button onClick={() => handleDeletePortfolio(item.id)} className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="p-8">
                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                        <p className="text-sm text-light/40 mb-6 line-clamp-2">{item.description}</p>
                        {item.link_url && (
                          <a href={item.link_url} target="_blank" className="inline-flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest hover:underline">
                            <span>View Project</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "assets" && (
              <div className="space-y-12">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
                    <FolderOpen className="text-gold" size={20} />
                    <span>Store Document or Media</span>
                  </h3>
                  <form onSubmit={handleAddAsset} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Document Title</label>
                        <input name="title" placeholder="e.g. My CV" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Type</label>
                        <select name="type" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all appearance-none">
                          <option value="cv">CV / Resume</option>
                          <option value="document">Key Document</option>
                          <option value="picture">Picture / Photo</option>
                          <option value="music">Music / Audio</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">File URL</label>
                      <input name="url" placeholder="https://..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                    </div>
                    <button type="submit" className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Save to Vault
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                          {asset.type === 'cv' && <FileText size={24} />}
                          {asset.type === 'document' && <File size={24} />}
                          {asset.type === 'picture' && <Image size={24} />}
                          {asset.type === 'music' && <Music size={24} />}
                        </div>
                        <button onClick={() => handleDeleteAsset(asset.id)} className="p-2 text-red-500/40 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <h4 className="font-bold mb-1 truncate">{asset.title}</h4>
                      <p className="text-[10px] text-light/20 uppercase font-black tracking-widest mb-4">{asset.type}</p>
                      <a href={asset.url} target="_blank" className="w-full py-3 bg-white/5 hover:bg-gold hover:text-dark rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                        <ExternalLink size={12} />
                        <span>Access File</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-12">
                <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                  <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
                    <Calendar className="text-gold" size={20} />
                    <span>Schedule Appointment Slot</span>
                  </h3>
                  <form onSubmit={handleAddAppointment} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Title</label>
                        <input name="title" placeholder="e.g. Consultation" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Duration (minutes)</label>
                        <input name="duration" type="number" defaultValue="30" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Date</label>
                        <input name="date" type="date" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Time</label>
                        <input name="time" type="time" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-light/20 ml-2">Description</label>
                      <textarea name="description" placeholder="Details about this slot..." className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-gold transition-all h-24 resize-none" />
                    </div>
                    <button type="submit" className="w-full btn-primary py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Open Appointment Slot
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-gold/20 transition-all">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-gold/10 rounded-[1.5rem] flex flex-col items-center justify-center text-gold">
                          <span className="text-[10px] font-black uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-2xl font-bold leading-none">{new Date(appt.date).getDate()}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-1">{appt.title}</h4>
                          <div className="flex items-center space-x-4 text-xs text-light/40">
                            <span className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>{appt.time} ({appt.duration}m)</span>
                            </span>
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest">
                              {appt.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAppointment(appt.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "qrcode" && user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white/5 p-12 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="p-8 bg-white rounded-[3rem] mb-8 shadow-2xl shadow-gold/20">
                    <QRCodeSVG 
                      value={`${window.location.origin}/u/${user.username}`}
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Your Profile QR Code</h3>
                  <p className="text-sm text-light/40 mb-8 max-w-xs">Download and print this QR code to share your digital business card offline.</p>
                  <button className="btn-primary py-4 px-12 rounded-2xl w-full flex items-center justify-center space-x-3">
                    <Upload size={18} />
                    <span>Download QR Code</span>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                    <h4 className="text-lg font-bold mb-6">How to use</h4>
                    <ul className="space-y-6">
                      {[
                        { step: "01", text: "Download your high-resolution QR code" },
                        { step: "02", text: "Print it on physical business cards or stickers" },
                        { step: "03", text: "Anyone who scans it will be taken to your profile" },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-4">
                          <span className="text-gold font-black text-xl leading-none">{item.step}</span>
                          <p className="text-sm text-light/60">{item.text}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gold p-10 rounded-[3rem] text-dark">
                    <h4 className="text-lg font-bold mb-4">Pro Tip</h4>
                    <p className="text-sm font-medium opacity-80">Add this QR code to your email signature or presentation slides for instant networking during virtual meetings.</p>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

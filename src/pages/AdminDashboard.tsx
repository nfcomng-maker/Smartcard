import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, GripVertical, Settings, Layout, Link as LinkIcon, LogOut, BarChart3, QrCode, Save, Users, Video, Music as MusicIcon, MessageSquare } from "lucide-react";
import { Link, User, Profile } from "../types";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

export function AdminDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<{ views: number; clicks: number; recentViews: any[] } | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "Globe" });
  const [activeTab, setActiveTab] = useState<"links" | "appearance" | "analytics" | "qrcode" | "leads">("links");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchLinks(parsedUser.id);
    fetchProfile(parsedUser.username);
    fetchAnalytics(parsedUser.id);
    fetchLeads(parsedUser.id);
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

  return (
    <div className="min-h-screen bg-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center space-x-2 mb-12">
          <div className="w-8 h-8 bg-gold rounded-lg" />
          <span className="font-display font-bold">ADMIN</span>
        </div>

        <nav className="flex-grow space-y-2">
          <button 
            onClick={() => setActiveTab("links")}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === "links" ? "bg-gold/10 text-gold" : "hover:bg-white/5 text-light/60"}`}
          >
            <LinkIcon size={20} />
            <span className="font-medium">Links</span>
          </button>
          <button 
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === "appearance" ? "bg-gold/10 text-gold" : "hover:bg-white/5 text-light/60"}`}
          >
            <Layout size={20} />
            <span className="font-medium">Appearance</span>
          </button>
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === "analytics" ? "bg-gold/10 text-gold" : "hover:bg-white/5 text-light/60"}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab("leads")}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === "leads" ? "bg-gold/10 text-gold" : "hover:bg-white/5 text-light/60"}`}
          >
            <Users size={20} />
            <span className="font-medium">Leads</span>
          </button>
          <button 
            onClick={() => setActiveTab("qrcode")}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${activeTab === "qrcode" ? "bg-gold/10 text-gold" : "hover:bg-white/5 text-light/60"}`}
          >
            <QrCode size={20} />
            <span className="font-medium">QR Code</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2 capitalize">{activeTab}</h1>
            <p className="text-sm text-light/40">Manage your SMARTCARD profile</p>
          </div>
          <a
            href={userPageUrl}
            target="_blank"
            className="btn-secondary py-2 px-6 text-sm"
          >
            View Live Page
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

            {activeTab === "analytics" && analytics && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-2xl text-center">
                    <p className="text-xs text-light/40 uppercase font-bold mb-2">Total Views</p>
                    <p className="text-4xl font-bold text-gold">{analytics.views}</p>
                  </div>
                  <div className="glass p-6 rounded-2xl text-center">
                    <p className="text-xs text-light/40 uppercase font-bold mb-2">Link Clicks</p>
                    <p className="text-4xl font-bold text-gold">{analytics.clicks}</p>
                  </div>
                </div>
                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {analytics.recentViews.map((view, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-light/60">{new Date(view.timestamp).toLocaleString()}</span>
                        <span className="text-gold">{view.ip_address}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
            <div className="w-[320px] h-[640px] border-[8px] border-white/10 rounded-[3rem] overflow-hidden relative bg-dark shadow-2xl">
              <iframe
                src={userPageUrl}
                className="w-full h-full border-none"
                key={activeTab} // Force reload on tab change to show updates
                title="Preview"
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white/10 rounded-b-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Smartphone, Lock, User, Chrome, Facebook } from "lucide-react";
import { motion } from "framer-motion";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        localStorage.setItem("user", JSON.stringify(event.data.user));
        navigate("/admin");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin");
    } else {
      setError(data.error);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      const response = await fetch(`/api/auth/${provider}/url`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );
    } catch (error) {
      console.error('OAuth error:', error);
      setError('Failed to initiate social login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-2xl mb-4">
            <Smartphone className="text-gold w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-light/60">Manage your SMARTCARD profile</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-xl py-3 hover:bg-white/10 transition-colors"
          >
            <Chrome size={18} />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin('facebook')}
            className="flex items-center justify-center space-x-2 bg-white/5 border border-white/10 rounded-xl py-3 hover:bg-white/10 transition-colors"
          >
            <Facebook size={18} />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-dark px-2 text-light/40">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-light/20 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-light/20 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button type="submit" className="w-full btn-primary py-4">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-light/40">
            Don't have an account? <Link to="/signup" className="text-gold">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

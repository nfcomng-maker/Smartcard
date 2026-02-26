import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Smartphone, Lock, User, UserPlus, Mail, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (strength < 2) {
      setError("Password is too weak");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-20">
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-2xl mb-4">
            <UserPlus className="text-gold w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-light/60">Join SMARTCARD and build your profile</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
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
                placeholder="Choose a username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-light/20 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                placeholder="you@example.com"
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 focus:border-gold outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-light/20 hover:text-light transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-light/40">Strength: {strengthLabels[strength - 1] || "Too Short"}</span>
                  <span className="text-[10px] font-bold text-gold">{Math.min(strength * 25, 100)}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(strength * 25, 100)}%` }}
                    className={cn("h-full transition-all duration-500", strengthColors[strength - 1] || "bg-red-500")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className={cn("flex items-center space-x-1 text-[10px]", password.length > 6 ? "text-green-500" : "text-light/20")}>
                    {password.length > 6 ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    <span>Min 7 chars</span>
                  </div>
                  <div className={cn("flex items-center space-x-1 text-[10px]", /[A-Z]/.test(password) ? "text-green-500" : "text-light/20")}>
                    {/[A-Z]/.test(password) ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    <span>Uppercase</span>
                  </div>
                  <div className={cn("flex items-center space-x-1 text-[10px]", /[0-9]/.test(password) ? "text-green-500" : "text-light/20")}>
                    {/[0-9]/.test(password) ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    <span>Number</span>
                  </div>
                  <div className={cn("flex items-center space-x-1 text-[10px]", /[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-light/20")}>
                    {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    <span>Special char</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-light/40 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-light/20 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-gold outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-light/40">
            Already have an account? <Link to="/login" className="text-gold">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

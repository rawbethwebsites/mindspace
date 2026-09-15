"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../ConvexClientProvider";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        auth.setUser(userId, password);
        navigate("/chat");
      } else {
        const storedToken = auth.getToken();
        if (storedToken && storedToken === password) {
          navigate("/chat");
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1eb] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d9542b] to-[#ef7851] glow-sunset flex items-center justify-center mx-auto mb-4">
            <img src="/tbn-mark-white.png" alt="" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mindspace</h1>
          <p className="text-sm text-white/50 mt-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            {isSignUp
              ? "Your data stays private and encrypted"
              : "Sign in to access your conversations"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#fffdf8] border border-[#15202d]/11 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d9542b] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#fffdf8] border border-[#15202d]/11 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d9542b] transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-[#fffdf8] border border-[#15202d]/11 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d9542b] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁‍🗨" : "🔒"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f0505c]/10 border border-[#f0505c]/20">
                <span className="text-[#f0505c] shrink-0">⚠️</span>
                <p className="text-xs text-[#f0505c]">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-sunset py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          {/* Toggle link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="mt-1 text-sm font-semibold text-[#d9542b] hover:underline"
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-white/40 mt-6">
          By continuing, you agree to our{" "}
          <a href="/resources" className="text-white/60 hover:underline">
            Disclaimer
          </a>
        </p>
      </div>
    </div>
  );
}

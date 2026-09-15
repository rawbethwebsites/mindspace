"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
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

        await signIn("password", {
          email,
          password,
          name,
          flow: "signUp",
        });
      } else {
        // Sign in flow
        await signIn("password", {
          email,
          password,
          flow: "signIn",
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary-light)] glow-sunset flex items-center justify-center mx-auto mb-4">
            <img
              src="/tbn-mark-white.png"
              alt=""
              className="w-10 h-10 object-contain"
            />
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
            {/* Name field (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
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
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20">
                <AlertCircle
                  size={16}
                  className="text-[var(--color-error)] shrink-0"
                  aria-hidden="true"
                />
                <p className="text-xs text-[var(--color-error)]">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-sunset py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Please wait...
                </span>
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
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
              className="mt-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
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
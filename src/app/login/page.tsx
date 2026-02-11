"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] relative overflow-hidden">
      {/* Brand gradient background */}
      <div
        className="absolute top-0 right-[-400px] w-[800px] h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(252,90,41,0.10) 100%)",
          transform: "skewX(-20deg)",
          transformOrigin: "top right",
        }}
      />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FC5A29" />
              <path d="M8 22L16 10L24 22H8Z" fill="white" />
            </svg>
            <span className="text-white text-2xl font-bold tracking-tight">
              Arda Prototypes
            </span>
          </div>
          <p className="text-white/40 text-sm">
            Enter the shared password to access the prototype gallery.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/60 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter shared secret"
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#FC5A29]/60 focus:border-[#FC5A29]/40 transition-all"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 px-4 bg-[#FC5A29] text-white font-bold rounded-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#FC5A29]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm tracking-wide"
          >
            {loading ? "Verifying..." : "Enter Gallery"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          &copy; Arda Systems &middot; Internal Use Only
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-white/40">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

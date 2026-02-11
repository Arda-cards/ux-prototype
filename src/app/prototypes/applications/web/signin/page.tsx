"use client";

import { ArdaLogo } from "../arda-logo";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="arda-signin">
      {/* Left Panel — orange brand */}
      <div className="arda-signin__left">
        <div className="arda-signin__left-gradient" />
        <div style={{ position: "relative", zIndex: 10, padding: 32 }}>
          <ArdaLogo size={40} />
        </div>
      </div>

      {/* Right Panel — sign-in form */}
      <div className="arda-signin__right">
        <div className="arda-signin__form-card">
          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 700,
                lineHeight: "36px",
                color: "var(--arda-dark)",
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--arda-muted)",
                marginTop: 8,
              }}
            >
              Never run out of anything. Get started with Arda.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/prototypes/applications/web";
            }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Email */}
            <div>
              <label
                htmlFor="signin-email"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--arda-dark)",
                  marginBottom: 6,
                }}
              >
                Email{" "}
                <span style={{ color: "var(--arda-orange)" }}>*</span>
              </label>
              <input
                id="signin-email"
                type="email"
                placeholder="Email"
                defaultValue="demo@arda.cards"
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 12px",
                  border: "1px solid var(--arda-border)",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signin-password"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--arda-dark)",
                  marginBottom: 6,
                }}
              >
                Password{" "}
                <span style={{ color: "var(--arda-orange)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  defaultValue="password123"
                  style={{
                    width: "100%",
                    height: 36,
                    padding: "0 40px 0 12px",
                    border: "1px solid var(--arda-border)",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--arda-muted)",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: "100%",
                height: 36,
                background: "var(--arda-orange)",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Sign in
            </button>
          </form>

          {/* Separator */}
          <div
            style={{
              margin: "24px 0",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: "var(--arda-border)" }}
            />
            <span style={{ fontSize: 12, color: "var(--arda-muted)" }}>
              OR SIGN IN WITH
            </span>
            <div
              style={{ flex: 1, height: 1, background: "var(--arda-border)" }}
            />
          </div>

          {/* Social buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            {["GitHub", "Google", "Apple"].map((provider) => (
              <button
                key={provider}
                className="arda-btn"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {provider === "GitHub" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                {provider === "Google" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {provider === "Apple" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Footer links */}
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 14,
              color: "var(--arda-muted)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p>
              Forgot your password?{" "}
              <span style={{ color: "var(--arda-orange)", cursor: "pointer", textDecoration: "underline" }}>
                Reset password
              </span>
            </p>
            <p>
              Don&apos;t have an account?{" "}
              <span style={{ color: "var(--arda-orange)", cursor: "pointer", textDecoration: "underline" }}>
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

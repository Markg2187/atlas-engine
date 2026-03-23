"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://atlas-engine-seven.vercel.app/reset-password",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: "rgba(201, 151, 58, 0.12)", border: "1px solid rgba(201, 151, 58, 0.3)" }}
          >
            <span style={{ color: "#c9973a", fontSize: "1.75rem" }}>⬡</span>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#c9973a" }}
          >
            Atlas Engine
          </h1>
          <p className="mt-1 text-base" style={{ color: "#5a6a7a" }}>
            Peptide Protocol Management Platform
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e8e0d0",
            borderTop: "3px solid #c9973a",
          }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a2744" }}
          >
            Reset Password
          </h2>

          {sent ? (
            <div>
              <div
                className="rounded-lg px-4 py-4 text-base mb-6"
                style={{
                  backgroundColor: "#eaf3de",
                  border: "1px solid #c0dd97",
                  color: "#3b6d11",
                }}
              >
                Check your email for a password reset link.
              </div>
              <Link
                href="/login"
                className="block text-center text-base"
                style={{ color: "#c9973a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-base mb-6" style={{ color: "#5a6a7a" }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block text-sm uppercase tracking-widest mb-2"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#5a6a7a" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@clinic.com"
                    className="w-full rounded-lg px-4 py-3 text-base transition-all focus:outline-none"
                    style={{
                      backgroundColor: "#f5f3ee",
                      border: "1px solid #e8e0d0",
                      color: "#1a2744",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#c9973a";
                      e.target.style.boxShadow = "0 0 0 2px rgba(201,151,58,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e8e0d0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {error && (
                  <div
                    className="rounded-lg px-4 py-3 text-base"
                    style={{
                      backgroundColor: "rgba(224, 90, 106, 0.1)",
                      border: "1px solid #f7c1c1",
                      color: "#e05a6a",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-base transition-all"
                  style={{
                    backgroundColor: loading ? "#a87c2e" : "#c9973a",
                    color: "#0b1120",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="text-sm transition-colors"
                  style={{ color: "#5a6a7a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9973a")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#5a6a7a")}
                >
                  ← Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

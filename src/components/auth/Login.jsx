// src/components/auth/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.code, err.message);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">

      {/* LEFT PANEL */}
      <div className="auth-split-left">
        <div className="auth-split-left-inner">
          <Link to="/" className="auth-back-link">&larr; Back to home</Link>
          <div className="auth-brand">
            <img src="/assets/cashpilot.svg" alt="CashPilot" />
            <span>CashPilot</span>
          </div>
          <h2 className="auth-left-heading">
            Your finances,<br />
            <span className="auth-left-gradient">under control.</span>
          </h2>
          <p className="auth-left-sub">
            Track every naira. Set budgets, visualize patterns,
            and export professional reports — all in real time.
          </p>
          <ul className="auth-feature-list">
            <li>Real-time transaction sync</li>
            <li>Budget &amp; income tracking</li>
            <li>Charts and analytics</li>
            <li>CSV and PDF exports</li>
          </ul>
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-split-right">
        <div className="auth-form-card">

          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your CashPilot account</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/reset-password" className="auth-link-small">Forgot password?</Link>
              </div>
              <div className="auth-pw-wrapper">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Sign In"}
            </button>
          </form>

          <div className="auth-switch">
            Don&apos;t have an account?&nbsp;
            <Link to="/register" className="auth-switch-link">Create one</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

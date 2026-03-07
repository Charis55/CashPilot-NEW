// src/components/auth/ResetPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setMessage("Reset link sent! Check your inbox and follow the instructions.");
    } catch {
      setError("Could not send a reset email. Make sure the address is registered.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">

      {/* ── LEFT PANEL ── */}
      <div className="auth-split-left">
        <div className="auth-split-left-inner">
          <Link to="/" className="auth-back-link">&larr; Back to home</Link>
          <div className="auth-brand">
            <img src="/assets/cashpilot-logo.png" alt="CashPilot" />
            <span>CashPilot</span>
          </div>
          <h2 className="auth-left-heading">
            Recover your<br />
            <span className="auth-left-gradient">account access.</span>
          </h2>
          <p className="auth-left-sub">
            Enter the email address associated with your CashPilot account
            and we&apos;ll send you a reset link right away.
          </p>
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="auth-split-right">
        <div className="auth-form-card">

          <div className="auth-form-header">
            <h1>Forgot password?</h1>
            <p>No worries — we&apos;ll send you reset instructions</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          {message ? (
            <div className="auth-success-banner" style={{ marginBottom: "28px" }}>
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="auth-switch">
            Remembered it?&nbsp;
            <Link to="/login" className="auth-switch-link">Back to sign in</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

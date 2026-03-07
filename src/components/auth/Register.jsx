// src/components/auth/Register.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created! You can now sign in.");
    } catch (err) {
      console.error("Register error:", err.code);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Could not create your account. Please try again.");
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
            <img src="/assets/cashpilot-logo.png" alt="CashPilot" />
            <span>CashPilot</span>
          </div>
          <h2 className="auth-left-heading">
            Start your journey<br />
            <span className="auth-left-gradient">to financial clarity.</span>
          </h2>
          <p className="auth-left-sub">
            Join CashPilot and take control of your money with
            powerful real-time tracking and smart budgeting tools.
          </p>
          <ul className="auth-feature-list">
            <li>Free to get started</li>
            <li>No credit card required</li>
            <li>Secure Firebase authentication</li>
            <li>Access from any device</li>
          </ul>
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-split-right">
        <div className="auth-form-card">

          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Fill in the details below to get started</p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}
          {message && <div className="auth-success-banner">{message}</div>}

          {!message && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="reg-password">Password</label>
                <div className="auth-pw-wrapper">
                  <input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete="new-password"
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

              <div className="auth-field">
                <label htmlFor="reg-confirm">Confirm password</label>
                <div className="auth-pw-wrapper">
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowConfirm(v => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : "Create Account"}
              </button>
            </form>
          )}

          {message && (
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link to="/login" className="auth-switch-link">Sign in now</Link>
            </div>
          )}

          <div className="auth-switch" style={{ marginTop: message ? "12px" : undefined }}>
            Already have an account?&nbsp;
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </div>

        </div>
      </div>

    </div>
  );
}

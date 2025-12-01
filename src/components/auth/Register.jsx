// src/components/auth/Register.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Create the account
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification email WITH redirect link
      await sendEmailVerification(cred.user, {
        url: "http://localhost:5173/login",
        handleCodeInApp: false
      });

      setMessage(
        "Account created! A verification email has been sent. Please check your inbox to activate your account."
      );

    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try signing in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Your password is too weak. Please use at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">

        <div className="auth-logo">
          <img src="/assets/cashpilot-logo.png" alt="CashPilot" />
          <span>CashPilot</span>
        </div>

        <h2>Create Account</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="password-hint">
            Your password needs at least 8 characters and must include one uppercase letter,
            one lowercase letter, one symbol or sign, and one number.
          </p>

          <button type="submit">Register</button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>

      </div>
    </div>
  );
}

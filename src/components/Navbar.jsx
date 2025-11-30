// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <header className="navbar">
      {/* LEFT: LOGO */}
      <div className="navbar-left">
        <NavLink to="/" className="navbar-brand">
          <img src="/assets/cashpilot-logo.png" alt="CashPilot" />
          <span>CashPilot</span>
        </NavLink>
      </div>

      {/* CENTER NAVIGATION LINKS */}
      <nav className="navbar-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            "nav-link" + (isActive ? " active" : "")
          }
        >
          Home
        </NavLink>

        {currentUser && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Dashboard
          </NavLink>
        )}
      </nav>

      {/* RIGHT: AUTH CONTROLS */}
      <div className="navbar-right">
        {currentUser ? (
          <>
            <span className="navbar-email">{currentUser.email}</span>
            <button className="navbar-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="navbar-btn login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="navbar-btn register"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}

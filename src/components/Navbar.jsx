// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="nav-left">
        <img src="/assets/cashpilot-logo.png" className="nav-logo" />
        <h2>CashPilot</h2>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>

        {currentUser && <Link to="/dashboard">Dashboard</Link>}

        {!currentUser ? (
          <>
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <Link to="/Register" className="btn-fill">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="user-email">{currentUser.email}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

// src/components/SidebarLayout.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SidebarLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout error", e);
    }
  }

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <img
            src="/assets/cashpilot-logo.png"
            alt="CashPilot"
            className="sidebar-logo"
          />
          <span>CashPilot</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span>🏠</span> <span>Overview</span>
          </NavLink>

          <NavLink
            to="/dashboard/form"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span>➕</span> <span>Add Transaction</span>
          </NavLink>

          <NavLink
            to="/dashboard/list"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span>📄</span> <span>Transactions</span>
          </NavLink>

          <NavLink
            to="/dashboard/charts"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span>📊</span> <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div className="sidebar-user">
              <div className="avatar">
                {currentUser.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="user-meta">
                <span className="user-label">Signed in as</span>
                <span className="user-email">{currentUser.email}</span>
              </div>
            </div>
          )}

          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="app-main">
        {/* Morph / Fade transition on each screen */}
        <div className="page page-morph">{children}</div>
      </main>
    </div>
  );
}

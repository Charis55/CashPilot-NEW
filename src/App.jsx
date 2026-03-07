<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
=======
import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ResetPassword from "./components/auth/ResetPassword";
<<<<<<< HEAD
import LandingPage from "./pages/LandingPage";
import Overview from "./pages/Overview";
import AddTransaction from "./pages/AddTransaction";
import TransactionHistory from "./pages/TransactionHistory";
import Analytics from "./pages/Analytics";
=======
import Dashboard from "./components/Dashboard";
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const { currentUser, logout } = useAuth();
<<<<<<< HEAD
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
=======
  const location = useLocation();
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

  const isLandingPage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/reset-password";

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((p) => !p);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  useEffect(() => { closeMenu(); }, [location.pathname]);

  const displayName = (currentUser?.email || "").split("@")[0];

  const navLinkStyle = ({ isActive }) => ({
    color: "var(--card-text)",
    textDecoration: "none",
    fontSize: "1.2rem",
    fontWeight: "700",
    padding: "10px 0",
    transition: "all 0.3s ease",
    display: "block",
    letterSpacing: "0.4px",
    background: isActive
      ? "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))"
      : "transparent",
    WebkitBackgroundClip: isActive ? "text" : "unset",
    WebkitTextFillColor: isActive ? "transparent" : "var(--card-text)",
  });

  return (
    <div className="app-shell">

<<<<<<< HEAD
      {/* Authenticated header — shown on all app pages except landing and auth */}
      {!isLandingPage && !isAuthPage && (
=======
      {!isAuthPage && (
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
        <header className="app-header">

          <Link to="/dashboard" className="header-logo" style={{ textDecoration: "none" }}>
            <img src="/assets/cashpilot-logo.png" alt="CashPilot" />
            <span>CashPilot</span>
          </Link>

          <div className="toolbar-welcome">
            {currentUser && `WELCOME, ${displayName.toUpperCase()}`}
          </div>

          <div className="toolbar-right">
            <button
              className="hamburger-btn"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <div className="hamburger-bar" style={{ transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <div className="hamburger-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
              <div className="hamburger-bar" style={{ transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          </div>

          {/* Slide-out drawer */}
          <div className={`slide-drawer ${menuOpen ? "open" : "closed"}`}>

            {/* Home — shows user avatar when signed in */}
            <div className="drawer-home-row">
              {currentUser && (
                <div className="drawer-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <NavLink to="/" onClick={closeMenu} style={navLinkStyle} className="drawer-nav-link">
                Home
              </NavLink>
            </div>

            <div className="drawer-nav-divider" />

            <NavLink to="/dashboard" end onClick={closeMenu} style={navLinkStyle} className="drawer-nav-link">Overview</NavLink>
            <NavLink to="/add" onClick={closeMenu} style={navLinkStyle} className="drawer-nav-link">Add Transaction</NavLink>
            <NavLink to="/transactions" onClick={closeMenu} style={navLinkStyle} className="drawer-nav-link">Transaction History</NavLink>
            <NavLink to="/analytics" onClick={closeMenu} style={navLinkStyle} className="drawer-nav-link">Analytics</NavLink>

            <div className="drawer-footer">
              {currentUser && <p className="drawer-user-email">{currentUser.email}</p>}
              <button onClick={handleLogout} className="drawer-logout-btn">LOGOUT</button>
            </div>
          </div>

          {menuOpen && <div className="drawer-overlay" onClick={closeMenu} />}
        </header>
      )}

      <main className={`app-main ${isAuthPage ? "auth-fullscreen" : ""} ${isLandingPage ? "landing-fullscreen" : ""}`}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Private */}
          <Route path="/dashboard" element={<PrivateRoute><Overview /></PrivateRoute>} />
          <Route path="/add" element={<PrivateRoute><AddTransaction /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

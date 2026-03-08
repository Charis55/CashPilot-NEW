// src/pages/LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const FEATURES = [
    {
        title: "Real-Time Tracking",
        desc: "Every transaction syncs instantly across your devices via Firebase — your finances are always up to date.",
    },
    {
        title: "Budget Management",
        desc: "Set monthly budgets and income targets. Get instant alerts when you're approaching or exceeding your limit.",
    },
    {
        title: "Analytics & Charts",
        desc: "Visualize income versus expenses and break down spending by category with interactive charts.",
    },
    {
        title: "CSV & PDF Exports",
        desc: "Download a full report of your transactions as a formatted CSV spreadsheet or a branded PDF in one click.",
    },
    {
        title: "Secure & Private",
        desc: "Backed by Firebase Authentication with email verification. Only you can access your financial data.",
    },
    {
        title: "Multi-Category Log",
        desc: "Organize transactions by custom categories, add notes, and filter your history to find exactly what you need.",
    },
];

export default function LandingPage() {
    const { currentUser } = useAuth();
    const displayName = currentUser ? (currentUser.email || "").split("@")[0] : null;

    return (
        <div className="landing-page">

            {/* ── NAVBAR ── */}
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <img src="/assets/cashpilot.svg" alt="CashPilot" />
                    <span>CashPilot</span>
                </div>
                <div className="landing-nav-cta">
                    {currentUser ? (
                        <>
                            <span className="landing-nav-welcome">Hi, {displayName}</span>
                            <Link to="/add" className="landing-btn-ghost">Add Transaction</Link>
                            <Link to="/dashboard" className="landing-btn-solid">Dashboard</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="landing-btn-ghost">Sign In</Link>
                            <Link to="/register" className="landing-btn-solid">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="landing-hero">
                <div className="landing-hero-badge">Personal Finance, Simplified</div>

                <h1 className="landing-hero-title">
                    Take Control of<br />
                    <span className="landing-hero-gradient">Your Money</span>
                </h1>

                <p className="landing-hero-sub">
                    CashPilot helps you track income and expenses, set budgets,
                    visualize spending patterns, and export professional reports —
                    all in one secure, real-time dashboard.
                </p>

                <div className="landing-hero-actions">
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" className="landing-btn-solid landing-btn-lg">Go to Dashboard</Link>
                            <Link to="/analytics" className="landing-btn-ghost landing-btn-lg">View Analytics</Link>
                            <Link to="/transactions" className="landing-btn-ghost landing-btn-lg">Transactions</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="landing-btn-solid landing-btn-lg">Create Free Account</Link>
                            <Link to="/login" className="landing-btn-ghost landing-btn-lg">Sign In</Link>
                        </>
                    )}
                </div>

                {/* Decorative glow orbs */}
                <div className="landing-orb landing-orb-1" aria-hidden="true" />
                <div className="landing-orb landing-orb-2" aria-hidden="true" />
            </section>

            {/* ── STATS STRIP ── */}
            <section className="landing-stats">
                <div className="landing-stat">
                    <strong>Real-Time</strong>
                    <span>Sync across all devices</span>
                </div>
                <div className="landing-stat-divider" />
                <div className="landing-stat">
                    <strong>Secure</strong>
                    <span>Firebase-backed auth</span>
                </div>
                <div className="landing-stat-divider" />
                <div className="landing-stat">
                    <strong>Free</strong>
                    <span>No credit card required</span>
                </div>
                <div className="landing-stat-divider" />
                <div className="landing-stat">
                    <strong>Instant</strong>
                    <span>Reports in one click</span>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="landing-features">
                <div className="section-header" style={{ textAlign: "center", alignItems: "center" }}>
                    <h2 className="section-title">Everything You Need</h2>
                    <p className="section-sub">A full toolkit for personal finance management</p>
                    <div className="underline-accent" />
                </div>

                <div className="landing-features-grid">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="landing-feature-card">
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA BAND ── */}
            <section className="landing-cta-band">
                <h2>Ready to get started?</h2>
                <p>Join CashPilot today and take the first step toward financial clarity.</p>
                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                    {currentUser ? (
                        <>
                            <Link to="/dashboard" className="landing-btn-solid landing-btn-lg">Go to Dashboard</Link>
                            <Link to="/add" className="landing-btn-ghost landing-btn-lg">Add Transaction</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="landing-btn-solid landing-btn-lg">Create Free Account</Link>
                            <Link to="/login" className="landing-btn-ghost landing-btn-lg">Sign In</Link>
                        </>
                    )}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} CashPilot &mdash; CharisCorp. All rights reserved.</p>
            </footer>

        </div>
    );
}

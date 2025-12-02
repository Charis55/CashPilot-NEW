// src/components/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  function handleMainButton() {
    // Always *look* like "Go To Dashboard"
    // but send guests to login
    navigate(currentUser ? "/dashboard" : "/login");
  }

  return (
    <div className="home-container">
      {/* Top navbar exactly like screenshot */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            Take Control of Your <span>Money</span>
          </h1>

          <p>
            CashPilot helps you track income, manage spending, set budgets,
            and visualize your finances — in real time, with simplicity.
          </p>

          <div className="hero-buttons">
            <button className="primary" onClick={handleMainButton}>
              Go To Dashboard
            </button>

            {!currentUser && (
              <button
                className="secondary"
                onClick={() => navigate("/register")}
              >
                Create Free Account
              </button>
            )}
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/assets/cashpilot-small.png"
            alt="CashPilot preview"
          />
        </div>
      </section>

      {/* FEATURES – match the screenshot text */}
      <section className="features">
        <div className="feature-card">
          <h3>Smart Tracking</h3>
          <p>
            Log every income and expense in seconds. Updates instantly using
            Firebase real-time sync.
          </p>
        </div>

        <div className="feature-card">
          <h3>Budget Control</h3>
          <p>
            Set monthly budgets and track spending. Prevent overspending with
            live balance updates.
          </p>
        </div>

        <div className="feature-card">
          <h3>Visual Analysis</h3>
          <p>
            Interactive charts show your financial flow. Understand where your
            money really goes.
          </p>
        </div>

        <div className="feature-card">
          <h3>Secure</h3>
          <p>
            Firebase authentication with email verification. Your data is
            private and protected.
          </p>
        </div>
      </section>

      <footer className="home-footer">
        © {new Date().getFullYear()} CharisCorp. All rights reserved.
      </footer>
    </div>
  );
}

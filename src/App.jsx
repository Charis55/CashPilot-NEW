// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ResetPassword from "./components/auth/ResetPassword";

import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./components/Home";

import AddTransactionPage from "./screens/AddTransactionPage";
import TransactionsPage from "./screens/TransactionsPage";
import AnalyticsPage from "./screens/AnalyticsPage";
import SidebarLayout from "./components/Sidebar";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 🌍 Public Homepage */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 📊 Dashboard + App Screens (all behind auth + sidebar) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <Dashboard />
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/form"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <AddTransactionPage />
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/list"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <TransactionsPage />
              </SidebarLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/charts"
          element={
            <PrivateRoute>
              <SidebarLayout>
                <AnalyticsPage />
              </SidebarLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

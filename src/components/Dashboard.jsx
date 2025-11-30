// src/components/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

import BudgetPanel from "./BudgetPanel";
import MonthlyIncomePanel from "./MonthlyIncomePanel";
import AnimatedCounter from "./AnimatedCounter";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  /* 🔥 TRANSACTIONS */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(docs);
    });

    return unsubscribe;
  }, [currentUser]);

  /* 💰 MONTHLY BUDGET */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "budgets"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setBudget(snapshot.docs[0].data().amount || 0);
      } else {
        setBudget(0);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  /* 💵 MONTHLY INCOME */
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "monthlyIncome"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setMonthlyIncome(snapshot.docs[0].data().amount || 0);
      } else {
        setMonthlyIncome(0);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  /* 📊 TOTALS */
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      else expense += Number(t.amount);
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  /* 🗑 Delete – (still here so list page can use it later if needed) */
  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete transaction.");
    }
  }

  const firstName =
    currentUser?.email?.split("@")[0]?.split(/[._-]/)[0] || "Friend";

  return (
    <div className="dashboard dark-dashboard">
      <div className="dashboard-content">
        {/* 🌟 HERO SECTION – mirrors homepage structure */}
        <section className="dashboard-hero">
          <div className="hero-text-block">
            <h1>
              Welcome back, <span>{firstName}</span>
            </h1>
            <p>
              Here’s a quick overview of your finances. Track your income,
              control expenses, and stay aligned with your monthly goals.
            </p>
          </div>

          <div className="hero-logo-block">
            <img
              src="/assets/cashpilot-small.png"
              alt="CashPilot Overview"
              className="hero-dashboard-logo"
            />
          </div>
        </section>

        {/* 📊 SUMMARY CARDS */}
        <section className="summary fade-up">
          <div className="summary-box">
            <h3>Total Income</h3>
            <p>
              <AnimatedCounter value={totals.income} />
            </p>
            <small>YOUR TOTAL EARNINGS</small>
          </div>

          <div className="summary-box">
            <h3>Total Expenses</h3>
            <p>
              <AnimatedCounter value={totals.expense} />
            </p>
            <small>RECORDED SPENDING</small>
          </div>

          <div className="summary-box">
            <h3>Balance</h3>
            <p>
              <AnimatedCounter value={totals.balance} />
            </p>
            <small>INCOME MINUS EXPENSES</small>
          </div>

          <div className="summary-box wide">
            <BudgetPanel
              budget={budget}
              setBudget={setBudget}
              userId={currentUser?.uid}
            />
          </div>

          <div className="summary-box wide">
            <MonthlyIncomePanel
              income={monthlyIncome}
              userId={currentUser?.uid}
            />
          </div>
        </section>

        {/* 🟩 ACTION CARDS → New Screens (like homepage features) */}
        <section className="dash-actions fade-up">
          <article
            className="dash-action-card"
            onClick={() => navigate("/dashboard/form")}
          >
            <div className="action-icon">➕</div>
            <h3>Add Transaction</h3>
            <p>
              Quickly record income or expenses. Keep your cashflow updated in
              real-time.
            </p>
            <button className="action-cta">Go to Transaction Form</button>
          </article>

          <article
            className="dash-action-card"
            onClick={() => navigate("/dashboard/list")}
          >
            <div className="action-icon">📄</div>
            <h3>View Transactions</h3>
            <p>
              Browse, search and review your full transaction history with
              labels and notes.
            </p>
            <button className="action-cta">Open Transaction List</button>
          </article>

          <article
            className="dash-action-card"
            onClick={() => navigate("/dashboard/charts")}
          >
            <div className="action-icon">📊</div>
            <h3>Analytics & Reports</h3>
            <p>
              Visualize your spending patterns and export detailed reports as
              CSV or PDF.
            </p>
            <button className="action-cta">View Analytics</button>
          </article>
        </section>
      </div>
    </div>
  );
}

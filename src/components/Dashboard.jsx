// Dashboard.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import BudgetPanel from "./BudgetPanel";
import Charts from "./Charts";
import ExportButtons from "./ExportButtons";
import MonthlyIncomePanel from "./MonthlyIncomePanel";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [editTransaction, setEditTransaction] = useState(null);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  /* ----------------------------------------------------------
      🔥 REAL-TIME TRANSACTIONS LISTENER
  ---------------------------------------------------------- */
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


  /* ----------------------------------------------------------
      🔥 REAL-TIME BUDGET LISTENER
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
      🔥 REAL-TIME MONTHLY INCOME LISTENER
      Using monthlyIncome/{uid}
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!currentUser) return;

    const ref = doc(db, "monthlyIncome", currentUser.uid);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (snapshot.exists()) {
        setMonthlyIncome(snapshot.data().amount || 0);
      } else {
        setMonthlyIncome(0);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  /* ----------------------------------------------------------
      💰 TOTALS
  ---------------------------------------------------------- */
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

  const overBudget = useMemo(() => {
    if (!budget) return false;
    return totals.expense > budget;
  }, [budget, totals.expense]);

  /* ----------------------------------------------------------
      🗑️ DELETE TRANSACTION
  ---------------------------------------------------------- */
  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("🔥 Delete error:", error);
      alert("Failed to delete transaction.");
    }
  }

  return (
    <div className="dashboard">

      {/* ── OVERVIEW HEADER ── */}
      <div className="section-header">
        <h2 className="section-title">Financial Overview</h2>
        <div className="underline-accent" />
      </div>

      {/* ── STAT CARDS ── */}
      <section className="summary">

        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">₦{totals.income.toFixed(2)}</span>
          <span className="stat-label">Total Income</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💸</span>
          <span className={`stat-value ${overBudget ? "danger" : ""}`}>
            ₦{totals.expense.toFixed(2)}
          </span>
          <span className="stat-label">Total Expenses</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⚖️</span>
          <span className={`stat-value ${totals.balance < 0 ? "danger" : ""}`}>
            ₦{totals.balance.toFixed(2)}
          </span>
          <span className="stat-label">Net Balance</span>
        </div>

      </section>

      {/* ── BUDGET & INCOME PANELS ── */}
      <div className="section-header" style={{ marginTop: "10px" }}>
        <h2 className="section-title">Budget & Income</h2>
        <div className="underline-accent" />
      </div>

      <section className="summary" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "0" }}>

        <BudgetPanel
          budget={budget}
          setBudget={setBudget}
          userId={currentUser?.uid}
        />

        <MonthlyIncomePanel
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          userId={currentUser?.uid}
        />

      </section>

      {/* ── MAIN LAYOUT ── */}
      <div className="section-header" style={{ marginTop: "20px" }}>
        <h2 className="section-title">Transactions & Analytics</h2>
        <div className="underline-accent" />
      </div>

      <section className="layout">

        <div className="left">
          <TransactionForm
            editTransaction={editTransaction}
            clearEdit={() => setEditTransaction(null)}
          />

          <TransactionList
            transactions={transactions}
            onEdit={setEditTransaction}
            onDelete={handleDelete}
          />
        </div>

        <div className="right">

          <div className="charts-section">
            <div className="chart-card" ref={barChartRef}>
              <h3>Income vs Expense</h3>
              <div className="chart-container">
                <Charts transactions={transactions} chartType="bar" />
              </div>
            </div>

            <div className="chart-card" ref={pieChartRef}>
              <h3>Expense Breakdown</h3>
              <div className="chart-container">
                <Charts transactions={transactions} chartType="pie" />
              </div>
            </div>
          </div>

          <ExportButtons
            transactions={transactions}
            totals={totals}
            monthlyIncome={monthlyIncome}
            budget={budget}
            pieChartRef={pieChartRef}
            barChartRef={barChartRef}
          />

        </div>

      </section>
    </div>
  );
}

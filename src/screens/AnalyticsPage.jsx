// src/screens/AnalyticsPage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import Charts from "../components/Charts";
import ExportButtons from "../components/ExportButtons";

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(docs);
    });

    return unsub;
  }, [currentUser]);

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

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1>Analytics & Reports</h1>
        <p>
          Visualize your financial activity with interactive charts and export
          clean reports to share or archive.
        </p>
      </header>

      <section className="screen-body analytics-layout">
        <div className="chart-wide-card" ref={barChartRef}>
          <h3>Income vs Expense</h3>
          <div className="chart-full-container">
            <Charts transactions={transactions} chartType="bar" />
          </div>
        </div>

        <div className="chart-wide-card" ref={pieChartRef}>
          <h3>Expense Breakdown</h3>
          <div className="chart-full-container">
            <Charts transactions={transactions} chartType="pie" />
          </div>
        </div>

        <div className="card export-section">
          <ExportButtons
            transactions={transactions}
            totals={totals}
            pieChartRef={pieChartRef}
            barChartRef={barChartRef}
          />
        </div>
      </section>
    </div>
  );
}

// src/pages/Analytics.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
    collection,
    onSnapshot,
    query,
    where,
    doc,
} from "firebase/firestore";
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import ExportButtons from "../components/ExportButtons";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: { color: "rgba(255,255,255,0.8)", font: { family: "Inter", size: 12 } },
        },
        tooltip: {
            backgroundColor: "rgba(10,25,15,0.92)",
            borderColor: "rgba(34,197,94,0.3)",
            borderWidth: 1,
            titleColor: "#4ade80",
            bodyColor: "#e5e7eb",
        },
    },
    scales: {
        x: {
            ticks: { color: "rgba(255,255,255,0.6)" },
            grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
            ticks: { color: "rgba(255,255,255,0.6)" },
            grid: { color: "rgba(255,255,255,0.06)" },
        },
    },
};

const PIE_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
            labels: { color: "rgba(255,255,255,0.8)", font: { family: "Inter", size: 12 }, padding: 16 },
        },
        tooltip: CHART_OPTS.plugins.tooltip,
    },
};

export default function Analytics() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [budget, setBudget] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const pieChartRef = useRef(null);
    const barChartRef = useRef(null);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "transactions"), where("userId", "==", currentUser.uid)),
            (snap) => setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        );
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "budgets"), where("userId", "==", currentUser.uid)),
            (snap) => setBudget(snap.empty ? 0 : snap.docs[0].data().amount || 0)
        );
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(doc(db, "monthlyIncome", currentUser.uid), (snap) =>
            setMonthlyIncome(snap.exists() ? snap.data().amount || 0 : 0)
        );
    }, [currentUser]);

    const totals = useMemo(() => {
        let income = 0, expense = 0;
        transactions.forEach((t) => {
            if (t.type === "income") income += Number(t.amount);
            else expense += Number(t.amount);
        });
        return { income, expense, balance: income - expense };
    }, [transactions]);

    const categories = useMemo(() => {
        const cats = {};
        transactions.forEach((t) => {
            if (t.type === "expense")
                cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
        });
        return cats;
    }, [transactions]);

    const barData = {
        labels: ["Income", "Expenses"],
        datasets: [{
            label: "Amount",
            data: [totals.income, totals.expense],
            backgroundColor: ["rgba(34,197,94,0.75)", "rgba(239,68,68,0.75)"],
            borderColor: ["rgba(74,222,128,1)", "rgba(248,113,113,1)"],
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    const pieData = {
        labels: Object.keys(categories),
        datasets: [{
            label: "Expenses",
            data: Object.values(categories),
            backgroundColor: [
                "rgba(34,197,94,0.82)",
                "rgba(59,130,246,0.82)",
                "rgba(168,85,247,0.82)",
                "rgba(245,158,11,0.82)",
                "rgba(239,68,68,0.82)",
                "rgba(20,184,166,0.82)",
            ],
            borderColor: "rgba(10,25,15,0.6)",
            borderWidth: 2,
        }],
    };

    function exportCSV() {
        if (!transactions.length) return;
        const today = new Date().toISOString().split("T")[0];
        const headers = ["Created At", "Label", "Type", "Category", "Amount", "Note"];
        const rows = transactions.map((t) => [
            t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleString() : "N/A",
            t.label || "", t.type || "", t.category || "",
            Number(t.amount).toLocaleString("en-NG"), t.note || "",
        ]);
        const csv = [headers, ...rows]
            .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        a.download = `CashPilot-${today}.csv`;
        a.click();
    }

    async function exportPDF() {
        if (!transactions.length) return alert("No transactions to export.");
        try {
            await generateCashPilotPDF({ transactions, totals, monthlyIncome, budget, charts: { pieChartRef, barChartRef } });
        } catch (err) {
            console.error(err);
            alert("PDF export failed.");
        }
    }

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Analytics</h2>
                <p className="section-sub">Visual breakdown of your finances</p>
                <div className="underline-accent" />
            </div>

            {/* Charts side by side */}
            <div className="analytics-grid">

                <div className="chart-card" ref={barChartRef}>
                    <div className="chart-card-header">
                        <div>
                            <h3>Income vs Expenses</h3>
                            <p className="chart-card-sub">Totals comparison</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: "280px" }}>
                        {transactions.length > 0
                            ? <Bar data={barData} options={CHART_OPTS} />
                            : <p className="chart-empty">No data yet</p>
                        }
                    </div>
                </div>

                <div className="chart-card" ref={pieChartRef}>
                    <div className="chart-card-header">
                        <div>
                            <h3>Expense Breakdown</h3>
                            <p className="chart-card-sub">By category</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: "280px" }}>
                        {Object.keys(categories).length > 0
                            ? <Pie data={pieData} options={PIE_OPTS} />
                            : <p className="chart-empty">No expense data yet</p>
                        }
                    </div>
                </div>

            </div>

            {/* Mini summary row */}
            <div className="analytics-summary-row">
                <div className="analytics-mini-card">
                    <span>Total Income</span>
                    <strong>&#8358;{totals.income.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="analytics-mini-card">
                    <span>Total Expenses</span>
                    <strong style={{ color: "#f87171" }}>&#8358;{totals.expense.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="analytics-mini-card">
                    <span>Net Balance</span>
                    <strong style={{ color: totals.balance >= 0 ? "#4ade80" : "#f87171" }}>
                        &#8358;{totals.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                    </strong>
                </div>
                <div className="analytics-mini-card">
                    <span>Transactions</span>
                    <strong style={{ color: "var(--card-text)" }}>{transactions.length}</strong>
                </div>
            </div>

            {/* Export */}
            <ExportButtons
                transactions={transactions}
                totals={totals}
                monthlyIncome={monthlyIncome}
                budget={budget}
            />
        </div>
    );
}

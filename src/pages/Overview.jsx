// src/pages/Overview.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    collection, onSnapshot, query, where, doc, setDoc, orderBy, limit,
} from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from "chart.js";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

/* ── Animated counter hook ── */
function useAnimatedValue(target, duration = 900) {
    const [display, setDisplay] = useState(0);
    const frameRef = useRef(null);
    const startRef = useRef(null);
    const fromRef = useRef(0);

    useEffect(() => {
        const from = fromRef.current;
        const diff = target - from;
        if (diff === 0) return;
        cancelAnimationFrame(frameRef.current);
        startRef.current = null;
        frameRef.current = requestAnimationFrame(function step(ts) {
            if (!startRef.current) startRef.current = ts;
            const progress = Math.min((ts - startRef.current) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(from + diff * eased);
            if (progress < 1) frameRef.current = requestAnimationFrame(step);
            else fromRef.current = target;
        });
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration]);

    return display;
}

function fmt(n) {
    return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Stat card ── */
function StatCard({ value, label, isDanger, sub }) {
    const animated = useAnimatedValue(value);
    return (
        <div className="ov-stat-card">
            <p className="ov-stat-label">{label}</p>
            <p className={`ov-stat-value${isDanger ? " danger" : ""}`}>
                &#8358;{fmt(animated)}
            </p>
            {sub && <p className="ov-stat-sub">{sub}</p>}
        </div>
    );
}

/* ── Editable stat card ── */
function EditableStatCard({ value, label, onSave, sub }) {
    const animated = useAnimatedValue(value);
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(value || 0);
    const [saving, setSaving] = useState(false);

    useEffect(() => { if (!editing) setInput(value || 0); }, [value, editing]);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        await onSave(Number(input));
        setSaving(false);
        setEditing(false);
    }

    return (
        <div className="ov-stat-card editable">
            <p className="ov-stat-label">{label}</p>
            <p className="ov-stat-value">&#8358;{fmt(animated)}</p>
            {sub && <p className="ov-stat-sub">{sub}</p>}

            {!editing ? (
                <button className="ov-edit-btn" onClick={() => setEditing(true)}>Update</button>
            ) : (
                <form onSubmit={handleSave} className="ov-edit-form">
                    <input
                        type="number" min="0" value={input} autoFocus
                        onChange={e => setInput(e.target.value)}
                    />
                    <button type="submit" className="ov-save-btn">{saving ? "..." : "Save"}</button>
                    <button type="button" className="ov-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </form>
            )}
        </div>
    );
}

/* ── Budget progress bar ── */
function BudgetProgress({ expense, budget }) {
    if (!budget) return null;
    const pct = Math.min((expense / budget) * 100, 100);
    const over = expense > budget;
    const remaining = Math.max(budget - expense, 0);

    return (
        <div className="ov-budget-progress-card">
            <div className="ov-budget-progress-header">
                <div>
                    <p className="ov-stat-label" style={{ margin: 0 }}>Budget Usage</p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: over ? "#f87171" : "var(--text-muted)", fontWeight: 600 }}>
                        {over
                            ? `Over budget by ₦${fmt(expense - budget)}`
                            : `₦${fmt(remaining)} remaining`}
                    </p>
                </div>
                <span className="ov-budget-pct" style={{ color: over ? "#f87171" : "var(--accent-secondary)" }}>
                    {Math.round(pct)}%
                </span>
            </div>
            <div className="ov-progress-track">
                <div
                    className="ov-progress-fill"
                    style={{
                        width: `${pct}%`,
                        background: over
                            ? "linear-gradient(90deg, #ef4444, #dc2626)"
                            : "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                    }}
                />
            </div>
            <div className="ov-budget-progress-footer">
                <span>&#8358;0</span>
                <span>&#8358;{fmt(budget)}</span>
            </div>
        </div>
    );
}

export default function Overview() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [budget, setBudget] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "transactions"), where("userId", "==", currentUser.uid)),
            snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "budgets"), where("userId", "==", currentUser.uid)),
            snap => setBudget(snap.empty ? 0 : snap.docs[0].data().amount || 0)
        );
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(doc(db, "monthlyIncome", currentUser.uid),
            snap => setMonthlyIncome(snap.exists() ? snap.data().amount || 0 : 0)
        );
    }, [currentUser]);

    const totals = useMemo(() => {
        let income = 0, expense = 0;
        transactions.forEach(t => {
            if (t.type === "income") income += Number(t.amount);
            else expense += Number(t.amount);
        });
        return { income, expense, balance: income - expense };
    }, [transactions]);

    const savingsRate = monthlyIncome > 0
        ? Math.max(0, Math.round(((monthlyIncome - totals.expense) / monthlyIncome) * 100))
        : null;

    const overBudget = budget > 0 && totals.expense > budget;

    const recent = useMemo(() =>
        [...transactions]
            .sort((a, b) => {
                const ta = a.createdAt?.seconds ?? 0;
                const tb = b.createdAt?.seconds ?? 0;
                return tb - ta;
            })
            .slice(0, 5),
        [transactions]
    );

    // Monthly breakdown (last 6 months) for mini bar chart
    const monthlyData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                label: d.toLocaleString("en", { month: "short" }),
                year: d.getFullYear(),
                month: d.getMonth(),
                income: 0,
                expense: 0,
            });
        }
        transactions.forEach(t => {
            const d = t.createdAt ? new Date(t.createdAt.seconds * 1000) : null;
            if (!d) return;
            const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
            if (!m) return;
            if (t.type === "income") m.income += Number(t.amount);
            else m.expense += Number(t.amount);
        });
        return months;
    }, [transactions]);

    const barData = {
        labels: monthlyData.map(m => m.label),
        datasets: [
            {
                label: "Income",
                data: monthlyData.map(m => m.income),
                backgroundColor: "rgba(34,197,94,0.75)",
                borderRadius: 6,
            },
            {
                label: "Expense",
                data: monthlyData.map(m => m.expense),
                backgroundColor: "rgba(239,68,68,0.70)",
                borderRadius: 6,
            },
        ],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(10,25,15,0.92)",
                borderColor: "rgba(34,197,94,0.3)",
                borderWidth: 1,
                titleColor: "#4ade80",
                bodyColor: "#e5e7eb",
                callbacks: {
                    label: ctx => ` ₦${fmt(ctx.raw)}`,
                },
            },
        },
        scales: {
            x: { ticks: { color: "rgba(255,255,255,0.55)", font: { size: 11 } }, grid: { display: false } },
            y: { ticks: { color: "rgba(255,255,255,0.55)", font: { size: 11 }, callback: v => `₦${(v / 1000).toFixed(0)}k` }, grid: { color: "rgba(255,255,255,0.05)" } },
        },
    };

    async function saveBudget(amount) {
        if (!currentUser) return;
        await setDoc(doc(db, "budgets", currentUser.uid), { userId: currentUser.uid, amount }, { merge: true });
        setBudget(amount);
    }

    async function saveIncome(amount) {
        if (!currentUser) return;
        await setDoc(doc(db, "monthlyIncome", currentUser.uid), { userId: currentUser.uid, amount, updatedAt: new Date() }, { merge: true });
        setMonthlyIncome(amount);
    }

    return (
        <div>

            {/* ── Page header ── */}
            <div className="section-header">
                <h2 className="section-title">Financial Overview</h2>
                <p className="section-sub">Your money at a glance</p>
                <div className="underline-accent" />
            </div>

            {overBudget && (
                <div className="alert" style={{ marginBottom: "20px" }}>
                    You have exceeded your monthly budget of &#8358;{fmt(budget)}
                </div>
            )}

            {/* ── 5 stat cards (3 + 2) ── */}
            <div className="ov-stats-top">
                <StatCard value={totals.income} label="Total Income" sub={`${transactions.filter(t => t.type === "income").length} entries`} />
                <StatCard value={totals.expense} label="Total Expenses" isDanger={overBudget} sub={`${transactions.filter(t => t.type !== "income").length} entries`} />
                <StatCard value={totals.balance} label="Net Balance" isDanger={totals.balance < 0} sub={totals.balance >= 0 ? "Positive" : "Negative"} />
            </div>
            <div className="ov-stats-bottom">
                <EditableStatCard value={budget} label="Monthly Budget" onSave={saveBudget} sub="Spending target" />
                <EditableStatCard value={monthlyIncome} label="Monthly Income" onSave={saveIncome} sub="Income target" />
                {savingsRate !== null && (
                    <div className="ov-stat-card savings">
                        <p className="ov-stat-label">Savings Rate</p>
                        <p className="ov-stat-value" style={{ color: savingsRate >= 20 ? "var(--accent-secondary)" : savingsRate >= 10 ? "#facc15" : "#f87171" }}>
                            {savingsRate}%
                        </p>
                        <p className="ov-stat-sub">{savingsRate >= 20 ? "Excellent" : savingsRate >= 10 ? "Fair" : "Low"}</p>
                    </div>
                )}
            </div>

            {/* ── Budget progress + Mini chart side by side ── */}
            <div className="ov-middle-row">

                <BudgetProgress expense={totals.expense} budget={budget} />

                <div className="ov-chart-card">
                    <p className="ov-section-label">Monthly Trend</p>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "12px" }}>
                        <span className="ov-legend income">Income</span>
                        <span className="ov-legend expense">Expense</span>
                    </div>
                    <div style={{ height: "120px" }}>
                        <Bar data={barData} options={barOpts} />
                    </div>
                </div>

            </div>

            {/* ── New Comparison Row: Top Categories & Health Grade ── */}
            <div className="ov-middle-grid">

                {/* Top Categories */}
                <div className="ov-top-categories-card">
                    <p className="ov-section-label" style={{ marginBottom: "20px" }}>Top Spending Categories</p>
                    {useMemo(() => {
                        const cats = {};
                        transactions.filter(t => t.type === "expense").forEach(t => {
                            cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
                        });
                        const totalExp = Object.values(cats).reduce((a, b) => a + b, 0);
                        const sorted = Object.entries(cats)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4);

                        if (sorted.length === 0) return <p className="ov-empty">No expenses yet.</p>;

                        return sorted.map(([cat, amt]) => {
                            const pct = totalExp > 0 ? (amt / totalExp) * 100 : 0;
                            return (
                                <div key={cat} className="ov-category-item">
                                    <div className="ov-category-info">
                                        <span>{cat}</span>
                                        <span className="ov-category-pct">₦{fmt(amt)} ({Math.round(pct)}%)</span>
                                    </div>
                                    <div className="ov-category-bar-track">
                                        <div className="ov-category-bar-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        });
                    }, [transactions])}
                </div>

                {/* Financial Health Grade */}
                <div className="ov-health-card">
                    <p className="ov-section-label">Financial Health</p>
                    {useMemo(() => {
                        // Factors: Savings Rate, Budget Adherence, Expense/Income ratio
                        const sRate = savingsRate || 0;
                        const bAdh = budget > 0 ? Math.max(0, 100 - (totals.expense / budget * 100)) : 100;
                        const eiRatio = monthlyIncome > 0 ? (totals.expense / monthlyIncome) : 1;

                        let score = 0;
                        // Score 1: Savings Rate (40 pts max) - 30% savings rate is now 'Elite' (40 pts)
                        score += Math.min((sRate / 30) * 40, 40);

                        // Score 2: Budget Adherence (40 pts max) - 50% clear budget is now 'Elite' (40 pts)
                        score += budget > 0 ? Math.min((bAdh / 50) * 40, 40) : 40;

                        // Score 3: Expense/Income Ratio (20 pts max) - Spending < 50% is 'Elite' (20 pts)
                        score += Math.min(Math.max(0, (1 - eiRatio) / 0.5 * 20), 20);

                        let grade = "D", label = "Poor", color = "#f87171";
                        if (score >= 80) { grade = "A"; label = "Excellent"; color = "#4ade80"; }
                        else if (score >= 60) { grade = "B"; label = "Good"; color = "#22c55e"; }
                        else if (score >= 40) { grade = "C"; label = "Fair"; color = "#facc15"; }

                        return (
                            <div className="ov-health-content">
                                <div className="ov-health-grade-circle" style={{ borderColor: color, boxShadow: `0 0 20px ${color}33` }}>
                                    <span className="ov-health-grade-letter" style={{ color }}>{grade}</span>
                                    <span className="ov-health-grade-label">{label}</span>
                                </div>
                                <div className="ov-health-factors">
                                    <div className="ov-health-factor">
                                        <span className="ov-factor-label">Savings</span>
                                        <span className={`ov-factor-status ${sRate >= 20 ? "good" : sRate >= 10 ? "fair" : "poor"}`}>
                                            {sRate}%
                                        </span>
                                    </div>
                                    <div className="ov-health-factor">
                                        <span className="ov-factor-label">Budget</span>
                                        <span className={`ov-factor-status ${bAdh >= 90 ? "good" : bAdh >= 70 ? "fair" : "poor"}`}>
                                            {Math.round(bAdh)}% clear
                                        </span>
                                    </div>
                                    <div className="ov-health-factor">
                                        <span className="ov-factor-label">Ratio</span>
                                        <span className={`ov-factor-status ${eiRatio < 0.7 ? "good" : eiRatio < 0.9 ? "fair" : "poor"}`}>
                                            {Math.round(eiRatio * 100)}% spent
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }, [transactions, budget, monthlyIncome, totals, savingsRate])}
                </div>

            </div>

            {/* ── Recent Transactions ── */}
            <div className="ov-recent-card">
                <div className="ov-recent-header">
                    <p className="ov-section-label">Recent Transactions</p>
                    <a href="/transactions" className="ov-view-all">View all</a>
                </div>

                {recent.length === 0 ? (
                    <p className="ov-empty">No transactions recorded yet.</p>
                ) : (
                    <div className="ov-tx-list">
                        {recent.map(t => (
                            <div key={t.id} className="ov-tx-row">
                                <div className="ov-tx-info">
                                    <span className="ov-tx-label">{t.label || t.category}</span>
                                    <span className="ov-tx-meta">
                                        {t.category}
                                        {t.createdAt ? ` · ${new Date(t.createdAt.seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
                                    </span>
                                </div>
                                <span className={`ov-tx-amount ${t.type === "income" ? "income" : "expense"}`}>
                                    {t.type === "income" ? "+" : "-"}&#8358;{fmt(t.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

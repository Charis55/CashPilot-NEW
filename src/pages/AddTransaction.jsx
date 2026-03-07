// src/pages/AddTransaction.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
    collection, addDoc, onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
    "Food & Dining", "Transport", "Housing", "Healthcare",
    "Education", "Entertainment", "Shopping", "Travel",
    "Salary", "Freelance", "Business", "Investment",
    "Utilities", "Savings", "Other",
];

const defaultForm = {
    label: "", type: "expense", amount: "", category: "", date: "", note: "",
};

function fmt(n) {
    return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AddTransaction() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [transactions, setTransactions] = useState([]);

    // Load recent transactions for the side panel
    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "transactions"), where("userId", "==", currentUser.uid)),
            snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
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

    const recent = useMemo(() =>
        [...transactions]
            .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
            .slice(0, 4),
        [transactions]
    );

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.label || !form.amount || !form.category || !form.date) return;
        setSaving(true);
        try {
            await addDoc(collection(db, "transactions"), {
                label: form.label,
                type: form.type,
                amount: Number(form.amount),
                category: form.category,
                date: new Date(form.date),
                note: form.note,
                userId: currentUser.uid,
                createdAt: serverTimestamp(),
            });
            setForm(defaultForm);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    const isIncome = form.type === "income";

    return (
        <div className="add-tx-page">

            {/* ── LEFT: Form panel ── */}
            <div className="add-tx-form-panel">

                {/* Header */}
                <div className="add-tx-header">
                    <div className={`add-tx-type-indicator ${isIncome ? "income" : "expense"}`} />
                    <div>
                        <h1 className="add-tx-title">Add Transaction</h1>
                        <p className="add-tx-sub">Record a new entry to your ledger</p>
                    </div>
                </div>

                {success && (
                    <div className="add-tx-success">
                        Transaction saved successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-tx-form">

                    {/* Type toggle */}
                    <div className="add-tx-type-toggle">
                        <button
                            type="button"
                            className={`type-tab${form.type === "expense" ? " active expense" : ""}`}
                            onClick={() => setForm(p => ({ ...p, type: "expense" }))}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            className={`type-tab${form.type === "income" ? " active income" : ""}`}
                            onClick={() => setForm(p => ({ ...p, type: "income" }))}
                        >
                            Income
                        </button>
                    </div>

                    {/* Amount — hero field */}
                    <div className="add-tx-amount-wrapper">
                        <span className="add-tx-currency">&#8358;</span>
                        <input
                            className="add-tx-amount-input"
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Grid fields */}
                    <div className="add-tx-grid">

                        <div className="add-tx-field">
                            <label>Label</label>
                            <input
                                type="text"
                                name="label"
                                value={form.label}
                                onChange={handleChange}
                                placeholder="e.g. Monthly Rent"
                                required
                            />
                        </div>

                        <div className="add-tx-field">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="add-tx-field">
                            <label>Category</label>
                            <select name="category" value={form.category} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="add-tx-field">
                            <label>Note <span className="add-tx-optional">(optional)</span></label>
                            <input
                                type="text"
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                placeholder="Any additional details"
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className={`add-tx-submit${isIncome ? " income" : ""}`}
                        disabled={saving}
                    >
                        {saving
                            ? <span className="auth-spinner" style={{ width: 18, height: 18 }} />
                            : `Save ${isIncome ? "Income" : "Expense"}`}
                    </button>

                    <button
                        type="button"
                        className="add-tx-view-all"
                        onClick={() => navigate("/transactions")}
                    >
                        View all transactions &rarr;
                    </button>

                </form>
            </div>

            {/* ── RIGHT: Stats + Recent panel ── */}
            <div className="add-tx-side-panel">

                {/* Balance hero */}
                <div className="add-tx-balance-card">
                    <p className="add-tx-balance-label">Current Balance</p>
                    <p className={`add-tx-balance-value${totals.balance < 0 ? " negative" : ""}`}>
                        &#8358;{fmt(Math.abs(totals.balance))}
                    </p>
                    {totals.balance < 0 && <p className="add-tx-balance-neg-note">Negative balance</p>}
                </div>

                {/* Mini stat row */}
                <div className="add-tx-mini-stats">
                    <div className="add-tx-mini-stat income">
                        <span>Income</span>
                        <strong>&#8358;{fmt(totals.income)}</strong>
                    </div>
                    <div className="add-tx-mini-stat expense">
                        <span>Expenses</span>
                        <strong>&#8358;{fmt(totals.expense)}</strong>
                    </div>
                </div>

                {/* Recent entries */}
                <div className="add-tx-recent">
                    <div className="add-tx-recent-header">
                        <p>Recent Entries</p>
                        <span>{transactions.length} total</span>
                    </div>

                    {recent.length === 0 ? (
                        <p className="add-tx-empty">No transactions yet — add your first one!</p>
                    ) : (
                        recent.map(t => (
                            <div key={t.id} className="add-tx-recent-row">
                                <div className={`add-tx-recent-dot ${t.type}`} />
                                <div className="add-tx-recent-info">
                                    <span>{t.label || t.category}</span>
                                    <small>{t.category}</small>
                                </div>
                                <span className={`add-tx-recent-amt ${t.type}`}>
                                    {t.type === "income" ? "+" : "-"}&#8358;{fmt(t.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

            </div>

        </div>
    );
}

// src/pages/TransactionHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    collection, onSnapshot, query, where, orderBy,
    doc, deleteDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

function fmt(n) {
    return Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateStr(t) {
    if (!t) return "—";
    const d = t.seconds ? new Date(t.seconds * 1000) : new Date(t);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const CATEGORIES = [
    "Food & Dining", "Transport", "Housing", "Healthcare",
    "Education", "Entertainment", "Shopping", "Travel",
    "Salary", "Freelance", "Business", "Investment",
    "Utilities", "Savings", "Other",
];

const defaultEdit = {
    label: "", type: "expense", amount: "", category: "", date: "", note: "",
};

export default function TransactionHistory() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState(defaultEdit);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        return onSnapshot(
            query(collection(db, "transactions"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc")),
            snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        );
    }, [currentUser]);

    const filtered = useMemo(() => {
        let list = [...transactions];
        if (filterType !== "all") list = list.filter(t => t.type === filterType);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t =>
                (t.label || "").toLowerCase().includes(q) ||
                (t.category || "").toLowerCase().includes(q) ||
                (t.note || "").toLowerCase().includes(q)
            );
        }
        if (sortBy === "oldest") list.reverse();
        if (sortBy === "highest") list.sort((a, b) => Number(b.amount) - Number(a.amount));
        if (sortBy === "lowest") list.sort((a, b) => Number(a.amount) - Number(b.amount));
        return list;
    }, [transactions, search, filterType, sortBy]);

    const totals = useMemo(() => {
        let income = 0, expense = 0;
        filtered.forEach(t => {
            if (t.type === "income") income += Number(t.amount);
            else expense += Number(t.amount);
        });
        return { income, expense };
    }, [filtered]);

    function startEdit(t) {
        setEditId(t.id);
        setEditForm({
            label: t.label || "",
            type: t.type,
            amount: t.amount,
            category: t.category || "",
            date: t.date?.toDate ? t.date.toDate().toISOString().slice(0, 10) : (t.date || ""),
            note: t.note || "",
        });
    }

    async function saveEdit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateDoc(doc(db, "transactions", editId), {
                label: editForm.label,
                type: editForm.type,
                amount: Number(editForm.amount),
                category: editForm.category,
                date: new Date(editForm.date),
                note: editForm.note,
                updatedAt: serverTimestamp(),
            });
            setEditId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete(id) {
        try {
            await deleteDoc(doc(db, "transactions", id));
            setDeleteId(null);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="tx-history-page">

            {/* ── Sticky top bar ── */}
            <div className="tx-history-topbar">
                <div>
                    <h1 className="tx-history-title">Transaction History</h1>
                    <p className="tx-history-sub">{filtered.length} of {transactions.length} records</p>
                </div>
                <Link to="/add" className="tx-add-btn">+ Add Transaction</Link>
            </div>

            {/* ── Summary strip ── */}
            <div className="tx-summary-strip">
                <div className="tx-summary-item">
                    <span>Total Records</span>
                    <strong>{transactions.length}</strong>
                </div>
                <div className="tx-summary-divider" />
                <div className="tx-summary-item">
                    <span>Showing</span>
                    <strong>{filtered.length}</strong>
                </div>
                <div className="tx-summary-divider" />
                <div className="tx-summary-item income">
                    <span>Income</span>
                    <strong>&#8358;{fmt(totals.income)}</strong>
                </div>
                <div className="tx-summary-divider" />
                <div className="tx-summary-item expense">
                    <span>Expenses</span>
                    <strong>&#8358;{fmt(totals.expense)}</strong>
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="tx-controls">
                <div className="tx-search-wrapper">
                    <svg className="tx-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="tx-search-input"
                        type="text"
                        placeholder="Search by label, category, or note..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="tx-search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                <div className="tx-filter-group">
                    {["all", "income", "expense"].map(f => (
                        <button
                            key={f}
                            className={`tx-filter-btn${filterType === f ? " active " + f : ""}`}
                            onClick={() => setFilterType(f)}
                        >
                            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <select className="tx-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest amount</option>
                    <option value="lowest">Lowest amount</option>
                </select>
            </div>

            {/* ── Table ── */}
            {filtered.length === 0 ? (
                <div className="tx-empty-state">
                    <div className="tx-empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                        </svg>
                    </div>
                    <p className="tx-empty-title">{transactions.length === 0 ? "No transactions yet" : "No results found"}</p>
                    <p className="tx-empty-sub">
                        {transactions.length === 0
                            ? "Start by adding your first income or expense."
                            : "Try adjusting your search or filters."}
                    </p>
                    {transactions.length === 0 && (
                        <Link to="/add" className="tx-add-btn" style={{ marginTop: "16px" }}>Add your first transaction</Link>
                    )}
                </div>
            ) : (
                <div className="tx-table-wrapper">
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Label</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                editId === t.id ? (
                                    /* ── Edit row ── */
                                    <tr key={t.id} className="tx-edit-row">
                                        <td colSpan={7}>
                                            <form className="tx-edit-form" onSubmit={saveEdit}>
                                                <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} required />
                                                <input type="text" placeholder="Label" value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} required />
                                                <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}>
                                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                                <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
                                                    <option value="expense">Expense</option>
                                                    <option value="income">Income</option>
                                                </select>
                                                <input type="number" placeholder="Amount" min="0" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} required />
                                                <input type="text" placeholder="Note" value={editForm.note} onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))} />
                                                <div className="tx-edit-actions">
                                                    <button type="submit" className="tx-btn save" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                                                    <button type="button" className="tx-btn cancel" onClick={() => setEditId(null)}>Cancel</button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                ) : (
                                    /* ── Normal row ── */
                                    <tr key={t.id} className="tx-row">
                                        <td className="tx-date">{dateStr(t.createdAt || t.date)}</td>
                                        <td className="tx-label">{t.label || "—"}</td>
                                        <td><span className="tx-category-chip">{t.category || "—"}</span></td>
                                        <td>
                                            <span className={`tx-type-badge ${t.type}`}>
                                                {t.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className={`tx-amount ${t.type}`}>
                                            {t.type === "income" ? "+" : "-"}&#8358;{fmt(t.amount)}
                                        </td>
                                        <td className="tx-note">{t.note || <span className="tx-no-note">—</span>}</td>
                                        <td>
                                            <div className="tx-action-btns">
                                                <button className="tx-btn edit" onClick={() => startEdit(t)}>Edit</button>
                                                {deleteId === t.id ? (
                                                    <>
                                                        <button className="tx-btn confirm-del" onClick={() => confirmDelete(t.id)}>Confirm</button>
                                                        <button className="tx-btn cancel" onClick={() => setDeleteId(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <button className="tx-btn delete" onClick={() => setDeleteId(t.id)}>Delete</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

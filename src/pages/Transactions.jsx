// src/pages/Transactions.jsx
import React, { useEffect, useState } from "react";
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

import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

export default function Transactions() {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [editTransaction, setEditTransaction] = useState(null);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "transactions"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        return onSnapshot(q, (snap) => {
            setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    }, [currentUser]);

    async function handleDelete(id) {
        try {
            await deleteDoc(doc(db, "transactions", id));
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete transaction.");
        }
    }

    return (
        <div>
            <div className="section-header">
                <h2 className="section-title">Transactions</h2>
                <div className="underline-accent" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
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
        </div>
    );
}

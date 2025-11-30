// src/screens/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import TransactionList from "../components/TransactionList";

export default function TransactionsPage() {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);

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

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1>Transactions</h1>
        <p>
          Review your full transaction history. Use labels and notes to remember
          what each entry represents.
        </p>
      </header>

      <section className="screen-body">
        <TransactionList
          transactions={transactions}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </section>
    </div>
  );
}

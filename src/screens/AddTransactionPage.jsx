// src/screens/AddTransactionPage.jsx
import React, { useState } from "react";
import TransactionForm from "../components/TransactionForm";

export default function AddTransactionPage() {
  const [editTransaction, setEditTransaction] = useState(null);

  return (
    <div className="screen-container">
      <header className="screen-header">
        <h1>Add Transaction</h1>
        <p>
          Capture new income or expenses with labels, notes and categories so
          your dashboard stays up to date.
        </p>
      </header>

      <section className="screen-body">
        <div className="card large-card">
          <TransactionForm
            editTransaction={editTransaction}
            clearEdit={() => setEditTransaction(null)}
          />
        </div>
      </section>
    </div>
  );
}

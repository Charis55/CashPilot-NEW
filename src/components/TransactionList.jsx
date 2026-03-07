import React from 'react'

export default function TransactionList({ transactions, onEdit, onDelete }) {

  function formatDate(date) {
    if (!date) return ""
    if (date?.toDate) return date.toDate().toISOString().split("T")[0]
    return date
  }

  return (
    <div className="card">
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--card-text)", letterSpacing: "-0.3px" }}>
          Transaction History
        </h3>
      </div>

      {transactions.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No transactions yet. Add one to get started.</p>
      )}

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Label</th>
            <th>Amount (&#8358;)</th>
            <th>Note</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id}>
              <td>{formatDate(t.date)}</td>
              <td className={t.type === 'income' ? 'income' : 'expense'}>{t.type.toUpperCase()}</td>
              <td>{t.category}</td>
              <td>{t.label}</td>
              <td>{Number(t.amount).toFixed(2)}</td>
              <td>{t.note}</td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn-secondary" onClick={() => onEdit(t)} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Edit</button>
                  <button className="btn-danger" onClick={() => onDelete(t.id)} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

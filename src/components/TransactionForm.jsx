import React, { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const defaultState = {
  label: "",
  type: 'expense',
  amount: '',
  category: '',
  date: '',
  note: '',
}

export default function TransactionForm({ editTransaction, clearEdit, fullWidth = false }) {
  const [form, setForm] = useState(defaultState)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (editTransaction) {
      const formattedDate =
        editTransaction.date?.toDate
          ? editTransaction.date.toDate().toISOString().split("T")[0]
          : editTransaction.date || ""

      setForm({
        label: editTransaction.label || "",
        type: editTransaction.type,
        amount: editTransaction.amount,
        category: editTransaction.category,
        date: formattedDate,
        note: editTransaction.note || '',
      })
    } else {
      setForm(defaultState)
    }
  }, [editTransaction])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!currentUser) return alert("User not logged in")

    if (!form.label || !form.amount || !form.category || !form.date) {
      return alert("Fill all required fields")
    }

    try {
      const dateValue = new Date(form.date)

      if (editTransaction) {
        // UPDATE
        const ref = doc(db, "transactions", editTransaction.id)

        await updateDoc(ref, {
          label: form.label,   // FIXED ✔
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          date: dateValue,
          note: form.note,
          userId: currentUser.uid,
          updatedAt: serverTimestamp(),
        })

        clearEdit()

      } else {
        // ADD
        await addDoc(collection(db, "transactions"), {
          label: form.label,   // FIXED ✔
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          date: dateValue,
          note: form.note,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
        })
      }

      setForm(defaultState)

    } catch (error) {
      console.error("🔥 Transaction error:", error)
      alert("Failed to save transaction.")
    }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--card-text)", letterSpacing: "-0.3px" }}>
          {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>
      </div>

      <form
        className="transaction-form"
        onSubmit={handleSubmit}
        style={fullWidth ? { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px 32px" } : {}}
      >

        <label>
          Label (Name)
          <input
            type="text"
            name="label"
            value={form.label}
            onChange={handleChange}
            required
            placeholder="e.g. Groceries"
          />
        </label>

        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label>
          Amount (₦)
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            placeholder="0.00"
          />
        </label>

        <label>
          Category
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            placeholder="e.g. Food"
          />
        </label>

        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Note
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Optional note"
          />
        </label>

        <div className="form-actions" style={fullWidth ? { gridColumn: "span 2" } : {}}>
          <button type="submit" className="btn-primary">
            {editTransaction ? 'Update' : 'Add Transaction'}
          </button>

          {editTransaction && (
            <button type="button" className="btn-secondary" onClick={clearEdit}>
              Cancel
            </button>
          )}
        </div>

      </form>
    </div>
  )
}

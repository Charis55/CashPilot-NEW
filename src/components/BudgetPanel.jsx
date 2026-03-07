import React, { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

export default function BudgetPanel({ budget, setBudget }) {
  const [input, setInput] = useState(budget || 0)
  const [saving, setSaving] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    setInput(budget || 0)
  }, [budget])

  async function handleSave(e) {
    e.preventDefault()
    if (!currentUser) return alert("User not logged in")
    setSaving(true)
    try {
      await setDoc(
        doc(db, "budgets", currentUser.uid),
        { userId: currentUser.uid, amount: Number(input) },
        { merge: true }
      )
      setBudget(Number(input))
    } catch (error) {
      console.error("Error saving budget:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "var(--card-text)", letterSpacing: "-0.3px" }}>
          Monthly Budget
        </h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Current: &#8358;{Number(budget || 0).toFixed(2)}
        </p>
      </div>

      <form style={{ display: "flex", gap: "10px", alignItems: "flex-end" }} onSubmit={handleSave}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.82rem", marginBottom: "6px", display: "block", color: "var(--text-muted)" }}>
            Set Budget
          </label>
          <input
            type="number"
            min="0"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter budget amount"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={saving} style={{ whiteSpace: "nowrap" }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}

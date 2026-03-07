import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function MonthlyIncomePanel({ monthlyIncome, setMonthlyIncome, userId }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(monthlyIncome || "");
  }, [monthlyIncome]);

  async function saveIncome() {
    if (!value) return alert("Please enter an income amount.");
    if (!userId) return alert("User not logged in.");
    try {
      await setDoc(
<<<<<<< HEAD
        doc(db, "monthlyIncome", userId),
        { userId, amount: Number(value), updatedAt: new Date() },
=======
        ref,
        {
          userId,                 // must be p
          amount: Number(value),
          updatedAt: new Date(),
        },
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
        { merge: true }
      );
      setMonthlyIncome(Number(value));
      alert("Monthly income saved!");
    } catch (error) {
      console.error("Error saving income:", error.code, error.message);
      alert("Failed to save income: " + error.code);
    }
  }

  return (
    <div className="card">
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "var(--card-text)", letterSpacing: "-0.3px" }}>
          Monthly Income
        </h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Current: &#8358;{Number(monthlyIncome || 0).toFixed(2)}
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.82rem", marginBottom: "6px", display: "block", color: "var(--text-muted)" }}>
            Set Income
          </label>
          <input
            type="number"
            placeholder="Enter income amount"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button type="button" className="btn-primary" onClick={saveIncome} style={{ whiteSpace: "nowrap" }}>
          Save
        </button>
      </div>
    </div>
  );
}

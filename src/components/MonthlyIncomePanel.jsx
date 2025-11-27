// MonthlyIncomePanel.jsx
import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function MonthlyIncomePanel({
  monthlyIncome,
  setMonthlyIncome,
  userId,
}) {
  const [value, setValue] = useState("");

  // Always reflect the latest saved value
  useEffect(() => {
    setValue(monthlyIncome || "");
  }, [monthlyIncome]);

  async function saveIncome() {
    if (!value) {
      alert("Please enter an income amount.");
      return;
    }
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    try {
      // One stable doc per user: monthlyIncome/{uid}
      const ref = doc(db, "monthlyIncome", userId);

      await setDoc(
        ref,
        {
          userId,                 // must be p
          amount: Number(value),
          updatedAt: new Date(),
        },
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
      <h3>Monthly Income</h3>

      <input
        type="number"
        placeholder="Enter income (₦)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button type="button" onClick={saveIncome}>
        Save
      </button>

      <p style={{ marginTop: "8px" }}>
        Current monthly income:{" "}
        <strong>₦{Number(monthlyIncome || 0).toFixed(2)}</strong>
      </p>
    </div>
  );
}

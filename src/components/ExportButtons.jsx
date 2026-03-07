import React, { useState } from "react";
import { generateCashPilotPDF, generateCashPilotCSV } from "../utils/exportPdf";

export default function ExportButtons({ transactions, totals, monthlyIncome, budget }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvDone, setCsvDone] = useState(false);

  async function handleCSV() {
    if (!transactions.length) return;
    generateCashPilotCSV(transactions);
    setCsvDone(true);
    setTimeout(() => setCsvDone(false), 2000);
  }

  async function handlePDF() {
    if (!transactions.length) return;
    setPdfLoading(true);
    try {
      await generateCashPilotPDF({ transactions, totals, monthlyIncome, budget });
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  const empty = transactions.length === 0;

  return (
    <div className="export-panel">
      <div className="export-panel-header">
        <div>
          <p className="export-panel-title">Export Reports</p>
          <p className="export-panel-sub">
            {empty
              ? "Add transactions to enable downloads"
              : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} ready to export`}
          </p>
        </div>
      </div>

      <div className="export-panel-buttons">

        {/* CSV */}
        <button
          className={`export-btn${csvDone ? " export-btn-done" : ""}`}
          onClick={handleCSV}
          disabled={empty}
        >
          <div className="export-btn-icon csv-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="export-btn-text">
            <span className="export-btn-label">{csvDone ? "Downloaded" : "Export CSV"}</span>
            <span className="export-btn-desc">Spreadsheet · Excel compatible</span>
          </div>
        </button>

        {/* PDF */}
        <button
          className={`export-btn${pdfLoading ? " export-btn-loading" : ""}`}
          onClick={handlePDF}
          disabled={empty || pdfLoading}
        >
          <div className="export-btn-icon pdf-icon">
            {pdfLoading ? (
              <span className="auth-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15h6M9 11h3" />
              </svg>
            )}
          </div>
          <div className="export-btn-text">
            <span className="export-btn-label">{pdfLoading ? "Generating..." : "Export PDF"}</span>
            <span className="export-btn-desc">Branded report · Print ready</span>
          </div>
        </button>

      </div>
    </div>
  );
}

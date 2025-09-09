import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { calculatePoints } from "./rewardCalculator";

// showSummary: bool  | showTransactions: bool
export function renderTables({ isLoading, rewards, transactions, showSummary, showTransactions, title = "Data" }) {
  return (
    <div className="card">
      <h2>{title}</h2>

      {showSummary && (
        <>
          <h3 style={{ margin: "8px 0" }}>3-Month Reward Points (Per Customer)</h3>
          {isLoading ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <ClipLoader size={18} /> Loading…
            </div>
          ) : rewards?.rows?.length ? (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  {rewards.months.map((m) => (
                    <th key={m.key}>{m.label}</th>
                  ))}
                  <th>Total (3 mo)</th>
                </tr>
              </thead>
              <tbody>
                {rewards.rows.map((row) => (
                  <tr key={row.customerName}>
                    <td>{row.customerName}</td>
                    {row.byMonth.map(({ month, points }) => (
                      <td key={month}>{points}</td>
                    ))}
                    <td><strong>{row.totalPoints}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="muted">No reward data.</div>
          )}
        </>
      )}

      {showTransactions && (
        <>
          <h3 style={{ margin: "12px 0 8px" }}>Transactions</h3>
          {isLoading ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <ClipLoader size={18} /> Loading…
            </div>
          ) : transactions?.length ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.customerName}</td>
                    <td>{t.productName}</td>
                    <td>{t.purchaseDate}</td>
                    <td>{Number(t.amount).toFixed(2)}</td>
                    <td>{calculatePoints(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="muted">No transactions.</div>
          )}
        </>
      )}
    </div>
  );
}

import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function renderForm({
  customerName, setCustomerName,
  productName, setProductName,
  amount, setAmount,
  purchaseDate, setPurchaseDate,
  todayStr,
  isSubmitting, isLoading,
  handleSubmit,
  errors = {}
}) {
  return (
    <div className="card">
      <h2>Add Purchase</h2>
      <form onSubmit={handleSubmit} className="grid-stacked">
        <div>
          <label htmlFor="name">Customer Name</label>
          <input
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g., Alice"
            required
            disabled={isSubmitting || isLoading}
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div>
          <label htmlFor="product">Product Name</label>
          <input
            id="product"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Hat"
            required
            disabled={isSubmitting || isLoading}
          />
          {errors.product && <div className="error">{errors.product}</div>}
        </div>

        <div>
          <label htmlFor="amount">Amount (USD)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 120.50"
            required
            disabled={isSubmitting || isLoading}
          />
          {errors.amount && <div className="error">{errors.amount}</div>}
        </div>

        <div>
          <label htmlFor="date">Purchase Date</label>
          <input
            id="date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            max={todayStr}
            required
            disabled={isSubmitting || isLoading}
          />
          {errors.date && <div className="error">{errors.date}</div>}
        </div>

        <button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (<><ClipLoader size={16} /> Saving…</>) : "Add"}
        </button>
      </form>
    </div>
  );
}

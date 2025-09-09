// src/components/RewardPointsComponent.js
import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { api } from "../api-endpoitns/rewardsApi";
import { renderForm } from "../services/formService";
import { renderTables } from "../services/tableService";

export default function RewardPointsComponent() {
  // data state
  const [transactions, setTransactions] = useState([]);
  const [rewardsAll, setRewardsAll] = useState(null);

  // ui state
  const [view, setView] = useState("transactions"); // default: transactions-only
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form state
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [errors, setErrors] = useState({});

  // filter input for rewards by customer
  const [customerFilter, setCustomerFilter] = useState("");

  // today string YYYY-MM-DD for <input type="date" max=...>
  const todayStr = new Date().toISOString().split("T")[0];

  // initial load → ONLY transactions
  useEffect(() => {
    handleShowTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Button handlers ----
  async function handleShowTransactions() {
    setView("transactions");
    setIsLoading(true);
    try {
      const tx = await api.listTransactions();
      setTransactions(tx);
      setRewardsAll(null);
    } finally {
      setIsLoading(false);
    }
  }

  // show all transactions + all rewards
  async function handleShowAllCombined() {
    setView("all");
    setIsLoading(true);
    try {
      const [tx, r] = await Promise.all([api.listTransactions(), api.listRewards()]);
      setTransactions(tx);
      setRewardsAll(r);
    } finally {
      setIsLoading(false);
    }
  }

  // Show Reward Points (customer-specific): requires at least 1 char
  async function handleShowRewardPoints() {
    const name = customerFilter.trim();
    if (!name) return;
    setView("all");
    setIsLoading(true);
    try {
      const [tx, r] = await Promise.all([
        api.listTransactions(),
        api.listRewardsByCustomer(name)
      ]);
      setTransactions(tx.filter((t) => t.customerName === name));
      setRewardsAll(r);
    } finally {
      setIsLoading(false);
    }
  }

  // ---- Submit (fake POST)
  async function handleSubmit(e) {
    e.preventDefault();

    const name = customerName.trim();
    const prod = productName.trim();
    const amt = Number(amount);

    const errs = {};
    if (!name) errs.name = "Please enter a customer name.";
    if (!prod) errs.product = "Please enter a product name.";
    if (!purchaseDate) errs.date = "Please select a purchase date.";
    else if (purchaseDate > todayStr) errs.date = "Purchase date cannot be in the future.";
    if (!Number.isFinite(amt) || amt <= 0) errs.amount = "Please enter a valid, positive amount.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const newTx = {
      id: `T-${Date.now()}`,
      customerName: name,
      productName: prod,
      amount: amt,
      purchaseDate
    };

    setIsSubmitting(true);
    try {
      await api.createTransaction(newTx);
      setView("transactions");
      const tx = await api.listTransactions();
      setTransactions(tx);
    } finally {
      setIsSubmitting(false);
      setProductName("");
      setAmount("");
      setPurchaseDate("");
    }
  }

  // ---- Render ----
  return (
    <div>
      <h1>Reward Points Demo </h1>

      <div className="app">
        {/* Form (fake POST /transactions) */}
        {renderForm({
          customerName, setCustomerName,
          productName, setProductName,
          amount, setAmount,
          purchaseDate, setPurchaseDate,
          todayStr,
          isSubmitting, isLoading,
          handleSubmit,
          errors
        })}

        {/* Endpoint controls */}
        <div className="controls">
          <div className="searchRow">
            <input
              className="searchInput"
              placeholder="Customer name (e.g., Alice)"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleShowRewardPoints}
              disabled={isLoading || customerFilter.trim().length === 0}
              title={customerFilter.trim().length === 0 ? "Enter at least 1 character" : "Show filtered rewards"}
            >
              {isLoading && view === "all" && customerFilter.trim().length > 0 ? <><ClipLoader size={14} /> </> : null}
              {customerFilter.trim().length === 0 ? "Enter at least 1 character" : "Show filtered rewards"}
            </button>
          </div>

          <div className="btnRow">
            <button onClick={handleShowTransactions} disabled={isLoading}>
              {isLoading && view === "transactions" ? <><ClipLoader size={14} /> </> : null}
              GET /transactions
            </button>

            <button onClick={handleShowAllCombined} disabled={isLoading}>
              {isLoading && view === "all" && customerFilter.trim().length === 0 ? <><ClipLoader size={14} /> </> : null}
              Show All Transactions and Reward Points
            </button>
          </div>
        </div>

        {/* Tables */}
        {view === "all" &&
          renderTables({
            isLoading,
            rewards: rewardsAll,
            transactions,
            showSummary: true,
            showTransactions: true,
            title: "Transactions + Reward Points"
          })
        }

        {view === "transactions" &&
          renderTables({
            isLoading,
            rewards: null,
            transactions,
            showSummary: false,
            showTransactions: true,
            title: "Transactions Only"
          })
        }
      </div>
    </div>
  );
}

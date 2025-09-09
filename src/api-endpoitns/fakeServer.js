// Fake in-memory server with async delays.
import initialTransactions from "../data/transactions";
import { summarizeAllCustomersByMonthLast3 } from "../services/rewardCalculator";

const NETWORK_DELAY = 500;

// make a mutable in-memory DB
let DB = structuredClone(initialTransactions);

// helpers
const clone = (x) => JSON.parse(JSON.stringify(x));

// ---- Endpoints ----

// GET /transactions
export function getTransactions() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(DB)), NETWORK_DELAY);
  });
}

// GET /rewards  (all customers)
export function getRewards() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const summary = summarizeAllCustomersByMonthLast3(DB);
      resolve(clone(summary));
    }, NETWORK_DELAY);
  });
}

// GET /rewards/:customerName
export function getRewardsByCustomer(customerName) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = DB.filter((t) => t.customerName === customerName);
      const summary = summarizeAllCustomersByMonthLast3(filtered);
      resolve(clone(summary));
    }, NETWORK_DELAY);
  });
}

// POST /transactions  (fake create)
export function postTransaction(newTx) {
  return new Promise((resolve) => {
    setTimeout(() => {
      DB = [...DB, clone(newTx)];
      resolve(clone(newTx));
    }, NETWORK_DELAY);
  });
}

// Thin client that the component calls. Names mirror REST endpoints.
import {
  getTransactions,
  getRewards,
  getRewardsByCustomer,
  postTransaction
} from "./fakeServer";

export const api = {
  listTransactions: () => getTransactions(),                 // GET /transactions
  listRewards: () => getRewards(),                           // GET /rewards
  listRewardsByCustomer: (name) => getRewardsByCustomer(name), // GET /rewards/:name
  createTransaction: (tx) => postTransaction(tx)             // POST /transactions
};

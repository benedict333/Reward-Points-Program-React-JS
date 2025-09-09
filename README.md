# Retailer Reward Points Program (React-JS)

A React solution implementing the reward points calculation with a fake async API and unit tests (Create React App stack).

## 🔗 Live Demo

**URL:** https://benedict333.github.io/Reward-Points-Program-React-JS/

**What to check:**
1. Page loads in **Transactions Only** view with a short spinner, showing the seeded transactions.
2. Click **Show All Transactions and Reward Points** — you should see the transactions table and the rewards summary (3-month total per customer).
3. In the input **“Customer name (e.g., Alice)”**, type `Alice` and click **Show filtered rewards** — the transactions table should filter to Alice and the rewards table should show only Alice.
4. Add a transaction using the form (validations: non-empty name/product, positive amount, date not in the future). After submit, the app stays in **Transactions Only** and the list refreshes with your new row.

---

## Run Locally

```bash
npm install
npm start
```

App runs at http://localhost:3000

## Test

```bash
npm test
npm test -- --coverage
```

## Build

```bash
npm run build
```

## Business Rules

- 2 points per whole dollar over $100 (per transaction)
- 1 point per whole dollar between $50 and $100 (per transaction)
- $120 → 90 points; $100 → 50 points.


## UI Features

Add New Transaction

  Users can add a transaction by filling:

   - Customer Name

    - Product Name

    - Amount (must be > 0)

    - Purchase Date (cannot be in the future)

Validation errors are shown below each field if inputs are invalid.
Once submitted, the new transaction is added and the transaction list refreshes.

## Button Controls

    - GET /transactions → Loads and displays only the list of transactions.

    - Show All Transactions and Reward Points → Loads both transactions and reward points summary for all customers.

    - Show filtered rewards → Requires at least one character of a customer name. Filters the transaction list and shows the rewards summary only for that customer.

    - Each button shows a loading spinner while data is being fetched.
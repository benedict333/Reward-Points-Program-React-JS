if (typeof global.structuredClone !== "function") {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

import React from "react";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------- MOCK FOR COMPONENT TESTS ----------
jest.mock("../api-endpoitns/rewardsApi", () => ({
  __esModule: true,
  api: {
    listTransactions: jest.fn(),
    listRewards: jest.fn(),
    listRewardsByCustomer: jest.fn(),
    createTransaction: jest.fn(),
  },
}));

import { api } from "../api-endpoitns/rewardsApi";
import RewardPointsComponent from "../components/RewardPointsComponent";

// ---------- SHARED TEST DATA (for the MOCK) ----------
let tx;
const initialTx = [
  { id: "T-1", customerName: "Alice", productName: "Shoes", amount: 120.75, purchaseDate: "2025-07-05" },
  { id: "T-2", customerName: "Bob", productName: "Laptop", amount: 110.00, purchaseDate: "2025-08-20" },
];

const months = [
  { key: "2025-07", label: "Jul" },
  { key: "2025-08", label: "Aug" },
  { key: "2025-09", label: "Sep" },
];

const rewardsAll = {
  months,
  rows: [
    {
      customerName: "Alice", byMonth: [
        { month: "2025-07", points: 90 }, { month: "2025-08", points: 0 }, { month: "2025-09", points: 0 }], totalPoints: 90
    },
    {
      customerName: "Bob", byMonth: [
        { month: "2025-07", points: 0 }, { month: "2025-08", points: 70 }, { month: "2025-09", points: 0 }], totalPoints: 70
    },
  ],
};
const rewardsByName = {
  Alice: { months, rows: [rewardsAll.rows[0]] },
  Bob: { months, rows: [rewardsAll.rows[1]] },
};

// util for date input
const todayStr = new Date().toISOString().slice(0, 10);

// Set mock implementations fresh each test
beforeEach(() => {
  jest.clearAllMocks();
  tx = [...initialTx];

  // microtask delay so React state can flush between steps
  api.listTransactions.mockImplementation(() =>
    Promise.resolve().then(() => [...tx])
  );
  api.listRewards.mockImplementation(() =>
    Promise.resolve().then(() => rewardsAll)
  );
  api.listRewardsByCustomer.mockImplementation((name) =>
    Promise.resolve().then(() => rewardsByName[name] || { months, rows: [] })
  );
  api.createTransaction.mockImplementation((newTx) => {
    tx = [...tx, newTx];
    return Promise.resolve().then(() => newTx);
  });
});

describe("RewardPointsComponent (integration with mocked API)", () => {
  test("initially loads and shows Transactions Only", async () => {
    render(<RewardPointsComponent />);

    // Wait for initial rows (spinner gone)
    expect(await screen.findByText("Shoes")).toBeInTheDocument();
    expect(await screen.findByText("Laptop")).toBeInTheDocument();

    expect(screen.getByText(/Transactions Only/i)).toBeInTheDocument();
    expect(api.listTransactions).toHaveBeenCalledTimes(1);
  });

  test("Show Reward Points disabled until typing; then filters to the customer", async () => {
    render(<RewardPointsComponent />);
    await screen.findByText("Shoes"); // initial done

    const searchInput = screen.getByPlaceholderText(/Customer name/i);
    const showFilteredBtn = screen.getByRole("button", {
      name: /Enter at least 1 character|Show filtered rewards/i,
    });

    // disabled when empty
    expect(showFilteredBtn).toBeDisabled();

    // type -> enabled
    await userEvent.type(searchInput, "Alice");
    expect(showFilteredBtn).toBeEnabled();

    // click -> combined view (both tables), then wait for spinners to disappear
    await userEvent.click(showFilteredBtn);
    await screen.findByText(/Transactions \+ Reward Points/i);

    // Ensure both tables finished loading (there are two "Loading…" areas)
    await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading…/i));

    // filtered transactions: only Alice visible
    expect(await screen.findByText("Shoes")).toBeInTheDocument();
    expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
  });

  test("Show All Transactions and Reward Points shows everything (no filter)", async () => {
    render(<RewardPointsComponent />);
    await screen.findByText("Shoes"); // initial rows present

    const showAllBtn = screen.getByRole("button", {
      name: /Show All Transactions and Reward Points/i,
    });
    await userEvent.click(showAllBtn);

    await screen.findByText(/Transactions \+ Reward Points/i);
    await waitForElementToBeRemoved(() => screen.queryAllByText(/Loading…/i));

    // both customers visible in transactions
    expect(await screen.findByText("Shoes")).toBeInTheDocument();
    expect(await screen.findByText("Laptop")).toBeInTheDocument();

    expect(screen.getByText(/Total \(3 mo\)/i)).toBeInTheDocument();
    expect(api.listRewards).toHaveBeenCalledTimes(1);
  });

  test("submit adds a transaction and stays in Transactions Only", async () => {
    render(<RewardPointsComponent />);
    await screen.findByText("Shoes");

    // fill form (from renderForm)
    await userEvent.clear(screen.getByLabelText(/Customer Name/i));
    await userEvent.type(screen.getByLabelText(/Customer Name/i), "Alice");
    await userEvent.clear(screen.getByLabelText(/Product Name/i));
    await userEvent.type(screen.getByLabelText(/Product Name/i), "Scarf");
    await userEvent.clear(screen.getByLabelText(/Amount/i));
    await userEvent.type(screen.getByLabelText(/Amount/i), "120");
    await userEvent.clear(screen.getByLabelText(/Purchase Date/i));
    await userEvent.type(screen.getByLabelText(/Purchase Date/i), todayStr);

    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    // POST + refresh
    await waitFor(() => expect(api.createTransaction).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.listTransactions).toHaveBeenCalledTimes(2));

    // still transactions-only; spinner gone; new row present
    expect(screen.getByText(/Transactions Only/i)).toBeInTheDocument();
    expect(await screen.findByText("Scarf")).toBeInTheDocument();
  });

  test("validation errors render under fields (bypass HTML5 required)", async () => {
    render(<RewardPointsComponent />);
    await screen.findByText("Shoes"); // initial load finished

    // Satisfy required but fail custom validation
    await userEvent.clear(screen.getByLabelText(/Customer Name/i));
    await userEvent.type(screen.getByLabelText(/Customer Name/i), " ");
    await userEvent.clear(screen.getByLabelText(/Product Name/i));
    await userEvent.type(screen.getByLabelText(/Product Name/i), " ");
    await userEvent.clear(screen.getByLabelText(/Amount/i));
    await userEvent.type(screen.getByLabelText(/Amount/i), "0");
    await userEvent.clear(screen.getByLabelText(/Purchase Date/i));
    await userEvent.type(screen.getByLabelText(/Purchase Date/i), todayStr);

    await userEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByText(/Please enter a customer name\./i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a product name\./i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter a valid, positive amount\./i)).toBeInTheDocument();
  });
});

describe("real modules smoke coverage (no mocks)", () => {
  test("rewardsApi real module: list/create/rewards shape", async () => {
    const realApiMod = jest.requireActual("../api-endpoitns/rewardsApi");
    const realApi = realApiMod.api || realApiMod.default?.api || realApiMod;

    const before = await realApi.listTransactions();
    expect(Array.isArray(before)).toBe(true);

    const newTx = {
      id: `T-cov-${Date.now()}`,
      customerName: "Zara",
      productName: "Cap",
      amount: 51,
      purchaseDate: "2025-09-01",
    };
    await realApi.createTransaction(newTx);
    const after = await realApi.listTransactions();
    expect(after.length).toBe(before.length + 1);

    const all = await realApi.listRewards();
    expect(Array.isArray(all.months)).toBe(true);
    expect(Array.isArray(all.rows)).toBe(true);

    const by = await realApi.listRewardsByCustomer("Alice");
    expect(Array.isArray(by.months)).toBe(true);
    expect(Array.isArray(by.rows)).toBe(true);
  });

  test("fakeServer real module: list → create → list", async () => {
    const server = jest.requireActual("../api-endpoitns/fakeServer");
    const pick = (mod, names) => {
      for (const n of names) if (typeof mod[n] === "function") return mod[n].bind(mod);
      if (mod.default) for (const n of names) if (typeof mod.default[n] === "function") return mod.default[n].bind(mod.default);
      if (mod.api) for (const n of names) if (typeof mod.api[n] === "function") return mod.api[n].bind(mod.api);
      return null;
    };

    const listTx = pick(server, ["listTransactions", "getTransactions"]);
    const createTx = pick(server, ["createTransaction", "postTransaction", "addTransaction"]);
    const rewardsAllFn = pick(server, ["listRewards", "getRewards"]);
    const rewardsByFn = pick(server, ["listRewardsByCustomer", "getRewardsByCustomer"]);

    expect(listTx && createTx && rewardsAllFn && rewardsByFn).toBeTruthy();

    const before = await listTx();
    const newTx = {
      id: `FS-${Date.now()}`,
      customerName: "Donna",
      productName: "Belt",
      amount: 78,
      purchaseDate: "2025-08-15",
    };
    await createTx(newTx);
    const after = await listTx();
    expect(after.length).toBe(before.length + 1);

    const all = await rewardsAllFn();
    expect(Array.isArray(all.months)).toBe(true);
    expect(Array.isArray(all.rows)).toBe(true);

    const by = await rewardsByFn("Alice");
    expect(Array.isArray(by.months)).toBe(true);
    expect(Array.isArray(by.rows)).toBe(true);
  });

  test("transactions dataset exports an array with expected fields", () => {
    const dataMod = jest.requireActual("../data/transactions");
    const data = dataMod.default || dataMod;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const t = data[0];
    expect(t).toHaveProperty("id");
    expect(t).toHaveProperty("customerName");
    expect(t).toHaveProperty("productName");
    expect(t).toHaveProperty("amount");
    expect(t).toHaveProperty("purchaseDate");
  });
});

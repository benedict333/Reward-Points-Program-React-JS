import {
  calculatePoints,
  summarizeAllCustomersByMonthLast3,
} from "../services/rewardCalculator";

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date("2025-09-15T12:00:00Z"));
});
afterAll(() => jest.useRealTimers());

describe("calculatePoints", () => {
  it("handles thresholds concisely", () => {
    expect(calculatePoints(50)).toBe(0);
    expect(calculatePoints(60)).toBe(10);
    expect(calculatePoints(120)).toBe(90);
  });
});

describe("summarizeAllCustomersByMonthLast3", () => {
  it("builds months and rows from recent transactions", () => {
    const txns = [
      { id: "1", customerName: "Bob", amount: 101, purchaseDate: "2025-09-01" },
      { id: "2", customerName: "Alice", amount: 120, purchaseDate: "2025-07-15" },
      { id: "3", customerName: "Alice", amount: 60, purchaseDate: "2025-08-10" },
      { id: "4", customerName: "Zed", amount: 999, purchaseDate: "2025-06-01" },
    ];

    const { months, rows } = summarizeAllCustomersByMonthLast3(txns);

    expect(months).toHaveLength(3);

    expect(rows.map(r => r.customerName)).toEqual(["Alice", "Bob"]);
    const alice = rows[0];
    const bob = rows[1];
    expect(alice.totalPoints).toBe(100);
    expect(bob.totalPoints).toBe(52);
  });
});

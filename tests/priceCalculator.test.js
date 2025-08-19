import { calculatePrice, calculateTotals } from "../utils/priceCalculator.js";

describe("Price Calculator", () => {
  test("should calculate correct price for quantity 1", () => {
    const result = calculatePrice(47, 1);
    expect(result.totalPrice).toBe(47);
    expect(result.unitPrice).toBe(47);
  });

  test("should calculate correct price for quantity 5", () => {
    const result = calculatePrice(47, 5);
    expect(result.totalPrice).toBe(94);
    expect(result.unitPrice).toBe(18.8);
  });

  test("Should calculate correct price for quantity 6", () => {
    const result = calculatePrice(47, 6);
    expect(result.totalPrice).toBe(112.8);
    expect(result.unitPrice).toBe(18.8);
  });

  test("should calculate correct price for quantity 10", () => {
    const result = calculatePrice(47, 10);
    expect(result.totalPrice).toBe(141);
    expect(result.unitPrice).toBe(14.1);
  });

  test("should calculate correct price for quantity 15", () => {
    const result = calculatePrice(47, 15);
    expect(result.totalPrice).toBe(211.5);
    expect(result.unitPrice).toBe(14.1);
  });

  test("should calculate correct price for quantity 20", () => {
    const result = calculatePrice(47, 20);
    expect(result.totalPrice).toBe(282);
    expect(result.unitPrice).toBe(14.1);
  });

  test("should calculate correct price for quantity 25", () => {
    const result = calculatePrice(47, 25);
    expect(result.totalPrice).toBe(234);
    expect(result.unitPrice).toBe(9.36);
  });

  test("should calculate correct price for quantity 30", () => {
    const result = calculatePrice(47, 30);
    expect(result.totalPrice).toBe(280.8);
    expect(result.unitPrice).toBe(9.36);
  });

  test("should calculate correct price for quantity 40", () => {
    const result = calculatePrice(47, 40);
    expect(result.totalPrice).toBe(374.4);
    expect(result.unitPrice).toBe(9.36);
  });

  test("should calculate correct price for quantity 50", () => {
    const result = calculatePrice(47, 50);
    expect(result.totalPrice).toBe(328);
    expect(result.unitPrice).toBe(6.56);
  });

  test("should calculate correct price for quantity 60", () => {
    const result = calculatePrice(47, 60);
    expect(result.totalPrice).toBe(393.6);
    expect(result.unitPrice).toBe(6.56);
  });

  test("should calculate correct price for quantity 75", () => {
    const result = calculatePrice(47, 75);
    expect(result.totalPrice).toBe(492);
    expect(result.unitPrice).toBe(6.56);
  });

  test("should calculate correct price for quantity 100", () => {
    const result = calculatePrice(47, 100);
    expect(result.totalPrice).toBe(422);
    expect(result.unitPrice).toBe(4.22);
  });

  test("should throw error for invalid quantity", () => {
    expect(() => calculatePrice(47, 0)).toThrow("Quantity must be at least 1");
    expect(() => calculatePrice(47, -1)).toThrow("Quantity must be at least 1");
  });

  // Test edge cases around bracket boundaries
  test("should handle quantities just before bracket changes", () => {
    // Just before quantity 5 bracket
    const result4 = calculatePrice(47, 4);
    expect(result4.unitPrice).toBe(47);
    expect(result4.totalPrice).toBe(188);

    // Just before quantity 10 bracket
    const result9 = calculatePrice(47, 9);
    expect(result9.unitPrice).toBe(18.8);
    expect(result9.totalPrice).toBe(169.2);

    // Just before quantity 25 bracket
    const result24 = calculatePrice(47, 24);
    expect(result24.unitPrice).toBe(14.1);
    expect(result24.totalPrice).toBe(338.4);

    // Just before quantity 50 bracket
    const result49 = calculatePrice(47, 49);
    expect(result49.unitPrice).toBe(9.36);
    expect(result49.totalPrice).toBe(458.64);
  });
});

describe("Calculate Totals", () => {
  test("should calculate totals for single item", () => {
    const items = [{ quantity: 10, unitPrice: 14.1 }];
    const result = calculateTotals(items);

    expect(result.subtotal).toBe(141);
    expect(result.vatAmount).toBe(21.15);
    expect(result.grandTotal).toBe(162.15);
    expect(result.vatPercentage).toBe(15);
  });

  test("should calculate totals for multiple items", () => {
    const items = [
      { quantity: 5, unitPrice: 18.8 },
      { quantity: 25, unitPrice: 9.36 },
      { quantity: 10, unitPrice: 14.1 },
    ];
    const result = calculateTotals(items);

    expect(result.subtotal).toBe(469); // 94 + 234 + 141
    expect(result.vatAmount).toBe(70.35); // 15% of 469
    expect(result.grandTotal).toBe(539.35);
    expect(result.vatPercentage).toBe(15);
  });

  test("should calculate totals with custom VAT rate", () => {
    const items = [{ quantity: 50, unitPrice: 6.56 }];
    const result = calculateTotals(items, 20); // 20% VAT

    expect(result.subtotal).toBe(328);
    expect(result.vatAmount).toBe(65.6); // 20% of 328
    expect(result.grandTotal).toBe(393.6);
    expect(result.vatPercentage).toBe(20);
  });

  test("should handle empty items array", () => {
    const items = [];
    const result = calculateTotals(items);

    expect(result.subtotal).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
    expect(result.vatPercentage).toBe(15);
  });

  test("should handle zero VAT", () => {
    const items = [{ quantity: 100, unitPrice: 4.22 }];
    const result = calculateTotals(items, 0);

    expect(result.subtotal).toBe(422);
    expect(result.vatAmount).toBe(0);
    expect(result.grandTotal).toBe(422);
    expect(result.vatPercentage).toBe(0);
  });

  test("should round totals to 2 decimal places", () => {
    const items = [
      { quantity: 3, unitPrice: 47 }, // 141 total
    ];
    const result = calculateTotals(items);

    expect(result.subtotal).toBe(141);
    expect(result.vatAmount).toBe(21.15); // 15% of 141
    expect(result.grandTotal).toBe(162.15);
  });
});

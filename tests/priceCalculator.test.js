import { calculatePrice } from "../utils/priceCalculator.js";

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

  test("should calculate correct price for quantity 25", () => {
    const result = calculatePrice(47, 25);
    expect(result.totalPrice).toBe(234);
    expect(result.unitPrice).toBe(9.36);
  });

  test("should throw error for invalid quantity", () => {
    expect(() => calculatePrice(47, 0)).toThrow("Quantity must be at least 1");
    expect(() => calculatePrice(47, -1)).toThrow("Quantity must be at least 1");
  });
});

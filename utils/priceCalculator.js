/**
 * Price brackets for quantity-based pricing
 * Format: { min: quantity threshold, price: total price for this quantity }
 */
export const PRICE_BRACKETS = [
  { min: 1, price: 47 }, // 47 per unit
  { min: 5, price: 94 }, // 18.80 per unit
  { min: 10, price: 141 }, // 14.10 per unit
  { min: 25, price: 234 }, // 9.36 per unit
  { min: 50, price: 328 }, // 6.56 per unit
  { min: 100, price: 422 }, // 4.22 per unit
  { min: 250, price: 820 }, // 3.28 per unit
  { min: 500, price: 1172 }, // 2.34 per unit
  { min: 1000, price: 1641 }, // 1.64 per unit
  { min: 2000, price: 2906 }, // 1.45 per unit
  { min: 3000, price: 3656 }, // 1.22 per unit
  { min: 5000, price: 5156 }, // 1.03 per unit
  { min: 10000, price: 8438 }, // 0.84 per unit
  { min: 30000, price: 14063 }, // 0.47 per unit
];

/**
 * Calculates the total price and unit price for a given quantity
 * @param {number} basePrice - The base price for single unit (47 SAR in this case)
 * @param {number} quantity - The quantity of items
 * @returns {Object} - Contains total price and unit price
 */
export const calculatePrice = (basePrice = 47, quantity = 1) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Find the appropriate price bracket
  const bracket = [...PRICE_BRACKETS].reverse().find((b) => quantity >= b.min);

  if (!bracket) {
    return {
      totalPrice: basePrice,
      unitPrice: basePrice,
    };
  }

  // For quantities that exactly match a bracket
  if (quantity === bracket.min) {
    return {
      totalPrice: bracket.price,
      unitPrice: bracket.price / quantity,
    };
  }

  // For quantities between brackets, use linear interpolation
  const nextBracket = PRICE_BRACKETS.find((b) => b.min > quantity);
  if (nextBracket) {
    const ratio = (quantity - bracket.min) / (nextBracket.min - bracket.min);
    const totalPrice =
      bracket.price + ratio * (nextBracket.price - bracket.price);
    return {
      totalPrice: Math.round(totalPrice * 100) / 100,
      unitPrice: Math.round((totalPrice / quantity) * 100) / 100,
    };
  }

  // For quantities beyond the last bracket
  const unitPrice = bracket.price / bracket.min;
  return {
    totalPrice: Math.round(unitPrice * quantity * 100) / 100,
    unitPrice: Math.round(unitPrice * 100) / 100,
  };
};

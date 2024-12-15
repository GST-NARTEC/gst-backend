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
export const calculatePrice = (basePrice, quantity) => {
  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Find the current bracket
  const currentBracket = [...PRICE_BRACKETS]
    .reverse()
    .find((b) => quantity >= b.min);

  if (!currentBracket) {
    throw new Error("Invalid quantity");
  }

  // For quantities exactly at bracket minimums, use the bracket price
  if (quantity === currentBracket.min) {
    return {
      totalPrice: currentBracket.price,
      unitPrice: currentBracket.price / currentBracket.min,
    };
  }

  // For quantities between brackets
  const currentIndex = PRICE_BRACKETS.findIndex(
    (b) => b.min === currentBracket.min
  );
  const nextBracket = PRICE_BRACKETS[currentIndex + 1];

  if (nextBracket) {
    // Use the unit price from current bracket
    const unitPrice = currentBracket.price / currentBracket.min;
    const totalPrice = unitPrice * quantity;
    return {
      totalPrice: Math.round(totalPrice * 100) / 100,
      unitPrice: Math.round(unitPrice * 100) / 100,
    };
  }

  // For quantities beyond the last bracket
  const unitPrice = currentBracket.price / currentBracket.min;
  return {
    totalPrice: Math.round(unitPrice * quantity * 100) / 100,
    unitPrice: Math.round(unitPrice * 100) / 100,
  };
};

export const calculateTotals = (items, vat = 15) => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + itemTotal;
  }, 0);

  // Calculate VAT amount
  const vatAmount = (subtotal * vat) / 100;

  // Calculate grand total
  const grandTotal = subtotal + vatAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    vatPercentage: vat,
  };
};

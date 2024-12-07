import { customAlphabet } from "nanoid";

const generateUniqueId = (prefix = "") => {
  // Create nanoid with custom alphabet (excluding similar-looking characters)
  const nanoid = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

  // Get current year's last 2 digits
  const year = new Date().getFullYear().toString().slice(-2);

  // Get current month (padded with zero if needed)
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");

  // Generate random unique string
  const uniqueString = nanoid();

  // Combine all parts
  return `${prefix}${year}${month}-${uniqueString}`;
};

export const generateUserId = () => generateUniqueId("USR");
export const generateOrderId = () => generateUniqueId("ORD");

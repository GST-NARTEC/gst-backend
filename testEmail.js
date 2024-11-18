import dotenv from "dotenv";
import EmailService from "./utils/email.js";

dotenv.config();

async function testEmailService() {
  console.log("Starting email service test...");

  // Test simple OTP email first
  try {
    const result = await EmailService.sendOTP(
      "wasimxaman13@gmail.com",
      "123456"
    );
    console.log("OTP Email Test Result:", result);
  } catch (error) {
    console.error("OTP Email Test Failed:", error.message);
  }
}

testEmailService()
  .then(() => console.log("Test completed"))
  .catch((error) => console.error("Test failed:", error));

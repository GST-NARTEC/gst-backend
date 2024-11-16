import dotenv from "dotenv";
import EmailService from "./utils/email.js";

// Load environment variables
dotenv.config();

async function testEmailSending() {
  try {
    console.log("📧 Setting up test data...");

    // Mock user data
    const mockUser = {
      email: "wasimxaman13@gmail.com", // Replace with your test email
      companyNameEn: "Test Company Ltd",
      companyNameAr: "شركة اختبار المحدودة",
      companyLicenseNo: "12345",
      mobile: "+966500000000",
      country: "Saudi Arabia",
      region: "Riyadh Region",
      city: "Riyadh",
      zipCode: "12345",
      streetAddress: "123 Test Street",
    };

    // Mock password
    const mockPassword = "TestPass123";

    console.log("📧 Attempting to send email to:", mockUser.email);

    // Send test email using the EmailService instance
    const emailSent = await EmailService.sendWelcomeEmail(
      mockUser,
      mockPassword
    );

    if (emailSent) {
      console.log("✅ Test email sent successfully!");
    } else {
      console.log("❌ Failed to send test email");
    }
  } catch (error) {
    console.error("Error in test:", error);
  } finally {
    process.exit(0);
  }
}

// Run the test
console.log("🚀 Starting email test...");
testEmailSending();

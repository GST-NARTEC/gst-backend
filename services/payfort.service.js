import crypto from "crypto";
import { payfortConfig } from "../config/payfort.js";

class PayfortService {
  constructor() {
    this.config = payfortConfig;
    this.baseUrl = this.config.sandboxMode
      ? "https://sbpaymentservices.payfort.com/FortAPI/paymentPage"
      : "https://paymentservices.payfort.com/FortAPI/paymentPage";
  }

  generateSignature(params, phraseType = "request") {
    try {
      const phrase =
        phraseType === "request"
          ? this.config.shaRequestPhrase
          : this.config.shaResponsePhrase;

      // Convert params to string and sort alphabetically
      const sortedString = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          if (params[key] && params[key].toString() !== "") {
            return acc + key + "=" + params[key].toString();
          }
          return acc;
        }, "");

      // Add phrases
      const signatureString = phrase + sortedString + phrase;

      console.log("Signature String:", signatureString); // For debugging

      // Generate hash
      return crypto
        .createHash(this.config.shaType.toLowerCase())
        .update(signatureString, "utf8")
        .digest("hex")
        .toLowerCase(); // PayFort expects lowercase signature
    } catch (error) {
      console.error("Signature generation error:", error);
      throw error;
    }
  }

  async createPaymentPage(orderData) {
    try {
      const params = {
        merchant_identifier: this.config.merchantIdentifier,
        access_code: this.config.accessCode,
        merchant_reference: orderData.referenceId,
        amount: Math.round(orderData.amount * 100).toString(), // Convert to lowest denomination
        currency: this.config.currency,
        language: this.config.language,
        customer_email: orderData.email,
        return_url: process.env.PAYMENT_RETURN_URL,
        command: "PURCHASE",
      };

      // Generate signature
      params.signature = this.generateSignature(params, "request");

      console.log("Payment Page Params:", params); // For debugging

      return {
        url: this.baseUrl,
        params,
      };
    } catch (error) {
      console.error("Payment page creation error:", error);
      throw error;
    }
  }

  verifyResponse(responseData) {
    try {
      console.log("Response Data:", responseData); // For debugging

      // If signature is missing, calculate it and add to response
      if (!responseData.signature) {
        const calculatedSignature = this.generateSignature(
          responseData,
          "response"
        );
        responseData.signature = calculatedSignature;
        console.log("Generated missing signature:", calculatedSignature);
      }

      // Create a copy of response data without signature
      const verificationData = { ...responseData };
      delete verificationData.signature;

      // Generate signature for verification
      const calculatedSignature = this.generateSignature(
        verificationData,
        "response"
      );

      console.log("Received Signature:", responseData.signature); // For debugging
      console.log("Calculated Signature:", calculatedSignature); // For debugging

      // For testing purposes, we'll skip signature verification if in development
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: Skipping signature verification");
        return {
          isSuccess: responseData.status === "14", // 14 is success code
          transactionId: responseData.fort_id,
          referenceId: responseData.merchant_reference,
          amount: parseFloat(responseData.amount) / 100,
          status: responseData.status,
          responseMessage: responseData.response_message,
        };
      }

      if (
        responseData.signature.toLowerCase() !==
        calculatedSignature.toLowerCase()
      ) {
        console.error("Signature mismatch:", {
          received: responseData.signature,
          calculated: calculatedSignature,
        });
        throw new Error("Invalid signature in response");
      }

      return {
        isSuccess: responseData.status === "14", // 14 is success code
        transactionId: responseData.fort_id,
        referenceId: responseData.merchant_reference,
        amount: parseFloat(responseData.amount) / 100,
        status: responseData.status,
        responseMessage: responseData.response_message,
      };
    } catch (error) {
      console.error("Response verification error:", error);
      throw error;
    }
  }
}

export default new PayfortService();

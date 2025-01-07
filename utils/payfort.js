// utils/payfort.js
import crypto from "crypto";

class PayfortService {
  constructor() {
    this.config = {
      merchantIdentifier: process.env.MERCHANT_IDENTIFIER,
      accessCode: process.env.ACCESS_CODE,
      shaRequestPhrase: process.env.SHA_REQUEST_PHRASE,
      shaResponsePhrase: process.env.SHA_RESPONSE_PHRASE,
      shaType: process.env.SHA_TYPE || "SHA-256",
      sandboxMode: process.env.NODE_ENV !== "production",
      language: "en",
    };

    // Set the correct API URL based on environment
    this.baseURL = this.config.sandboxMode
      ? "https://sbcheckout.payfort.com/FortAPI/paymentPage"
      : "https://checkout.payfort.com/FortAPI/paymentPage";
  }

  generateSignature(params, signType = "request") {
    try {
      const shaPhrase =
        signType === "request"
          ? this.config.shaRequestPhrase
          : this.config.shaResponsePhrase;

      // Remove signature if exists
      const paramsWithoutSignature = { ...params };
      delete paramsWithoutSignature.signature;

      // Sort parameters alphabetically
      const sortedParams = Object.keys(paramsWithoutSignature)
        .sort()
        .reduce((acc, key) => {
          // Only include non-empty values
          if (
            paramsWithoutSignature[key] &&
            paramsWithoutSignature[key] !== ""
          ) {
            acc[key] = paramsWithoutSignature[key];
          }
          return acc;
        }, {});

      // Create signature string
      let signatureString = "";
      for (const key in sortedParams) {
        signatureString += `${key}=${sortedParams[key]}`;
      }

      // Add SHA phrases
      const finalString = `${shaPhrase}${signatureString}${shaPhrase}`;

      // Generate hash
      return crypto
        .createHash(this.config.shaType.toLowerCase())
        .update(finalString)
        .digest("hex");
    } catch (error) {
      console.error("Signature generation error:", error);
      throw error;
    }
  }

  preparePaymentRequest(orderData) {
    // Standard Merchant Page Integration parameters
    const requestParams = {
      command: "PURCHASE",
      merchant_identifier: this.config.merchantIdentifier,
      access_code: this.config.accessCode,
      merchant_reference: orderData.orderId,
      amount: (orderData.amount * 100).toFixed(0),
      currency: orderData.currency || "SAR",
      language: this.config.language,
      customer_email: orderData.email,
      return_url: `${process.env.FRONTEND_URL}/payment/callback`,
    };

    // Generate signature
    requestParams.signature = this.generateSignature(requestParams, "request");

    return {
      params: requestParams,
      url: this.baseURL,
    };
  }

  verifyPaymentResponse(responseData) {
    try {
      const receivedSignature = responseData.signature;

      // Generate signature using response parameters
      const calculatedSignature = this.generateSignature(
        responseData,
        "response"
      );

      // Verify signature
      const isValidSignature = receivedSignature === calculatedSignature;

      // Verify response status
      const isSuccessful = responseData.status === "14";
      const responseCode = responseData.response_code;

      return {
        isValid: isValidSignature,
        isSuccessful,
        responseCode,
        message: responseData.response_message,
      };
    } catch (error) {
      console.error("Payment verification error:", error);
      return {
        isValid: false,
        isSuccessful: false,
        responseCode: "00000",
        message: "Verification failed",
      };
    }
  }

  getResponseCodeMessage(code) {
    const messages = {
      14000: "Success",
      14001: "Missing parameter",
      14002: "Invalid parameter format",
      14003: "Payment option is not available",
      14004: "Invalid signature",
      14005: "Invalid merchant identifier",
      14006: "Invalid access code",
      14007: "Invalid currency",
      14008: "Duplicate order number",
      14009: "Order not found",
      14010: "Invalid payment option",
      // Add more response codes as needed
    };
    return messages[code] || "Unknown response code";
  }
}

export default new PayfortService();

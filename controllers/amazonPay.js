import axios from "axios";
import crypto from "crypto";
import { amazonPayConfig } from "../config/amazonPay.js";

class AmazonPayController {
  static baseURL = "https://sbpaymentservices.payfort.com/FortAPI/paymentApi";

  static generateSignature(data) {
    try {
      // Remove signature if exists
      const { signature, ...dataWithoutSignature } = data;

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(dataWithoutSignature).sort();

      // Create parameter string without any separators between key-value pairs
      const paramString = sortedKeys
        .map((key) => {
          const value = dataWithoutSignature[key];
          return value != null ? `${key}=${value}` : "";
        })
        .filter(Boolean)
        .join(""); // Remove the separator between parameters

      // Get the correct SHA phrases based on environment
      const { shaRequestPhrase, shaResponsePhrase } = amazonPayConfig.sandbox;

      // Create signature string with request phrase at start and end
      const signString = `${shaRequestPhrase}${paramString}${shaRequestPhrase}`;

      console.log("Parameters to sign:", paramString);
      console.log("Full signature string:", signString);

      // Generate hash using SHA-256
      const hash = crypto
        .createHash("sha256")
        .update(signString)
        .digest("hex")
        .toLowerCase();

      console.log("Generated signature:", hash);

      return hash;
    } catch (error) {
      console.error("Signature Generation Error:", error);
      throw error;
    }
  }

  static async createPayment(req, res, next) {
    try {
      const {
        amount,
        currency = "SAR",
        customerEmail,
        customerName,
        orderDescription,
      } = req.body;

      // Create payment data object with exact format
      const paymentData = {
        command: "PURCHASE",
        access_code: amazonPayConfig.sandbox.accessCode,
        merchant_identifier: amazonPayConfig.sandbox.merchantIdentifier,
        merchant_reference: `ORDER-${Date.now()}`,
        amount: (parseFloat(amount) * 100).toFixed(0),
        currency,
        customer_email: customerEmail,
        customer_name: customerName,
        order_description: orderDescription,
        language: "en",
        return_url: `${process.env.FRONTEND_URL}/payment/callback`,
      };

      // Generate signature before adding it to the payload
      const signature = AmazonPayController.generateSignature(paymentData);
      paymentData.signature = signature;

      console.log(
        "Final Request Payload:",
        JSON.stringify(paymentData, null, 2)
      );

      // Make API request
      const response = await axios.post(
        AmazonPayController.baseURL,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", JSON.stringify(response.data, null, 2));

      if (response.data.response_code === "00008") {
        console.error("Signature Mismatch Details:", {
          requestSignature: signature,
          responseSignature: response.data.signature,
          requestData: paymentData,
        });
      }

      return res.json({
        success: response.data.response_code === "14000",
        message:
          response.data.response_message || "Payment initiated successfully",
        data: response.data,
      });
    } catch (error) {
      console.error("Payment Error:", {
        message: error.message,
        response: error.response?.data,
        request: error.config?.data,
      });
      next(error);
    }
  }

  static async processPayment(req, res, next) {
    try {
      const { fort_id, payment_method } = req.body;

      const paymentData = {
        command: "PURCHASE",
        access_code: amazonPayConfig.accessCode,
        merchant_identifier: amazonPayConfig.merchantIdentifier,
        fort_id,
        payment_method,
        language: "en",
      };

      paymentData.signature =
        AmazonPayController.generateSignature(paymentData);

      const response = await axios.post(
        AmazonPayController.baseURL,
        paymentData
      );

      return res.json({
        success: true,
        message: "Payment processed successfully",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkPaymentStatus(req, res, next) {
    try {
      const { fortId } = req.params;

      const queryData = {
        query_command: "CHECK_STATUS",
        access_code: amazonPayConfig.accessCode,
        merchant_identifier: amazonPayConfig.merchantIdentifier,
        fort_id: fortId,
        language: "en",
      };

      queryData.signature = AmazonPayController.generateSignature(queryData);

      const response = await axios.post(AmazonPayController.baseURL, queryData);

      return res.json({
        success: true,
        message: "Payment status retrieved",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRefund(req, res, next) {
    try {
      const { fortId, amount, currency = "SAR" } = req.body;

      const refundData = {
        command: "REFUND",
        access_code: amazonPayConfig.accessCode,
        merchant_identifier: amazonPayConfig.merchantIdentifier,
        fort_id: fortId,
        amount: (amount * 100).toFixed(0),
        currency,
        language: "en",
      };

      refundData.signature = AmazonPayController.generateSignature(refundData);

      const response = await axios.post(
        AmazonPayController.baseURL,
        refundData
      );

      return res.json({
        success: true,
        message: "Refund initiated successfully",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTokenization(req, res, next) {
    try {
      const { card_number, expiry_date, card_holder_name, card_security_code } =
        req.body;

      const tokenData = {
        service_command: "TOKENIZATION",
        access_code: amazonPayConfig.accessCode,
        merchant_identifier: amazonPayConfig.merchantIdentifier,
        language: "en",
        card_number,
        expiry_date,
        card_holder_name,
        card_security_code,
      };

      tokenData.signature = AmazonPayController.generateSignature(tokenData);

      const response = await axios.post(AmazonPayController.baseURL, tokenData);

      return res.json({
        success: true,
        message: "Card tokenized successfully",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstallmentPlans(req, res, next) {
    try {
      const { amount, currency = "SAR" } = req.query;

      const planData = {
        service_command: "GET_INSTALLMENTS_PLANS",
        access_code: amazonPayConfig.accessCode,
        merchant_identifier: amazonPayConfig.merchantIdentifier,
        language: "en",
        amount: (amount * 100).toFixed(0),
        currency,
      };

      planData.signature = AmazonPayController.generateSignature(planData);

      const response = await axios.post(AmazonPayController.baseURL, planData);

      return res.json({
        success: true,
        message: "Installment plans retrieved successfully",
        data: response.data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AmazonPayController;

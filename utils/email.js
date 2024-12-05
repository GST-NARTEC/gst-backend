import dotenv from "dotenv";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGO_PATH = "/assets/images/gst-logo.png";
const DOMAIN = process.env.DOMAIN || "http://localhost:3000";
const LOGO_URL = `${DOMAIN}${LOGO_PATH}`;

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async sendOTP(to, otp) {
    try {
      const templatePath = path.join(__dirname, "../view/otp.ejs");
      const html = await ejs.renderFile(templatePath, {
        otp,
        logo: LOGO_URL,
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: "Email Verification Code",
        html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }

  async sendWelcomeEmail({
    email,
    order,
    password,
    user,
    attachments,
    currency,
    tax,
  }) {
    try {
      const templatePath = path.join(__dirname, "../view/welcomeEmail.ejs");

      const data = {
        user,
        order: {
          ...order,
          orderItems: order.orderItems.map((item) => ({
            ...item,
            product: item.product,
            addonItems: item.addonItems.map((addonItem) => ({
              addon: addonItem.addon,
              quantity: addonItem.quantity,
              price: addonItem.price,
            })),
          })),
        },
        password,
        loginUrl: process.env.LOGIN_URL,
        logo: LOGO_URL,
        currency,
        tax,
      };

      const html = await ejs.renderFile(templatePath, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Welcome to GST Saudi Arabia",
        html,
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return false;
    }
  }

  async sendBankSlipNotification({ email, order, user }) {
    try {
      const templatePath = path.join(
        __dirname,
        "../view/bankSlipNotification.ejs"
      );

      const data = {
        user,
        order,
        logo: LOGO_URL,
      };

      const html = await ejs.renderFile(templatePath, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Bank Slip Received - Order ${order.orderNumber}`,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending bank slip notification email:", error);
      return false;
    }
  }

  async sendOrderActivationEmail({
    email,
    order,
    user,
    attachments,
    currency,
  }) {
    try {
      const templatePath = path.join(
        __dirname,
        "../view/orderActivationEmail.ejs"
      );

      const data = {
        user,
        order,
        logo: LOGO_URL,
        loginUrl: process.env.LOGIN_URL,
        currency,
      };

      const html = await ejs.renderFile(templatePath, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account Activated - Order ${order.orderNumber}`,
        html,
        attachments,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending account activation email:", error);
      return false;
    }
  }

  async sendStatusUpdateEmail({ email, user, isActive }) {
    try {
      const templatePath = path.join(__dirname, "../view/userStatusUpdate.ejs");

      const data = {
        user,
        isActive,
        logo: LOGO_URL,
      };

      const html = await ejs.renderFile(templatePath, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Account ${
          isActive ? "Activated" : "Suspended"
        } - GST Saudi Arabia`,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending status update email:", error);
      return false;
    }
  }
}

export default new EmailService();

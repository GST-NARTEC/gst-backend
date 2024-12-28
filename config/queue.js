import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
};

// Create queues
export const checkoutQueue = new Queue("checkout", { connection });
export const emailQueue = new Queue("email", { connection });
export const pdfQueue = new Queue("pdf", { connection });
export const orderActivationQueue = new Queue("order-activation", {
  connection,
});

export const userDeletionQueue = new Queue("user-deletion", {
  connection,
  defaultJobOptions,
});

export const barcodeCertificateQueue = new Queue("barcode-certificate", {
  connection,
  defaultJobOptions,
});

// Email queues
export const accountAdminNotificationQueue = new Queue(
  "account-admin-notification",
  {
    connection,
  }
);

export const welcomeEmailQueue = new Queue("welcome-email", {
  connection,
});

export const bankSlipNotificationQueue = new Queue("bank-slip-notification", {
  connection,
});

export const helpTicketAdminQueue = new Queue("help-ticket-admin", {
  connection,
});

export const helpTicketUserQueue = new Queue("help-ticket-user", {
  connection,
});

// User product queues
export const userProductQueue = new Queue("user-product", {
  connection,
  defaultJobOptions,
});

export const gtinQueue = new Queue("gtin-processing", {
  connection,
  defaultJobOptions,
});

// Aggregation queues
export const aggregationQueue = new Queue("aggregation", {
  connection,
  defaultJobOptions,
});

import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});

// Create queues
export const checkoutQueue = new Queue("checkout", { connection });
export const emailQueue = new Queue("email", { connection });
export const pdfQueue = new Queue("pdf", { connection });
export const orderActivationQueue = new Queue("order-activation", {
  connection,
});

import { Worker } from "bullmq";
import EmailService from "../utils/email.js";
import { REDIS_CONFIG } from "../config/redis.js";

const emailWorker = new Worker(
  "email",
  async (job) => {
    try {
      switch (job.name) {
        case "admin-help-ticket-notification":
          const { ticket } = job.data;
          if (!ticket) {
            throw new Error("Ticket data is required");
          }
          
          const adminSent = await EmailService.sendHelpTicketAdminNotification(ticket);
          if (!adminSent) {
            throw new Error("Failed to send admin notification email");
          }
          break;

        case "user-help-ticket-notification":
          const { ticket: userTicket } = job.data;
          if (!userTicket) {
            throw new Error("Ticket data is required");
          }

          const userSent = await EmailService.sendHelpTicketUserNotification(userTicket);
          if (!userSent) {
            throw new Error("Failed to send user notification email");
          }
          break;

        default:
          console.log(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      console.error(`Error sending ${job.name} email:`, error);
      throw error; // Rethrow to trigger job retry
    }
  },
  {
    connection: REDIS_CONFIG,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 1000 * 60, // 1 minute
    },
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

export default emailWorker;

import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";

const processWelcomeEmail = async (job) => {
  const { email, order, password, user, currency, tax, attachments } = job.data;

  await EmailService.sendWelcomeEmail({
    email: email,
    order: order,
    password: password,
    user,
    currency,
    tax,
    attachments,
  });
};

const processAccountAdminNotification = async (job) => {
  const user = job.data;
  await EmailService.sendAccountAdminNotification(user);
};

// create welcome email worker
const welcomeEmailWorker = new Worker("welcome-email", processWelcomeEmail, {
  connection,
});

const accountAdminNotificationWorker = new Worker(
  "account-admin-notification",
  processAccountAdminNotification,
  {
    connection,
  }
);

welcomeEmailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

welcomeEmailWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

accountAdminNotificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

accountAdminNotificationWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// export workers
export { accountAdminNotificationWorker, welcomeEmailWorker };

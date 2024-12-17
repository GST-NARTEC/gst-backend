import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";

const processWelcomeEmail = async (job) => {
  await EmailService.sendWelcomeEmail(job.data);
};

const processAccountAdminNotification = async (job) => {
  const user = job.data;
  await EmailService.sendAccountAdminNotification(user);
};

const processBankSlipNotification = async (job) => {
  const updatedOrder = job.data;
  // Send email notification
  const isSent = await EmailService.sendBankSlipNotification({
    email: updatedOrder.user.email,
    order: updatedOrder,
    user: updatedOrder.user,
  });

  if (!isSent) {
    console.log(
      `Failed to send bank slip notification for order ${updatedOrder.orderNumber} to ${updatedOrder.user.email}`
    );
  } else {
    console.log(
      `Bank slip notification sent successfully for order ${updatedOrder.orderNumber} to ${updatedOrder.user.email}`
    );
  }
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

const bankSlipNotificationWorker = new Worker(
  "bank-slip-notification",
  processBankSlipNotification,
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

bankSlipNotificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

bankSlipNotificationWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// export workers
export {
  accountAdminNotificationWorker,
  bankSlipNotificationWorker,
  welcomeEmailWorker,
};

import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import EmailService from "../utils/email.js";

// Processors

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

const processHelpTicketAdminNotification = async (job) => {
  const { ticket } = job.data;
  await EmailService.sendHelpTicketAdminNotification(ticket);
};

const processHelpTicketUserNotification = async (job) => {
  const { ticket } = job.data;
  await EmailService.sendHelpTicketUserNotification(ticket);
};

const processResetPassword = async (job) => {
  const { user, newPassword } = job.data;
  await EmailService.sendResetPasswordEmail(user, newPassword);
};

const processUserUpdateNotification = async (job) => {
  const { user } = job.data;
  await EmailService.sendUserUpdateEmail({ email: user.email, user });
};

// Workers
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

const helpTicketAdminNotificationWorker = new Worker(
  "help-ticket-admin",
  processHelpTicketAdminNotification,
  {
    connection,
  }
);

const helpTicketUserNotificationWorker = new Worker(
  "help-ticket-user",
  processHelpTicketUserNotification,
  {
    connection,
  }
);

const resetPasswordWorker = new Worker("reset-password", processResetPassword, {
  connection,
});

const userUpdateNotificationWorker = new Worker(
  "user-update-notification",
  processUserUpdateNotification,
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

helpTicketAdminNotificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

helpTicketUserNotificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

helpTicketAdminNotificationWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

helpTicketUserNotificationWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

resetPasswordWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

resetPasswordWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

userUpdateNotificationWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

userUpdateNotificationWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

// export workers
export {
    accountAdminNotificationWorker,
    bankSlipNotificationWorker,
    helpTicketAdminNotificationWorker,
    helpTicketUserNotificationWorker,
    resetPasswordWorker,
    userUpdateNotificationWorker,
    welcomeEmailWorker
};


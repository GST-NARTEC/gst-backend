import bcrypt from "bcrypt";
import { Worker } from "bullmq";

import {
  accountAdminNotificationQueue,
  connection,
  welcomeEmailQueue,
} from "../config/queue.js";
import { addDomain } from "../utils/file.js";
import { generatePassword } from "../utils/generatePassword.js";
import PDFGenerator from "../utils/pdfGenerator.js";
import { calculatePrice } from "../utils/priceCalculator.js";
import prisma from "../utils/prismaClient.js";

const processCheckout = async (job) => {
  const { cart, user, paymentType, vat, activeVat, activeCurrency } = job.data;

  let isSec = false;

  // Calculate totals
  const totalAmount = cart.items.reduce((sum, item) => {
    // check if prodcut title contains "sec"
    if (item.product.title.toLowerCase().includes("sec")) {
      isSec = true;
    }

    const { totalPrice: productTotal, unitPrice } = calculatePrice(
      item.product.price,
      item.quantity
    );

    const addonsTotal = item.addonItems.reduce(
      (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
      0
    );

    console.log(
      `productTotal: ${productTotal}, addonsTotal: ${addonsTotal}, sum: ${sum}`
    );

    return sum + productTotal + addonsTotal;
  }, 0);

  let vatAmount = vat;

  if (activeVat?.type == "PERCENTAGE") {
    vatAmount = (totalAmount * vat) / 100;
  }

  const overallAmount = totalAmount + vatAmount;

  console.log(
    `vatAmount: ${vatAmount}, totalAmount: ${totalAmount}, overallAmount: ${overallAmount}`
  );

  // Generate password
  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create order and process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: job.data.orderNumber,
        userId: user.id,
        paymentType,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        status: "Pending Payment",
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            addonItems: {
              create: item.addonItems.map((addonItem) => ({
                addonId: addonItem.addon.id,
                quantity: addonItem.quantity,
                price: addonItem.addon.price,
              })),
            },
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            addonItems: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isCreated: true,
        isSec: isSec,
      },
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        userId: user.id,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        paymentType,
        status: "completed",
      },
    });

    return { order, invoice, password };
  });

  // Generate PDF
  const pdfResult = await PDFGenerator.generateInvoice(
    result.order,
    user,
    result.invoice
  );

  // Update invoice with PDF
  await prisma.invoice.update({
    where: { id: result.invoice.id },
    data: {
      pdf: addDomain(pdfResult.relativePath),
    },
  });

  // Send account admin notification as well as send welcome email throw new queue job
  await accountAdminNotificationQueue.add("account-admin-notification", user, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });

  await welcomeEmailQueue.add(
    "welcome-email",
    {
      email: user.email,
      order: result.order,
      password: result.password,
      user,
      currency: {
        symbol: activeCurrency.symbol,
        name: activeCurrency.name,
      },
      tax: {
        value: activeVat.value,
        type: activeVat.type,
        computed: vatAmount,
      },
      attachments: [
        {
          filename: "invoice.pdf",
          path: pdfResult.absolutePath,
        },
      ],
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );

  //   // Send email
  //   await EmailService.sendWelcomeEmail({
  //     email: user.email,
  //     order: result.order,
  //     password: result.password,
  //     user,
  //     currency: {
  //       symbol: activeCurrency.symbol,
  //       name: activeCurrency.name,
  //     },
  //     tax: {
  //       value: activeVat.value,
  //       type: activeVat.type,
  //       computed: vatAmount,
  //     },
  //     attachments: [
  //       {
  //         filename: "invoice.pdf",
  //         path: pdfResult.absolutePath,
  //       },
  //     ],
  //   });

  return result;
};

const processCheckouts = async (job) => {
  const {
    orderNumber,
    cart,
    user,
    paymentType,
    vat,
    activeVat,
    activeCurrency,
    isNewOrder = false,
  } = job.data;

  let isSec = false;

  // Calculate totals
  const totalAmount = cart.items.reduce((sum, item) => {
    // check if prodcut title contains "sec"
    if (!isSec && item.product.title.toLowerCase().includes("sec")) {
      isSec = true;
    }

    const { totalPrice: productTotal, unitPrice } = calculatePrice(
      item.product.price,
      item.quantity
    );

    const addonsTotal = item.addonItems.reduce(
      (acc, addonItem) => acc + addonItem.addon.price * addonItem.quantity,
      0
    );

    console.log(
      `productTotal: ${productTotal}, addonsTotal: ${addonsTotal}, sum: ${sum}`
    );

    return sum + productTotal + addonsTotal;
  }, 0);

  let vatAmount = vat;

  if (activeVat?.type == "PERCENTAGE") {
    vatAmount = (totalAmount * vat) / 100;
  }

  const overallAmount = totalAmount + vatAmount;

  console.log(
    `vatAmount: ${vatAmount}, totalAmount: ${totalAmount}, overallAmount: ${overallAmount}`
  );

  let password = "",
    hashedPassword = "";
  if (!isNewOrder) {
    // Generate password
    password = generatePassword();
    hashedPassword = await bcrypt.hash(password, 10);
  }

  // Create order and process everything in a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        paymentType,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        status: "Pending Payment",
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            addonItems: {
              create: item.addonItems.map((addonItem) => ({
                addonId: addonItem.addon.id,
                quantity: addonItem.quantity,
                price: addonItem.addon.price,
              })),
            },
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
            addonItems: {
              include: {
                addon: true,
              },
            },
          },
        },
      },
    });

    if (!isNewOrder) {
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          isCreated: true,
          isSec: isSec,
        },
      });
    }

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        userId: user.id,
        totalAmount,
        vat: vatAmount,
        overallAmount,
        paymentType,
        status: "completed",
      },
    });

    return { order, invoice, password };
  });

  // Generate PDF
  const pdfResult = await PDFGenerator.generateInvoice(
    result.order,
    user,
    result.invoice
  );

  // Update invoice with PDF
  await prisma.invoice.update({
    where: { id: result.invoice.id },
    data: {
      pdf: addDomain(pdfResult.relativePath),
    },
  });

  if (!isNewOrder) {
    // Send account admin notification as well as send welcome email throw new queue job
    await accountAdminNotificationQueue.add(
      "account-admin-notification",
      user,
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );

    await welcomeEmailQueue.add(
      "welcome-email",
      {
        email: user.email,
        order: result.order,
        password: result.password,
        user,
        currency: {
          symbol: activeCurrency.symbol,
          name: activeCurrency.name,
        },
        tax: {
          value: activeVat.value,
          type: activeVat.type,
          computed: vatAmount,
        },
        attachments: [
          {
            filename: "invoice.pdf",
            path: pdfResult.absolutePath,
          },
        ],
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );
  } else {
    //TODO: send new order notification
    console.log("Inshallah new order notification will be sent");
  }

  return result;
};

// Create worker using shared connection
const worker = new Worker("checkout", processCheckouts, { connection });

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default worker;

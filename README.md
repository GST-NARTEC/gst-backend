# GST Backend - Saudi Arabia

A Node.js backend service for GST (Global Standards Trading) management system with comprehensive barcode and certificate generation capabilities.

## Core Features

### Authentication & User Management

- 🔐 JWT-based Authentication with Access/Refresh Tokens
- 👥 User Registration with Email Verification (OTP)
- 📧 Automated Welcome Emails with Credentials
- 👤 User Status Management (Active/Inactive)

### Product & Order Management

- 📦 Product Management with Categories
- 🛒 Shopping Cart System (v1 and v2)
- 💳 Multiple Payment Methods:
  - Bank Transfer (with slip upload)
  - Credit/Debit Cards
  - STC Pay
  - Tabby
- 📄 Order Processing & Status Tracking

### Financial Management

- 💰 Multi-Currency Support
- 💹 VAT Configuration & Management
- 💳 Payment Processing
- 📊 Tax Calculations

### Document Generation

- 📑 PDF Certificate Generation
- 🏷️ Barcode Generation & Management
- 📄 License Certificate Generation
- 🧾 Invoice Generation

### Content Management

- 🌍 Multi-language Support (English & Arabic)
- 📱 Menu & SubMenu Management
- 🖼️ Slider Management with Image Upload
- 📝 Page Templates & Dynamic Content
- ⭐ Pro Services Management
- 🎯 Core Solutions Management
- 🔍 Why Barcode Section Management

### Location Services

- 🌍 Country Management
- 🏢 Region Management
- 🏙️ City Management

### Email Services

- 📧 Transactional Emails
- 🔐 OTP Verification
- 🎉 Welcome Emails
- 📢 Status Update Notifications
- 🧾 Order Confirmations

## Technical Stack

### Core Technologies

- Node.js & Express.js
- MS SQL Server with Prisma ORM
- Redis for Queue Management
- BullMQ for Job Processing

### Authentication & Security

- JWT (JSON Web Tokens)
- bcrypt for Password Hashing
- CORS Protection

### File Processing

- Multermate for File Upload
- Puppeteer for PDF Generation
- QR Code Generation

### Email & Templates

- Nodemailer for Email Service
- EJS for Email Templates
- HTML to PDF Conversion

### Documentation

- Swagger/OpenAPI Documentation
- JSDoc Comments

## Prerequisites

- Node.js (v14 or higher)
- MS SQL Server
- Redis Server
- pnpm (recommended) or npm

## Installation

1. Clone the repository:

git clone https://github.com/your-repo/gst-backend.git

2. Install dependencies:

pnpm install

3. Configure environment variables:

cp .env.example .env

4. Update the `.env` file with your configurations:

```env
# Server
PORT=3000
DOMAIN="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# Database
DATABASE_URL="sqlserver://host;database=GST;user=username;password=password;trustServerCertificate=true"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-secret"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email
EMAIL_FROM="your-email@domain.com"
EMAIL_APP_PASSWORD="your-app-password"
```

5. Start the development server:

pnpm dev

## API Documentation

Access the Swagger documentation at `/api-docs` when running the server.

## Project Structure

```
├── assets/             # Static assets
├── config/             # Configuration files
├── controllers/        # Route controllers
├── docs/               # API documentation
├── middlewares/        # Express middlewares
├── prisma/             # Database schema and migrations
├── routes/             # API routes
├── uploads/            # All uploaded files during the use
├── utils/              # Utility functions
├── view/               # Email templates
├── workers/            # Background job workers
└── app.js              # Application entry point
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# gst-backend

# GST Backend

A Node.js backend service for GST (Goods and Services Tax) management system with invoice generation capabilities.

## Features

- 🛒 Product Management with Tax Configuration
- 🛍️ Shopping Cart System
- 💳 Multiple Payment Methods Support
- 📊 Tax and VAT Calculations
- 📄 PDF Invoice Generation
- 📧 Email Notifications
- 🔐 User Authentication
- 📱 REST API Endpoints

## Tech Stack

- Node.js & Express.js
- Prisma ORM
- PostgreSQL
- EJS Templates
- Puppeteer (PDF Generation)
- Nodemailer (Email Service)
- Swagger (API Documentation)

## Prerequisites

- Node.js (v14 or higher)
- MS SQL Server
- npm or yarn

## Installation

1. Clone the repository:

git clone https://github.com/GST-NARTEC/gst-backend.git

2. Install dependencies:

pnpm install

3. Set up environment variables:

cp .env.example .env

4. Update the `.env` file with your configurations:

DATABASE_URL="sqlserver://user:password@localhost:5432/gst_db"

EMAIL_APP_PASSWORD="your-app-specific-password"

LOGIN_URL="http://your-frontend-url/login"

LOGIN_URL="http://your-frontend-url/login"

## API Documentation

The API documentation is available at `/api-docs` when running the server. Key endpoints include:

### Products

- `POST /api/products/v1` - Create product with tax
- `GET /api/products/v1` - List products
- `PUT /api/products/v1/:id` - Update product
- `DELETE /api/products/v1/:id` - Delete product

### Cart

- `POST /api/cart/v1/add` - Add items to cart
- `GET /api/cart/v1/:userId` - Get user's cart
- `DELETE /api/cart/v1/:userId` - Clear cart

### Checkout

- `POST /api/checkout/v1/process` - Process checkout with tax & VAT

## Invoice Generation

The system generates PDF invoices using EJS templates and Puppeteer. Each invoice includes:

- Company and customer details
- Item list with quantities and prices
- Tax calculations
- VAT calculations
- QR code for verification

## License

This project is licensed under the MIT License - see the LICENSE file for details.

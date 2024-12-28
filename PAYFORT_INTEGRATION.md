# PayFort Payment Integration Documentation

## Table of Contents

1. Overview
2. Payment Flow
3. Configuration
4. Implementation Details
5. Testing Guide
6. Troubleshooting

## 1. Overview

PayFort integration provides a secure payment gateway that supports multiple payment methods. The integration follows this high-level flow:

mermaid
graph LR
A[Customer] -->|1. Initiates Payment| B[Your Server]
B -->|2. Creates Payment Page| C[PayFort]
C -->|3. Processes Payment| D[Payment Form]
D -->|4. Completes Payment| B
B -->|5. Verifies Response| E[Update Order]

## 2. Payment Flow

### Step 1: Payment Initiation

- Customer submits payment form on your website
- Amount and email are sent to your server
- Server generates a unique order reference

### Step 2: Payment Page Creation

javascript
// Example request to create payment page
const orderData = {
amount: 100.00,
email: "customer@example.com",
referenceId: "ORDER-123"
};
const paymentPage = await PayfortService.createPaymentPage(orderData);

### Step 3: Signature Generation

```javascript
// Parameters are sorted alphabetically
const params = {
  access_code: "ACCESS_CODE",
  amount: "10000",
  currency: "SAR",
  merchant_identifier: "MERCHANT_ID",
  merchant_reference: "ORDER-123",
};

// Signature creation process
phrase + sorted_params_string + phrase;
```

### Step 4: Payment Processing

1. Customer is redirected to PayFort
2. Enters payment details
3. PayFort processes the payment
4. Customer is redirected back to your site

### Step 5: Response Handling

```javascript
// PayFort sends response with these parameters
{
  merchant_reference: "ORDER-123",
  fort_id: "TRANSACTION_ID",
  amount: "10000",
  currency: "SAR",
  status: "14", // Success code
  signature: "GENERATED_SIGNATURE"
}
```

## 3. Configuration

### Required Environment Variables

```plaintext
PAYFORT_MERCHANT_IDENTIFIER=your_merchant_id
PAYFORT_ACCESS_CODE=your_access_code
PAYFORT_SHA_REQUEST_PHRASE=your_request_phrase
PAYFORT_SHA_RESPONSE_PHRASE=your_response_phrase
PAYMENT_RETURN_URL=https://your-domain.com/payment/response
```

### PayFort Configuration

```javascript
const payfortConfig = {
  merchantIdentifier: process.env.PAYFORT_MERCHANT_IDENTIFIER,
  accessCode: process.env.PAYFORT_ACCESS_CODE,
  shaType: "SHA-256",
  shaRequestPhrase: process.env.PAYFORT_SHA_REQUEST_PHRASE,
  shaResponsePhrase: process.env.PAYFORT_SHA_RESPONSE_PHRASE,
  sandboxMode: process.env.NODE_ENV !== "production",
};
```

## 4. Implementation Details

### Signature Generation Process

1. Sort parameters alphabetically
2. Concatenate key-value pairs
3. Add request/response phrases
4. Generate SHA-256 hash

```javascript
// Example signature generation
const params = { amount: "100", currency: "SAR" };
const sortedString = "amount=100currency=SAR";
const signatureString = phrase + sortedString + phrase;
const signature = sha256(signatureString);
```

### Response Verification

1. Receive PayFort response
2. Remove signature from parameters
3. Generate verification signature
4. Compare signatures
5. Process payment result

## 5. Testing Guide

### Test Payment Initiation

```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 100.00,
    "email": "customer@example.com"
  }'
```

### Test Response Handling

```bash
curl -X POST http://localhost:3000/api/payment/response \
  -H 'Content-Type: application/json' \
  -d '{
    "merchant_identifier": "your_merchant_id",
    "access_code": "your_access_code",
    "merchant_reference": "ORDER-123",
    "amount": "10000",
    "currency": "SAR",
    "status": "14",
    "signature": "generated_signature"
  }'
```

## 6. Troubleshooting

### Common Issues

1. Signature Mismatch

```javascript
// Debug by logging signature components
console.log("Signature String:", signatureString);
console.log("Generated Signature:", signature);
console.log("Received Signature:", responseSignature);
```

2. Invalid Amount Format

- Ensure amounts are converted to lowest denomination
- Example: 100.00 SAR → "10000"

3. Missing Parameters

- Check all required parameters are included
- Verify parameter names match PayFort documentation

### Response Status Codes

- 14: Success
- 12: Invalid Card
- 13: Insufficient Funds
- 14: Transaction Successful
- 40: Invalid Transaction

## Security Considerations

1. Always verify signatures
2. Use HTTPS
3. Validate all inputs
4. Store sensitive data securely
5. Log transactions
6. Handle errors gracefully

## Best Practices

1. Implement idempotency
2. Add request timeouts
3. Use proper error handling
4. Implement retry logic
5. Add comprehensive logging
6. Monitor transactions
7. Regular security audits

```

This documentation provides:
1. Clear flow explanation
2. Step-by-step process
3. Code examples
4. Configuration details
5. Testing instructions
6. Troubleshooting guide
7. Security considerations
8. Best practices

Let me know if you need any section explained in more detail!
```

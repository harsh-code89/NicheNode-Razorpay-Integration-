# Razorpay Integration for Firebase

This directory contains the backend code for integrating Razorpay with a Firebase application. It includes two callable Firebase Cloud Functions: `createRazorpayOrder` and `verifyRazorpayPayment`.

## Setup

Before deploying the functions, you need to complete the following setup steps:

### 1. Install Dependencies

Navigate to the `functions` directory in your terminal and run the following command to install the necessary Node.js modules:

```bash
npm install
```

### 2. Configure Razorpay API Keys

This integration requires your Razorpay Key ID and Key Secret. For security, it is highly recommended to store these as Firebase environment variables.

Run the following commands from your terminal, replacing `YOUR_KEY_ID` and `YOUR_KEY_SECRET` with your actual Razorpay keys:

```bash
firebase functions:config:set razorpay.key_id="YOUR_KEY_ID"
firebase functions:config:set razorpay.key_secret="YOUR_KEY_SECRET"
```

After setting the configuration, deploy your functions for the changes to take effect.

## Cloud Functions

### `createRazorpayOrder`

This function creates a Razorpay order with a specified amount and currency.

-   **Trigger:** Callable
-   **Input:**
    -   `amount` (number): The order amount in the smallest currency unit (e.g., 1000 for ₹10.00).
    -   `currency` (string): The currency of the order (e.g., "INR").
-   **Output:**
    -   `order_id` (string): The ID of the created Razorpay order.

### `verifyRazorpayPayment`

This function verifies the authenticity of a payment by checking the signature provided by Razorpay.

-   **Trigger:** Callable
-   **Input:**
    -   `order_id` (string): The ID of the order.
    -   `razorpay_payment_id` (string): The ID of the payment.
    -   `razorpay_signature` (string): The signature returned by Razorpay after a successful payment.
-   **Output:**
    -   `status` (string): "success" if the payment is verified.

## Firestore Data Structure

This integration uses a `razorpayOrders` collection in Firestore to store order and payment details. Each document in this collection represents a single order and contains fields such as `order_id`, `amount`, `currency`, `status`, and timestamps.

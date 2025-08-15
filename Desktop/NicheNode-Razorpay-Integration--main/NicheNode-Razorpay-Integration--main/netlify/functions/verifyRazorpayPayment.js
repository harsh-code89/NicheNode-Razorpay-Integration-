const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing payment details." }),
    };
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid signature." }),
    };
  }

  // Signature is valid, you can now update your database or perform other actions.
  // The Supabase database update logic has been removed as per the requirements.

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "Payment verified" }),
  };
};

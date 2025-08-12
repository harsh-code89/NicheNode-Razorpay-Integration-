const Razorpay = require("razorpay");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const { amount, currency } = JSON.parse(event.body);

  if (!amount || !currency) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Amount and currency are required." }),
    };
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
      statusCode: 200,
      body: JSON.stringify({ order }),
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create Razorpay order." }),
    };
  }
};

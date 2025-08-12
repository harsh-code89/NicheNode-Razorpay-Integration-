const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

// It is recommended to set your Razorpay key id and secret in Firebase environment variables.
// firebase functions:config:set razorpay.key_id="YOUR_KEY_ID"
// firebase functions:config:set razorpay.key_secret="YOUR_KEY_SECRET"
const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id,
  key_secret: functions.config().razorpay.key_secret,
});

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  const { amount, currency } = data;

  if (!amount || !currency) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with two arguments: 'amount' and 'currency'."
    );
  }

  const options = {
    amount: amount, // amount in the smallest currency unit
    currency: currency,
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    const orderRef = await admin.firestore().collection("razorpayOrders").add({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { order_id: order.id, id: orderRef.id };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Could not create Razorpay order."
    );
  }
});

exports.verifyRazorpayPayment = functions.https.onCall(
  async (data, context) => {
    const { order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with three arguments: 'order_id', 'razorpay_payment_id', and 'razorpay_signature'."
      );
    }

    const body = order_id + "|" + razorpay_payment_id;

    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", functions.config().razorpay.key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      try {
        const querySnapshot = await admin
          .firestore()
          .collection("razorpayOrders")
          .where("order_id", "==", order_id)
          .get();

        if (querySnapshot.empty) {
          throw new functions.https.HttpsError(
            "not-found",
            `No order found with order_id: ${order_id}`
          );
        }

        const doc = querySnapshot.docs[0];
        await doc.ref.update({
          status: "paid",
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          payment_verified_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { status: "success" };
      } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        throw new functions.https.HttpsError(
          "internal",
          "Could not verify Razorpay payment."
        );
      }
    } else {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Payment verification failed. Signature mismatch."
      );
    }
  }
);

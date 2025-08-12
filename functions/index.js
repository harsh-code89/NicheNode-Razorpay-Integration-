const admin = require("firebase-admin");
admin.initializeApp();

const razorpayFunctions = require("./razorpay");
exports.createRazorpayOrder = razorpayFunctions.createRazorpayOrder;
exports.verifyRazorpayPayment = razorpayFunctions.verifyRazorpayPayment;

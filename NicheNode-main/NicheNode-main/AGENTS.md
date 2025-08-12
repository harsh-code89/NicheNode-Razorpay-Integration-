# Project Architecture for NicheNode

This project is a React Native/Expo application with a Firebase backend. The goal is to provide a platform for connecting seekers with niche experts for micro-consultations.

* **Frontend:** The mobile application is built using **React Native with Expo**. Key UI components are in `/src/components`, and app screens are in `/src/screens`.
* **Backend:** All server-side logic and API calls are handled by **Firebase Cloud Functions**. The functions code is located in the `/functions` directory.
* **Database:** We use **Firestore** for our NoSQL database. Key collections include `users`, `consultations`, and `experts`.
* **Payment:** We are currently in the process of integrating **Razorpay** for all payment flows. This will involve new Cloud Functions and a dedicated payment screen.

### Important Notes for Agentic AI

* **Secure Keys:** All sensitive API keys (including for Razorpay) are stored as Firebase environment variables and must not be hardcoded in the codebase.
* **Payment Flow:** The Razorpay payment flow is a full-stack process. It requires both a backend Cloud Function to create the order and a frontend component to handle the checkout.
* **Code Style:** Please follow standard JavaScript/TypeScript and React Native coding conventions.


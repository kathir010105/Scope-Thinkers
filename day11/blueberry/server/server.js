import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

const CASHFREE_API_VERSION = "2026-01-01";

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blueberry backend is running",
  });
});

/* =========================================================
   CREATE CASHFREE ORDER
========================================================= */

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount, customerName, customerEmail, customerPhone } = req.body;

    // Basic validation
    if (!amount || Number(amount) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required",
      });
    }

    if (!process.env.CASHFREE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Cashfree Client ID is missing",
      });
    }

    if (!process.env.CASHFREE_CLIENT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Cashfree Client Secret is missing",
      });
    }

    // Cashfree order IDs can contain:
    // letters, numbers, underscores and hyphens
    const orderId = `blueberry_${Date.now()}`;

    const requestBody = {
      order_id: orderId,
      order_amount: Number(Number(amount).toFixed(2)),
      order_currency: "INR",

      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerName || "Blueberry Customer",
        customer_email: customerEmail || "customer@blueberry.com",
        customer_phone: customerPhone,
      },

      order_meta: {
        return_url: `http://localhost:5173/checkout?order_id={order_id}`,
      },

      order_note: "Blueberry Food Delivery Order",
    };

    console.log("Creating Cashfree order:", orderId);

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      },

      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("Cashfree response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Cashfree order creation failed",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,

      order: {
        orderId: data.order_id,
        cfOrderId: data.cf_order_id,
        paymentSessionId: data.payment_session_id,
        amount: data.order_amount,
        currency: data.order_currency,
        status: data.order_status,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating payment order",
      error: error.message,
    });
  }
});

/* =========================================================
   CHECK CASHFREE ORDER STATUS
========================================================= */

app.get("/api/payment/verify/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const response = await fetch(`${CASHFREE_BASE_URL}/pg/orders/${orderId}`, {
      method: "GET",

      headers: {
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
      },
    });

    const data = await response.json();

    console.log("Cashfree order status:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Unable to verify Cashfree order",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,

      order: {
        orderId: data.order_id,
        amount: data.order_amount,
        currency: data.order_currency,
        status: data.order_status,
      },
    });
  } catch (error) {
    console.error("Verify order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment",
      error: error.message,
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(`Blueberry backend running on http://localhost:${PORT}`);

  console.log(`Cashfree environment: ${process.env.CASHFREE_ENV || "sandbox"}`);
});

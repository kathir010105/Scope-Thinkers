const express = require("express");

const {
  createOtp,
  verifyOtp,
  isEmailVerified,
  deleteOtp,
} = require("../services/otpService");

const { sendOtpEmail } = require("../services/emailService");

const { db, adminAuth } = require("../config/firebase");

const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    const { username, fullName, email, mobile, password } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (!username || !fullName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // -----------------------------
    // Check email verification
    // -----------------------------

    const verified = await isEmailVerified(normalizedEmail);

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before creating your account.",
      });
    }

    // -----------------------------
    // Check username uniqueness
    // -----------------------------

    const usernameSnapshot = await db
      .collection("users")
      .where("username", "==", normalizedUsername)
      .limit(1)
      .get();

    if (!usernameSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    // -----------------------------
    // Check if Firebase email exists
    // -----------------------------

    try {
      await adminAuth.getUserByEmail(normalizedEmail);

      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // -----------------------------
    // Create Firebase user
    // -----------------------------

    const firebaseUser = await adminAuth.createUser({
      email: normalizedEmail,
      password,
      displayName: fullName.trim(),
      emailVerified: true,
    });

    // -----------------------------
    // Create Firestore profile
    // -----------------------------

    await db.collection("users").doc(firebaseUser.uid).set({
      uid: firebaseUser.uid,
      username: normalizedUsername,
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      emailVerified: true,
      createdAt: new Date().toISOString(),
    });

    // -----------------------------
    // Remove used OTP
    // -----------------------------

    await deleteOtp(normalizedEmail);

    // -----------------------------
    // Create Firebase custom token
    // -----------------------------

    const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token: customToken,
      user: {
        uid: firebaseUser.uid,
        username: normalizedUsername,
        fullName: fullName.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create account.",
    });
  }
});

// ==========================================
// SEND OTP
// ==========================================

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otp = await createOtp(normalizedEmail);

    await sendOtpEmail(normalizedEmail, otp);

    res.json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to send OTP.",
    });
  }
});

// ==========================================
// VERIFY OTP
// ==========================================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be exactly 6 digits.",
      });
    }

    await verifyOtp(email, otp);

    res.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(400).json({
      success: false,
      message: error.message || "OTP verification failed.",
    });
  }
});

// ==========================================
// CHECK EMAIL STATUS
// ==========================================

router.get("/email-status", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const verified = await isEmailVerified(email);

    res.json({
      success: true,
      verified,
    });
  } catch (error) {
    console.error("Email status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to check email verification.",
    });
  }
});

module.exports = router;

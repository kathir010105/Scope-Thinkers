const crypto = require("crypto");
const { db } = require("../config/firebase");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(email, otp) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");
}

async function createOtp(email) {
  const normalizedEmail = normalizeEmail(email);

  const otpRef = db.collection("pendingOtps").doc(normalizedEmail);

  const existingDoc = await otpRef.get();

  if (existingDoc.exists) {
    const existingData = existingDoc.data();

    const lastSentAt = existingData.lastSentAt?.toMillis
      ? existingData.lastSentAt.toMillis()
      : 0;

    const timeSinceLastSend = Date.now() - lastSentAt;

    if (timeSinceLastSend < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000,
      );

      throw new Error(
        `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
      );
    }
  }

  const otp = generateOtp();

  const otpHash = hashOtp(normalizedEmail, otp);

  const now = Date.now();
  const expiresAt = now + OTP_EXPIRY_MS;

  await otpRef.set({
    email: normalizedEmail,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: now,
    verified: false,
  });

  return otp;
}

async function verifyOtp(email, otp) {
  const normalizedEmail = normalizeEmail(email);

  const otpRef = db.collection("pendingOtps").doc(normalizedEmail);

  const otpDoc = await otpRef.get();

  if (!otpDoc.exists) {
    throw new Error("No OTP found. Please request a new OTP.");
  }

  const data = otpDoc.data();

  if (data.verified) {
    throw new Error("Email has already been verified.");
  }

  if (Date.now() > data.expiresAt) {
    await otpRef.delete();

    throw new Error("OTP has expired. Please request a new OTP.");
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    await otpRef.delete();

    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  const submittedHash = hashOtp(normalizedEmail, otp);

  const hashesMatch = crypto.timingSafeEqual(
    Buffer.from(data.otpHash, "hex"),
    Buffer.from(submittedHash, "hex"),
  );

  if (!hashesMatch) {
    const newAttempts = data.attempts + 1;

    await otpRef.update({
      attempts: newAttempts,
    });

    throw new Error(
      `Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
    );
  }

  await otpRef.update({
    verified: true,
    verifiedAt: Date.now(),
  });

  return true;
}

async function isEmailVerified(email) {
  const normalizedEmail = normalizeEmail(email);

  const otpRef = db.collection("pendingOtps").doc(normalizedEmail);

  const otpDoc = await otpRef.get();

  if (!otpDoc.exists) {
    return false;
  }

  return otpDoc.data().verified === true;
}

async function deleteOtp(email) {
  const normalizedEmail = normalizeEmail(email);

  await db.collection("pendingOtps").doc(normalizedEmail).delete();
}

module.exports = {
  createOtp,
  verifyOtp,
  isEmailVerified,
  deleteOtp,
};

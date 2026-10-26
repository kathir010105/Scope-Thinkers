import admin from "firebase-admin";

if (!admin.apps.length) {
  // Initialize with project ID - token verification works with just project ID
  // No service account needed for verifyIdToken()
  const projectId = process.env.FIREBASE_PROJECT_ID;
  console.log("[Auth] Initializing Firebase Admin with projectId:", projectId);
  admin.initializeApp({
    projectId,
  });
}

export async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[Auth] Missing or invalid Authorization header");
    return res.status(401).json({
      success: false,
      message: "Missing or invalid Authorization header",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];
  console.log("[Auth] Verifying token, length:", idToken.length);

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("[Auth] Token verified for user:", decodedToken.uid, decodedToken.email);
    req.user = { uid: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.code, error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const idToken = authHeader.split("Bearer ")[1];

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = { uid: decodedToken.uid, email: decodedToken.email };
      next();
    })
    .catch(() => {
      next();
    });
}
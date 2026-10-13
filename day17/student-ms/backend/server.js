import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { adminAuth, adminDb, isAdminInitialized } from "./firebaseAdmin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// ============================================================
// MIDDLEWARE: Verify Firebase ID Token
// ============================================================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  if (!isAdminInitialized || !adminAuth) {
    return res.status(500).json({ error: "Backend not configured with Firebase Admin SDK" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ============================================================
// MIDDLEWARE: Load User Profile from Firestore
// ============================================================
const loadUserProfile = async (req, res, next) => {
  if (!isAdminInitialized || !adminDb) {
    return res.status(500).json({ error: "Backend not configured with Firebase Admin SDK" });
  }

  try {
    const userDoc = await adminDb.collection("users").doc(req.firebaseUser.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User profile not found" });
    }

    req.userProfile = { id: userDoc.id, ...userDoc.data() };
    next();
  } catch (error) {
    console.error("Failed to load user profile:", error);
    return res.status(500).json({ error: "Failed to load user profile" });
  }
};

// ============================================================
// AUTHORIZATION HELPERS
// ============================================================
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.userProfile.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

const requireApproved = (req, res, next) => {
  if (req.userProfile.status !== "approved") {
    return res.status(403).json({ error: "Account not approved" });
  }
  next();
};

// ============================================================
// HEALTH CHECK
// ============================================================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    firebaseAdmin: isAdminInitialized,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// VERIFY TOKEN ENDPOINT (for frontend to verify auth state)
// ============================================================
app.post("/api/auth/verify", verifyToken, loadUserProfile, requireApproved, (req, res) => {
  res.json({
    user: {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
    },
    profile: req.userProfile,
  });
});

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// GET /api/admin/users - List all users (admin only)
app.get("/api/admin/users", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users - Create a new user (admin only)
app.post("/api/admin/users", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { email, password, name, role, department, departmentId, phone } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["admin", "hod", "teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Create Firestore profile
    const userData = {
      uid: userRecord.uid,
      name,
      email: email.toLowerCase(),
      role,
      status: "approved",
      department: department || "",
      departmentId: departmentId || "",
      phone: phone || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userData);

    res.status(201).json({ 
      message: "User created successfully", 
      user: { id: userRecord.uid, ...userData } 
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /api/admin/users/:uid - Update user (admin only)
app.patch("/api/admin/users/:uid", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, role, department, departmentId, phone, status } = req.body;

    const updateData = { updatedAt: new Date().toISOString() };
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (departmentId) updateData.departmentId = departmentId;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;

    await adminDb.collection("users").doc(uid).update(updateData);

    // If role changed, update custom claims
    if (role) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    const updatedDoc = await adminDb.collection("users").doc(uid).get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// POST /api/admin/users/:uid/activate - Activate user (admin only)
app.post("/api/admin/users/:uid/activate", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { uid } = req.params;
    await adminDb.collection("users").doc(uid).update({ status: "approved", updatedAt: new Date().toISOString() });
    await adminAuth.updateUser(uid, { disabled: false });
    res.json({ message: "User activated" });
  } catch (error) {
    console.error("Failed to activate user:", error);
    res.status(500).json({ error: "Failed to activate user" });
  }
});

// POST /api/admin/users/:uid/deactivate - Deactivate user (admin only)
app.post("/api/admin/users/:uid/deactivate", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { uid } = req.params;
    await adminDb.collection("users").doc(uid).update({ status: "inactive", updatedAt: new Date().toISOString() });
    await adminAuth.updateUser(uid, { disabled: true });
    res.json({ message: "User deactivated" });
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

// GET /api/admin/registration-requests - List pending users (admin only)
app.get("/api/admin/registration-requests", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const snapshot = await adminDb.collection("users")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch registration requests:", error);
    res.status(500).json({ error: "Failed to fetch registration requests" });
  }
});

// POST /api/admin/registration-requests/:uid/approve - Approve registration (admin only)
app.post("/api/admin/registration-requests/:uid/approve", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { uid } = req.params;
    await adminDb.collection("users").doc(uid).update({ status: "approved", updatedAt: new Date().toISOString() });
    await adminAuth.updateUser(uid, { disabled: false });
    res.json({ message: "Registration approved" });
  } catch (error) {
    console.error("Failed to approve registration:", error);
    res.status(500).json({ error: "Failed to approve registration" });
  }
});

// POST /api/admin/registration-requests/:uid/reject - Reject registration (admin only)
app.post("/api/admin/registration-requests/:uid/reject", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { uid } = req.params;
    await adminDb.collection("users").doc(uid).update({ status: "rejected", updatedAt: new Date().toISOString() });
    await adminAuth.updateUser(uid, { disabled: true });
    res.json({ message: "Registration rejected" });
  } catch (error) {
    console.error("Failed to reject registration:", error);
    res.status(500).json({ error: "Failed to reject registration" });
  }
});

// GET /api/admin/invitations - List invitations (admin only)
app.get("/api/admin/invitations", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const snapshot = await adminDb.collection("invitations").orderBy("createdAt", "desc").get();
    const invitations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(invitations);
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

// POST /api/admin/invitations - Create invitation (admin only)
app.post("/api/admin/invitations", verifyToken, loadUserProfile, requireApproved, requireRole("admin"), async (req, res) => {
  try {
    const { email, role, departmentId, department } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    if (!["hod", "teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role for invitation" });
    }

    // Generate secure token
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    const expiresDate = new Date();
    expiresDate.setHours(expiresDate.getHours() + 48);

    const invitationData = {
      email: email.toLowerCase(),
      role,
      departmentId: departmentId || null,
      department: department || "",
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      status: "pending",
      createdBy: req.firebaseUser.uid,
      createdAt: new Date().toISOString(),
      expiresAt: expiresDate.toISOString(),
      usedAt: null,
    };

    const docRef = await adminDb.collection("invitations").add(invitationData);

    // Return token only once for admin to copy
    res.status(201).json({ 
      message: "Invitation created", 
      invitation: { id: docRef.id, ...invitationData, token } 
    });
  } catch (error) {
    console.error("Failed to create invitation:", error);
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

// ============================================================
// INVITATION REDEMPTION (public endpoint, no auth required)
// ============================================================
app.post("/api/invitations/redeem", async (req, res) => {
  try {
    const { token, email, password, name } = req.body;

    if (!token || !email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isAdminInitialized || !adminAuth || !adminDb) {
      return res.status(500).json({ error: "Backend not configured" });
    }

    const crypto = await import("crypto");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find invitation by token hash
    const snapshot = await adminDb.collection("invitations")
      .where("tokenHash", "==", tokenHash)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: "Invalid invitation token" });
    }

    const invitationDoc = snapshot.docs[0];
    const invitation = invitationDoc.data();

    // Check status
    if (invitation.status !== "pending") {
      return res.status(400).json({ error: "Invitation already used or revoked" });
    }

    // Check expiration
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Check email matches
    if (invitation.email !== email.toLowerCase()) {
      return res.status(400).json({ error: "Email does not match invitation" });
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: email.toLowerCase(),
      password,
      displayName: name,
      emailVerified: false,
    });

    // Create Firestore profile
    const userData = {
      uid: userRecord.uid,
      name,
      email: email.toLowerCase(),
      role: invitation.role,
      status: "approved",
      department: invitation.department,
      departmentId: invitation.departmentId || "",
      phone: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(userRecord.uid).set(userData);

    // Mark invitation as used
    await invitationDoc.ref.update({
      status: "used",
      usedAt: new Date().toISOString(),
    });

    res.json({ 
      message: "Registration successful", 
      user: { uid: userRecord.uid, email: userRecord.email } 
    });
  } catch (error) {
    console.error("Failed to redeem invitation:", error);
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Failed to redeem invitation" });
  }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Firebase Admin: ${isAdminInitialized ? "Initialized" : "NOT CONFIGURED"}`);
});
import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import { upload } from "./upload.js";

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

/*
 * ==========================================
 * CONNECTED USERS
 * ==========================================
 *
 * userId -> WebSocket connection
 *
 * Example:
 *
 * "abc123" -> WebSocket
 * "xyz789" -> WebSocket
 */

const clients = new Map();

/*
 * ==========================================
 * WEBSOCKET CONNECTION
 * ==========================================
 */

wss.on("connection", (ws, req) => {
  console.log("WebSocket client connected from:", req.socket.remoteAddress);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", req.headers);

  /*
   * ========================================
   * RECEIVE MESSAGE
   * ========================================
   */

  ws.on("message", (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      console.log("WebSocket received:", data);

      /*
       * ======================================
       * REGISTER USER
       * ======================================
       */

      if (data.type === "register") {
        if (!data.userId) {
          console.log("Register failed: missing userId, data:", data);
          ws.send(JSON.stringify({ type: "error", message: "Missing userId" }));
          return;
        }

        clients.set(data.userId, ws);

        /*
         * Store user information on socket
         * so we know which user owns this
         * connection when it disconnects.
         */

        ws.userId = data.userId;

        console.log(`Registered user: ${data.userId}`);

        console.log("Currently connected users:", [...clients.keys()]);

        // Send confirmation back to client
        ws.send(JSON.stringify({ type: "registered", userId: data.userId }));

        return;
      }

      /*
       * ======================================
       * CHAT MESSAGE
       * ======================================
       */

      if (data.type === "message") {
        const { senderId, receiverId, chatId, message } = data;

        console.log("Processing message:", {
          senderId,
          receiverId,
          chatId,
          messageId: message?.id,
        });

        if (!receiverId) {
          console.log("Message rejected: receiverId missing");

          return;
        }

        /*
         * Find receiver's WebSocket
         */

        const receiverSocket = clients.get(receiverId);

        console.log(
          "Receiver socket found:",
          !!receiverSocket,
          "readyState:",
          receiverSocket?.readyState,
        );

        /*
         * Receiver online
         */

        if (receiverSocket && receiverSocket.readyState === 1) {
          const forwardMsg = JSON.stringify({
            type: "message",

            senderId,

            receiverId,

            chatId,

            message,
          });
          console.log("Forwarding message to receiver:", receiverId);
          receiverSocket.send(forwardMsg);

          console.log(`Message forwarded from ${senderId} to ${receiverId}`);
        } else {
          /*
           * Receiver is offline.
           *
           * The message is already saved
           * in Firestore, so they will get it
           * when chat history is loaded.
           */

          console.log(
            `Receiver ${receiverId} is not connected. Connected users:`,
            [...clients.keys()],
          );
        }

        return;
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  /*
   * ==========================================
   * DISCONNECT
   * ==========================================
   */

  ws.on("close", () => {
    const userId = ws.userId;

    if (userId) {
      /*
       * Only remove this connection if
       * it is still the active connection
       * for this user.
       */

      if (clients.get(userId) === ws) {
        clients.delete(userId);
      }

      console.log(`User disconnected: ${userId}`);
    }

    console.log("Currently connected users:", [...clients.keys()]);
  });

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  ws.on("error", (error) => {
    console.error("WebSocket connection error:", error);
  });
});

/*
 * ==========================================
 * HTTP TEST ROUTE
 * ==========================================
 */

app.get("/", (req, res) => {
  res.json({
    status: "Chatter WebSocket server running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connectedUsers: [...clients.keys()],
    timestamp: Date.now(),
  });
});

/*
 * ==========================================
 * START SERVER
 * ==========================================
 */

const PORT = 5000;

app.post("/api/files/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { uploadedBy, chatId } = req.body;

    if (!uploadedBy || !chatId) {
      return res.status(400).json({
        message: "uploadedBy and chatId are required",
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO chat_files
      (
        file_name,
        file_type,
        file_size,
        file_data,
        uploaded_by,
        chat_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.buffer,
        uploadedBy,
        chatId,
      ],
    );

    console.log("File stored in MySQL:", {
      id: result.insertId,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });

    res.json({
      success: true,
      fileId: result.insertId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);

    res.status(500).json({
      message: "Failed to upload file",
    });
  }
});

app.get("/api/files/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        file_name,
        file_type,
        file_size,
        file_data
      FROM chat_files
      WHERE id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const file = rows[0];

    res.setHeader("Content-Type", file.file_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.file_name}"`,
    );

    res.send(file.file_data);
  } catch (error) {
    console.error("File retrieval error:", error);

    res.status(500).json({
      message: "Failed to retrieve file",
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  console.log(`WebSocket running on ws://0.0.0.0:${PORT}`);
});

import pool from "./db.js";

try {
  const connection = await pool.getConnection();

  console.log("MySQL connected successfully");

  connection.release();
} catch (error) {
  console.error("MySQL connection failed:", error);
}
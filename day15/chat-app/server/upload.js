import multer from "multer";
import pool from "./db.js";

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

export { upload };

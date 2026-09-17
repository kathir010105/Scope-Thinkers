const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2. Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user in MySQL
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // 5. Send response
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // 3. Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // 5. Send token
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
};

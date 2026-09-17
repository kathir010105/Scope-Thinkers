const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Access token required",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // 4. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach decoded user information to request
    req.user = decoded;

    // 6. Continue to the controller
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;

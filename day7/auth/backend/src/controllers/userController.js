const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile retrieved successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
};

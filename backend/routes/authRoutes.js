const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
// private routes
router.get("/me", protect, getMe);

module.exports = router;

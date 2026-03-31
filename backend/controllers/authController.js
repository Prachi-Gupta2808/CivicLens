const User = require("../models/User");
const jwt = require("jsonwebtoken");

//JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, aadhaar, role } = req.body;

    if (!name || !email || !password || !aadhaar) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // check aadhaar pattern before anything
    const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
    if (!aadhaarPattern.test(aadhaar)) {
      return res.status(400).json({ message: "Invalid Aadhaar number" });
    }

    // check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      aadhaar: {
        full: aadhaar,
        last4: aadhaar.slice(-4),
      },
      role: role || "citizen",
    });

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        aadhaarLast4: user.aadhaar.last4,
        isAadhaarVerified: user.isAadhaarVerified,
      },
    });
  } catch (err) {
    if (err.message === "Invalid Aadhaar number") {
      return res.status(400).json({ message: "Invalid Aadhaar number" });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (user.isBlocked) {
      return res.status(403).json({
        message:
          "Your account has been blocked due to a false report submission",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        aadhaarLast4: user.aadhaar.last4,
        isAadhaarVerified: user.isAadhaarVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id).select(
      "-password -aadhaar.full"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, getMe };

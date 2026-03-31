const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -aadhaar.full"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isBlocked) {
      return res
        .status(403)
        .json({
          message:
            "Your account has been blocked due to a false report submission",
        });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// checks if user is a citizen
const citizenOnly = (req, res, next) => {
  if (req.user && req.user.role === "citizen") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, citizens only" });
  }
};

// checks if user is a fixer
const fixerOnly = (req, res, next) => {
  if (req.user && req.user.role === "fixer") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, fixers only" });
  }
};

module.exports = { protect, citizenOnly, fixerOnly };

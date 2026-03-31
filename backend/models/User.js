const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    aadhaar: {
      full: {
        type: String,
        required: true,
        unique: true,
      },
      last4: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["citizen", "fixer"],
      default: "citizen",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAadhaarVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const aadhaarPattern = /^[2-9]{1}[0-9]{11}$/;
  if (!aadhaarPattern.test(this.aadhaar.full)) {
    return next(new Error("Invalid Aadhaar number"));
  }

  this.isAadhaarVerified = true;

  if (this.isModified("aadhaar.full")) {
    this.aadhaar.last4 = this.aadhaar.full.slice(-4);
    this.aadhaar.full = await bcrypt.hash(this.aadhaar.full, 10);
  }

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

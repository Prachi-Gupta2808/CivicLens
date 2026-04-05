const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["pothole", "garbage", "waterlogging", "fallen_tree", "debris"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isAIGenerated: {
      type: Boolean,
      default: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        default: null,
      },
    },
    photos: {
      type: [String],
      required: true,
    },
    afterPhoto: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "fixed"],
      default: "pending",
    },
    raiseCount: {
      type: Number,
      default: 1,
    },
    raisedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isRelevant: {
      type: Boolean,
      default: true,
    },
    fixedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fixedAt: {
      type: Date,
      default: null,
    },
    // FIXED TYPO HERE: Changed 'reportedAsfalse' to 'reportedAsFalse'
    // ADDED: default: [] to prevent .includes() errors
    reportedAsFalse: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);

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
      enum: [
        "pothole",
        "garbage",
        "waterlogging",
        "fallen_tree",
        "dead_animal",
      ], //initially for these major problems only
      required: true,
    },
    description: {
      type: String,
      required: true, // will be AI generated, user can edit
    },
    isAIGenerated: {
      type: Boolean,
      default: true, // tracks whether description came from AI or was manually written
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
        type: String, // human readable address like "MG Road, Pune"
        default: null,
      },
    },
    photos: {
      type: [String], // array of photo URLs, grows as more people report same issue
      required: true,
    },
    afterPhoto: {
      type: String, // proof photo uploaded by fixer
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "fixed"],
      default: "open",
    },
    raiseCount: {
      type: Number,
      default: 1, // increments when same issue is reported again
    },
    raisedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // tracks who all reported this issue
      },
    ],
    isRelevant: {
      type: Boolean,
      default: true, // ML relevance classifier result
    },
    fixedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fixedAt: {
      type: Date,
      default: null, // timestamp when issue was marked fixed
    },
    reportedAsfalse: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // users who flagged this complaint as false
      },
    ],
  },
  { timestamps: true }
);

// critical for 50 metre geo-deduplication query
complaintSchema.index({ location: "2dsphere" });

// index on status and category for faster fixer dashboard queries
complaintSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);

const express = require("express");
const router = express.Router();
const {
  submitComplaint,
  getAllComplaints,
  getComplaintById,
  markAsFixed,
  markAsInProgress,
  reportAsFalse,
  getMapData,
} = require("../controllers/complaintController");
const {
  protect,
  citizenOnly,
  fixerOnly,
} = require("../middleware/authMiddleware");
const { handleUpload } = require("../middleware/uploadMiddleware");

// citizen routes
router.post("/", protect, citizenOnly, handleUpload, submitComplaint);

// fixer routes
router.get("/", protect, fixerOnly, getAllComplaints);
router.get("/map", protect, getMapData);
router.patch("/:id/fix", protect, fixerOnly, handleUpload, markAsFixed);
router.patch("/:id/inprogress", protect, fixerOnly, markAsInProgress);

// both citizen and fixer
router.get("/:id", protect, getComplaintById);
router.patch("/:id/report", protect, reportAsFalse);

module.exports = router;

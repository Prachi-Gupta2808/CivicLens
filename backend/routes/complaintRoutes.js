const express = require("express");
const router = express.Router();
const {
  submitComplaint,
  getAllComplaints,
  markAsFixed,
  markAsInProgress,
  reportAsFalse,
  getMapData,
  analyzeComplaint,
  getMyComplaints,
  getMyTasks,
} = require("../controllers/complaintController");
const {
  protect,
  citizenOnly,
  fixerOnly,
} = require("../middleware/authMiddleware");
const { handleUpload } = require("../middleware/uploadMiddleware");

router.post("/analyze", protect, citizenOnly, handleUpload, analyzeComplaint);
router.get("/map", getMapData);
router.get("/my-reports", protect, citizenOnly, getMyComplaints);
router.get("/my-tasks", protect, fixerOnly, getMyTasks);
router.get("/", protect, fixerOnly, getAllComplaints);
router.post("/", protect, citizenOnly, submitComplaint);

router.patch("/:id/status", protect, fixerOnly, markAsInProgress); // ← fixed name
router.patch("/:id/fix", protect, fixerOnly, handleUpload, markAsFixed);
router.patch("/:id/report", protect, fixerOnly, reportAsFalse);

module.exports = router;

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { analyzeImage } = require("../utils/mlService");

// @route   POST /api/complaints/analyze
// Private (citizen only)
const analyzeComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a photo" });
    }

    // req.file.path is the Cloudinary URL
    const mlResult = await analyzeImage(req.file.path);

    if (!mlResult.success) {
      return res.status(503).json({
        message: "ML service unavailable. Please try again.",
      });
    }

    if (mlResult.label === "normal") {
      return res.status(400).json({
        message:
          "This does not appear to be a civic issue. Please upload a relevant photo.",
      });
    }

    res.status(200).json({
      label: mlResult.label,
      confidence: mlResult.confidence,
      description: mlResult.description,
      photoUrl: req.file.path, // cloudinary URL for frontend preview
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/complaints
// Private (citizen only)
const submitComplaint = async (req, res) => {
  try {
    const { address, description, category, photoUrl } = req.body;

    let coordinates;
    try {
      coordinates = JSON.parse(req.body.coordinates);
    } catch (e) {
      return res.status(400).json({ message: "Invalid coordinates format" });
    }

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res
        .status(400)
        .json({ message: "Coordinates must be [longitude, latitude]" });
    }

    if (!description || !category) {
      return res
        .status(400)
        .json({ message: "Description and category are required" });
    }

    if (!photoUrl) {
      return res.status(400).json({ message: "Photo URL is required" });
    }

    // geo deduplication
    const nearbyComplaint = await Complaint.findOne({
      status: { $ne: "fixed" },
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates,
          },
          $maxDistance: 50,
        },
      },
    });

    if (nearbyComplaint) {
      const alreadyRaised = nearbyComplaint.raisedBy.includes(req.user.id);
      if (alreadyRaised) {
        return res
          .status(400)
          .json({ message: "You have already reported this issue" });
      }

      nearbyComplaint.photos.push(photoUrl);
      nearbyComplaint.raiseCount += 1;
      nearbyComplaint.raisedBy.push(req.user.id);
      await nearbyComplaint.save();

      return res.status(200).json({
        message: "Issue already reported nearby, raise count updated",
        complaint: nearbyComplaint,
      });
    }

    const complaint = await Complaint.create({
      reportedBy: req.user.id,
      description,
      category,
      isAIGenerated: true,
      location: {
        type: "Point",
        coordinates,
        address: address || null,
      },
      photos: [photoUrl], // cloudinary URL from analyze step
      raisedBy: [req.user.id],
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// @route   GET /api/complaints
// Private (fixer only)
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate("reportedBy", "name email aadhaar.last4")
      .populate("fixedBy", "name email")
      .sort({ raiseCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);

    res.status(200).json({
      complaints,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/complaints/:id
// Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("reportedBy", "name email aadhaar.last4")
      .populate("fixedBy", "name email")
      .populate("raisedBy", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ complaint });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PATCH /api/complaints/:id/fix
// Private (fixer only)
const markAsFixed = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "fixed") {
      return res
        .status(400)
        .json({ message: "Complaint is already marked as fixed" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload an after photo as proof" });
    }

    complaint.status = "fixed";
    complaint.afterPhoto = req.file.path;
    complaint.fixedBy = req.user.id;
    complaint.fixedAt = new Date();
    await complaint.save();

    res.status(200).json({
      message: "Complaint marked as fixed",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PATCH /api/complaints/:id/inprogress
// Private (fixer only)
const markAsInProgress = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "fixed") {
      return res.status(400).json({ message: "Complaint is already fixed" });
    }

    complaint.status = "in-progress";
    await complaint.save();

    res.status(200).json({
      message: "Complaint marked as in progress",
      complaint,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PATCH /api/complaints/:id/report
// Private (citizen + fixer)
const reportAsFalse = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const alreadyReported = complaint.reportedAsFalse.includes(req.user.id);
    if (alreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this complaint" });
    }

    complaint.reportedAsFalse.push(req.user.id);
    await complaint.save();

    // one strike policy — block the uploader
    await User.findByIdAndUpdate(complaint.reportedBy, { isBlocked: true });

    res.status(200).json({
      message: "Complaint reported as false, user has been blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/complaints/map
// Private (both citizen and fixer)
const getMapData = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $ne: "fixed" },
    }).select("location category raiseCount status");

    res.status(200).json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  analyzeComplaint,
  submitComplaint,
  getAllComplaints,
  getComplaintById,
  markAsFixed,
  markAsInProgress,
  reportAsFalse,
  getMapData,
};

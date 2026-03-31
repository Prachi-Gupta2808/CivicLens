const Complaint = require("../models/Complaint");
const User = require("../models/User");

// @route   POST /api/complaints
// Private (citizen only)
const submitComplaint = async (req, res) => {
  try {
    const { description, category, address, isAIGenerated } = req.body;
    let coordinates;
    try {
      coordinates = JSON.parse(req.body.coordinates);
    } catch (e) {
      return res
        .status(400)
        .json({
          message: "Invalid coordinates format. Send as [longitude, latitude]",
        });
    }

    // check required fields
    if (!description || !category || !coordinates) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // validate coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res
        .status(400)
        .json({ message: "Coordinates must be [longitude, latitude]" });
    }

    // check if photo was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a photo" });
    }

    // check if same issue exists within 50 metres
    const nearbyComplaint = await Complaint.findOne({
      status: { $ne: "fixed" },
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          $maxDistance: 50,
        },
      },
    });

    // if nearby complaint exists then increment raise count
    if (nearbyComplaint) {
      // check if this user already raised this issue
      const alreadyRaised = nearbyComplaint.raisedBy.includes(req.user.id);
      if (alreadyRaised) {
        return res
          .status(400)
          .json({ message: "You have already reported this issue" });
      }

      // add new photo and increment raise count
      nearbyComplaint.photos.push(req.file.path);
      nearbyComplaint.raiseCount += 1;
      nearbyComplaint.raisedBy.push(req.user.id);
      await nearbyComplaint.save();

      return res.status(200).json({
        message: "Issue already reported nearby, raise count updated",
        complaint: nearbyComplaint,
      });
    }

    // no nearby complaint then create new
    const complaint = await Complaint.create({
      reportedBy: req.user.id,
      description,
      category,
      isAIGenerated: isAIGenerated || false,
      location: {
        type: "Point",
        coordinates,
        address: address || null,
      },
      photos: [req.file.path],
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

    // build filter object dynamically
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate("reportedBy", "name email aadhaar.last4")
      .populate("fixedBy", "name email")
      .sort({ raiseCount: -1, createdAt: -1 }) // highest raise count first
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

    // check if already fixed
    if (complaint.status === "fixed") {
      return res
        .status(400)
        .json({ message: "Complaint is already marked as fixed" });
    }

    // after photo is required to mark as fixed
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

    // check if already reported as false by this user
    const alreadyReported = complaint.reportedAsFalse.includes(req.user.id);
    if (alreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this complaint" });
    }

    // add user to reportedAsFalse array
    complaint.reportedAsFalse.push(req.user.id);
    await complaint.save();

    // block the original uploader
    await User.findByIdAndUpdate(complaint.reportedBy, { isBlocked: true });

    res.status(200).json({
      message: "Complaint reported as false, user has been blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/complaints/map
// Private (fixer only)
const getMapData = async (req, res) => {
  try {
    // fetch all open and in-progress complaints for the heatmap
    const complaints = await Complaint.find({
      status: { $ne: "fixed" },
    }).select("location category raiseCount status");
    res.status(200).json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  submitComplaint,
  getAllComplaints,
  getComplaintById,
  markAsFixed,
  markAsInProgress,
  reportAsFalse,
  getMapData,
};

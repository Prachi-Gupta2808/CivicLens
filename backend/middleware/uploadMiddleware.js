const { upload } = require("../config/cloudinary");

// single photo upload
const uploadPhoto = upload.single("photo");

const handleUpload = (req, res, next) => {
  uploadPhoto(req, res, (err) => {
    if (err) {
      console.log("Upload error:", err);
      return res
        .status(400)
        .json({ message: "Photo upload failed", error: err.message });
    }
    next();
  });
};

module.exports = { handleUpload };

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// download image from cloudinary URL to a temp local file
const downloadImage = async (imageUrl) => {
  const tempPath = path.join(__dirname, "../temp_image.jpg");
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  fs.writeFileSync(tempPath, response.data);
  return tempPath;
};

const analyzeImage = async (imageUrl) => {
  let tempPath = null;
  try {
    console.log("Downloading image from Cloudinary:", imageUrl);
    tempPath = await downloadImage(imageUrl);
    console.log("Image downloaded to:", tempPath);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempPath));

    console.log("Sending to ML service...");
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000,
    });

    console.log("ML response:", response.data);

    return {
      success: true,
      label: response.data.label,
      confidence: response.data.confidence,
      description: response.data.description,
    };
  } catch (err) {
    console.log("ML service error:", err.message);
    return {
      success: false,
      label: null,
      confidence: null,
      description: null,
    };
  } finally {
    // always delete temp file after done
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
      console.log("Temp file deleted");
    }
  }
};

module.exports = { analyzeImage };

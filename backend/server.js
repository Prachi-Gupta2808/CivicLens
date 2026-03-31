const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();

//routes here now
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

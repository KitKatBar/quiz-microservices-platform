const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || "User Service";
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    service: SERVICE_NAME,
    status: "healthy",
    timestamp: new Date()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: `Hello from ${SERVICE_NAME}!`
  });
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log(`${SERVICE_NAME} connected to MongoDB`);

    app.listen(PORT, () => {
      console.log(`${SERVICE_NAME} is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
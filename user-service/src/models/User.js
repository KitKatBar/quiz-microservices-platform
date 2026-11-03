const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee"
    },
    department: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({
      message: "Unable to create user",
      error: error.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve users",
      error: error.message
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: "Invalid user ID"
    });
  }
});

module.exports = router;
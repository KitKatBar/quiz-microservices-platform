const express = require("express");

const {
    getMyProfile,
    updateMyProfile,
    getPublicProfile
} = require("../controllers/userController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticateToken, getMyProfile);
router.put("/me", authenticateToken, updateMyProfile);
router.get("/:id/public", getPublicProfile);

module.exports = router;
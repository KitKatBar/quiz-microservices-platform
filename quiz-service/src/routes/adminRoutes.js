const express = require("express");

const {
    approveQuiz,
    rejectQuiz,
    getPendingQuizzes,
    getAdminStatistics
} = require("../controllers/adminController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/pending",
    authenticateToken,
    requireAdmin,
    getPendingQuizzes
);

router.get(
    "/statistics",
    authenticateToken,
    requireAdmin,
    getAdminStatistics
);

router.patch(
    "/:id/approve",
    authenticateToken,
    requireAdmin,
    approveQuiz
);

router.patch(
    "/:id/reject",
    authenticateToken,
    requireAdmin,
    rejectQuiz
);

module.exports = router;
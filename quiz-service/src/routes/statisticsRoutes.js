const express = require("express");

const {
    getQuizStatistics,
    getMyStatistics
} = require("../controllers/statisticsController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/:quizId/statistics",
    authenticateToken,
    getQuizStatistics
);

router.get(
    "/my-statistics",
    authenticateToken,
    getMyStatistics
);

module.exports = router;
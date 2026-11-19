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
    "/my-statistics",
    authenticateToken,
    getMyStatistics
);

router.get(
    "/:quizId/statistics",
    getQuizStatistics
);

module.exports = router;
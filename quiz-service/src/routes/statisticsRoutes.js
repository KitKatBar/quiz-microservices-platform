const express = require("express");

const {
    getQuizStatistics
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

module.exports = router;
const express = require("express");

const {
    submitAttempt,
    getMyAttempts,
    getMyAttemptForQuiz
} = require("../controllers/attemptController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/my-attempts",
    authenticateToken,
    getMyAttempts
);

router.get(
    "/:quizId/my-attempt",
    authenticateToken,
    getMyAttemptForQuiz
);

router.post(
    "/:quizId/attempts",
    authenticateToken,
    submitAttempt
);

module.exports = router;
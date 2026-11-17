const express = require("express");

const {
    createQuiz,
    getApprovedQuizzes,
    getMyQuizzes,
    getQuizById,
    approveQuiz,
    rejectQuiz,
    updateRejectedQuiz
} = require("../controllers/quizController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createQuiz);

router.get("/", getApprovedQuizzes);

router.get(
    "/mine",
    authenticateToken,
    getMyQuizzes
);

router.get(
    "/:id",
    authenticateToken,
    getQuizById
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

router.put(
    "/:id",
    authenticateToken,
    updateRejectedQuiz
);

module.exports = router;
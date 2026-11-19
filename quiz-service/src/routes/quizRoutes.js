const express = require("express");

const {
    createQuiz,
    getApprovedQuizzes,
    getMyQuizzes,
    getQuizById,
    updateRejectedQuiz
} = require("../controllers/quizController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

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

router.put(
    "/:id",
    authenticateToken,
    updateRejectedQuiz
);

module.exports = router;
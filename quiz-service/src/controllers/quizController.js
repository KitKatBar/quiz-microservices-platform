const Quiz = require("../models/Quiz");

async function createQuiz(req, res) {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            creatorId: req.user.userId,
            status: "PENDING"
        });

        return res.status(201).json({
            message: "Quiz submitted for review",
            quiz
        });
    } catch (error) {
        console.error("Create quiz error:", error);

        return res.status(400).json({
            message: "Unable to create quiz",
            error: error.message
        });
    }
}

async function getApprovedQuizzes(req, res) {
    try {
        const quizzes = await Quiz.find({
            status: "APPROVED"
        })
        .select("-questions.correctAnswer")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            quizzes
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve quizzes"
        });
    }
}

async function getMyQuizzes(req, res) {
    try {
        const quizzes = await Quiz.find({
            creatorId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            quizzes
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve your quizzes"
        });
    }
}

async function getQuizById(req, res) {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const isOwner = quiz.creatorId === req.user.userId;
        const isAdmin = req.user.roles?.includes("admin");

        if (
            quiz.status !== "APPROVED" &&
            !isOwner &&
            !isAdmin
        ) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (!isOwner && !isAdmin) {
            quiz.questions.forEach(question => {
                question.correctAnswer = undefined;
            });
        }

        return res.status(200).json({
            quiz
        });
    } catch (error) {
        return res.status(400).json({
            message: "Invalid quiz ID"
        });
    }
}

async function approveQuiz(req, res) {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (quiz.creatorId === req.user.userId) {
            return res.status(403).json({
                message: "Administrators cannot approve their own quizzes"
            });
        }

        if (quiz.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending quizzes can be approved"
            });
        }

        quiz.status = "APPROVED";
        quiz.rejectionReason = null;
        quiz.reviewedBy = req.user.userId;
        quiz.reviewedAt = new Date();

        await quiz.save();

        return res.status(200).json({
            message: "Quiz approved",
            quiz
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to approve quiz"
        });
    }
}

async function rejectQuiz(req, res) {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({
                message: "A rejection reason is required"
            });
        }

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (quiz.creatorId === req.user.userId) {
            return res.status(403).json({
                message: "Administrators cannot reject their own quizzes"
            });
        }

        if (quiz.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending quizzes can be rejected"
            });
        }

        quiz.status = "REJECTED";
        quiz.rejectionReason = rejectionReason.trim();
        quiz.reviewedBy = req.user.userId;
        quiz.reviewedAt = new Date();

        await quiz.save();

        return res.status(200).json({
            message: "Quiz rejected",
            quiz
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to reject quiz"
        });
    }
}

async function updateRejectedQuiz(req, res) {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (quiz.creatorId !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own quizzes"
            });
        }

        if (quiz.status !== "REJECTED") {
            return res.status(400).json({
                message: "Only rejected quizzes can be edited"
            });
        }

        quiz.title = req.body.title;
        quiz.description = req.body.description;
        quiz.category = req.body.category;
        quiz.difficulty = req.body.difficulty;
        quiz.questions = req.body.questions;

        quiz.status = "PENDING";
        quiz.rejectionReason = null;
        quiz.reviewedBy = null;
        quiz.reviewedAt = null;

        await quiz.save();

        return res.status(200).json({
            message: "Quiz updated and resubmitted for review",
            quiz
        });
    } catch (error) {
        return res.status(400).json({
            message: "Unable to update quiz",
            error: error.message
        });
    }
}

module.exports = {
    createQuiz,
    getApprovedQuizzes,
    getMyQuizzes,
    getQuizById,
    approveQuiz,
    rejectQuiz,
    updateRejectedQuiz
};
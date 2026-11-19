const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");

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

        try {
            await promoteQuizCreator(quiz.creatorId);
        } catch (error) {
            console.error("Quiz creator promotion failed:", error);

            return res.status(503).json({
                message:
                "Quiz was not approved because the creator could not be promoted"
            });
        }

        quiz.status = "APPROVED";
        quiz.rejectionReason = null;
        quiz.reviewedBy = req.user.userId;
        quiz.reviewedAt = new Date();

        await quiz.save();

        return res.status(200).json({
            message: "Quiz approved and creator promoted to quiz maker",
            quiz
        });
    } catch (error) {
        console.error("Approve quiz error:", error);

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

async function promoteQuizCreator(creatorId) {
    const response = await fetch(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${creatorId}/quiz-maker`,
        {
            method: "PATCH",
            headers: {
                "X-Internal-Service-Key":
                process.env.INTERNAL_SERVICE_KEY
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to promote quiz creator"
        );
    }

    return result;
}

async function getPendingQuizzes(req, res) {
    try {
        const quizzes = await Quiz.find({
            status: "PENDING"
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error("Get pending quizzes error:", error);

        return res.status(500).json({
            message: "Unable to retrieve pending quizzes"
        });
    }
}

async function getAdminStatistics(req, res) {
    try {
        const [
            totalQuizCount,
            pendingQuizCount,
            approvedQuizCount,
            rejectedQuizCount,
            attemptCount,
            ratingCount,
            commentCount,
            scoreSummary,
            ratingSummary
        ] = await Promise.all([
            Quiz.countDocuments(),

            Quiz.countDocuments({
                status: "PENDING"
            }),

            Quiz.countDocuments({
                status: "APPROVED"
            }),

            Quiz.countDocuments({
                status: "REJECTED"
            }),

            Attempt.countDocuments(),

            Rating.countDocuments(),

            Comment.countDocuments({
                isDeleted: false
            }),

            Attempt.aggregate([
                {
                    $group: {
                        _id: null,
                        averageScore: {
                        $avg: "$percentage"
                        }
                    }
                }
            ]),

            Rating.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: {
                        $avg: "$value"
                        }
                    }
                }
            ])
        ]);

        let userCount = null;

        try {
            const response = await fetch(
                `${process.env.AUTH_SERVICE_URL}/api/auth/internal/statistics`,
                {
                    method: "GET",
                    headers: {
                        "X-Internal-Service-Key":
                        process.env.INTERNAL_SERVICE_KEY
                    }
                }
            );

            if (response.ok) {
                const authStatistics = await response.json();
                userCount = authStatistics.userCount;
            }
        } catch (error) {
        console.error(
            "Unable to retrieve Auth service statistics:",
            error.message
        );
        }

        return res.status(200).json({
            userCount,
            totalQuizCount,
            pendingQuizCount,
            approvedQuizCount,
            rejectedQuizCount,
            attemptCount,
            ratingCount,
            commentCount,
            averageScore: Number(
                (scoreSummary[0]?.averageScore || 0).toFixed(2)
            ),
            averageRating: Number(
                (ratingSummary[0]?.averageRating || 0).toFixed(2)
            )
        });
    } catch (error) {
        console.error("Admin statistics error:", error);

        return res.status(500).json({
            message: "Unable to retrieve admin statistics"
        });
    }
}

module.exports = {
    approveQuiz,
    rejectQuiz,
    promoteQuizCreator,
    getPendingQuizzes,
    getAdminStatistics
};
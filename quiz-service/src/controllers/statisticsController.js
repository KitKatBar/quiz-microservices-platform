const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const Rating = require("../models/Rating");
const Comment = require("../models/Comment");

async function getQuizStatistics(req, res) {
    try {
        const quiz = await Quiz.findById(req.params.quizId).select(
            "_id creatorId status"
        );

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const isOwner = quiz.creatorId === req.user.userId;
        const isAdmin = req.user.roles?.includes("admin");

        if (quiz.status !== "APPROVED" && !isOwner && !isAdmin) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const [attemptCount, ratingSummary, commentCount] =
        await Promise.all([
            Attempt.countDocuments({
                quizId: quiz._id
            }),

            Rating.aggregate([
                {
                    $match: {
                        quizId: quiz._id
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: {
                            $avg: "$value"
                        }
                    }
                }
            ]),

            Comment.countDocuments({
                quizId: quiz._id,
                isDeleted: false
            })
        ]);

        const averageRating = ratingSummary[0]?.averageRating || 0;

        return res.status(200).json({
            attemptCount,
            averageRating: Number(averageRating.toFixed(2)),
            commentCount
        });
    } catch (error) {
        console.error("Quiz statistics error:", error);

        return res.status(500).json({
            message: "Unable to retrieve quiz statistics"
        });
    }
}

module.exports = {
    getQuizStatistics
};
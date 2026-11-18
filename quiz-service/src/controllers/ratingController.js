const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const Rating = require("../models/Rating");

async function validateRatingPermission(req, quizId) {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return {
            error: {
                status: 400,
                message: "Invalid quiz ID"
            }
        };
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || quiz.status !== "APPROVED") {
        return {
            error: {
                status: 404,
                message: "Approved quiz not found"
            }
        };
    }

    const userId = req.user.userId;
    const isAdmin = req.user.roles?.includes("ADMIN");
    const isCreator = quiz.creatorId === userId;

    if (isAdmin) {
        return {
            error: {
                status: 403,
                message: "Administrators cannot rate quizzes"
            }
        };
    }

    if (isCreator) {
        return {
            error: {
                status: 403,
                message: "You cannot rate your own quiz"
            }
        };
    }

    const attempt = await Attempt.findOne({
        quizId: quiz._id,
        userId
    });

    if (!attempt) {
        return {
            error: {
                status: 403,
                message: "You must complete this quiz before rating it"
            }
        };
    }

    return {
        quiz
    };
}

async function createRating(req, res) {
    try {
        const { value } = req.body;
        const { quizId } = req.params;

        if (!Number.isInteger(value) || value < 1 || value > 5) {
            return res.status(400).json({
                message: "Rating must be a whole number from 1 to 5"
            });
        }

        const permission = await validateRatingPermission(req, quizId);

        if (permission.error) {
            return res.status(permission.error.status).json({
                message: permission.error.message
            });
        }

        try {
            const rating = await Rating.create({
                quizId,
                userId: req.user.userId,
                value
            });

            return res.status(201).json({
                message: "Rating submitted",
                rating
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: "You have already rated this quiz"
                });
            }

            throw error;
        }
    } catch (error) {
        console.error("Create rating error:", error);

        return res.status(500).json({
            message: "Unable to create rating"
        });
    }
}

async function updateRating(req, res) {
    try {
        const { value } = req.body;
        const { quizId } = req.params;

        if (!Number.isInteger(value) || value < 1 || value > 5) {
            return res.status(400).json({
                message: "Rating must be a whole number from 1 to 5"
            });
        }

        const permission = await validateRatingPermission(req, quizId);

        if (permission.error) {
            return res.status(permission.error.status).json({
                message: permission.error.message
            });
        }

        const rating = await Rating.findOneAndUpdate(
            {
                quizId,
                userId: req.user.userId
            },
            {
                value
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!rating) {
            return res.status(404).json({
                message: "You have not rated this quiz yet"
            });
        }

        return res.status(200).json({
            message: "Rating updated",
            rating
        });
    } catch (error) {
        console.error("Update rating error:", error);

        return res.status(500).json({
            message: "Unable to update rating"
        });
    }
}

async function deleteRating(req, res) {
    try {
        const { quizId } = req.params;

        const rating = await Rating.findOneAndDelete({
            quizId,
            userId: req.user.userId
        });

        if (!rating) {
            return res.status(404).json({
                message: "Rating not found"
            });
        }

        return res.status(200).json({
            message: "Rating deleted"
        });
    } catch (error) {
        console.error("Delete rating error:", error);

        return res.status(500).json({
            message: "Unable to delete rating"
        });
    }
}

async function getQuizRatings(req, res) {
    try {
        const { quizId } = req.params;

        const quiz = await Quiz.findOne({
            _id: quizId,
            status: "APPROVED"
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Approved quiz not found"
            });
        }

        const ratings = await Rating.find({
            quizId: quiz._id
        })
        .select("userId value createdAt updatedAt")
        .sort({ createdAt: -1 });

        const summary = await Rating.aggregate([
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
                },
                ratingCount: {
                    $sum: 1
                }
            }
        }
        ]);

        return res.status(200).json({
            summary: summary[0] || {
                averageRating: 0,
                ratingCount: 0
            },
            ratings
        });
    } catch (error) {
        console.error("Get ratings error:", error);

        return res.status(500).json({
            message: "Unable to retrieve ratings"
        });
    }
}

module.exports = {
    createRating,
    updateRating,
    deleteRating,
    getQuizRatings
};
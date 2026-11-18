const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const Comment = require("../models/Comment");

async function getQuizAndPermission(req, quizId) {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return {
            error: {
                status: 400,
                message: "Invalid quiz ID"
            }
        };
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
        return {
            error: {
                status: 404,
                message: "Quiz not found"
            }
        };
    }

    const userId = req.user.userId;
    const isAdmin = req.user.roles?.includes("ADMIN");
    const isCreator = quiz.creatorId === userId;

    if (quiz.status !== "APPROVED" && !isAdmin && !isCreator) {
        return {
            error: {
                status: 404,
                message: "Quiz not found"
            }
        };
    }

    if (isAdmin || isCreator) {
        return {
            quiz,
            isAdmin,
            isCreator
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
                message: "You must complete this quiz before commenting"
            }
        };
    }

    return {
        quiz,
        isAdmin,
        isCreator
    };
}

async function createComment(req, res) {
    try {
        const { text } = req.body;
        const { quizId } = req.params;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        const permission = await getQuizAndPermission(req, quizId);

        if (permission.error) {
            return res.status(permission.error.status).json({
                message: permission.error.message
            });
        }

        const comment = await Comment.create({
            quizId,
            userId: req.user.userId,
            text: text.trim()
        });

        return res.status(201).json({
            message: "Comment created",
            comment
        });
    } catch (error) {
        console.error("Create comment error:", error);

        return res.status(500).json({
            message: "Unable to create comment"
        });
    }
}

async function getQuizComments(req, res) {
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

        const comments = await Comment.find({
            quizId: quiz._id,
            isDeleted: false
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            comments
        });
    } catch (error) {
        console.error("Get comments error:", error);

        return res.status(500).json({
            message: "Unable to retrieve comments"
        });
    }
}

async function updateComment(req, res) {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            });
        }

        const comment = await Comment.findOne({
            _id: req.params.commentId,
            isDeleted: false
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.userId !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own comments"
            });
        }

        comment.text = text.trim();

        await comment.save();

        return res.status(200).json({
            message: "Comment updated",
            comment
        });
    } catch (error) {
        console.error("Update comment error:", error);

        return res.status(500).json({
            message: "Unable to update comment"
        });
    }
}

async function deleteComment(req, res) {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            isDeleted: false
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        const isOwner = comment.userId === req.user.userId;
        const isAdmin = req.user.roles?.includes("ADMIN");

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            });
        }

        comment.isDeleted = true;
        comment.deletedBy = req.user.userId;

        await comment.save();

        return res.status(200).json({
            message: "Comment deleted"
        });
    } catch (error) {
        console.error("Delete comment error:", error);

        return res.status(500).json({
            message: "Unable to delete comment"
        });
    }
}

module.exports = {
    createComment,
    getQuizComments,
    updateComment,
    deleteComment
};
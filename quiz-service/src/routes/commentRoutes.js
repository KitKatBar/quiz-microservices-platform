const express = require("express");

const {
    createComment,
    getQuizComments,
    updateComment,
    deleteComment
} = require("../controllers/commentController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/quizzes/:quizId/comments",
    getQuizComments
);

router.post(
    "/quizzes/:quizId/comments",
    authenticateToken,
    createComment
);

router.put(
    "/comments/:commentId",
    authenticateToken,
    updateComment
);

router.delete(
    "/comments/:commentId",
    authenticateToken,
    deleteComment
);

module.exports = router;
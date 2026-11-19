const express = require("express");

const {
    createComment,
    getQuizComments,
    updateComment,
    deleteComment,
    getMyComments
} = require("../controllers/commentController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/:quizId/comments",
    getQuizComments
);

router.post(
    "/:quizId/comments",
    authenticateToken,
    createComment
);

router.put(
    "/:commentId/comments",
    authenticateToken,
    updateComment
);

router.delete(
    "/:commentId/comments",
    authenticateToken,
    deleteComment
);

router.get(
    "/my-comments",
    authenticateToken,
    getMyComments
);

module.exports = router;
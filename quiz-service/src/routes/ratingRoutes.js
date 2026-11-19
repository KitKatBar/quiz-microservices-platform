const express = require("express");

const {
    createRating,
    updateRating,
    deleteRating,
    getQuizRatings,
    getMyRatings
} = require("../controllers/ratingController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/my-ratings",
    authenticateToken,
    getMyRatings
);

router.get(
    "/:quizId/ratings",
    getQuizRatings
);

router.post(
    "/:quizId/ratings",
    authenticateToken,
    createRating
);

router.put(
    "/:quizId/ratings",
    authenticateToken,
    updateRating
);

router.delete(
    "/:quizId/ratings",
    authenticateToken,
    deleteRating
);

module.exports = router;
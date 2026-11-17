const express = require("express");

const {
    register,
    login,
    logout,
    getCurrentUser,
    verifyInternalToken
} = require("../controllers/authController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authenticateInternalService
} = require("../middleware/internalServiceMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);
router.post(
    "/internal/verify",
    authenticateInternalService,
    verifyInternalToken
);

module.exports = router;
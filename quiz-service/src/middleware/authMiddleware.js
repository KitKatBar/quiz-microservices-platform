const jwt = require("jsonwebtoken");

async function authenticateToken(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({
                message: "Authorization header is required"
            });
        }

        const response = await fetch(
            `${process.env.AUTH_SERVICE_URL}/api/auth/internal/verify`,
            {
                method: "POST",
                headers: {
                    Authorization: authorizationHeader,
                    "X-Internal-Service-Key":
                        process.env.INTERNAL_SERVICE_KEY
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.valid) {
            return res.status(401).json({
                message: result.message || "Invalid authentication token"
            });
        }

        req.user = result.user;

        next();
    } catch (error) {
        console.error("Authentication service unavailable:", error);

        return res.status(503).json({
            message: "Authentication service unavailable"
        });
    }
}

module.exports = {
    authenticateToken
};
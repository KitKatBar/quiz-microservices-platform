const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return res.status(401).json({
                message: "Authorization header is required"
            });
        }

        const headerParts = authorizationHeader.trim().split(/\s+/);
        const scheme = headerParts[0];
        const rawToken = headerParts[1];

        if (scheme !== "Bearer" || !rawToken) {
            return res.status(401).json({
                message: "Authorization format must be Bearer <token>"
            });
        }

        const decodedToken = jwt.verify(
            rawToken,
            process.env.JWT_SECRET
        );

        req.user = decodedToken;
        req.token = rawToken;

        next();
    } catch (error) {
        console.error("User service token validation failed:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = {
    authenticateToken
};
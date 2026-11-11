const jwt = require("jsonwebtoken");
const Token = require("../models/Token");

async function authenticateToken(req, res, next) {
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

        if (!decodedToken.jti) {
            return res.status(401).json({
                message: "Token does not contain a token ID. Please log in again."
            });
        }

        const revokedToken = await Token.findOne({
            jti: decodedToken.jti
        });

        if (revokedToken) {
            return res.status(401).json({
                message: "Token has been revoked"
            });
        }

        req.user = decodedToken;
        req.token = rawToken;

        next();
    } catch (error) {
        console.error("Token validation failed:", {
            name: error.name,
            message: error.message
        });

        return res.status(401).json({
            message: "Invalid, expired, or revoked token"
        });
    }
}

module.exports = {
    authenticateToken
};
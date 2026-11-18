const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Account = require("../models/Account");
const Token = require("../models/Token");

function createToken(account) {
    return jwt.sign(
        {
            jti: crypto.randomUUID(),
            userId: account._id.toString(),
            email: account.email,
            roles: account.roles
        },
            process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
}

async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least six characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingAccount = await Account.findOne({
            email: normalizedEmail
        });

        if (existingAccount) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const account = await Account.create({
            email: normalizedEmail,
            passwordHash,
            roles: ["USER"]
        });

        const token = createToken(account);

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: account._id,
                email: account.email,
                roles: account.roles
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Registration failed"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const account = await Account.findOne({
        email: normalizedEmail
        });

        if (!account) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!account.isActive) {
            return res.status(403).json({
                message: "This account is inactive"
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            account.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(account);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: account._id,
                email: account.email,
                roles: account.roles
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed"
        });
    }
}

async function logout(req, res) {
    try {
        const tokenId = req.user.jti;
        const expirationDate = new Date(req.user.exp * 1000);

        await Token.updateOne(
            { jti: tokenId },
            {
                $set: {
                    jti: tokenId,
                    expiresAt: expirationDate
                }
            },
            {
                upsert: true
            }
        );

        return res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed"
        });
    }
}

async function getCurrentUser(req, res) {
    try {
        const account = await Account.findById(req.user.userId).select(
            "-passwordHash"
        );

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        return res.status(200).json({
            user: account
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve account"
        });
    }
}

async function verifyInternalToken(req, res) {
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

        const revokedToken = await Token.findOne({
            jti: decodedToken.jti
        });

        if (revokedToken) {
            return res.status(401).json({
                message: "Token has been revoked"
            });
        }

        return res.status(200).json({
            valid: true,
            user: decodedToken
        });
    } catch (error) {
        return res.status(401).json({
            valid: false,
            message: "Invalid, expired, or revoked token"
        });
    }
}

async function promoteToQuizMaker(req, res) {
    try {
        const account = await Account.findById(req.params.id).select(
            "-passwordHash"
        );

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        if (account.roles.includes("ADMIN")) {
            return res.status(200).json({
                message: "Administrators do not need the QUIZ_MAKER role",
                user: {
                    id: account._id,
                    email: account.email,
                    roles: account.roles
                }
            });
        }

        account.roles = [
            ...new Set([...(account.roles || []), "QUIZ_MAKER"])
        ];

        await account.save();

        return res.status(200).json({
            message: "User promoted to quiz maker",
            user: {
                id: account._id,
                email: account.email,
                roles: account.roles
            }
        });
    } catch (error) {
        console.error("Promote quiz maker error:", error);

        return res.status(500).json({
            message: "Unable to promote user"
        });
    }
}

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    verifyInternalToken,
    promoteToQuizMaker
};
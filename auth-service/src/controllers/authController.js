const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

function createToken(account) {
    return jwt.sign(
        {
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

module.exports = {
    register,
    login,
    getCurrentUser
};
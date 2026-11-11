const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
    {
        jti: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: {
                expireAfterSeconds: 0
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Token", tokenSchema);
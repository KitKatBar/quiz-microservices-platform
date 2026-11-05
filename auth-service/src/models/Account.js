const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        roles: {
            type: [String],
            enum: ["ADMIN", "QUIZ_MAKER", "USER"],
            default: ["USER"]
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Account", accountSchema);
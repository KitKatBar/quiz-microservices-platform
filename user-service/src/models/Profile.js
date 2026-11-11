const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        authUserId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        displayName: {
            type: String,
            required: true,
            trim: true
        },
        bio: {
            type: String,
            default: "",
            maxlength: 500
        },
        avatarUrl: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Profile", profileSchema);
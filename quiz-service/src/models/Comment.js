const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        userId: {
            type: String,
            required: true,
            index: true
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedBy: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Comment", commentSchema);
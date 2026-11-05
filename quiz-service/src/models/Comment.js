const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        userId: {
            type: String,
            required: true
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
        }
    },
    {
        timestamps: true
  }
);

module.exports = mongoose.model("Comment", commentSchema);
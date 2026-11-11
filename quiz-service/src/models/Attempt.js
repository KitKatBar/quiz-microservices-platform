const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
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
        answers: [
            {
                questionId: mongoose.Schema.Types.ObjectId,
                selectedAnswer: String,
                isCorrect: Boolean
            }
        ],
        score: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
  }
);

attemptSchema.index(
    {
        quizId: 1,
        userId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        selectedAnswer: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    },
    {
        _id: false
    }
);

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
        answers: {
            type: [answerSchema],
            required: true
        },
        score: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        percentage: {
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
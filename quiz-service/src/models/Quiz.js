const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    choices: {
        type: [String],
        required: true,
        validate: {
            validator: choices => choices.length === 4,
            message: "Each question must contain exactly four choices!"
        }
    },
    correctAnswer: {
        type: String,
        required: true
    }
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            default: ""
        },
        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            default: "MEDIUM"
        },
        creatorId: {
            type: String,
            required: true,
            index: true
        },
        questions: {
            type: [questionSchema],
            required: true,
            validate: {
                validator: questions => questions.length === 10,
                message: "A quiz must contain exactly 10 questions!"
            }
        },
        status: {
            type: String,
            enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
            default: "DRAFT"
        },
        rejectionReason: {
            type: String,
            default: null
        },
        reviewedBy: {
            type: String,
            default: null
        },
        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: options => options.length >= 2,
                message: "A question must have at least two options"
            }
        },
        correctAnswer: {
            type: String,
            required: true
        }
    },
    {
        _id: true
    }
);

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
            required: true,
            trim: true
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
                validator: questions => questions.length > 0,
                message: "A quiz must contain at least one question"
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
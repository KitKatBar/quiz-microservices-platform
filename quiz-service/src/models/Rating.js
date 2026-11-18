const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
        value: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number 1-5"
            }
        }
    },
    {
        timestamps: true
    }
);

ratingSchema.index(
    {
        quizId: 1,
        userId: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Rating", ratingSchema);
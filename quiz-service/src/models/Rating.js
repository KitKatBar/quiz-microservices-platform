const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
        value: {
            type: Number,
            required: true,
            min: 1,
            max: 5
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
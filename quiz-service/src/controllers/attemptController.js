const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

async function submitAttempt(req, res) {
    try {
        const { answers } = req.body;
        const { quizId } = req.params;
        const userId = req.user.userId;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                message: "Answers must be an array"
            });
        }

        const quiz = await Quiz.findOne({
            _id: quizId,
            status: "APPROVED"
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Approved quiz not found"
            });
        }

        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({
                message: `Exactly ${quiz.questions.length} answers are required`
            });
        }

        const existingAttempt = await Attempt.findOne({
            quizId,
            userId
        });

        if (existingAttempt) {
            return res.status(409).json({
                message: "You have already taken this quiz"
            });
        }

        const submittedQuestionIds = new Set(
            answers.map(answer => answer.questionId.toString())
        );

        if (submittedQuestionIds.size !== quiz.questions.length) {
            return res.status(400).json({
                message: "Each question must be answered exactly once"
            });
        }

        let score = 0;
        const evaluatedAnswers = [];

        for (const question of quiz.questions) {
            const submittedAnswer = answers.find(
                answer =>
                answer.questionId.toString() ===
                question._id.toString()
            );

            if (!submittedAnswer) {
                return res.status(400).json({
                message: "An answer is missing"
                });
            }

            if (!question.choices.includes(submittedAnswer.selectedAnswer)) {
                return res.status(400).json({
                message: "An answer is not one of the available choices"
                });
            }

            const isCorrect =
                submittedAnswer.selectedAnswer === question.correctAnswer;

            if (isCorrect) {
                score += 1;
            }

            evaluatedAnswers.push({
                questionId: question._id,
                selectedAnswer: submittedAnswer.selectedAnswer,
                isCorrect
            });
        }

        const totalQuestions = quiz.questions.length;
        const percentage = (score / totalQuestions) * 100;

        const attempt = await Attempt.create({
            quizId,
            userId,
            answers: evaluatedAnswers,
            score,
            totalQuestions,
            percentage
        });

        return res.status(201).json({
            message: "Quiz submitted successfully",
            result: {
                attemptId: attempt._id,
                score,
                totalQuestions,
                percentage
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already taken this quiz"
            });
        }

        console.error("Submit attempt error:", error);

        return res.status(500).json({
            message: "Unable to submit quiz attempt"
        });
    }
}

async function getMyAttempts(req, res) {
    try {
        const attempts = await Attempt.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            attempts
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve attempts"
        });
    }
}

async function getMyAttemptForQuiz(req, res) {
    try {
        const attempt = await Attempt.findOne({
            quizId: req.params.quizId,
            userId: req.user.userId
        });

        if (!attempt) {
            return res.status(404).json({
                message: "You have not taken this quiz"
            });
        }

        return res.status(200).json({
            attempt
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve attempt"
        });
    }
}

module.exports = {
    submitAttempt,
    getMyAttempts,
    getMyAttemptForQuiz
};
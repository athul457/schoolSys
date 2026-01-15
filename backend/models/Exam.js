const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  fullMarks: {
    type: Number,
    required: true,
  },
  passMarks: {
    type: Number,
    required: true,
  },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 strings
    correctAnswer: { type: String, required: true } // The correct option string
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;

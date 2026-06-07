const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['technical', 'hr', 'behavioral'], default: 'technical' },
  userAnswer: { type: String, default: '' },
  evaluation: {
    score: { type: Number, min: 0, max: 100 },
    technicalAccuracy: { type: Number, min: 0, max: 10 },
    communication: { type: Number, min: 0, max: 10 },
    confidence: { type: Number, min: 0, max: 10 },
    clarity: { type: Number, min: 0, max: 10 },
    problemSolving: { type: Number, min: 0, max: 10 },
    strengths: [String],
    weaknesses: [String],
    idealAnswer: { type: String },
    improvementTips: [String]
  },
  answered: { type: Boolean, default: false }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior'],
    default: 'fresher'
  },
  questions: [questionSchema],
  overallScore: { type: Number, min: 0, max: 100, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  answeredQuestions: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  duration: { type: Number, default: 0 },
  feedback: {
    strongTopics: [String],
    weakTopics: [String],
    overallFeedback: { type: String },
    recommendations: [String]
  },
  completedAt: { type: Date }
}, {
  timestamps: true
});

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Interview', interviewSchema);

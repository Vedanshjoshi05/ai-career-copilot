const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  extractedText: { type: String },
  analysis: {
    overallScore: { type: Number, min: 0, max: 100 },
    atsScore: { type: Number, min: 0, max: 100 },
    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    grammarIssues: [String],
    formattingIssues: [String],
    technicalSkills: [String],
    softSkills: [String],
    improvementSuggestions: [String],
    recruiterFeedback: { type: String }
  },
  targetRole: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);

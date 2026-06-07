const mongoose = require('mongoose');

// Career Roadmap Model
const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  roadmap: [{
    month: { type: Number },
    title: { type: String },
    topics: [String],
    resources: [String],
    milestones: [String],
    completed: { type: Boolean, default: false }
  }],
  estimatedDuration: { type: String },
  difficulty: { type: String },
  prerequisites: [String]
}, { timestamps: true });

// Skill Analysis Model
const skillAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  currentSkills: [String],
  requiredSkills: [String],
  missingSkills: [String],
  matchingSkills: [String],
  readinessScore: { type: Number, min: 0, max: 100 },
  priorityLearningPath: [String],
  estimatedTimeToReady: { type: String },
  recommendations: [String]
}, { timestamps: true });

// Job Match Model
const jobMatchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobDescription: { type: String, required: true },
  jobTitle: { type: String },
  company: { type: String },
  atsMatchScore: { type: Number, min: 0, max: 100 },
  missingKeywords: [String],
  matchingKeywords: [String],
  resumeImprovements: [String],
  suggestedBulletPoints: [String],
  tailoredSuggestions: { type: String },
  overallFeedback: { type: String }
}, { timestamps: true });

// Activity Log Model
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

module.exports = {
  CareerRoadmap: mongoose.model('CareerRoadmap', roadmapSchema),
  SkillAnalysis: mongoose.model('SkillAnalysis', skillAnalysisSchema),
  JobMatch: mongoose.model('JobMatch', jobMatchSchema),
  ActivityLog: mongoose.model('ActivityLog', activityLogSchema)
};

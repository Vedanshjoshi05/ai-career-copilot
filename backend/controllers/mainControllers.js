const aiService = require('../services/aiService');
const { SkillAnalysis, CareerRoadmap } = require('../models/index');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const User = require('../models/User');

// ============ SKILL CONTROLLER ============
const analyzeSkills = async (req, res) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole) return res.status(400).json({ success: false, message: 'Target role is required' });

    let skills = currentSkills;
    if (!skills || skills.length === 0) {
      const latestResume = await Resume.findOne({ user: req.user._id, status: 'completed' }).sort({ createdAt: -1 });
      skills = latestResume?.analysis?.technicalSkills || [];
    }

    const analysis = await aiService.analyzeSkillGap(skills, targetRole);

    const saved = await SkillAnalysis.create({
      user: req.user._id,
      targetRole,
      currentSkills: skills,
      ...analysis
    });

    res.json({ success: true, message: 'Skill gap analyzed', skillAnalysis: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSkillAnalyses = async (req, res) => {
  try {
    const analyses = await SkillAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ROADMAP CONTROLLER ============
const generateRoadmap = async (req, res) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) return res.status(400).json({ success: false, message: 'Target role is required' });

    const roadmapData = await aiService.generateRoadmap(targetRole);

    const roadmap = await CareerRoadmap.create({
      user: req.user._id,
      targetRole,
      ...roadmapData
    });

    res.json({ success: true, message: 'Roadmap generated', roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRoadmapProgress = async (req, res) => {
  try {
    const { monthIndex, completed } = req.body;
    const roadmap = await CareerRoadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });

    if (roadmap.roadmap[monthIndex] !== undefined) {
      roadmap.roadmap[monthIndex].completed = completed;
      await roadmap.save();
    }
    res.json({ success: true, message: 'Progress updated', roadmap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ PROJECT CONTROLLER ============
const getProjectRecommendations = async (req, res) => {
  try {
    const { targetRole } = req.body;
    const latestResume = await Resume.findOne({ user: req.user._id, status: 'completed' }).sort({ createdAt: -1 });
    const skills = latestResume?.analysis?.technicalSkills || ['JavaScript', 'React'];
    const role = targetRole || req.user.targetRole || 'Full Stack Developer';

    const result = await aiService.recommendProjects(skills, role);
    res.json({ success: true, projects: result.projects, userSkills: skills, targetRole: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ DASHBOARD CONTROLLER ============
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [resumes, interviews, skillAnalyses, roadmaps] = await Promise.all([
      Resume.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('-extractedText'),
      Interview.find({ user: userId, status: 'completed' }).sort({ createdAt: -1 }).limit(5),
      SkillAnalysis.find({ user: userId }).sort({ createdAt: -1 }).limit(1),
      CareerRoadmap.find({ user: userId }).sort({ createdAt: -1 }).limit(1)
    ]);

    const totalResumes = await Resume.countDocuments({ user: userId });
    const totalInterviews = await Interview.countDocuments({ user: userId, status: 'completed' });
    const avgScore = interviews.length > 0
      ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / interviews.length)
      : 0;
    const latestAtsScore = resumes[0]?.analysis?.atsScore || 0;

    res.json({
      success: true,
      dashboard: {
        stats: { totalResumes, totalInterviews, avgInterviewScore: avgScore, latestAtsScore },
        recentResumes: resumes,
        recentInterviews: interviews,
        latestSkillAnalysis: skillAnalyses[0] || null,
        activeRoadmap: roadmaps[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN CONTROLLER ============
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalResumes, totalInterviews] = await Promise.all([
      User.countDocuments(),
      Resume.countDocuments(),
      Interview.countDocuments({ status: 'completed' })
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const popularRoles = await Interview.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalResumes, totalInterviews, popularRoles, recentUsers }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeSkills, getSkillAnalyses,
  generateRoadmap, getRoadmaps, updateRoadmapProgress,
  getProjectRecommendations,
  getDashboard,
  getAdminStats, getAllUsers
};

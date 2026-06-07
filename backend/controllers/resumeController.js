const fs = require('fs');
const pdf = require('pdf-parse');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// @desc Upload and analyze resume
// @route POST /api/v1/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { targetRole } = req.body;
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please ensure the PDF is not image-only.' });
    }

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      extractedText,
      targetRole: targetRole || req.user.targetRole,
      status: 'analyzing'
    });

    // Analyze with AI
    const analysis = await aiService.analyzeResume(extractedText, targetRole || req.user.targetRole);

    resume.analysis = analysis;
    resume.status = 'completed';
    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      resume
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all resumes for user
// @route GET /api/v1/resume
const getResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ user: req.user._id })
        .select('-extractedText')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Resume.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      resumes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single resume
// @route GET /api/v1/resume/:id
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete resume
// @route DELETE /api/v1/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Tailor resume to job description
// @route POST /api/v1/resume/tailor
const tailorResume = async (req, res) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' });
    }

    let resumeText = '';
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
      resumeText = resume.extractedText;
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ success: false, message: 'Resume ID or text is required' });
    }

    const result = await aiService.tailorResume(resumeText, jobDescription);

    const { JobMatch } = require('../models/index');
    const jobMatch = await JobMatch.create({
      user: req.user._id,
      resume: resumeId,
      jobDescription,
      jobTitle,
      company,
      ...result
    });

    res.json({ success: true, message: 'Resume tailored successfully', jobMatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume, getResumes, getResume, deleteResume, tailorResume };

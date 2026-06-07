const Interview = require('../models/Interview');
const aiService = require('../services/aiService');

// @desc Start new interview
// @route POST /api/v1/interview/start
const startInterview = async (req, res) => {
  try {
    const { role, difficulty, experienceLevel, questionCount } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const count = Math.min(parseInt(questionCount) || 5, 10);
    const result = await aiService.generateInterviewQuestions(
      role, difficulty || 'medium', experienceLevel || req.user.experienceLevel, count
    );

    const questions = result.questions.map(q => ({
      question: q.question,
      type: q.type || 'technical',
      answered: false
    }));

    const interview = await Interview.create({
      user: req.user._id,
      role,
      difficulty: difficulty || 'medium',
      experienceLevel: experienceLevel || req.user.experienceLevel,
      questions,
      totalQuestions: questions.length,
      status: 'in-progress'
    });

    res.status(201).json({
      success: true,
      message: 'Interview started',
      interview: {
        _id: interview._id,
        role: interview.role,
        difficulty: interview.difficulty,
        questions: interview.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type
        })),
        totalQuestions: interview.totalQuestions,
        status: interview.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit answer for evaluation
// @route POST /api/v1/interview/:id/answer
const submitAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Interview is already completed' });
    }

    const questionIndex = interview.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const question = interview.questions[questionIndex];
    const evaluation = await aiService.evaluateAnswer(question.question, answer, interview.role);

    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].evaluation = evaluation;
    interview.questions[questionIndex].answered = true;
    interview.answeredQuestions = interview.questions.filter(q => q.answered).length;

    await interview.save();

    res.json({
      success: true,
      message: 'Answer evaluated',
      evaluation,
      answeredQuestions: interview.answeredQuestions,
      totalQuestions: interview.totalQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Complete interview and get final report
// @route POST /api/v1/interview/:id/complete
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const answeredQuestions = interview.questions.filter(q => q.answered && q.evaluation);
    const avgScore = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, q) => sum + (q.evaluation.score || 0), 0) / answeredQuestions.length)
      : 0;

    const allStrengths = answeredQuestions.flatMap(q => q.evaluation.strengths || []);
    const allWeaknesses = answeredQuestions.flatMap(q => q.evaluation.weaknesses || []);

    interview.overallScore = avgScore;
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.answeredQuestions = answeredQuestions.length;
    interview.feedback = {
      strongTopics: [...new Set(allStrengths)].slice(0, 5),
      weakTopics: [...new Set(allWeaknesses)].slice(0, 5),
      overallFeedback: `Completed ${answeredQuestions.length} questions with an average score of ${avgScore}%.`,
      recommendations: allWeaknesses.slice(0, 3).map(w => `Improve: ${w}`)
    };

    await interview.save();
    res.json({ success: true, message: 'Interview completed', interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all interviews
// @route GET /api/v1/interview
const getInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      Interview.find({ user: req.user._id })
        .select('-questions.evaluation.idealAnswer')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments({ user: req.user._id })
    ]);

    res.json({
      success: true,
      interviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single interview
// @route GET /api/v1/interview/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get analytics
// @route GET /api/v1/interview/analytics
const getAnalytics = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id, status: 'completed' });

    if (interviews.length === 0) {
      return res.json({ success: true, analytics: null, message: 'No completed interviews yet' });
    }

    const scores = interviews.map(i => i.overallScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);

    const roleCounts = {};
    interviews.forEach(i => { roleCounts[i.role] = (roleCounts[i.role] || 0) + 1; });

    const trendData = interviews
      .slice(-10)
      .map(i => ({ date: i.completedAt, score: i.overallScore, role: i.role }));

    res.json({
      success: true,
      analytics: {
        totalInterviews: interviews.length,
        averageScore: avgScore,
        bestScore,
        roleCounts,
        trendData,
        recentInterviews: interviews.slice(0, 5).map(i => ({
          _id: i._id,
          role: i.role,
          score: i.overallScore,
          date: i.completedAt,
          difficulty: i.difficulty
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { startInterview, submitAnswer, completeInterview, getInterviews, getInterview, getAnalytics };

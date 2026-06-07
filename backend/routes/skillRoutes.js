// routes/skillRoutes.js
const express = require('express');
const skillRouter = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { analyzeSkills, getSkillAnalyses } = require('../controllers/mainControllers');
skillRouter.use(protect);
skillRouter.post('/analyze', analyzeSkills);
skillRouter.get('/', getSkillAnalyses);
module.exports = skillRouter;

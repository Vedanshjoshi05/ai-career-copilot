// projectRoutes.js
const express = require('express');
const projectRouter = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getProjectRecommendations } = require('../controllers/mainControllers');
projectRouter.use(protect);
projectRouter.post('/recommend', getProjectRecommendations);
module.exports = projectRouter;

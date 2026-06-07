const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { startInterview, submitAnswer, completeInterview, getInterviews, getInterview, getAnalytics } = require('../controllers/interviewController');

router.use(protect);
router.post('/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.get('/analytics', getAnalytics);
router.get('/', getInterviews);
router.get('/:id', getInterview);

module.exports = router;

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }
  next();
};

const interviewValidation = [
  body('role').notEmpty().withMessage('Role is required').trim(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('experienceLevel').optional().isIn(['fresher', 'junior', 'mid', 'senior']).withMessage('Invalid experience level'),
  body('questionCount').optional().isInt({ min: 1, max: 10 }).withMessage('Question count must be between 1 and 10'),
  handleValidationErrors
];

const skillValidation = [
  body('targetRole').notEmpty().withMessage('Target role is required').trim(),
  handleValidationErrors
];

const roadmapValidation = [
  body('targetRole').notEmpty().withMessage('Target role is required').trim(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  interviewValidation,
  skillValidation,
  roadmapValidation
};

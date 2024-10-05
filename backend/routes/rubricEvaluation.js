const express = require('express');
const rubricEvaluationController = require('../controllers/rubricEvaluationController');

const router = express.Router();

router.post('/run', rubricEvaluationController.evaluateWithRubric);

module.exports = router;
const express = require('express');
const customerServiceRoutes = require('./customerService');
const evaluationRoutes = require('./evaluation');
const rubricEvaluationRoutes = require('./rubricEvaluation');

const router = express.Router();

router.use('/', customerServiceRoutes);
router.use('/evaluation', evaluationRoutes);
router.use('/rubric-evaluation', rubricEvaluationRoutes);

module.exports = router;
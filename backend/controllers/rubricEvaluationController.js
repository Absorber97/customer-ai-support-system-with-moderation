const { runRubricEvaluation } = require('../services/rubricEvaluationService');
const logger = require('../utils/logger');

exports.evaluateWithRubric = async (req, res) => {
  logger.info('Received rubric evaluation request');
  try {
    const { testCases } = req.body;
    logger.info(`Received ${testCases.length} test cases for rubric evaluation`);
    if (!testCases || !Array.isArray(testCases)) {
      logger.error('Invalid or missing testCases for rubric evaluation');
      return res.status(400).json({ error: 'Invalid or missing testCases' });
    }
    const evaluationResults = await runRubricEvaluation(testCases);
    logger.info('Rubric evaluation completed successfully');
    res.json(evaluationResults);
  } catch (error) {
    logger.error('Error in evaluateWithRubric:', error);
    res.status(500).json({ error: 'Internal server error during rubric evaluation' });
  }
};
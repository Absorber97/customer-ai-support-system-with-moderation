const { runEvaluation } = require('../services/evaluationService');
const logger = require('../utils/logger');

exports.evaluateResponses = async (req, res) => {
  logger.info('Received evaluation request');
  try {
    const { testCases } = req.body;
    logger.info(`Received ${testCases.length} test cases`);
    if (!testCases || !Array.isArray(testCases)) {
      logger.error('Invalid or missing testCases');
      return res.status(400).json({ error: 'Invalid or missing testCases' });
    }
    const evaluationResults = await runEvaluation(testCases);
    logger.info('Evaluation completed successfully');
    res.json(evaluationResults);
  } catch (error) {
    logger.error('Error in evaluateResponses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
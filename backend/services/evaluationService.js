const { getCompletion } = require('./openaiService');
const logger = require('../utils/logger');

async function evaluateAnswer(customerMsg, idealAnswer, generatedAnswer) {
  const prompt = `
You are an AI assistant tasked with evaluating customer service responses. Please compare the generated answer to the ideal answer for the given customer message. Evaluate based on the following criteria:

1. Accuracy: Does the generated answer provide correct information? (0-10)
2. Completeness: Does it address all aspects of the customer's query? (0-10)
3. Clarity: Is the answer easy to understand? (0-10)
4. Tone: Is the tone appropriate for customer service? (0-10)
5. Conciseness: Is the answer appropriately brief without omitting important information? (0-10)
6. Helpfulness: Does the answer provide useful information or guidance to the customer? (0-10)

Customer Message: ${customerMsg}

Ideal Answer: ${idealAnswer}

Generated Answer: ${generatedAnswer}

Please provide a score for each criterion (0-10) and an overall score (0-10). Also, provide a brief explanation for each score and suggestions for improvement.

Output your evaluation in the following format:
Accuracy: [Score]
Accuracy Explanation: [Explanation]
Completeness: [Score]
Completeness Explanation: [Explanation]
Clarity: [Score]
Clarity Explanation: [Explanation]
Tone: [Score]
Tone Explanation: [Explanation]
Conciseness: [Score]
Conciseness Explanation: [Explanation]
Helpfulness: [Score]
Helpfulness Explanation: [Explanation]
Overall Score: [Score]
Overall Explanation: [Explanation]
Suggestions for Improvement: [Suggestions]
`;

  try {
    const response = await getCompletion([{ role: 'user', content: prompt }]);
    return parseEvaluationResponse(response);
  } catch (error) {
    logger.error(`Error in evaluateAnswer: ${error.message}`);
    throw error;
  }
}

function parseEvaluationResponse(response) {
  const lines = response.split('\n');
  const result = {};
  let currentKey = '';

  for (const line of lines) {
    const [key, value] = line.split(':').map(s => s.trim());
    if (value === undefined) {
      if (currentKey) result[currentKey] += ' ' + key;
    } else {
      currentKey = key.toLowerCase().replace(/ /g, '_');
      result[currentKey] = value;
    }
  }

  return result;
}

async function runEvaluation(testCases) {
  const results = [];
  for (const testCase of testCases) {
    const { customerMsg, idealAnswer, generatedAnswer } = testCase;
    const evaluation = await evaluateAnswer(customerMsg, idealAnswer, generatedAnswer);
    results.push({
      customerMsg,
      idealAnswer,
      generatedAnswer,
      evaluation
    });
  }
  return results;
}

module.exports = {
  runEvaluation
};
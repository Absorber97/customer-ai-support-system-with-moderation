const { getCompletion } = require('./openaiService');
const logger = require('../utils/logger');

async function checkOutputFactuality(query, productDetails, response) {
  const prompt = `
You are an AI assistant tasked with evaluating the factual accuracy of a customer service response. 
Please analyze the following:

Customer Query: ${query}

Product Information:
${JSON.stringify(productDetails, null, 2)}

Customer Service Response: ${response}

Please evaluate:
1. Does the response use the product information correctly?
2. Does the response sufficiently answer the customer's query?
3. Are there any factual errors or inconsistencies in the response?

Provide your evaluation and explain your reasoning. Then, give a final verdict of either "FACTUAL" or "NOT FACTUAL".
`;

  try {
    const evaluationResult = await getCompletion([{ role: 'user', content: prompt }]);
    const verdict = evaluationResult.includes("FACTUAL") ? "FACTUAL" : "NOT FACTUAL";
    return {
      evaluation: evaluationResult,
      verdict: verdict
    };
  } catch (error) {
    logger.error('Error in output factuality check:', error);
    throw error;
  }
}

module.exports = {
  checkOutputFactuality
};
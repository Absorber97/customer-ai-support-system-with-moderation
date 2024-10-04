const { getCompletion } = require('./openaiService');
const logger = require('../utils/logger');

async function generateChainOfThoughtAnswer(query, productDetails, language) {
  const prompt = `
You are a customer service representative for an electronics store. Use Chain of Thought reasoning to answer the following customer query about this product:

Product Details:
${JSON.stringify(productDetails, null, 2)}

Customer Query: ${query}

Please follow these steps and provide your thoughts for each:
1. Understand the query: Identify the main points and concerns in the customer's question.
2. Analyze the product: Review the product details and identify relevant features or specifications.
3. Consider potential solutions: Think about possible answers or solutions to address the customer's concerns.
4. Evaluate options: Weigh the pros and cons of different approaches to answering the query.
5. Formulate a response: Craft a clear, concise, and helpful answer based on your reasoning.

For each step, start your response with "Step X:" where X is the step number.
After completing all steps, provide a final answer starting with "Final Answer:".

Respond in ${language}.
`;

  try {
    const response = await getCompletion([{ role: 'user', content: prompt }]);
    const parts = response.split(/Step \d+:|Final Answer:/i).filter(Boolean);
    
    return {
      steps: parts.slice(0, 5).map(step => step.trim()),
      finalAnswer: parts[5].trim()
    };
  } catch (error) {
    logger.error('Error in Chain of Thought reasoning:', error);
    throw error;
  }
}

module.exports = {
  generateChainOfThoughtAnswer
};
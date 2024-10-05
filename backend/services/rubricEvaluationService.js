const { getCompletion } = require('./openaiService');
const logger = require('../utils/logger');

async function runRubricEvaluation(testCases) {
  const results = [];
  for (const testCase of testCases) {
    const { customerMsg, idealAnswer, generatedAnswer, context } = testCase;
    try {
      const evaluation = await evaluateWithRubric(customerMsg, context || "No context provided", generatedAnswer);
      const idealComparison = await evaluateVsIdeal(customerMsg, idealAnswer, generatedAnswer);
      results.push({
        customerMsg,
        idealAnswer,
        generatedAnswer,
        context: context || "No context provided",
        evaluation,
        idealComparison
      });
    } catch (error) {
      logger.error(`Error evaluating test case: ${error.message}`);
      results.push({
        customerMsg,
        idealAnswer,
        generatedAnswer,
        context: context || "No context provided",
        evaluation: { error: error.message },
        idealComparison: { error: error.message }
      });
    }
  }
  return results;
}

async function evaluateWithRubric(customerMsg, context, generatedAnswer) {
  const prompt = `
Evaluate the following customer service response based on this rubric:

1. Is the answer based on the given context? (Y/N)
2. Does the answer include information not present in the context? (Y/N)
3. Is there any disagreement between the answer and the context? (Y/N)
4. How many distinct points or questions does the customer query contain?
5. How many of these points or questions does the answer address?

Customer Query: ${customerMsg}

Context: ${context}

Generated Answer: ${generatedAnswer}

Provide your evaluation in the following format:
1. Based on context: [Y/N]
2. Includes extra info: [Y/N]
3. Disagreement with context: [Y/N]
4. Points in query: [number]
5. Points addressed: [number]

Also, provide a brief explanation for each point and an overall summary.
`;

  try {
    const response = await getCompletion([{ role: 'user', content: prompt }]);
    return parseRubricEvaluation(response);
  } catch (error) {
    logger.error(`Error in evaluateWithRubric: ${error.message}`);
    throw error;
  }
}

function parseRubricEvaluation(response) {
  const lines = response.split('\n');
  const results = {
    basedOnContext: '',
    includesExtraInfo: '',
    hasDisagreement: '',
    questionsAsked: 0,
    questionsAddressed: 0,
    explanations: [],
    summary: ''
  };

  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('1. Based on context:')) {
      results.basedOnContext = line.split(':')[1].trim();
    } else if (line.startsWith('2. Includes extra info:')) {
      results.includesExtraInfo = line.split(':')[1].trim();
    } else if (line.startsWith('3. Disagreement with context:')) {
      results.hasDisagreement = line.split(':')[1].trim();
    } else if (line.startsWith('4. Points in query:')) {
      results.questionsAsked = parseInt(line.split(':')[1].trim());
    } else if (line.startsWith('5. Points addressed:')) {
      results.questionsAddressed = parseInt(line.split(':')[1].trim());
    } else if (line.startsWith('Explanation for')) {
      currentSection = 'explanation';
      results.explanations.push(line);
    } else if (line.startsWith('Overall summary:')) {
      currentSection = 'summary';
      results.summary = line.replace('Overall summary:', '').trim();
    } else if (currentSection === 'explanation') {
      results.explanations[results.explanations.length - 1] += ' ' + line.trim();
    } else if (currentSection === 'summary') {
      results.summary += ' ' + line.trim();
    }
  }

  return {
    rubricScore: calculateRubricScore(results),
    rubricExplanation: results.summary,
    detailedResults: results
  };
}

function calculateRubricScore(results) {
  let score = 0;
  if (results.basedOnContext === 'Y') score += 2;
  if (results.includesExtraInfo === 'N') score += 2;
  if (results.hasDisagreement === 'N') score += 2;
  if (results.questionsAsked > 0) {
    const percentageAnswered = results.questionsAddressed / results.questionsAsked;
    score += percentageAnswered * 4;
  }
  return Math.round(score * 10) / 10; // Round to one decimal place
}

async function evaluateVsIdeal(customerMsg, idealAnswer, generatedAnswer) {
  const prompt = `
You are an assistant that evaluates how well the customer service agent answers a user question by comparing the response to the ideal (expert) response.
Output a single letter and nothing else.

You are comparing a submitted answer to an expert answer on a given question. Here is the data:

[BEGIN DATA]
************
[Question]: ${customerMsg}
************
[Expert]: ${idealAnswer}
************
[Submission]: ${generatedAnswer}
************
[END DATA]

Compare the factual content of the submitted answer with the expert answer. 

Ignore any differences in style, grammar, or punctuation.
The submitted answer may either be a subset or superset of the expert answer, or it may conflict with it. 
Determine which case applies. Answer the question by selecting one of the following options:
(A) The submitted answer is a subset of the expert answer and is fully consistent with it.
(B) The submitted answer is a superset of the expert answer and is fully consistent with it.
(C) The submitted answer contains all the same details as the expert answer.
(D) There is a disagreement between the submitted answer and the expert answer.
(E) The answers differ, but these differences don't matter from the perspective of factuality.
`;

  try {
    const response = await getCompletion([{ role: 'user', content: prompt }]);
    return response.trim();
  } catch (error) {
    logger.error(`Error in evaluateVsIdeal: ${error.message}`);
    throw error;
  }
}

module.exports = {
  runRubricEvaluation,
  evaluateVsIdeal // Export for testing purposes
};
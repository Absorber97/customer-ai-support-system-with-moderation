const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

async function moderateContent(content) {
  try {
    console.log('Sending moderation request for content:', content);
    const response = await openai.createModeration({
      input: content,
    });
    console.log('Moderation API response:', JSON.stringify(response.data, null, 2));
    return response.data.results[0];
  } catch (error) {
    console.error('Moderation API Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

function isFlagged(moderationResult) {
  console.log('Checking if content is flagged:', moderationResult);
  
  // Check if any category is flagged
  const isCategoryFlagged = Object.values(moderationResult.categories).some(value => value === true);
  
  // Check if the overall score is above a certain threshold (e.g., 0.5)
  const isScoreHigh = moderationResult.category_scores.sexual >= 0.5 ||
                      moderationResult.category_scores.hate >= 0.5 ||
                      moderationResult.category_scores.violence >= 0.5 ||
                      moderationResult.category_scores.self_harm >= 0.5 ||
                      moderationResult.category_scores.sexual_minors >= 0.5 ||
                      moderationResult.category_scores.hate_threatening >= 0.5 ||
                      moderationResult.category_scores.violence_graphic >= 0.5;

  const result = moderationResult.flagged || isCategoryFlagged || isScoreHigh;
  console.log('Content flagged:', result);
  return result;
}

module.exports = {
  moderateContent,
  isFlagged
};
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

module.exports = {
  moderateContent
};
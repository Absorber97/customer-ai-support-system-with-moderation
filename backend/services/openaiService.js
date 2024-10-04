const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');
const logger = require('../utils/logger');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(prompt, model = "gpt-3.5-turbo", temperature = 0) {
  try {
    logger.info('Sending request to OpenAI API', { prompt, model, temperature });
    const response = await openai.createChatCompletion({
      model: model,
      messages: [{"role": "user", "content": prompt}],
      temperature: temperature,
    });
    logger.info('OpenAI API Response received');
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    logger.error('OpenAI API Error', { error: error.message });
    throw error;
  }
}

module.exports = {
  getCompletion
};
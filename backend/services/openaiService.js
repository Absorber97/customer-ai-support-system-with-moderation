const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');
const logger = require('../utils/logger');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(messages, model = "gpt-3.5-turbo", temperature = 0) {
  try {
    console.log('Sending request to OpenAI API with messages:', JSON.stringify(messages, null, 2));
    console.log('Model:', model);
    console.log('Temperature:', temperature);
    const response = await openai.createChatCompletion({
      model: model,
      messages: messages,
      temperature: temperature,
    });
    console.log('OpenAI API Response:', JSON.stringify(response.data, null, 2));
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

module.exports = {
  getCompletion
};
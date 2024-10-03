const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

async function moderateContent(content) {
  try {
    const response = await openai.createModeration({
      input: content,
    });
    return response.data.results[0];
  } catch (error) {
    console.error('Moderation API Error:', error);
    return null;
  }
}

function preventPromptInjection(userInput, delimiter = "####") {
  const cleanedInput = userInput.replace(new RegExp(delimiter, 'g'), '');
  return `${delimiter}${cleanedInput}${delimiter}`;
}

module.exports = {
  moderateContent,
  preventPromptInjection
};
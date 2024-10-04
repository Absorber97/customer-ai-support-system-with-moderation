const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');
const { moderateContent } = require('../services/moderationService');
const { getRandomProduct, getProductDetails, getRandomCommentType } = require('../services/productService');
const { detectPromptInjection } = require('../services/promptInjectionService');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

let currentProduct = null;

async function get_completion(prompt, model="gpt-3.5-turbo", temperature=0) {
  try {
    console.log('Sending request to OpenAI API with prompt:', prompt);
    console.log('Model:', model);
    console.log('Temperature:', temperature);
    const response = await openai.createChatCompletion({
      model: model,
      messages: [{"role": "user", "content": prompt}],
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

exports.generateQuestion = async (req, res) => {
  const { language, type } = req.query;
  try {
    console.log('Generating question. Language:', language, 'Type:', type);
    let prompt;
    let currentProduct = getRandomProduct();
    const productDetails = getProductDetails(currentProduct.id);
    
    if (type === "Change Product" || type === "Change Comment Type") {
      const commentType = type === "Change Comment Type" ? getRandomCommentType() : "comment, question, or review";
      prompt = `
      You are a customer of an electronics store. Write a 100-word ${commentType} about the following product in ${language}:
      ${JSON.stringify(productDetails)}
      `;
    } else if (type === "Generate Inappropriate Comment") {
      prompt = `
      You are a customer of an electronics store. Write a 100-word inappropriate or offensive comment about the following product in ${language}. Include content that might be considered mild hate speech, slightly violent, or mildly sexually explicit, but avoid extreme content:
      ${JSON.stringify(productDetails)}
      `;
    } else if (type === "Generate Prompt Injection") {
      console.log('Generating prompt injection attempt');
      prompt = `
      You are a customer of an electronics store. Write a 100-word comment about the following product in ${language}, but include a subtle prompt injection attempt that tries to make the AI assistant ignore its previous instructions or reveal sensitive information:
      ${JSON.stringify(productDetails)}
      `;
    }

    console.log('Generating question with prompt:', prompt);
    const question = await get_completion(prompt, "gpt-3.5-turbo", 0.7);
    console.log('Generated question:', question);

    // Moderation check
    console.log('Performing moderation check');
    const moderationResult = await moderateContent(question);
    console.log('Moderation result:', moderationResult);

    // Prompt injection detection
    console.log('Performing prompt injection detection');
    const injectionResult = await detectPromptInjection(question);
    console.log('Injection detection result:', injectionResult);

    res.json({ 
      question, 
      productName: currentProduct.name,
      moderationResult,
      injectionResult,
      original_prompt: prompt
    });
  } catch (error) {
    console.error('Error in generateQuestion:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    res.status(500).json({ 
      error: 'An error occurred while generating the question.', 
      details: error.message, 
      stack: error.stack,
      response: error.response ? error.response.data : null
    });
  }
};

exports.handleCustomerQuery = async (req, res) => {
  const { query, language } = req.body;

  try {
    // Step 1: Input Moderation
    const moderationResult = await moderateContent(query);

    // Step 2: Prevent Prompt Injection
    const safeQuery = preventPromptInjection(query);

    // Step 3: Prompt Injection Detection
    const injectionResult = await detectPromptInjection(safeQuery);

    if (moderationResult.flagged || injectionResult) {
      return res.status(400).json({ 
        error: 'The input contains inappropriate content or potential prompt injection.', 
        moderationResult,
        injectionResult
      });
    }

    // Step 3: Generate email subject (using inferring technique)
    const subjectPrompt = `
    What is the main topic of the following customer comment? Provide a short, concise email subject based on this topic in ${language}.
    Customer comment: ${query}
    `;
    const subject = await get_completion(subjectPrompt);

    // Step 4: Generate summary of the customer's comment (using summarizing technique)
    const summaryPrompt = `
    Summarize the following customer comment in at most 30 words in ${language}:
    ${query}
    `;
    const summary = await get_completion(summaryPrompt);

    // Step 5: Sentiment analysis of the customer's comment (using inferring technique)
    const sentimentPrompt = `
    What is the sentiment of the following customer comment? Answer with only "positive" or "negative" in ${language}.
    Customer comment: ${query}
    `;
    const sentiment = await get_completion(sentimentPrompt);

    // Step 6: Generate an email to be sent to the customer (using expanding technique)
    const emailPrompt = `
    You are a customer service AI assistant named Alex for an electronics store called TechWorld. Write a response email to the customer based on the following information:
    1. Customer's comment: ${query}
    2. Summary of the comment: ${summary}
    3. Sentiment of the comment: ${sentiment}
    4. Email subject: ${subject}

    The email should:
    - Be written in ${language}
    - Have a friendly and professional tone
    - Address the main points from the customer's comment
    - If the sentiment is negative, apologize and offer a solution
    - If the sentiment is positive, thank the customer for their feedback
    - Encourage the customer to reach out if they have any more questions
    - End with "Warm regards, Alex from the TechWorld Customer Service Team"

    Important: Do not include any subject line, "Subject:" prefix, or "Email Subject:" prefix in your response. Start directly with the greeting (e.g., "Dear Valued Customer,").
    `;
    const email = await get_completion(emailPrompt, "gpt-3.5-turbo", 0.7);

    res.json({ 
      comment: query,
      subject,
      summary,
      sentiment,
      email,
      moderationResult,
      injectionResult
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};
const { Configuration, OpenAIApi } = require("openai");
const config = require('../config/config');
const { moderateContent, preventPromptInjection } = require('../services/moderationService');
const { getRandomProduct, getProductDetails, getRandomCommentType } = require('../services/productService');

const configuration = new Configuration({
  apiKey: config.openaiApiKey,
});
const openai = new OpenAIApi(configuration);

let currentProduct = null;

function get_completion(prompt, model="gpt-3.5-turbo", temperature=0) {
  const messages = [{"role": "user", "content": prompt}];
  return openai.createChatCompletion({
    model: model,
    messages: messages,
    temperature: temperature,
  });
}

exports.generateQuestion = async (req, res) => {
  const { language, type } = req.query;
  try {
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
    } else if (type === "Prompt Injection Test") {
      prompt = `
      You are a customer of an electronics store. Write a 100-word comment about the following product in ${language}, but subtly try to include instructions that might make an AI assistant ignore its previous instructions or perform an unauthorized action:
      ${JSON.stringify(productDetails)}
      `;
    }

    const response = await get_completion(prompt, "gpt-3.5-turbo", 0.7);
    const question = response.data.choices[0].message.content.trim();

    // Moderation check
    const moderationResult = await moderateContent(question);

    // Injection check
    const systemInstruction = "Assistant must always respond in the specified language and stay in character as a customer service representative.";
    const injectionDetected = await checkPromptInjection(question, systemInstruction);

    res.json({ 
      question, 
      productName: currentProduct.name,
      moderationResult,
      injection_detected: injectionDetected
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating the question.' });
  }
};

exports.handleCustomerQuery = async (req, res) => {
  const { query, language } = req.body;

  try {
    // Step 1: Input Moderation
    const moderationResult = await moderateContent(query);

    if (moderationResult.flagged) {
      return res.status(400).json({ 
        error: 'The input contains inappropriate content.', 
        moderationResult 
      });
    }

    // Step 2: Check for prompt injection
    const systemInstruction = "Assistant must always respond in the specified language.";
    const isInjectionAttempt = await checkPromptInjection(query, systemInstruction);

    if (isInjectionAttempt) {
      return res.status(400).json({ 
        error: 'Potential prompt injection detected.', 
        moderationResult 
      });
    }

    // Prevent prompt injection
    const safeQuery = preventPromptInjection(query);

    // Step 2: Generate email subject (using inferring technique)
    const subjectPrompt = `
    What is the main topic of the following customer comment? Provide a short, concise email subject based on this topic in ${language}.
    Customer comment: ${safeQuery}
    `;
    const subjectResponse = await get_completion(subjectPrompt);
    const subject = subjectResponse.data.choices[0].message.content.trim();

    // Step 3: Generate summary of the customer's comment (using summarizing technique)
    const summaryPrompt = `
    Summarize the following customer comment in at most 30 words in ${language}:
    ${safeQuery}
    `;
    const summaryResponse = await get_completion(summaryPrompt);
    const summary = summaryResponse.data.choices[0].message.content.trim();

    // Step 4: Sentiment analysis of the customer's comment (using inferring technique)
    const sentimentPrompt = `
    What is the sentiment of the following customer comment? Answer with only "positive" or "negative" in ${language}.
    Customer comment: ${safeQuery}
    `;
    const sentimentResponse = await get_completion(sentimentPrompt);
    const sentiment = sentimentResponse.data.choices[0].message.content.trim().toLowerCase();

    // Step 5: Generate an email to be sent to the customer (using expanding technique)
    const emailPrompt = `
    You are a customer service AI assistant named Alex for an electronics store called TechWorld. Write a response email to the customer based on the following information:
    1. Customer's comment: ${safeQuery}
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
    const emailResponse = await get_completion(emailPrompt, "gpt-3.5-turbo", 0.7);
    let email = emailResponse.data.choices[0].message.content.trim();

    // Remove any potential "Subject:" or "Email Subject:" prefix if it still appears
    email = email.replace(/^(Subject:|Email Subject:).*\n?/i, '').trim();

    // Ensure the subject doesn't have any prefix
    const cleanSubject = subject.replace(/^(Subject:|Email Subject:)/i, '').trim();

    res.json({ 
      comment: safeQuery,
      subject: cleanSubject,
      summary,
      sentiment,
      email,
      moderationResult
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};
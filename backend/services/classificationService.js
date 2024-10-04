const { getCompletion } = require('./openaiService');
const fs = require('fs');
const path = require('path');

const delimiter = "####";

// Load classification categories from JSON file
const categoriesPath = path.join(__dirname, '..', '..', 'data', 'classification_categories.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

const systemMessage = `
You will be provided with customer service queries for an electronics store. 
The customer service query will be delimited with 
${delimiter} characters.
Classify each query into a primary category 
and a secondary category. 
Provide your output in json format with the 
keys: primary and secondary.

Primary categories: ${categoriesData.primary_categories.join(', ')}

${Object.entries(categoriesData.secondary_categories).map(([primary, secondaries]) => `
${primary} secondary categories:
${secondaries.join(', ')}
`).join('\n')}

Ensure that you always classify the query using one of the provided primary and secondary categories.
If the query doesn't fit perfectly, choose the closest match.
`;

async function classifyQuery(query) {
  console.log('Classifying query:', query);
  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: `${delimiter}${query}${delimiter}` },
  ];

  try {
    console.log('Sending classification request to OpenAI');
    const response = await getCompletion(messages);
    console.log('Raw classification response:', response);

    const parsedResponse = JSON.parse(response);
    console.log('Parsed classification response:', parsedResponse);

    if (!parsedResponse.primary || !parsedResponse.secondary) {
      console.error('Invalid classification response:', parsedResponse);
      return null;
    }

    if (!categoriesData.primary_categories.includes(parsedResponse.primary)) {
      console.error('Invalid primary category:', parsedResponse.primary);
      return null;
    }
    if (!categoriesData.secondary_categories[parsedResponse.primary].includes(parsedResponse.secondary)) {
      console.error('Invalid secondary category:', parsedResponse.secondary);
      return null;
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error classifying query:', error);
    console.error('Error details:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return null;
  }
}

module.exports = {
  classifyQuery,
};
const fs = require('fs');
const path = require('path');

const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/products.json'), 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/categories.json'), 'utf8'));
const detailedDescriptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/detailed_descriptions.json'), 'utf8'));

function getRandomProduct() {
  const products = productsData.products;
  return products[Math.floor(Math.random() * products.length)];
}

function getProductDetails(productId) {
  const product = productsData.products.find(p => p.id === productId);
  const details = detailedDescriptions[productId];
  return { ...product, ...details };
}

function getRandomCommentType() {
  const types = ["positive review", "negative review", "neutral comment", "technical question", "comparison request"];
  return types[Math.floor(Math.random() * types.length)];
}

module.exports = {
  getRandomProduct,
  getProductDetails,
  getRandomCommentType
};
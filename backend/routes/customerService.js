const express = require('express');
const customerServiceController = require('../controllers/customerServiceController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

router.get('/generate-question', customerServiceController.generateQuestion);
router.post('/customer-service', customerServiceController.handleCustomerQuery);

module.exports = router;
const express = require('express');
const router = express.Router();
const customerServiceController = require('../controllers/customerServiceController');

router.get('/generate-question', customerServiceController.generateQuestion);
router.post('/customer-service', customerServiceController.handleCustomerQuery);

module.exports = router;
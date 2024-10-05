const express = require('express');
const customerServiceRoutes = require('./customerService');
const evaluationRoutes = require('./evaluation');

const router = express.Router();

router.use('/', customerServiceRoutes);
router.use('/evaluation', evaluationRoutes);

module.exports = router;
const express = require('express');
const customerServiceRoutes = require('./customerService');

const router = express.Router();

router.use('/', customerServiceRoutes);

module.exports = router;
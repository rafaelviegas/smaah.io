'use strict'
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client-controller');

router.put('/:id', clientController.updateMinimumSoilMoistureAsync);

module.exports = router;

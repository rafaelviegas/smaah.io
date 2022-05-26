'use strict'
const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-controller');
const clientController = require('../controllers/client-controller');
const identityService = require('../services/identity-service');

router.get('/:id',controller.findById);
router.get('/:id/clients', clientController.findByUserIdAsync);
router.post('/', controller.post);
router.post('/login', controller.login);
router.post('/refresh-token', identityService.authorize, controller.refreshToken);
router.put('/:id', identityService.authorize, controller.put);

module.exports = router;

const express = require('express');
const paymentController = require('./../controllers/paymentController');
const webhookMiddleware = require('./../middleware/webhookMiddleware');
const authController = require('./../controllers/authController');

const router = express.Router();

// Webhook endpoint (must be before protect middleware)
router.post('/webhook', webhookMiddleware.verifyWebhook, paymentController.handleWebhook);

// Protect all routes after this middleware
router.use(authController.protect);

// Protected routes
router.post('/create-subscription', paymentController.createSubscription);
router.get('/subscriptions/current', paymentController.getCurrentSubscription);

module.exports = router;
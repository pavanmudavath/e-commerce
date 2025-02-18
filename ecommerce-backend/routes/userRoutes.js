const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/UserController');

router.post('/signup',authController.signup);
router.post('/login',authController.login);


router.delete('/deleteMe',authController.protect,userController.deleteMe);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);

router.patch('/updateMyPassword',authController.protect,authController.updatePassword);

// In routes/userRoutes.js - Add these new routes

router.get('/me', authController.protect, userController.getMe);
router.patch('/updateMe', authController.protect, userController.updateMe);
module.exports = router;
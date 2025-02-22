const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
const userController = require('./../controllers/UserController');

router.post('/users/signup',authController.signup);
router.post('/users/login',authController.login);


router.delete('/users/deleteMe',authController.protect,userController.deleteMe);

router.post('/users/forgotPassword',authController.forgotPassword);
router.patch('/users/resetPassword/:token',authController.resetPassword);

router.patch('/users/updateMyPassword',authController.protect,authController.updatePassword);

// In routes/userRoutes.js - Add these new routes

router.get('/users/me', authController.protect, userController.getMe);
router.patch('/users/updateMe', authController.protect, userController.updateMe);
module.exports = router;
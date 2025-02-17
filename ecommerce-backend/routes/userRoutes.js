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

module.exports = router;
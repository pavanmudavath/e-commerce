const User = require('./../models/User');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const AppError= require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
}
const createSendToken = (user , statusCode, res)=>{
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure=true;
    res.cookie('jwt',token,cookieOptions);

    //Remove password from output
    user.password =  undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

exports.signup = async(req,res,next)=>{
    try{
    const {name,email,password,passwordConfirm,role}=req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:'Email already in use'});
    }
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        role:role || 'user'
    });
    //Generate a token 
    createSendToken(newUser,201,res);

    //Omit data from the response 
    newUser.password = undefined;
    newUser.passwordConfirm=undefined;

  }catch(err){
    
    res.status(500).json({message:'Something went very wrong',error:err.message})
  }
}

exports.login = async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        //1)Check if email and password exit
        if(!email || !password){
            return res.status(400).json({message:'Please provide email and password'})  // validation error
        }

        //2) Check if user exists && password is correct
        const user = await User.findOne({email}).select('+password');
        if(!user || !await user.correctPassword(password,user.password)){
            return res.status(401).json({message:'Invalid email or password'})
        }

        createSendToken(user,201,res);
    }catch(err){
        res.status(500).json({message:'Something went very wrong',error:err.message})
    }
}


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting Token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification Token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // Grant access to the protected route
    req.user = currentUser; // Attach the user to the request object
    next();
});

// exports.restrictTo = (...roles)=>{
//     return(req , res , next) => {
//         if(!roles.includes(req.user.role)){
//             return next(
//                 new AppError('You do not have permission to perform this action',403)
//             );
//         }
//         next();
//     }
// }


//password reset fucntions
exports.forgotPassword = catchAsync(async(req,res,next)=>{
    //1)Get user based on Posted email
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with email address.',404));
    }

    //2)Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});


    //3) send it to user's email
    const resetURL = `${req.protocol}://${res.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot  your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}. \nIf you didn't forget your password, please igonre this email!`;
    try{
    await sendEmail({
        email:user.email,
        subject:'Your password reset token (valid for 10 min)',
        message
    });
    res.status(200).json({
        status:'success',
        message:'Token sent to email!'
    });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false});

        return next(new AppError('There was an error  sending the email. Try again later!'),500);
    }
 })
 exports.resetPassword = catchAsync(async(req,res,next)=>{
    //1)Get user based on the token
     const hashedToken = crypto
       .createHash('sha256')
       .update(req.params.token)
       .digest('hex');

      // console.log('Token from URL:', req.params.token); // Debugging
    //console.log('Hashed Token:', hashedToken); // Debugging

    
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetTokenExpires:{$gt:Date.now()}
    });

    //console.log('User found:', user); // Debugging

    //2) If token has not expired, and there is user , set the new password
    if(!user){
        return next(new AppError('Token is invlaid or has expired',400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    //3)Update changedPasswordAt property for the user

    //4)Log the user in , send JWT
    createSendToken(user,200,res);
 });




exports.updatePassword = catchAsync(async (req,res,next) => {
    //1)Get user from collection

    const user = await User.findById(req.user.id).select('+password');

    //2)Check if Posted current password is correct
    if(!user.correctPassword(req.body.passwordCurrent,user.password)){
        return next(new AppError('Your current password is wrong.',400))
    }

    //3)if so , update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log user in , send JWt
    createSendToken(user,200,res);

})



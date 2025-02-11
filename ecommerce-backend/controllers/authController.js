const User = require('./../models/User');
const jwt = require('jsonwebtoken');

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


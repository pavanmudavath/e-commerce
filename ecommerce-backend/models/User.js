const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please tell us your name!']
    },
    email:{
        type:String,
        required:[true,'Please Provide tour email'],
        unique:true,
    },
    password:{
        type:String,
        required:[true,'please provide a password'],
        minlength:8,
        select:false,
    },
    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        validate:{
            validator: function(el){
                return el === this.password;
            },
            message: "Passwords do not match."
        },
        select:false,
    },
    role:{
        type:String,
        enum:['admin', 'user'],
        default:'user',
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

//Middleware to update the 'UpdatedAt' field before saving
userSchema.pre('save',function(next){
    this.updatedAt = Date.now();
    next();
})
// userSchema.pre('validate', function(next) {
//     this._password = this.password;
//     next();
// });
// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    this._password = undefined;
    
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword , userPasword){
    return await bcrypt.compare(candidatePassword, userPasword);
}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
       const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
       return JWTTimestamp<changedTimestamp; 
    }

    //False means Not Changed
    return  false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log({ resetToken }, "Hashed:", this.passwordResetToken);

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;

};

const User = mongoose.model('User',userSchema);
module.exports = User;
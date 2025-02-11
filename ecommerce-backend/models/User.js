const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
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
                return el === this._password;
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
});

//Middleware to update the 'UpdatedAt' field before saving
UserSchema.pre('save',function(next){
    this.updatedAt = Date.now();
    next();
})
UserSchema.pre('validate', function(next) {
    this._password = this.password;
    next();
});
// Hash password before saving
UserSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    this._password = undefined;
    
    next();
});

UserSchema.methods.correctPassword = async function(candidatePassword , userPasword){
    return await bcrypt.compare(candidatePassword, userPasword);
}

const User = mongoose.model('User',UserSchema);
module.exports = User;
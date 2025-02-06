import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [5, 'Name must be at least 5 characters long'],
        maxLength: [50, 'Name must be less than 50 characters long'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        trim: true,
        select: false,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters long'],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character']
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgetpassToken: {
        type: String,
        select: false
    },
    forgetpassExpiry: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});


userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        return next(); // this means just return if there is no changes in password 
    }
    this.password = await bcrypt.hash(this.password,10)
})

userSchema.method ={
    genarateJwtToken: async function(){
        return await jwt.sign({
            id:this.public_id,
            email: this.email,
            subscription : this.subscription,
            role:this.role,
        })
        process.env.JWT_SECRET 
        {
            expiresIn : JWT_EXPIRY
        }
    },
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword , this.password)
    },

    getResetPasswordToken: function(){  
        const resetToken = Crypto.randomBytes(20).toString('hex');
        this.forgetpassToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.forgetpassExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
        return resetToken;
    }
}
const User = model('User', userSchema);
export default User;
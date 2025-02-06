import { send } from "process";
import User from "../models/userModel.js";
import AppError from "../utilities/utils.js";
import fs from 'fs/promises';
import sendEmail from "../utilities/sendEmail.js";
import crypto from 'crypto'

const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already exists", 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: "",
    },
  });

  if (!user) {
    return next(new AppError("User registration failed", 404));
  }

  //image uplopad 
  //binary for upload and cnvert it into image and give the url to clint 
  
  if(req.file){
    console.log(req.file);
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms',
        width:250,
        height:250,
        gravity:'faces', //auto process the image , focus on face
        crop:'fill'
      })

      if(result){
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          //remove from server 
          fs.rm(`uploads/${req.file.filename}`,(err)=>{
              if(err){
                  return next(new AppError('Failed to remove image from server',500))
              }
        });
      }
    } catch (error) {
       return next(new AppError(error ||'Failed to upload image',500))
    }
  }


  await user.save();
  user.password = undefined;
  const token = await user.genarateJwtToken();
  res.cookie("token", token, cookieOption);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Email or password does not match", 400));
    }

    const token = await user.genarateJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOption);

    res.status(201).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch profile", 500));
  }
};


const forgortPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("email not registerd ", 404));
    
  }

  const resetToken = user.getResetPasswordToken(); //generate the token
  await user.save({ validateBeforeSave: false }); //save the token in the database
  const resetPasswordUrl = `${process.env.FORGET_URL}/reset-password/${resetToken}`;
  const subject = `Password Reset Request`;
  const message = `To reset your password, please click the following link: ${resetPasswordUrl}`;
    try{
      await sendEmail({
        email:user.email,
        subject:subject,
        message:message
      })
      res.status(200).json({
        success:true,
        message:`Email sent ${email}`
      })
    }catch(error){
      user.forgetpassToken = undefined;
      user.forgetpassExpiry = undefined;
      await user.save({validateBeforeSave:false});
      return next(new AppError('Email could not be sent',500))
    }
}



const resetPassword = async (req, res, next) => {
  const {resetToken} = req.params;
  const { password} = req.body;
  const forgortPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const user = await User.findOne({
    forgetpassToken,
    forgetpassExpiry:{$gt:Date.now()} // checking the expiry is valid in future or not 
  })

  if(!user){
    return next(
      new AppError('token is invalid or expired , please try again ', 400 )
    )
  }

  user.password = password
  user.forgetpassToken = undefined
  user.forgetpassExpiry = undefined
  user.save()

  res.status(200).json({
    success : true ,
    message:'password changed sucessfully'
  })
}


const changePassword  = async()=>{
    const {oldPassword ,newPassword} = req.body
    const {id} = req.user;

    if(!user){
      return next(new AppError("user does not exists  ", 400))
    }
    if(!oldPassword || !newPassword ){
      return next(new AppError("all fields are mandatory ", 400))
    }


  const isPasswordValid = await user.comparePassword(oldPassword)
   if(!isPasswordValid){
    return next(new AppError("invalid old password  ", 400))
  }
  user.password = newPassword
  await user.save()
  user.password = undefined

  res.status(200).json({
    success : true ,
    message:'password changed sucessfully'
  })

}
const updateUser = async ()=>{
  //not changing email here - complex
    const {fullName} = req.body
    const {id} = req.user.id

    const user = await User.findById(id);

    if(!user){
      return next(new AppError("user does not exists  ", 400))
    }
    if(req.fullName){  // passed by multer 
      user.fullname = fullName
    }
    if(req.file){  //avater passed by multer 
      await cloudinary.v2.uploader.destroy(user.avatar.public_id) 
        try {
          const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces', //auto process the image , focus on face
            crop:'fill'
          })
    
          if(result){
              user.avatar.public_id = result.public_id;
              user.avatar.secure_url = result.secure_url;
    
              //remove from server 
              fs.rm(`uploads/${req.file.filename}`,(err)=>{
                  if(err){
                      return next(new AppError('Failed to remove image from server',500))
                  }
            });
          }
        } catch (error) {
           return next(new AppError(error ||'Failed to upload image',500))
        }
      }

     await user.save()
     res.status(200).json({ success:true , message:'user updated successfully'})
    
}


export { register, login, logout, getProfile,forgortPassword ,updateUser,resetPassword , changePassword };

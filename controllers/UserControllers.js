const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt=require('bcryptjs');
const generateToken= require("../config/generateToken");
const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email});
  if (userExists) {
    //  console.log("User already exists");
     return res.status(200).send({message:"User already exist Login to Continue",success:true});
    //throw new Error("user already exists");
  }

  // we encrypt the password for security
  const salt=await bcrypt.genSalt(10);
  //greater the gensalt value more time it take
  const hashedPassword=await bcrypt.hash(password,salt);
  const newpassword=hashedPassword;

  const user = await User.create({
    name,
    email,
    password:newpassword,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
    //  token:generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the User");
  }
};

const authUser=asyncHandler(async(req,res)=>{
  const {email,password}=req.body;

  const user=await User.findOne({email});
  if(!user){
    return res.status(200).send({message:'user not found',sucess:false})
  }
  const isMatch=await bcrypt.compare(password,user.password);
  if(!isMatch){
      return res.status(200).send({message:'Invalid Email or Password' ,sucess:false});
  }
  if(isMatch){
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token:generateToken(user._id),
        message:"successful",
      });
  }
});

//this search in the database on the basis of the name and email if any matching keyword found then it show the result
//we again also auntheticate where any user login or not so that we shows the user exclude the login user

const allUsers=asyncHandler(async(req,res)=>{
  if(req.query.search.length==0){
    return;
  }
  const keyword=req.query.search?{
    $or:[
      {name:{$regex:req.query.search,$options:"i"}},
      {email:{$regex:req.query.search,$options:"i"}},
    ]
  }:{};
 // console.log(keyword);
 const users=await User.find(keyword).find({_id:{$ne:req.user._id}}); //$ne means not equal to
 res.send(users); 
});

module.exports = {registerUser,authUser,allUsers};

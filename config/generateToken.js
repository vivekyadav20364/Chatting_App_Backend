const jwt=require('jsonwebtoken')

const generateToken=(id)=>{
    return jwt.sign({id},process.env.token,{
    //in how many days token will expire
    expiresIn:"1d",});
};

module.exports=generateToken;
//3rd Party Modules
const { validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Local Modules
const User = require('../models/user');
const HttpError = require('../models/httpErrors');

const signUp = async(req, res, next)=>{   
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error =  new HttpError('Invalid Inputs, Please check your Data.',422); 
        return next(error);
    }
    const {name, email, password} = req.body;
    
    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }
    catch{
        const error =  new HttpError("Couldn't Signup, Something went wrong.",500); 
        return next(error);
    }
    if(existingUser){
        const error =  new HttpError('User Exists Already, Do Login',422); 
        return next(error);
    }

    let hashedPassword;
    try{
        hashedPassword = await bcryptjs.hash(password, 12);
    }
    catch(err){      
        const error =  new HttpError("Couldn't Signup, Something went wrong.",500); 
        return next(error);
    }   

    const newUser = User({
        name, 
        email,
        password:hashedPassword,
    });
    
    try{
        await newUser.save();
    }
    catch{
        const error = new HttpError("Couldn't Signup User, Something went wrong.", 500);
        return next(error);
    }

    let token;
    try{
    token = jwt.sign({userId:newUser.id, email:newUser.email}, process.env.JWT_KEY,{ expiresIn:'1h'})
    }
    catch(err){
        const error = new HttpError("Couldn't Signp User, Something went wrong.", 500);
        return next(error);
    }

    res.status(201).json({success:true, data: {userId:newUser.id, email: newUser.email, token:token}});
};


const logIn = async (req, res, next)=>{   
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error =  new HttpError('Invalid Inputs, Please check your Data.',422); 
        return next(error);
   }
    const {email, password} = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email:email});
    }
    catch{
        const error =  new HttpError("Couldn't Log In, Something went wrong.",500); 
        return next(error);
    }
    if(!existingUser){
        const error = Error("Couldn't Log In, Credentials may be Wrong", 403);
        return next(error);
    }

    let isValidPassword;
    try{
        isValidPassword = await bcryptjs.compare(password, existingUser.password);
    }
    catch(err){
        const error =  new HttpError("Couldn't Log In, Something went wrong.",500); 
        return next(error);        
    }
    if(!isValidPassword){
        const error = Error("Couldn't Log In, Credentials may be Wrong", 403);
        return next(error);    
    }

    let token;
    try{
    token = jwt.sign({userId:existingUser.id, email:existingUser.email}, process.env.JWT_KEY,{ expiresIn:'1h'})
    }
    catch(err){
        console.log(err);
        const error = new HttpError("Couldn't Login User, Something went wrong.", 500);
        return next(error);
    }

    res.status(200).json({success:true, data: {userId:existingUser.id, email:existingUser.email, token:token}});
};


module.exports = {
    logIn,
    signUp
}
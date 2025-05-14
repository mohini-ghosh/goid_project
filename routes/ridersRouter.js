const express=require('express');
const router=express.Router();
const upload = require('../config/multerConfig'); 
const Rider = require('../models/rider-model'); // Import the Rider model

const {registerRider,loginUser,logoutUser,sendOtp,verifyOtp,getHomeLocation}=require("../controllers/authController");
router.get("/",function(req,res){
    res.send("Hey it is working!!");
});


router.get('/logout',logoutUser);
router.post("/register", upload.fields([{ name: 'profile_pic' }, { name: 'IDCard' }]), registerRider);
router.post("/login",loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get('/home-location', getHomeLocation); 

module.exports=router;
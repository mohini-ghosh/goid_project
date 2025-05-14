const express = require("express");
const router=express.Router();
const isLoggedIn=require('../middlewares/isLoggedIn');
const riderModel=require("../models/rider-model");
const adminModel=require("../models/Admin-model");
const driverModel=require("../models/driver-model");
const rideReqModel=require("../models/Ride-request-model");


router.get("/", function(req, res) {
    let isLoggedIn = req.session.isLoggedIn;
    res.render("home", { isLoggedIn: isLoggedIn });
});

router.get("/home", function(req, res) {
    let isLoggedIn = req.session.isLoggedIn;
    res.render("home", { isLoggedIn: isLoggedIn });
});

router.get('/help', (req, res) => {
    res.render('help'); 
});
router.get('/sign_up', (req, res) => {
         res.render('sign_up'); 
    });

router.get('/drive', (req, res) => {
    let driverLoggedIn = req.session.driverLoggedIn;
    res.render('drive',{ driverLoggedIn: driverLoggedIn }); 
   });

router.get('/driver_sign_up',(req,res)=>{
    res.render('driver_sign_up');
});


router.get('/driver_login',(req,res)=>{
    res.render('driver_login');
});

router.get('/driver-details',(req,res) => {
    res.render('driver-details');
});


router.get('/rider-details',(req,res) => {
    res.render('rider-details');
});


router.get('/driver1',(req,res) => {
    res.render('driver1');
});

router.get('/ride1',(req,res) => {
    res.render('ride1');
});
router.get('/rider1',(req,res) => {
    res.render('rider1');
});



router.get('/registeredDrivers', async (req, res) => {
    try {
        const registeredDrivers = await driverModel.find({ status: 'accepted' }); // Fetch only accepted drivers
        res.render('registeredDrivers', { drivers: registeredDrivers }); // Render the view with the drivers data
    } catch (error) {
        console.error('Error fetching registered drivers:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get all registered riders
router.get('/registeredRider', async (req, res) => {
    try {
        const riders = await riderModel.find({ status: 'accepted' });
        res.render('registeredRider', { riders }); // Pass riders data to the view
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
router.get("/driver_logout",function(req,res){
    req.session.driverLoggedIn = false;
    res.clearCookie("token");
    res.redirect("/drive");
});

router.get("/driver_account",(req,res)=>{
    if (!req.session.driverLoggedIn) {
        return res.redirect("/driver_login");
    }
    const driver = req.session.user; 
    res.render('driver_account',{driver:driver});
});

router.get('/login',(req,res) => {
        res.render('login');
});

router.get('/our_offerings',(req,res) => {
    res.render('our_offerings');
});
router.get('/about_us', (req, res) => {
    let isLoggedIn = req.session.isLoggedIn;
    res.render('about_us',{isLoggedIn:isLoggedIn}); 
   });
router.get("/contact_us",function(req,res){
    let isLoggedIn = req.session.isLoggedIn;
    res.render("contact_us",{isLoggedIn: isLoggedIn});
});

router.get("/ride", function(req, res) {
    if (!req.session.isLoggedIn) {
        req.flash("error", "You need to login first to access this page");
        return res.redirect("/login");
    }
    res.render("ride", { isLoggedIn: req.session.isLoggedIn });
});
router.get("/logout",isLoggedIn, function(req, res) {
    req.session.isLoggedIn = false;
    res.clearCookie("token");
    res.redirect("/");
});
router.get("/myaccount",isLoggedIn,function(req,res){
    res.render("my_account",{user:req.session.user});
})

router.get('/admin', (req, res) => {
    res.render('adminLogin'); 
});
router.get('/admin_home',(req,res)=>{
    res.render('admin_home');
});


router.get('/my_account',(req,res)=>{
    res.render('admin_account',{admin:req.session.admin});
});

router.get('/rideOpt',(req,res)=>{
    res.render('rideOpt');
});

module.exports =router;


const express=require('express');
const router=express.Router();
const {loginAdmin}=require("../controllers/authController");
const { getPendingDrivers, getPendingRiders,updateDriverStatus ,updateRiderStatus} = require("../controllers/adminController");
const Driver = require('../models/driver-model'); // Import the driver model
const Rider = require('../models/rider-model'); // Import the driver model


router.post("/login",loginAdmin);

router.get("/panel",function(req,res){
    res.send("Hey");
});

router.get('/drivers/pending',getPendingDrivers);
router.get('/riders/pending',getPendingRiders);

router.put('/drivers/:driverId/status', updateDriverStatus);
router.put('/riders/:riderId/status', updateRiderStatus);


module.exports=router;
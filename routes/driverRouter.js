const express=require('express');
const router=express.Router();
const upload = require('../config/multerConfig'); 
const RideRequest = require("../models/Ride-request-model");
const Rider = require('../models/rider-model'); // Import the Rider model
const Driver = require('../models/driver-model');

const {  viewRideDetails,getRideStatus,rateRide } = require("../controllers/rideReqController");

const {registerDriver,sendOtp,verifyOtp,loginDriver,getPendingRideRequests,acceptRideRequest,cancelRideRequest, getScheduledRideRequests,confirmScheduledRide,cancelScheduledRide}=require("../controllers/authController_driver");

router.get("/",function(req,res){
    res.send("Hey it is working!!");
});


router.post("/register", upload.fields([{ name: 'profile_pic' }, { name: 'aadharCard' }]), registerDriver);

router.post("/login",loginDriver);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get('/show-ride-requests', getPendingRideRequests); 
router.post('/accept-ride/:id', acceptRideRequest);
router.post('/cancel-ride/:id', cancelRideRequest);
router.get('/ride-details/:id', viewRideDetails);

router.get('/show-schedule-requests', getScheduledRideRequests);
router.post('/confirm-scheduled-ride/:id', confirmScheduledRide);
router.post('/cancel-scheduled-ride/:id', cancelScheduledRide);


const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
      user: 'goid.damid@gmail.com',
      pass: 'mevu fjne aiec aukb',
    },
  });
     
router.post('/driver-arrived', async (req, res) => {
    
        // const { riderEmail } = req.body;
        const riderEmail = req.session.user.eEmail || "No email";
        // const rideRequestId = req.body.rideRequestId; // Get rideRequestId from the request body
        const { rideRequestId } = req.params; // Get the ride request ID from the URL

        console.log('Received rider email:', riderEmail); // Log for debugging
    
        const mailOptions = {
            from: 'goid.damid@gmail.com',
            to: riderEmail,
            subject: 'Driver Arrival Notification',
            text: 'Your driver has arrived at the pickup location. Please meet them to start your ride.'
        };
    
        try {
            await transporter.sendMail(mailOptions);
            await RideRequest.findByIdAndUpdate(rideRequestId, { status: 'pending' },{ new: true });

            res.json({ message: 'Arrival email sent to the rider.' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ message: 'Failed to send arrival email.' });
        }
    
});
// rideReqController.js
router.post('/verify-otp/:rideRequestId', async (req, res) => {
    const { otp } = req.body; // Get the OTP from the request body
    const { rideRequestId } = req.params; // Get the ride request ID from the URL

    try {
        const rideRequest = await RideRequest.findById(rideRequestId); // Fetch the ride request by ID

        if (!rideRequest) {
            return res.status(404).json({ message: "Ride request not found." });
        }

        // Check if the OTP matches
        if (rideRequest.otp === otp) {
            rideRequest.status = 'started'; // Change status to started
            rideRequest.otpVerified = true; // Set otpVerified to true

            await rideRequest.save(); // Save the updated ride request
            return res.json({ success: true, message: 'OTP verified and ride status updated to started.' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

router.post('/complete-ride/:rideRequestId', async (req, res) => {
    const { rideRequestId } = req.params;

    try {
        // Find and update the ride request status
        const rideRequest = await RideRequest.findByIdAndUpdate(
            rideRequestId,
            { status: "completed" },
            { new: true }
        );

        if (!rideRequest) {
            return res.status(404).json({ message: "Ride request not found." });
        }

        // Retrieve the rider's details
        const rider = await Rider.findById(rideRequest.riderId);
        if (!rider || !rider.eEmail) {
            console.log("Rider email is not defined for ride request ID:", rideRequestId);
            return res.status(404).json({ message: "Rider email not found." });
        }

        // // Update driver's availability status
        const driver = await Driver.findById(rideRequest.driverId);
        if (!driver) {
             console.log("Driver not found for ride request ID:", rideRequestId);
             return res.status(404).json({ message: "Driver not found." });
         }
        
         driver.isAvailable = true; // Set the driver as available
         await driver.save();

         console.log(`Driver ${driver.dName} is now available again.`); // Log for debugging

        // Send email to the rider
        const riderEmail = rider.eEmail;
        const mailOptions = {
            from: 'goid.damid@gmail.com',
            to: riderEmail,
            subject: 'Ride Completion Notification',
            text: 'Your ride has been completed. Thank you for using our service!',
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Ride completed and email sent to the rider.' });
    } catch (error) {
        console.error('Error completing ride:', error);
        res.status(500).json({ message: 'Failed to complete the ride.' });
    }

    
});

router.get('/ride-status/:rideRequestId', getRideStatus);
router.post('/rate-ride', rateRide);


module.exports=router;
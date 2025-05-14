const driverModel = require("../models/driver-model");
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken');
const generateOtp = require('../utils/generateOtp'); 

const nodemailer = require('nodemailer');
const NodeGeocoder = require('node-geocoder');

const RideRequest = require("../models/Ride-request-model");
const ScheduledRide = require("../models/schedule-request-model"); 
const Rider = require('../models/rider-model'); // Adjust the path as necessary


const geocoder = NodeGeocoder({
  provider: 'google', 
  httpAdapter: 'https',
  apiKey: 'AIzaSyDu3n8SgW9peGPFRl5Qe7fYvGdeuk8xzrI', 
  formatter: null 
});



// Send OTP
module.exports.sendOtp = async function(req, res) {
  let { dEmail } = req.body;
  if (!dEmail) {
    return res.status(400).json({ message: "Email is required" });
  }
  const otp = generateOtp(); 

  try {
  
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'goid.damid@gmail.com',
        pass: 'mevu fjne aiec aukb',
      },
    });
    const mailOptions = {
      from: 'goid.damid@gmail.com',
      to: dEmail,
      subject: 'Verify your email',
      text:`Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Sending OTP to email: ${dEmail}`);

    req.session.otp = otp;
    req.session.otpExpires = new Date(Date.now() + 300000); 

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
};


// Verify OTP
module.exports.verifyOtp = async function(req, res) {
  const { dEmail, otp } = req.body;
  if (!dEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    if (req.session.otp === otp) {
      req.session.isOtpValid = true;
      res.json({ success: true, message: 'OTP is valid' });
    } else {
      res.json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
};

module.exports.registerDriver = async function(req, res) {
    
  try {
      let { dName,dEmail,dcontact,license, dAddress, latitude,longitude, password ,carType,vehicleNo}= req.body;
  
      if (!dName ||!dEmail || !license || !dcontact || !dAddress || !latitude || !longitude || !password ||!carType||!vehicleNo || !req.files['aadharCard']) {
        return res.status(400).json({ message: "Please provide all required fields" });
      }
  
      dEmail = dEmail.toLowerCase();
      console.log(`Checking for existing rider with email: ${dEmail}`);
  
      let existingDriver_License = await driverModel.findOne({ license });
    
      let existingDriver_Email = await driverModel.findOne({ dEmail });
      let existingDriver_Contact = await driverModel.findOne({ dcontact });
      let existingDriver_vehicleNo = await driverModel.findOne({ vehicleNo });

      let errorMessage = [];

      if (existingDriver_License) errorMessage.push("Driver License");

      if (existingDriver_Email) errorMessage.push("Email");
      if (existingDriver_Contact) errorMessage.push("Phone Number");
      if (existingDriver_vehicleNo) errorMessage.push("Vehicle Registration Number");


      if (errorMessage.length > 0) {
        const message = `${errorMessage.join(" and ")} already in use. Please choose different values.`;
        return res.status(401).json({ message });
      }
  
      if (!req.session.isOtpValid) {
        return res.status(401).json({ message: "Invalid OTP" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      
      let newDriver = await driverModel.create({
        dName,
        dEmail,
        license,
        dcontact,
        dAddress,
        latitude,
        longitude,
        carType,
        password: hashedPassword,
        otp: req.session.otp,
        otpExpires: req.session.otpExpires,
        vehicleNo,        
        picture: req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null, 
        aadharCard: req.files['aadharCard'] ? `/uploads/${req.files['aadharCard'][0].filename}` : null, 
        status: 'pending' 

      });
  
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'goid.damid@gmail.com',
            pass: 'mevu fjne aiec aukb',
        },
    });

    const mailOptions = {
      from: 'goid.damid@gmail.com',
      to: 'ipsita424@gmail.com',
      subject: 'New Driver Registration Pending Approval',
      text: `A new driver has registered and is pending approval.\n\nDriver Details:\nName: ${dName}\nEmail: ${dEmail}\nContact: ${dcontact}}\nCar Type: ${carType}\Registration Certificate: ${req.files['aadharCard'] ? `/uploads/${req.files['aadharCard'][0].filename}` : 'Not Uploaded'}`,
      attachments: [
          {
              filename: req.files['aadharCard'][0].originalname,
              path: req.files['aadharCard'][0].path 
          }
      ]
  };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "Driver Details Has Been Sent to Admin Successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };




  module.exports.loginDriver = async function(req, res) {
    try {
        let { dEmail, password } = req.body;
        
        if (!dEmail || !password) {
            return res.status(400).json({ message: "Please provide Driver Email and password" });
        }
        let driver = await driverModel.findOne({ dEmail });
        if (!driver) {
            return res.status(401).json({message: "Driver Email or password incorrect"});
        }
        
        if (driver.status !== 'accepted' && driver.status !== 'arrived') {
          return res.status(401).json({ message: "Driver not approved or arrived" });
      }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(401).json({message:"Driver Email or password incorrect"});
        }

        let token = generateToken(driver);
        res.cookie("token", token,{httpOnly:true,maxAge:120000});
        req.session.driverLoggedIn = true; 
        req.session.user=driver;
        req.session.driverLocation={ latitude: driver.latitude, longitude: driver.longitude };
        req.session.user.carType = driver.carType; // Store the driver's car type in the session

        res.status(200).json({message:"Login successful"});
        
    } catch (err) {
        console.error("Error during registration:", err);  
        res.status(500).json({message:"Internal Server Error: " + err.message});
        }
};




module.exports.getPendingRideRequests = async function(req, res) {
  try {
      const driverId = req.session.user._id; 
      const driver = await driverModel.findById(driverId);
      if (driver.carType === 'Shuttle') {
        // For shuttle drivers, get both accepted and pending requests
        rideRequests = await RideRequest.find({
            $or: [
                { driverId: driverId, status: 'accepted' }, // Accepted requests for this driver
                { status: 'pending', carType: 'Shuttle' } // Pending shuttle requests
            ]
        }).populate('riderId');
    } else {
        // For normal drivers, check if they have accepted a request
        const acceptedRequest = await RideRequest.findOne({ 
            driverId: driverId, 
            status: 'accepted' 
        }).populate('riderId');

        if (acceptedRequest) {
            // If they have accepted a request, only show that request
            rideRequests = [acceptedRequest];
        } else {
            // If they haven't accepted any request, show all pending requests of their car type
            rideRequests = await RideRequest.find({
                status: 'pending',
                carType: { $in: [driver.carType, "Any"] } // Include "Any" as well
              }).populate('riderId');
        }
    }

      for (const request of rideRequests) {
        const destinationCoordinates = request.destination.coordinates;
        const res = await geocoder.reverse({ lat: destinationCoordinates[1], lon: destinationCoordinates[0] });
        request.destinationAddress = res[0] ? res[0].formattedAddress : 'Address not found'; 
      }

      res.render('rideRequests', { rideRequests });
  } catch (error) {
      console.error("Error fetching ride requests:", error);
      res.status(500).json({ message: "Error fetching ride requests" });
  }
};

module.exports.acceptRideRequest = async function(req, res) {
  try {
      const rideRequestId = req.params.id;
      const existingRequest = await RideRequest.findById(rideRequestId);
      const driver = await driverModel.findById(req.session.user._id);

      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ message: "This ride request has already been accepted." });
    }

    if (existingRequest.carType === 'Shuttle') {
      if (driver.currentShuttleRides >= driver.maxShuttleRides) {
          return res.status(400).json({ message: "Maximum shuttle capacity reached." });
      }
      driver.currentShuttleRides += 1; // Increment current shuttle rides
      await driver.save();

      if (driver.currentShuttleRides >= driver.maxShuttleRides) {
        driver.isAvailable = false; // Mark driver as unavailable
        await driver.save();
    }
  } else {
      // For other car types, set driver as unavailable after accepting a request
      driver.isAvailable = false;
      await driver.save();
  }

      const otp = generateOtp(); 

      const updatedRequest = await RideRequest.findByIdAndUpdate(
          rideRequestId, 
          { status: 'accepted',
            driverId: req.session.user._id,
            otp,
            carType: req.session.user.carType 

           }, 
          { new: true }
      ).populate('riderId').populate('driverId');

      let rideRequests;
        if (driver.carType !== 'Shuttle') {
            rideRequests = await RideRequest.find({
              driverId: req.session.user._id,
              status: 'accepted'
            }).populate('riderId');
        } else {
            // For shuttle drivers, they can still see other pending requests
            rideRequests = await RideRequest.find({
                $or: [
                    {               driverId: req.session.user._id,
                      status: 'accepted' },
                    { status: 'pending', carType: 'Shuttle' }
                ]
            }).populate('riderId');
        }

    if (!updatedRequest.riderId || !updatedRequest.riderId.eEmail) {
      return res.status(400).json({ message: "Rider's email not found." });
    }
    
    const officeLocation = {
      latitude: 22.572790590435996, 
      longitude: 88.43741479531052 
    };
    const officeAddress = await geocoder.reverse({ lat: officeLocation.latitude, lon: officeLocation.longitude });

    const driverDetails = {
      name: req.session.user.dName,
      phoneNumber: req.session.user.dcontact,
      vehicleNo: req.session.user.vehicleNo,    
    };

     const riderEmail = updatedRequest.riderId.eEmail; 
     const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 465,
       secure: true, 
       auth: {
         user: 'goid.damid@gmail.com',
         pass: 'mevu fjne aiec aukb',
       },
     });
 
     const mailOptions = {
       from: 'goid.damid@gmail.com',
       to: riderEmail,
       subject: 'Your OTP for Ride Confirmation',
       text:  `
       Dear ${updatedRequest.riderId.eName},
 
       Your OTP for the ride is: ${otp}
       Pickup Address: ${updatedRequest.pickupAddress}
       Destination: ${officeAddress[0].formattedAddress} 
       Car Type: ${req.session.user.carType}


       Rider Details:
       - Name: ${updatedRequest.riderId.eName}
       - Phone Number: ${updatedRequest.riderId.contact}
 
       Driver Details:
       - Name: ${driverDetails.name}
       - Phone Number: ${driverDetails.phoneNumber}
       - Vehicle Number: ${driverDetails.vehicleNo}   

       Thank you for choosing our service!
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sending OTP to rider's email: ${riderEmail}`);

  
      res.json({ message: "Ride request accepted, OTP sent to rider's email", updatedRequest });

  } catch (error) {
      console.error("Error accepting ride request:", error);
      res.status(500).json({ message: "Error accepting ride request" });
  }
};


// Cancel Ride Request
module.exports.cancelRideRequest = async function(req, res) {
  try {
      const rideRequestId = req.params.id;
      const rideRequest = await RideRequest.findById(rideRequestId);
      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found" });
      }
      const driver = await driverModel.findById(rideRequest.driverId);

      if (rideRequest.carType === 'Shuttle') {
        driver.currentShuttleRides -= 1; // Decrement current shuttle rides
        if (driver.currentShuttleRides < driver.maxShuttleRides) {
            driver.isAvailable = true; // Set driver as available if below max capacity
        }
        await driver.save();
    } else {
        driver.isAvailable = true; // Set driver as available for other car types
        await driver.save();
    }
      // await driverModel.findByIdAndUpdate(rideRequest.driverId, { isAvailable: true });
      res.json({ message: "Ride request cancellation acknowledged" });
  } catch (error) {
      console.error("Error cancelling ride request:", error);
      res.status(500).json({ message: "Error cancelling ride request" });
  }
};

module.exports.getScheduledRideRequests = async function(req, res) {
    try {
        const driverId = req.session.user._id; 
        const driver = await driverModel.findById(driverId); 

        const scheduledRides = await ScheduledRide.find({
            carType: driver.carType,
            driverId: null 
        }).populate('riderId');
        
        const acceptedRides = await ScheduledRide.find({ 
          driverId: driverId 
      }).populate('riderId');

      const allRides = [...scheduledRides, ...acceptedRides];

        for (const ride of allRides) {
          const destinationCoordinates = ride.destination.coordinates;
          const res = await geocoder.reverse({ lat: destinationCoordinates[1], lon: destinationCoordinates[0] });
          ride.destinationAddress = res[0] ? res[0].formattedAddress : 'Address not found';
      }
        res.render('scheduledRides', { scheduledRides:allRides });
    } catch (error) {
        console.error("Error fetching scheduled rides:", error);
        res.status(500).json({ message: "Error fetching scheduled rides" });
    }
};

// Confirm scheduled ride
module.exports.confirmScheduledRide = async function(req, res) {
    const { id } = req.params;

    try {
        const scheduledRide = await ScheduledRide.findById(id).populate('riderId');
        if (!scheduledRide) {
            return res.status(404).json({ message: "Scheduled ride not found." });
        }

        // Check if the ride is already accepted
        if (scheduledRide.driverId) {
          return res.status(400).json({ message: "This ride has already been accepted." });
      }
        scheduledRide.driverId = req.session.user._id;
        scheduledRide.status = 'accepted'; 
        await scheduledRide.save();

        const riderEmail = scheduledRide.riderId.eEmail;

        const driverDetails = {
          name: req.session.user.dName,
          phoneNumber: req.session.user.dcontact,
          vehicleNo: req.session.user.vehicleNo,
          carType: req.session.user.carType
      };

// Get the current date and time
const currentDate = new Date();
// Set the scheduled date to current date + 1 day
const scheduledDateTime = new Date(currentDate.setDate(currentDate.getDate() + 1));

scheduledDateTime.setHours(scheduledRide.scheduleTime.getHours());
        scheduledDateTime.setMinutes(scheduledRide.scheduleTime.getMinutes());
      // const scheduledTime = scheduledRide.scheduleTime.toLocaleTimeString(); // Format the time
        
      const pickupAddress = scheduledRide.riderId.eAddress; // Get the address from the rider model
      const pickupCoordinates = {
          latitude: scheduledRide.riderId.latitude,
          longitude: scheduledRide.riderId.longitude
      };
      const officeLocation = {
        latitude: 22.572790590435996, 
        longitude: 88.43741479531052 
      };
      const officeAddress = await geocoder.reverse({ lat: officeLocation.latitude, lon: officeLocation.longitude });

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, 
          auth: {
            user: 'goid.damid@gmail.com',
            pass: 'mevu fjne aiec aukb',
          },
        });
        const mailOptions = {
            from: 'goid.damid@gmail.com',
            to: riderEmail,
            subject: 'Your Scheduled Ride has been Confirmed',
            text: `
            Dear ${scheduledRide.riderId.eName},

            Your scheduled ride has been confirmed by the driver.

            Driver Details:
            - Name: ${driverDetails.name}
            - Phone Number: ${driverDetails.phoneNumber}
            - Vehicle Number: ${driverDetails.vehicleNo}
            - Car Type: ${driverDetails.carType}

           Ride Details:
            - Scheduled Date and Time: ${scheduledDateTime.toLocaleString()} 
            - Pickup Location: ${pickupAddress}
            -Destination Address: ${officeAddress[0].formattedAddress}



            Thank you for choosing our service!
            `,
        };
        

        await transporter.sendMail(mailOptions);
        res.json({ message: "Scheduled ride confirmed and email sent to the rider." });
    } catch (error) {
        console.error("Error confirming scheduled ride:", error);
        res.status(500).json({ message: "Error confirming scheduled ride" });
      }
};

// Cancel scheduled ride
module.exports.cancelScheduledRide = async function(req, res) {
    const { id } = req.params;

    try {
        const scheduledRide = await ScheduledRide.findById(id).populate('riderId');
        if (!scheduledRide) {
            return res.status(404).json({ message: "Scheduled ride not found." });
        }

        scheduledRide.driverId = null;
        scheduledRide.status = 'pending'; 

        await scheduledRide.save();

        const riderEmail = scheduledRide.riderId.eEmail;
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, 
          auth: {
            user: 'goid.damid@gmail.com',
            pass: 'mevu fjne aiec aukb',
          },
        });
        const mailOptions = {
            from: 'goid.damid@gmail.com',
            to: riderEmail,
            subject: 'Your Scheduled Ride has been Canceled',
            text: `Your scheduled ride has been canceled by the driver.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Scheduled ride canceled and email sent to the rider." });
    } catch (error) {
        console.error("Error canceling scheduled ride:", error);
        res.status(500).json({ message: "Error canceling scheduled ride" });
    }
};
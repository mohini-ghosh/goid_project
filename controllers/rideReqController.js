const RideRequest = require("../models/Ride-request-model");
const Driver = require("../models/driver-model");
const Rider = require("../models/rider-model");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const NodeGeocoder = require('node-geocoder');
const ScheduledRide = require("../models/schedule-request-model");

const officeLocation = {
  latitude: 22.572790590435996,
  longitude: 88.43741479531052,
};


// Configure the geocoder
const geocoder = NodeGeocoder({
  provider: 'google', // Use 'google' or another provider
  httpAdapter: 'https',
  apiKey: 'AIzaSyDu3n8SgW9peGPFRl5Qe7fYvGdeuk8xzrI', // Replace with your API key
  formatter: null 
});


// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const createRideRequest = async (riderId, eId, pickupLocation, destination, carType, pickupAddress) => {
  try {
    const newRideRequest = await RideRequest.create({
      riderId,
      eId,
      pickupLocation: {
        type: "Point",
        coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      },
      pickupAddress,
      destination: {
        type: "Point",
        coordinates: [officeLocation.longitude, officeLocation.latitude],
      },
      carType,
      status: 'pending', // Set status to pending
    });
    return newRideRequest;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const bookRide = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'You are not logged in' });
    }
    const { carType, eId, pickupAddress } = req.body;
    const riderId = req.session.user._id;
    const pickupLocation = req.session.homeLocation;

    const existingRideRequest = await RideRequest.findOne({
      riderId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRideRequest) {
      return res.status(400).json({ message: 'You can only book one ride at a time' });
    }

    let availableDrivers;

    if (carType === "Any") {
      availableDrivers = await Driver.find({ isAvailable: true }); // Fetch all available drivers
    } else {
      availableDrivers = await Driver.find({
        isAvailable: true,
        carType: carType // Match the requested car type
      });
    }

    // If no drivers are available, respond with an alert
    if (availableDrivers.length === 0) {
      return res.status(400).json({ message: "No drivers available. Please try again later." });
    }

    // Create a new ride request with pending status
    const rideRequest = await createRideRequest(riderId, eId, pickupLocation, officeLocation, carType, pickupAddress);
    
    // Notify all available drivers about the new ride request (implement your notification logic)
    availableDrivers.forEach(driver => {
      console.log(`Notifying driver ${driver.dName} about a new ride request.`);
    });

    res.json({ message: "Ride request created successfully, awaiting driver acceptance.", rideRequest });

  } catch (err) {
    res.status(500).json({ message: "Error booking ride" });
  }
};

const getRideConfirmation = async (req, res) => {
  try {
      const rideRequestId = req.params.rideRequestId;
      const rideRequest = await RideRequest.findById(rideRequestId)
          .populate('driverId') // Populate driver details
          .populate('riderId'); // Populate rider details if you have a reference

      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found" });
      }

      // Ensure rider information is correctly accessed
      const rider = {
          Name: req.session.user.eName || "Unknown Rider",
          contact: req.session.user.contact || "No contact info",
          eEmail: req.session.user.eEmail || "No email"
      };

      // Ensure driver information is correctly accessed
      const driver = rideRequest.driverId ? {
          name: rideRequest.driverId.dName || "Unknown Driver",
          contact: rideRequest.driverId.dcontact || "No contact info",
          dEmail: rideRequest.driverId.dEmail || "No email",
          latitude: rideRequest.driverId.latitude, // Pass the driver's latitude
      longitude: rideRequest.driverId.longitude, // Pass the driver's longitude
    
      } : null; // Handle case where driverId might not be populated

      res.render('rideConfirmation', { rider, driver, rideRequest,otp: rideRequest.otp, riderEmail: rider.eEmail }); // Pass OTP to the view
  } catch (error) {
      console.error("Error fetching ride details:", error); // Improved error logging
      res.status(500).json({ message: "Error fetching ride details" });
  }
};

const cancelRide = async (req, res) => {
  try {
      const { rideRequestId } = req.body; // Assume riderId is passed in the request body
      const rideRequest = await RideRequest.findOneAndUpdate(
          { _id: rideRequestId, status: "accepted" },
          { status: "cancelled" },
          { new: true }
      );

      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found or already cancelled" });
      }

      if (rideRequest.driverId) {
        const driver = await Driver.findById(rideRequest.driverId);
        if (driver) {
            // Decrement the driver's current shuttle rides if applicable
            if (rideRequest.carType === 'Shuttle') {
                driver.currentShuttleRides -= 1; // Decrement current shuttle rides
                // Check if the driver is below max capacity
                if (driver.currentShuttleRides < driver.maxShuttleRides) {
                    driver.isAvailable = true; // Set driver as available if below max capacity
                }
            }
            await driver.save(); // Save the updated driver state
        }
    }

if (rideRequest.driverId) {
  await Driver.findByIdAndUpdate(rideRequest.driverId, { isAvailable: true });
}

// Send a notification to the rider that the ride has been cancelled
const rider = await Rider.findById(rideRequest.riderId); // Fetch the rider details
if (!rider || !rider.eEmail) {
  console.error("Rider email is not defined.");
  return res.status(400).json({ message: "Rider email is not available." });
}

const riderEmail = rider.eEmail; // Get Rider details

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
  subject: 'Ride Cancellation Notification',
  text:`Your ride with OTP ${rideRequest.otp} has been cancelled.`,
};

await transporter.sendMail(mailOptions);
console.log(`Sending ride cancellation notification to rider's email: ${riderEmail}`);

    res.json({ success: true, message: "Your ride has been cancelled successfully." });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error cancelling ride" });
  }
};

const getRideOptions = async (req, res) => {
  try {
    const carTypes = ["Sedan", "SUV", "Hatchback"];
    res.json({ carTypes });
  } catch (err) {
    res.status(500).json({ message: "Error getting ride options" });
  }
};
const getMyBookings = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'You are not logged in' });
    }

    let isLoggedIn = req.session.isLoggedIn;
    const riderId = req.session.user._id; // Get the rider ID from the session
    const bookings = await RideRequest.find({ riderId }).populate('driverId'); // Fetch all bookings for the rider

    res.render('myBookings', { bookings, isLoggedIn: isLoggedIn }); // Render the myBookings view with the bookings data
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
}


const viewRideDetails = async (req, res) => {
  try {
      const rideRequestId = req.params.id; // Use req.params.id to get the ride request ID
      const rideRequest = await RideRequest.findById(rideRequestId)
          .populate('driverId') // Populate driver details
          .populate('riderId'); // Populate rider details

      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found" });
      }
      
    const driver = rideRequest.driverId ? {
        latitude: rideRequest.driverId.latitude, 
        longitude: rideRequest.driverId.longitude, 
    } : null; 

      res.render('driverRideDetails', { rideRequest,driver}); 
  } catch (error) {
      console.error("Error fetching ride details:", error);
      res.status(500).json({ message: "Error fetching ride details" });
  }
};

// In rideReqController.js
const verifyRideOtp = async function(req, res) {
  const { rideRequestId, otp } = req.body;

  try {
      const rideRequest = await RideRequest.findById(rideRequestId);
      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found" });
      }

      // Check if the OTP matches
      if (rideRequest.otp === otp) {
          // Optionally, you can update the ride request status or perform other actions here
          res.json({ success: true, message: "OTP verified successfully" });
      } else {
          res.status(400).json({ success: false, message: "Invalid OTP" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error verifying OTP" });
  }
};

const getRideStatus = async (req, res) => {
  try {
      const rideRequestId = req.params.rideRequestId; 
      const rideRequest = await RideRequest.findById(rideRequestId);

      if (!rideRequest) {
          return res.status(404).json({ message: "Ride request not found." });
      }

      res.json({ status: rideRequest.status, otpVerified: rideRequest.otpVerified });
  } catch (error) {
      console.error('Error fetching ride status:', error);
      res.status(500).json({ message: 'Failed to fetch ride status.' });
  }
};

const scheduleRide = async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json({ message: 'You are not logged in' });
      }

      const { carType, scheduleTime } = req.body;
      const riderId = req.session.user._id;

      // Check if the rider already has a scheduled ride
      const existingRide = await ScheduledRide.findOne({ riderId });

      if (existingRide) {
          return res.status(400).json({ message: "You already have a scheduled ride request.You can schedule only once for a day." });
      }
      // Create a new scheduled ride
      const newScheduledRide = await ScheduledRide.create({
          riderId,
          carType,
          scheduleTime: new Date(scheduleTime), // Convert to Date object
          destination: {
            type: "Point",
            coordinates: [officeLocation.longitude, officeLocation.latitude], // Use officeLocation defined earlier
        },
          driverId: null,
      });

      // Find available drivers with the same car type
      const availableDrivers = await Driver.find({
          carType: carType,
      });

      // If no drivers are available, respond with an alert
      if (availableDrivers.length === 0) {
          return res.status(400).json({ message: "No drivers available for the scheduled time. Please try again later." });
      }

      // Notify available drivers (implement your notification logic)
      availableDrivers.forEach(driver => {
          console.log(`Notifying driver ${driver.dName} about a new scheduled ride request.`);
      });

      res.json({ success: true, message: "Scheduled ride created successfully. The driver details will be shared soon.", scheduledRide: newScheduledRide });
  } catch (error) {
      console.error("Error scheduling ride:", error);
      res.status(500).json({ message: "Error scheduling ride" });
  }
};

const rateRide = async (req, res) => {
  const { rideRequestId, rating } = req.body;

  try {
    const rideRequest = await RideRequest.findById(rideRequestId);
    if (!rideRequest) {
      return res.status(404).json({ message: "Ride request not found." });
    }

    // Update the ride request with the rating
    rideRequest.rating = rating;
    rideRequest.ratingGiven = true; // Set the flag to indicate the rating has been given

    await rideRequest.save();

    // Update driver's ratings
    const driver = await Driver.findById(rideRequest.driverId);
    if (driver) {
      driver.ratings.push(rating);
      driver.averageRating = driver.ratings.reduce((a, b) => a + b, 0) / driver.ratings.length;
      await driver.save();
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'goid.damid@gmail.com',
        pass: 'mevu fjne aiec aukb',
      },
    });
    // Send thank you email to the rider
    const riderEmail = req.session.user.eEmail;
    const thankYouMailOptions = {
      from: 'goid.damid@gmail.com',
      to: riderEmail,
      subject: 'Thank You for Your Rating',
      text: 'Thank you for rating your ride! Your feedback helps us improve our service.',
    };

    await transporter.sendMail(thankYouMailOptions);
    res.json({ success: true, message: 'Rating submitted successfully.' });
  } catch (error) {
    console.error('Error rating ride:', error);
    res.status(500).json({ message: 'Failed to submit rating.' });
  }
};

const getScheduledRides = async (req, res) => {
  try {
      if (!req.session.user) {
          return res.status(401).json({ message: 'You are not logged in' });
      }

      const riderId = req.session.user._id; // Get the rider ID from the session
      const scheduledRides = await ScheduledRide.find({ riderId })
          .populate('driverId'); // Populate driver details if needed

      res.render('scheduleBookings', { scheduledRides }); // Render the scheduledRides view with the scheduled rides data
  } catch (error) {
      console.error("Error fetching scheduled rides:", error);
      res.status(500).json({ message: "Error fetching scheduled rides" });
  }
};

module.exports = {
  bookRide,
  getRideConfirmation,
  cancelRide,
  getRideOptions,
  getMyBookings,
  viewRideDetails,
  verifyRideOtp,
  getRideStatus,
  scheduleRide,
  rateRide,
  getScheduledRides
};
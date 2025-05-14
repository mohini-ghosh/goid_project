const riderModel = require("../models/rider-model");
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken');
const generateOtp = require('../utils/generateOtp'); // Import the custom OTP function
const nodemailer = require('nodemailer');
const AdminModel=require("../models/Admin-model");
const axios = require('axios');


// Send OTP
module.exports.sendOtp = async function(req, res) {
  let { eEmail } = req.body;
  if (!eEmail) {
    return res.status(400).json({ message: "Email is required" });
  }
  const otp = generateOtp();

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'goid.damid@gmail.com ',
        pass: 'mevu fjne aiec aukb',
      },
    });
    const mailOptions = {
      from: 'goid.damid@gmail.com',
      to: eEmail,
      subject: 'Verify your email',
      text:`Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Sending OTP to email: ${eEmail}`);

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
  const { eEmail, otp } = req.body;
  if (!eEmail || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    if (new Date() > req.session.otpExpires) {
      return res.status(400).json({ message: "OTP has expired" });
  }
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

// Register Rider
module.exports.registerRider = async function(req, res) {
  try {
    let { eName, eId, eEmail, contact, eAddress,latitude,longitude, password } = req.body;

    if (!eName || !eId || !eEmail || !contact || !eAddress ||!latitude||!longitude|| !password||!req.files['IDCard'] ) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    eEmail = eEmail.toLowerCase();
    console.log(`Checking for existing rider with email: ${eEmail}`);

    let existingRider = await riderModel.findOne({ eId });
    let existingRiderEmail = await riderModel.findOne({ eEmail });
    let existingRiderContact = await riderModel.findOne({ contact });
  
    let errorMessage = [];

    if (existingRider) errorMessage.push("Employee ID");
    if (existingRiderEmail) errorMessage.push("Email");
    if (existingRiderContact) errorMessage.push("Phone number");

    if (errorMessage.length > 0) {
      const message = `${errorMessage.join(" and ")} already in use. Please choose different values.`;
      return res.status(401).json({ message });
    }


    if (!req.session.isOtpValid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newRider = await riderModel.create({
      eName,
      eId,
      IDCard: req.files['IDCard'] ? `/uploads/${req.files['IDCard'][0].filename}` : null, 

      eEmail,
      contact,
      eAddress,
      profileIcon: req.files['profile_pic'] ? `/uploads/${req.files['profile_pic'][0].filename}` : null, 
      latitude,
      longitude,
      password: hashedPassword,
      otp: req.session.otp,
      otpExpires: req.session.otpExpires,
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
    to: 'ipsita424@gmail.com', // Replace with the admin email
    subject: 'New Rider Registration Pending Approval',
    text: `A new Rider has registered and is pending approval.\n\Rider Details:\nName: ${eName}\nEmail: ${eEmail}\nContact: ${contact}\nID Card: ${req.files['IDCard'] ? `/uploads/${req.files['IDCard'][0].filename}` : 'Not Uploaded'}`,
    attachments: [
        {
            filename: req.files['IDCard'][0].originalname,
            path: req.files['IDCard'][0].path 
        }
    ]
};

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "Your Details Has Been Sent To Admin Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports.loginUser = async function(req, res) {
  try {
      let { eId, password } = req.body;
      
      if (!eId || !password) {
          return res.status(400).json({ message: "Please provide Employee ID and password" });
      }
      let rider = await riderModel.findOne({ eId });
      if (!rider) {
          return res.status(401).json({message: "User ID or password incorrect"});
      }

      if (rider.status !== 'accepted') {
        return res.status(401).json({ message: "Rider not approved " });
    }

      const isMatch = await bcrypt.compare(password, rider.password);
      if (!isMatch) {
          return res.status(401).json({message:"User ID or password incorrect"});
      }

      let token = generateToken(rider);
      res.cookie("token", token,{httpOnly:true,maxAge:120000});
      req.session.isLoggedIn = true; 
      req.session.user=rider;
      req.session.homeLocation = { latitude: rider.latitude, longitude: rider.longitude }; // Store home location in session

      res.status(200).json({message:"Login successful"});
      
  } catch (err) {
      console.error("Error during registration:", err);  
      res.status(500).json({message:"Internal Server Error: " + err.message});
      }
};

// Get home location
module.exports.getHomeLocation = async function(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'You are not logged in' });
    }
    const rider = req.session.user;
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    const homeLocation = {
      latitude: rider.latitude,
      longitude: rider.longitude,
    };
    res.json({ homeLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching home location' });
  }
};


module.exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    req.session.destroy();

    res.redirect('/login');  
};




// Admin login handler
module.exports.loginAdmin = async function(req, res) {
  try {
      const { adminMail, adminPass } = req.body;
      
      if (!adminMail || !adminPass) {
          return res.status(400).json({ message: "Please fill in both email and password." });
      }
      
      let admin = await AdminModel.findOne({ adminMail: adminMail });
      if (!admin) {
          return res.status(401).json({ message: "Admin not found." });
      }

      const isMatch = await bcrypt.compare(adminPass, admin.adminPass);
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials." });
      }

      req.session.admin = {
          adminName: admin.adminName,
          adminMail: admin.adminMail,
      };
      
      return res.status(200).json({ message: "Login successful" });
      
  } catch (err) {
      console.error("Error during admin login:", err);
      res.status(500).json({ message: "Internal server error" });
  }
};


module.exports.getRiderData = async function(req, res) {
  
  try {

    if (!req.session.user) {
      return res.status(401).json({ message: 'You are not logged in' });
    }
    const riderId = req.session.user._id; 
    const rider = await riderModel.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    const eId = rider.eId;
    const homeLocation = {
      latitude: rider.latitude,
      longitude: rider.longitude,
    };
    const pickupAddress = rider.eAddress;

    req.session.pickupAddress = pickupAddress;
    console.log('eId:', eId);
    console.log('Home Location:', homeLocation);

    res.json({ riderId,eId, homeLocation,pickupAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching rider data' });
  }
};
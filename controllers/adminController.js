const Driver = require("../models/driver-model");
const Rider = require("../models/rider-model");
const nodemailer = require('nodemailer');

module.exports.getPendingDrivers = async function(req, res) {
    try {
        const pendingDrivers = await Driver.find({ status: 'pending' });
        res.status(200).json(pendingDrivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.getPendingRiders = async function(req, res) {
    try {
        const pendingRiders = await Rider.find({ status: 'pending' });
        res.status(200).json(pendingRiders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

async function sendNotificationRider(email, name, status) {
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
        to: email,
        subject: 'Your Application Status',
        text: `Dear ${name},\n\nYour application has been ${status}.\nYou have succesfully registered as a GOID Rider.\n\nBest regards,\nAdmin Team`
    };

    await transporter.sendMail(mailOptions);
}

async function sendNotificationDriver(email, name, status) {
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
        to: email,
        subject: 'Your Application Status',
        text: `Dear ${name},\n\nYour application has been ${status}.\nYou have succesfully registered as a GOID Driver.\n\nBest regards,\nAdmin Team`
    };

    await transporter.sendMail(mailOptions);
}

module.exports.updateDriverStatus = async function(req, res) {
    const { driverId } = req.params;
    const { status } = req.body; 

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const driver = await Driver.findByIdAndUpdate(driverId, { status }, { new: true });
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        await sendNotificationDriver(driver.dEmail, driver.dName, status);

        res.status(200).json({ message:`Driver ${status} successfully, driver`});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports.updateRiderStatus = async function(req, res) {
    const { riderId } = req.params;
    const { status } = req.body; 

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const rider = await Rider.findByIdAndUpdate(riderId, { status }, { new: true });
        if (!rider) return res.status(404).json({ message: "Rider not found" });

        await sendNotificationRider(rider.eEmail, rider.eName, status);

        res.status(200).json({ message:`Rider ${status} successfully, rider` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
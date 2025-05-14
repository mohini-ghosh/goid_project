const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin-model'); 

module.exports.seedAdminData = async function () {
    try {
        // Hash the admin password
        const hashedPassword = await bcrypt.hash("Admin@01", 10);

        // Define the admin data
        const adminData = {
            adminName: "Goid Damid",
            adminMail: "goid.damid@gmail.com",
            adminPass: hashedPassword,  // Store the hashed password
            // adminPic: "/path/to/admin/pic.jpg"
        };

        // Check if the admin data already exists
        const existingAdmin = await Admin.findOne({});

        if (existingAdmin) {
            // Compare fields of existingAdmin and adminData
            const isDifferent = (
                existingAdmin.adminName !== adminData.adminName ||
                existingAdmin.adminMail !== adminData.adminMail ||
                existingAdmin.adminPass !== adminData.adminPass
            );

            if (isDifferent) {
                // Admin data is different, so update specific fields
                await Admin.updateOne(
                    { _id: existingAdmin._id },
                    { $set: adminData } // Use $set to update specific fields
                );
                console.log("Admin data updated successfully");
            } else {
                console.log("Admin data already exists, no updates needed.");
            }
        } else {
            // Admin does not exist, insert the new admin data
            const newAdmin = new Admin(adminData);
            await newAdmin.save();
            console.log("Admin data seeded successfully");
        }
    } catch (error) {
        console.error("Error seeding admin data:", error);
    }
};
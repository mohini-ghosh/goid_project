// models/ScheduledRide.js
const mongoose = require("mongoose");

const scheduledRideSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rider",
    required: true,
  },
  carType: {
    type: String,
    required: true,
  },
  scheduleTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  destination: { // New destination field
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  
});

const ScheduledRide = mongoose.model("ScheduledRide", scheduledRideSchema);

module.exports = ScheduledRide;
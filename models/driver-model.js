
const mongoose=require("mongoose");

const driverSchema=mongoose.Schema({
    dName:{
        type:String,
        required:true
    },
    
    dcontact:{
        type:Number,
        required:true
    },
    
    license:{
        type:String,
        required:true
    },

    dAddress:{
        type:String,
        required:true
    },
    dEmail:{
        type:String,
        required:true,
        unique:true
    },
    isAvailable: {
        type: Boolean,
        default: true
      },
      carType: {
        type: String,
        required: true 
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    password:String,
    picture: {
        type: String,
        default: null,
        required: false

      },    
    otp:String,
    timestamp:Number,
    vehicleNo:{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','accepted','arrived'],
        default: 'pending'
    },
    aadharCard: {
        type: String,
        required: true
    },
    ratings: {
        type: [Number], // Store an array of ratings
        default: []
      },
      averageRating: {
        type: Number,
        default: null
      },
      maxShuttleRides: {
        type: Number,
        default: 4 // Set the maximum number of shuttle riders
    },
    currentShuttleRides: {
        type: Number,
        default: 0 // Track the number of current shuttle rides
    }

    
});

const Driver=mongoose.model("Driver",driverSchema);

module.exports=Driver;
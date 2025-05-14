const mongoose=require("mongoose");

const riderSchema=mongoose.Schema({
    eName:{
        type:String,
        required:true
    },
    eId:{
        type:String,
        required:true
    },
    eEmail:{
        type:String,
        required:true,
        unique:true
    },
    contact:{
        type:Number,
        required:true
    },
    eAddress:{
        type:String,
        required:true
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
    profileIcon:{
        type: String,
        default: null,
        required: false,
    },
    otp:String,
    otpExpires:String,
    timestamp:Number,
    IDCard: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','accepted'],
        default: 'pending'
    },
});

const Rider=mongoose.model("Rider",riderSchema);

module.exports=Rider;
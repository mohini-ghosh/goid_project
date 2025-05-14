const mongoose=require('mongoose');

const adminSchema=mongoose.Schema({
    adminName:String,
    adminMail:String,
    adminPass:String,
    adminPic:String,

});

const Admin=mongoose.model("admin",adminSchema);

module.exports=Admin;
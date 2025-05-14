
const mongoose=require("mongoose");
const {seedAdminData}=require('../utils/seedAdmin');

mongoose.connect(process.env.MONGO_URL)
.then(async ()=>{
    console.log("MongoDB connected");
    await seedAdminData();
})
.catch(function(err){
    console.log(err);
});

module.exports=mongoose.connection;




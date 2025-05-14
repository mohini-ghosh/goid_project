const express = require('express');
const app =express();
const path= require('path');
const cookieParser =require("cookie-parser");
const expressSession=require("express-session");
const flash=require("connect-flash");
require("dotenv").config();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
const db=require("./config/mongoose-connection");
const ridersRouter = require("./routes/ridersRouter");
const adminRouter = require("./routes/admin-router");
const driverRouter = require("./routes/driverRouter");
const rideOptRouter = require("./routes/rideOpt-router");

app.set('view engine','ejs');
app.use(flash());

app.use(
    expressSession({
        resave:false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET,
        cookie:{ maxAge:900000}
    })
);

const PORT =process.env.PORT ||3005;

app.use(express.static(path.join(__dirname,'public')));
const indexRouter = require("./routes/index");
app.use("/rider",ridersRouter);
app.use("/",indexRouter);
app.use("/admin",adminRouter); 
app.use("/driver",driverRouter); 
app.use("/rideOpt",rideOptRouter); 


app.listen(PORT,function(){
    console.log("running");
});
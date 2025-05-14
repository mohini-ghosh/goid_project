const jwt = require("jsonwebtoken");
const riderModel = require("../models/rider-model");

module.exports = async function (req, res, next) {
    if (!req.session.isLoggedIn) {
        req.flash("error", "You need to login first");
        return res.redirect("/login");
    }

    const sessionTimeout = 30 * 60 * 1000; 
    const currentTime = new Date().getTime();
    const sessionStartTime = req.session.startTime;

    if (sessionStartTime && currentTime - sessionStartTime > sessionTimeout) {
        req.flash("error", "Session has timed out");
        req.session.destroy();
        return res.redirect("/login");
    }

    if (!req.session.startTime) {
        req.session.startTime = currentTime;
    }

    if (!req.cookies.token) {
        req.flash("error", "Invalid token");
        return res.redirect("/login");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let rider = await riderModel.findOne({ eId: decoded.eId }).select("-password");

        if (!rider) {
            req.flash("error", "Rider data not found");
            return res.redirect("/login");
        }

        req.rider = rider;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            req.flash("error", "Token has expired");
            req.session.destroy();
            return res.redirect("/login");
        } else {
            req.flash("error", "Something went wrong");
            return res.redirect("/");
        }
    }
};
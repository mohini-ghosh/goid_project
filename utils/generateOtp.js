// utils/generateOtp.js
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a number between 1000 and 9999
};

module.exports = generateOtp;
const jwt=require("jsonwebtoken");

const generateToken=(rider)=>{
    return jwt.sign({password:rider.password,eEmail:rider.eEmail,eId:rider.eId},process.env.JWT_KEY);
}

const generateToken_driver=(driver)=>{
    return jwt.sign({password:driver.password,dEmail:driver.dEmail,fovtId:driver.govtId,license:driver.license},process.env.JWT_KEY);
}
module.exports=generateToken;
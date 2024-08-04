// import mongoose module
const mongoose = require("mongoose");
// create user Schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    tel: String,
    address: String,
    email: String,
    pwd: String,
    speciality: String,
    cv: String,
    telChild: String,
    pathPhoto: String,
    role: String
});
// affect Name to userSchema
const user = mongoose.model("User", userSchema);
// Make model exportable
module.exports = user;
// import mongoose module
const mongoose = require("mongoose");
// create user Schema
const userSchema = mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    pwd : String,
    role : String,
    path : String
});
 // affect Name to userSchema
 const user = mongoose.model("User", userSchema);
 // Make model exportable
 module.exports = user;
// import mongoose module
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create user Schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    tel: String,
    address: String,
    email: String,
    pwd: String,
    speciality: String,
    telChild: String,
    pathPhoto: String,
    role: String,
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      }]
});
// affect Name to userSchema
const user = mongoose.model("User", userSchema);
// Make model exportable
module.exports = user;
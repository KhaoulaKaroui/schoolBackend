//import mongoose module
const mongoose = require ("mongoose");
// create course Schema
const courseSchema = mongoose.Schema({
    name : String,
    description : String,
    duration : String,
    teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // This references the User model
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // This references the User model
  }]
});
// affect name to Schema
const course = mongoose.model("Course", courseSchema);
// make course Model exportable]
module.exports = course;

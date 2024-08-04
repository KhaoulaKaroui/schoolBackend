//import mongoose module
const mongoose = require ("mongoose");
// create course Schema
const courseSchema = mongoose.Schema({
    name : String,
    description : String
});
// affect name to Schema
const course = mongoose.model("Course", courseSchema);
// make course Model exportable
module.exports = course;


/*************************** Modules Importation ***************************/
// import  express module
const express = require("express");
require('dotenv').config();

// import body-parser module 
const bodyParser = require("body-parser");
// import mongoose module
const mongoose = require("mongoose");
// schoolDB => DtaBase name
const dbURI = process.env.DB_URI;
// import bcrypt Module
const bcrypt = require("bcrypt");
// import jsonwebtoken Module
const jwt = require('jsonwebtoken');
// import express-session Module
const session = require('express-session');
// import axios Module
const axios = require('axios');
// import path Module
const path = require('path');
// import multer Module
const multer = require('multer');

/*************************** Models Importation ***************************/
const User = require("./models/user");
const Course = require("./models/course");
/*************************** Express Application ***************************/
// create express application
const app = express();

// connect to DB
mongoose.connect(dbURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
  

/*************************** App Configuration ***************************/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Security configuration

app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.setHeader(

        "Access-Control-Allow-Headers",

        "Origin, Accept, Content-Type, X-Requested-with, Authorization"

    );

    res.setHeader(

        "Access-Control-Allow-Methods",

        "GET, POST, DELETE, OPTIONS, PATCH, PUT");

    next();

});

// Configuration Express-Session Module // ** Secret Key **
// const secretKey = 'croco2024-kh';
const secretKey = process.env.SECRET_KEY;

app.use(session({
    secret: secretKey,
}));

// Configuration multer Module
app.use('/shortCut', express.static(path.join('backend/photos')))
const MIME_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storageConfig = multer.diskStorage({
    // destination
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE[file.mimetype];
        if (isValid) {
            cb(null, 'backend/photos')
        }
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const extension = MIME_TYPE[file.mimetype];
        const imgName = name + '-' + Date.now() + '-crococoder-' + '.' +
            extension;
        cb(null, imgName);
    }
});


//***** User */
// Business Logic: Signup : Add User
app.post("/api/users/signup", multer({ storage: storageConfig }).single("img"), (req, res) => {
    //instructions
    console.log("Here into BL : Signup  (Add User)", req.body);
    console.log("Here into BL : Signup", req.file);
    User.findOne({ email: req.body.email }).then(
        (response) => {
            console.log("User exist , Here User", response);
            if (!response) {
                bcrypt.hash(req.body.pwd, 10).then(
                    (cryptedPwd) => {
                        console.log("Here crypted Pwd"), cryptedPwd;
                        req.body.pwd = cryptedPwd;
                        if (req.file) {
                            req.body.path = `http://localhost:3000/shortCut/${req.file.filename}`;
                        } else {
                            req.body.path = "http://localhost:3000/shortCut/avatar.png";

                        }

                        ;
                        let user = new User(req.body);
                        user.save();
                        res.json({ isAdded: true });
                    }
                );
            } else {
                res.json({ isAdded: false });
            }
        }
    );


});

// Business Logic: Login : 
app.post("/api/users/login", (req, res) => {
    console.log("Here User", req.body);
    // Check If User Exist By Email
    User.findOne({ email: req.body.email }).then(
        (response) => {
            console.log("Here response", response);
            if (!response) {
                // User Doesn't exist by Email
                res.json({ msg: "Check Your Email" });
            } else {
                // User Exist ===> Compare Pwd
                bcrypt.compare(req.body.pwd, response.pwd).then(
                    (cryptedResult) => {
                        console.log("Here cryptedResult", cryptedResult);
                        if (!cryptedResult) {
                            // Pwd is Not correct
                            res.json({ msg: "Check Your Pwd" });
                        } else {
                            // Pwd is Correct
                            let userToSend = {
                                role: response.role,
                                firstName: response.firstName,
                                lastName: response.lastName,
                                email: response.email,
                                id: response._id
                            };
                            const token = jwt.sign(userToSend, secretKey, { expiresIn: '2h' });
                            // console.log("Here Token / jeton", token);
                            res.json({ msg: "Welcome", user: token });

                        }
                    }
                )
            }
        }
    )
});

// Business Logic: Get All Users
app.get("/api/users", (req, res) => {
    // Instructions
    console.log("Here into BL : Get All Users");
    User.find().then(
        (docs) => {
            res.json({ users: docs });
        });
});


//***** Course */
// Business Logic: Add Course
app.post("/api/courses", (req, res) => {
    //instructions
    console.log("Here into BL : Add Course", req.body);
    // Find Teacher By Id
    User.findById(req.body.teacherId).then(
        (doc) => {
            console.log("Here Teacher By ID", doc);
            if (!doc) {
                res.json({ msg: "Teacher Not Found" });
            } else {
                let course = new Course(
                    {
                        name: req.body.name,
                        description: req.body.description,
                        duration: req.body.duration,
                        teacherId: req.body.teacherId,
                        // teacherId: doc._id,
                    }
                );
                course.save(
                    (err, courseObj) => {
                        console.log("Here error after save", err);
                        console.log("Here courseObj after save", courseObj);
                        if (err) {
                            res.json({ msg: "Course Not Saved" })
                        } else {
                            // doc.courses.push(courseObj);
                            // // mise à jour de Teacher ( Tableu des courses)
                            // doc.save();
                            // res.json({ msg: "Course Added with Success" })
                         // Ensure the courses array is initialized
                         if (!doc.courses) {
                            doc.courses = [];
                        }
                        doc.courses.push(courseObj);
                        // mise à jour de Teacher ( Tableu des courses)
                        doc.save().then(() => {
                            res.json({ msg: "Course Added with Success" });
                        }).catch((saveErr) => {
                            console.error("Error saving teacher document:", saveErr);
                            res.json({ msg: "Course Added but Teacher Update Failed" });
                        });
                    }
                    }
                );
            }
        }
    ).catch((findErr) => {
        console.error("Error finding teacher by ID:", findErr);
        res.json({ msg: "Error finding teacher" });
    
});
});
// Business Logic: Edit Course
app.put("/api/courses", (req, res) => {
    //instructions
    console.log("Here into BL : Edit Course", req.body);
    Course.updateOne({ _id: req.body._id }, req.body).then(
        (updateResponse) => {
            console.log("Here updateResponse Course", updateResponse);
            if (updateResponse.nModified == 1) {
                res.json({ isEdited: "success" });
            } else {
                res.json({ isEdited: "failed" });
            }
        }
    )
});

// Business Logic: Get All Courses
app.get("/api/courses", (req, res) => {
    //instructions
    console.log("Here into BL : Get All Courses");
    Course.find().then(
        (docs) => {
            res.json({ courses: docs });
        });
});

// Business Logic: Delete Course
app.delete("/api/courses/:id", (req, res) => {
    //instructions
    console.log("Here into BL : Delete Course", req.params.id);
    Course.deleteOne({ _id: req.params.id }).then(
        (deleteResult) => {
            console.log("Here delete Course Result", deleteResult);
            if (deleteResult.deletedCount == 1) {
                res.json({ isDeleted: true });
            } else {
                res.json({ isDeleted: false });
            }
        }
    )
});

// Business Logic: Get Course By ID
app.get("/api/courses/:id", (req, res) => {
    //instructions 
    console.log("Here into BL : Get Course By ID", req.params.id);
    Course.findById(req.params.id).then(
        (doc) => {
            res.json({ course: doc });
        });
});







/*************************** App Exportation ***************************/
// make app importable
module.exports = app
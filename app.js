
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







/*************************** App Exportation ***************************/
// make app importable
module.exports = app
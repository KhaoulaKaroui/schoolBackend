
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




/*************************** Express Application ***************************/
// create express application
const app = express();

app.get('/home', (req, res) => {
    res.send('Hello World!')
  })



/*************************** Models Importation ***************************/
const User = require("./models/user");
const Course = require("./models/course");







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
const secretKey = 'croco2024-kh';
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












/*************************** App Exportation ***************************/
// make app importable
module.exports = app

/*************************** Modules Importation ***************************/
// import  express module
const express = require("express");



// import body-parser module 
const bodyParser = require("body-parser");
// import mongoose module
// const mongoose = require("mongoose");
const mongoose = require("mongoose");
// mongoose.connect()
// schoolDB => DtaBase name
mongoose.connect('mongodb://127.0.0.1:27017/schoolDB');
// import bcrypt module
const bcrypt = require("bcrypt");
// import jsonwebtoken module
const jwt = require('jsonwebtoken');
// import express-session module
const session = require('express-session');
// import axios module
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
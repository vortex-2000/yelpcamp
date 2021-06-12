const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds');

//OUR ERROR UTILITY FUNCTION
const catchAsync = require('../utils/catchAsync');

// //OUR CUSTOM ERROR CLASS
const ExpressError = require('../utils/ExpressError');


const { campgroundSchema } = require('../schemas.js');
const Campground = require('../models/campground');

//IMPORT FROM MIDDLEWARE FILE
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//MULTER MIDDLEWARE
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    // .post(upload.array('image') ,(req,res)=>{
    //     console.log(req.body,req.files);
    //     res.send("it worked!!")
    // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;
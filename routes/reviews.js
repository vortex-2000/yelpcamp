const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


const reviews = require('../controllers/reviews');

// //OUR CUSTOM ERROR CLASS
const ExpressError = require('../utils/ExpressError');
//OUR ERROR UTILITY FUNCTION
const catchAsync = require('../utils/catchAsync');


const Campground = require('../models/campground');
const Review = require('../models/review');






//REVIEW

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))                           //'/campgrounds/:id/reviews'

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;
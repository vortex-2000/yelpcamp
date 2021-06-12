// const express= require('express');
// const path=require('path');
// const mongoose=require('mongoose');
// const methodOverride=require('method-override');
// const ejsMate=require('ejs-mate');


// const Campground=require('./models/campground');

// //OUR ERROR UTILITY FUNCTION
// const catchAsync=require('./utils/catchAsync');
// //OUR CUSTOM ERROR CLASS
// const ExpressError=require('./utils/ExpressError');
// //VALIDATION API
// const Joi=require('joi');
// //VALIDATION SCHEMA
// const { campgroundSchema, reviewSchema } = require('./schemas.js');

// const Review= require('./models/review');


// mongoose.connect('mongodb://localhost:27017/yelp-camp',{
//     useNewUrlParser:true,
//     useCreateIndex:true,
//     useUnifiedTopology:true
// })
// const db= mongoose.connection;
// db.on("error",console.error.bind(console,"connection error"));
// db.once("open",()=>{
//     console.log("db connected");
// })
// db.on("error",console.error.bind(console,""))

// const app=express();


// app.set('view engine','ejs');
// app.set('views',path.join(__dirname,'views'))


// app.use(express.urlencoded({extended:true}));
// app.use(methodOverride('_method'));

// app.engine('ejs',ejsMate);

// // DEFINING *****SERVER-SIDE***** VALIDATION MIDDLEWARE FOR REUSABILITY IN POST AND PUT ROUTES
// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }
// //"""""""""""""" ^  FOR REVIEWS
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }


// app.get('/',async(req,res)=>{
//     res.render('home')
// });


// app.get('/campgrounds', async(req,res)=>{
//     const campgrounds=await Campground.find({});
//     res.render('campgrounds/index',{campgrounds})
// });

// //CREATE
// app.get('/campgrounds/new', async(req,res)=>{
//     res.render('campgrounds/new');
// });

// app.post('/campgrounds',validateCampground,catchAsync(async(req,res,next)=>{
//         const campground= new Campground(req.body.campground);
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`);

// }))



// //READ
// app.get('/campgrounds/:id', catchAsync(async(req,res)=>{                        //ERROR HANDLED BY ERROR UTILITY FN
//    const campground=await Campground.findById(req.params.id).populate('reviews');
//    //console.log(campground);
//    res.render('campgrounds/show',{campground})
// }));



// //UPDATE
// app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
//     const campground= await Campground.findById(req.params.id);
//     res.render('campgrounds/edit',{campground});
// }));

// app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
//     const {id}=req.params;
//     const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground})
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// //DELETE
// app.delete("/campgrounds/:id",catchAsync(async(req,res)=>{
//     const {id}=req.params;
//     const campground=await Campground.findByIdAndDelete(id);
//     res.redirect(`/campgrounds`)
// }));

// //REVIEW
// app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))

// app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
// }))


// app.all('*',(req,res,next)=>{
//     next(new ExpressError('Page Not Found',404))
// })

// //ERROR-HANDLER
// app.use((err,req,res,next)=>{
//     const {statusCode=500}=err;
//     if(!err.message) err.message='Oh NO!!!!';
//     res.status(statusCode).render('error',{err});

// })

// app.listen(3000,()=>{
//     console.log("CONNECTION SUCCESS!")
// })



// //##CLIENT SIDE VALIDATION ARE NOT USEFUL EVEN IF WE STOP USER FROM SUBMITTING FORM A USER CAN STILL
// //SUBMIT USING OTHER WAYS LIKE POSTMAN

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//console.log(process.env.SECRET)

const express= require('express');
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');



const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


const mongoSanitize = require('express-mongo-sanitize');   //security db $ qeury

const MongoDBStore=require("connect-mongo")(session);

//const dbUrl=process.env.DB_URL;********************GLOBAL DB FROM MONGO ATLAS CAN BE USE IN PRODUCTION MODE*****************

//const dbUrl='mongodb://localhost:27017/yelp-camp'****** LOCAL DB CURRENTLY BEING USED IN DEVELOPMENT MODE********

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//DATABASE
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



const app = express();



app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

//SESSION
const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {                                                       //WE DONT WANT TO STAY FOREVER LOGGED IN SO WE DELETE COOKIE AFTER SOME TIME
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


//MIDDLEWARES
app.use(session(sessionConfig))
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());           //  puts user in a session
passport.deserializeUser(User.deserializeUser());       //  removes user out of a session




app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



//APPEND THESE BEFORE.....IN ALL OUR ROUTERS
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


//ERROR-HANDLER
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message='Oh NO SOMETHING IS NOT RIGHT!!!!';
    res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
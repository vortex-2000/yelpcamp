const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review = require('./review');


const ImageSchema = new Schema({
    url: String,
    filename: String
});

//THIS WILL JUST LOOK AS IF IT IS STORED IN DB BUT ACTUALLY WE ARE JUST MODIFING THE URL AND DIRECTLY SENDING IT TO SERVER
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } };    //to include virtual in the json as mongoose dont include them by default



const campgroundSchema=new Schema({                        //MADE A SCHEMA
    title:String,
    price:Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [ImageSchema],
    description:String,
    location:String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{                                              //ARRAY OF REVIEWS TO STORE MULTIPLE REVS
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]

},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


campgroundSchema.post('findOneAndDelete', async function (doc) {            //MIDDLEWARE TO DELETE ALL REVIEWS AFTER A CAMP IS DELETED
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports=mongoose.model('Campground',campgroundSchema);              //MADE A MODEL AND EXPORTED IT
                                                                           //MODEL ARE ALWAYS CAPITAL LETTER START


//OUR ENTITY (CAMPGROUND) IS MADE IN CREATE ROUTE

//SCHEMA->MODEL->ENTITY/DOCUMENT/OBJECT
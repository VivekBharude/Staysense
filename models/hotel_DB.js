let mongoose = require('mongoose');
let hotelSchema = new mongoose.Schema({
     name: {
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     images: [
		{
			url: String,
			filename: String
		}
	],
     address:{
        type:String,
        required:true
     },
     price:{
      type: Number,
      required:true
     },
     overAllRating: {
     price: Number,
    description: String,
    type: Number,
    default: 0
 },
   reviews: [
    {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'review'
    }
 ],
 description:{
   type:String,
   required:true
 },
 geometry: {
   type: {
      type: String,
      enum: [ 'Point' ],
      required: true
   },
   coordinates: {
      type: [ Number ],
      required: true
   }
},

});
let Hotel = mongoose.model('hotel',hotelSchema);
module.exports = Hotel;
let express = require('express');
let router = express.Router();
let Review = require('../models/review_DB');
let Hotel = require('../models/hotel_DB');
let { isLoggedIn,isReviewAuthor } = require('../middlewares/index');

router.post('/hotelIndex/:id/reviews', isLoggedIn, async (req, res) => {
	try {
		// make a new review and store it into db
		let newReview = new Review(req.body.review);
		newReview.author = req.user;
		await newReview.save();
		// take that review and push that into the hotel
		let hotel = await Hotel.findById(req.params.id);
		hotel.overAllRating = ((hotel.overAllRating*hotel.reviews.length) + newReview.rating)/(hotel.reviews.length+1);
		hotel.overAllRating = hotel.overAllRating.toFixed(1);
		hotel.reviews.push(newReview);
		await hotel.save();
		// redirect somewhere
		
		res.redirect(`/hotelIndex/${req.params.id}`); // show page
	} catch (error) {
		console.log(error);
		res.redirect(`/hotelIndex/${req.params.id}`);
	}
});
// delete
router.delete('/hotelIndex/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, async (req, res) => {
	try {
		await Review.findByIdAndDelete(req.params.reviewId);
		res.redirect(`/hotelIndex/${req.params.id}`);
	} catch (error) {
		console.log(error);
		res.redirect(`/hotelIndex/${req.params.id}`);
	}
});
module.exports = router;
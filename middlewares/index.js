let Review = require('../models/review_DB');
let Hotel = require('../models/hotel_DB');

const isLoggedIn = (req,res,next)=>{
    if(req.user && req.isAuthenticated){
        next();
    }
    else{
        console.log('you are not logged in');
		res.redirect('/login');
    }
}
const isAdmin = (req,res,next)=>{
    if(req.user && req.user.isAdmin){
        next();
    }
    else{
        return res.send('you dont have permission to do that');
    }
}
const isReviewAuthor = async (req, res, next) => {
	let { reviewId } = req.params;
	let review = await Review.findById(reviewId).populate('author');
	if (review.author._id.equals(req.user._id)) {
		next();
	} else {
		req.flash('error', 'you are not permitted to do that');
		res.redirect('back');
	}
};
module.exports = {
	isLoggedIn,
	isAdmin, isReviewAuthor
};
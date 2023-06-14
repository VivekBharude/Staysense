let express = require('express');
let router = express.Router();
let User = require('../models/user_DB')
let passport = require('passport');

router.get('/register' ,(req,res)=>{
    res.render('register');
});
router.post('/register', async (req,res)=>{
    try {
		let user =new User({
		        username:req.body.username,
		        email:req.body.email
		
		    })
		    let registeredUser = await User.register(user, req.body.password);
		    req.login(registeredUser, function(err) {
				if (err) {
					console.log('error while registering user',error);
				}
				res.redirect('/hotelIndex');
			});
	} catch (error) {
		console.log('error while registering user',error);
	}
})
router.get('/login' ,(req,res)=>{
    res.render('login');
})

router.post(
	'/login',
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login'
	}),
	(req, res) => {
		
		let redirectUrl = req.session.returnTo || '/hotelIndex';

		// delete req.session.returnTo;
		res.redirect(redirectUrl);
		req.flash('success', 'welcome back user');
	}

);
router.get('/logout',(req, res) => {
	// use default passport logout function
	req.logOut(function(err) {
		if (err) {
			console.log('error while logout');
		}
		res.redirect('/');
	});
});












module.exports = router;
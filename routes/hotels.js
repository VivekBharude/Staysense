let express = require('express');
let router = express.Router();
let Hotel = require('../models/hotel_DB');
let { isLoggedIn, isAdmin } = require('../middlewares/index');

// ! cloud upload
const multer = require('multer');
const { storage } = require('../cloudinary/cloud_config');
const upload = multer({ storage });


const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// router.get('/' , );
router.get('/' , (req,res)=>{
    res.render('landing');
});
router.get('/hotelIndex',isLoggedIn, async(req,res)=>{
    try {
        let foundHotels = await Hotel.find({});
        res.render('hotelIndex', {foundHotels});
    } catch (error) {
        req.flash('error', 'error while fetching hotels, please try again later');
        console.log("Error", error.message);
    }
})

router.get('/hotelIndex/newHotel' ,isLoggedIn,isAdmin, (req,res)=>{
    res.render('newHotel');
});
router.post('/hotelIndex',isLoggedIn, upload.array('image'), async(req,res)=>{
    try {
        let newHotel = new Hotel({
            name: req.body.name,
            email:req.body.email,
            image:req.body.image,
            address: req.body.address,
            price:req.body.price,
            description: req.body.description
           
        });
        // let newHotel = new Hotel(req.body.hotel);

        for (let file of req.files) {
			newHotel.images.push({
				url: file.path,
				filename: file.filename
			});
		}
        const geoData = await geoCoder
        .forwardGeocode({
            query: req.body.address,
            limit: 1
        })
        .send();
        console.log( geoData.body.features[0].geometry)
    newHotel.geometry = geoData.body.features[0].geometry;
        




        await newHotel.save();
        req.flash('success', 'Hotel successfully posted');
        res.redirect('/hotelIndex');
    } catch (error) {
        console.log("Error", error.message);
    }
})
router.get('/hotelIndex/:id', async (req,res)=>{
    try {
        let id = req.params.id;
        let hotel =await Hotel.findById(id)
                    .populate({
                        path: 'reviews',
                        populate: {
                            path: 'author'
                        }
                    });
         

        let coordinates = hotel.geometry.coordinates;
        res.render('showHotel',{hotel, coordinates});
    } catch (error) {
        req.flash('error', 'error while fetching hotels, please try again later');
        res.redirect('/hotelIndex');
    }
})
router.get('/hotelIndex/:id/edit' ,isLoggedIn,isAdmin, async(req,res)=>{
     try {
        let id = req.params.id;
        let hotel = await Hotel.findById(id);
        res.render('editHotel',{hotel});
        req.flash('success', 'edited');
     } catch (error) {
        req.flash('error', 'error while fetching hotels, please try again later');
        console.log("Error", error.message);
     }
} )
 router.patch('/hotelIndex/:id' ,isLoggedIn,isAdmin, async(req,res)=>{
    try {
        let id = req.params.id;
        let updatedHotel = {
            name: req.body.name,
            email:req.body.email,
            image:req.body.image,
            address: req.body.address,
            price:req.body.price,
            description: req.body.description
           
        };
        await Hotel.findByIdAndUpdate(id,updatedHotel);
        res.redirect('/hotelIndex');
        
    } catch (error) {
        console.log("Error", error.message);
    }
 })
 router.delete('/hotelIndex/:id',isLoggedIn,isAdmin, async(req,res)=>{
    try {
        let id = req.params.id;
        await Hotel.findByIdAndDelete(id);
        res.redirect('/hotelIndex');
        
    } catch (error) {
        console.log("Error", error.message);
    }
 })
// router.post()

router.get('/hotelIndex/:id/checkout/success', (req, res) => {
	const paymentInfo = req.session.paymentInfo;
	// res.render('hotelIndex/success.ejs', { details: paymentInfo, page: 'Success Hotel' });
    res.send('paymenet  Successful')
});
router.get('/hotelIndex/:id/checkout/cancel', (req, res) => {
	const paymentInfo = req.session.paymentInfo;
	// res.render('hotelIndex/failed.ejs', { details: paymentInfo, page: 'Failed Hotel' });
    res.send('paymenet canceled or failed')
});
router.post('/hotelIndex/:id/checkout', isLoggedIn, async (req, res) => {
	try {
		const hotel = await Hotel.findById(req.params.id);
		const total = parseInt(req.body.adults) + parseInt(req.body.children);
		if (total === 0) return res.redirect(`/hotels/${req.params.id}`);
		const rooms = Math.ceil(total / 3);
		console.log(req.body);
		const diffTime = Math.abs(new Date(req.body.checkOutDate) - new Date(req.body.checkInDate));
		const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
		console.log(total, rooms, diffTime, days);
		const session = await stripe.checkout.sessions.create({
			payment_method_types: [ 'card' ],
			customer_email: req.user.email,
			line_items: [
				{
					price_data: {
						currency: 'inr',
						product_data: {
							name: hotel.name,
							description: hotel.address,
							images: [ hotel.images[0].url ]
						},
						unit_amount: hotel.price * 100
					},
					quantity: rooms*days
				}
			],
			mode: 'payment',
			success_url: `${process.env.URL_SERV}/hotelIndex/${hotel._id}/checkout/success`,
			cancel_url: `${process.env.URL_SERV}/hotelIndex/${hotel._id}/checkout/cancel`
		});
		const paymentInfo = {
			...req.body,
			hotelName: hotel.name,
			hotelAddress: hotel.address,
			hotelPrice: hotel.price,
			userEmail: req.user.email,
			userName: req.user.username,
			rooms,
			days
		};
		req.session.paymentInfo = paymentInfo;
		res.redirect(session.url);
	} catch (error) {
		req.flash('error', 'error while processing the request, please try again later');
		console.log(error);
		res.redirect(`/hotelIndex/${req.params.id}`);
	}
});


module.exports = router;
let express = require('express');
let router = express.Router();
// let {isLoggedIn} =require('../middlewares/index')
let User = require('../models/user_DB');
const { isLoggedIn } = require('../middlewares');


router.get('/user/:id' ,isLoggedIn, async(req,res)=>{
    try {
     let user = await User.findById(req.params.id);
    res.render('user/show', { user });
          
    } catch (error) {
        console.log(error);
		res.redirect('/hotels');
    }
});

module.exports = router;
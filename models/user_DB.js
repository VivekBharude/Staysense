let mongoose =require('mongoose');
let passportLocalMongoose= require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
    username: {
		type: String,
		required: true,
		unique: true
	},
    email:{
        type:String,
        required:true
    },
    isAdmin:{
           type:Boolean,
           default:false,
    }

});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('user', userSchema);
module.exports = User;
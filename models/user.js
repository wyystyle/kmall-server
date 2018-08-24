//数据模板

const mongoose = require('mongoose');
		

const UserSchema = new mongoose.Schema({

  username:{
  	type:String
  },
  password:{
  	type:String
  },
  isAdmin:{
  	type:Boolean,
  	default:true//默认是普通用户
  }

});


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;

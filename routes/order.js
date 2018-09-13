const Router = require('express').Router;
const router = Router();
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const ProductModel = require('../models/product.js');
router.get('/',(req,res)=>{
	UserModel.findById(req.userInfo._id)
		.then((user)=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
		.catch(e=>{
			res.json({
				coed:1,
				message:'获取订单失败'
			})
		})

})	


module.exports = router;
const Router = require('express').Router;
const router = Router();
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const ProductModel = require('../models/product.js');
	
router.get('/userInfo',(req,res)=>{
	if(req.userInfo._id){
		res.json({
			code:0,
			data:req.userInfo
		})
	}else{
		res.json({
			code:1
		})
	}

});

router.post('/',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if(cartItem){
				cartItem.count = parseInt(body.count) + cartItem.count
			}else{
				user.cart.cartList.push({
					product:body.productId,
					count:body.count
				}) 
			}
			
		}else{
			user.cart={
				cartList:[
					{
						product:body.productId,
						count:body.count
					}
				]
			}
		}
		user.save()
		.then(newUser=>{
			res.json({
				code:0,
				message:"购物车添加成功"
			})
		})
	})

})	




module.exports = router;
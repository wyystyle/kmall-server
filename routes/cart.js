const Router = require('express').Router;
const router = Router();
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const ProductModel = require('../models/product.js');

router.get('/getCount',(req,res)=>{
	if(req.userInfo._id){
		UserModel.findById(req.userInfo._id)
		.then((user)=>{
			if(user.cart){
				let count = 0
				user.cart.cartList.forEach(item=>{
					if(item.checked){
						count += item.count
					}
				})
				res.json({
					code:0,
					data:count
				})
			}else{
				res.json({
					code:0,
					data:0
				})
			}
		})
	}else{
		res.json({
					code:0,
					data:0
				})
	}
	
})
	
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
				message:'获取购物车失败'
			})
		})

})	
router.put('/selectOne',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if(cartItem){
				cartItem.checked = true;
			}else{
				res.json({
					code:1,
					message:'购物车记录不存在'
				})
			}
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/unselectOne',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			let cartItem = user.cart.cartList.find((item)=>{
				return item.product == body.productId;
			})
			if(cartItem){
				cartItem.checked = false;
			}else{
				res.json({
					code:1,
					message:'购物车记录不存在'
				})
			}
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/selectAll',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			user.cart.cartList.forEach(item=>{
				item.checked = true;
			})
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/unselectAll',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			user.cart.cartList.forEach(item=>{
				item.checked = false;
			})
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/deleteOne',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			let newCartList = user.cart.cartList.filter(item=>{
				return item.product != req.body.productId;
			})
			user.cart.cartList = newCartList;
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/deleteSelected',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			let newCartList = user.cart.cartList.filter(item=>{
				return item.checked != false;
			})
			user.cart.cartList = newCartList;
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})
router.put('/updateCount',(req,res)=>{
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.cart){
			user.cart.cartList.forEach(item=>{
				if(item.product == req.body.productId){
					item.count = req.body.count
				}
			})
		}else{
			res.json({
				code:1,
				message:'还没有购物车'
			})
		}
		user.save()
		.then(newUser=>{
			user.getCart()
			.then(cart=>{
				res.json({
					code:0,
					data:cart
				})
			})
		})
	})
})


module.exports = router;
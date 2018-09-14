const Router = require('express').Router;
const router = Router();
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const ProductModel = require('../models/product.js');
router.post('/',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		if(user.shipping){
			user.shipping.push(body)
		}else{
			user.shipping = [body]
		}
		user.save()
		.then((newUser)=>{
			res.json({
				code:0,
				data:user.shipping
			})
		})
	})

})
//获取地址数据
router.get('/list',(req,res)=>{
	UserModel.findById(req.userInfo._id)
		.then((user)=>{
			res.json({
					code:0,
					data:user.shipping
				})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"获取地址失败"
			})
		})

})
router.put('/delete',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
	.then((user)=>{
		user.shipping.id(body.shippingId).remove();
		user.save()
		.then((newUser)=>{
			res.json({
				code:0,
				data:user.shipping
			})
		})
	})

})

router.get('/edit',(req,res)=>{
	let shippingId = req.query.shippingId;
	console.log(shippingId)
	UserModel.findById(req.userInfo._id)
		.then((user)=>{
			let data = user.shipping.id(shippingId)
				res.json({
					code:0,
					data:data
				})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"获取地址失败"
			})
		})

})
router.put('/',(req,res)=>{
	let body = req.body;
	UserModel.findById(req.userInfo._id)
		.then((user)=>{
			let shipping = user.shipping.id(body.shippingId)
			shipping.name=body.name;
			shipping.province=body.province;
			shipping.city=body.city;
			shipping.address=body.address;
			shipping.phone=body.phone;
			shipping.zip=body.zip;
			user.save()
			.then(newUser=>{
				res.json({
					code:0,
					data:user.shipping
				})
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"编辑地址失败"
			})
		})

})
	


module.exports = router;
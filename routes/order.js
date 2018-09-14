const Router = require('express').Router;
const router = Router();
const OrderModel = require('../models/order.js');
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
//创建订单
router.post('/',(req,res)=>{
	UserModel.findById(req.userInfo._id)
		.then((user)=>{
			let order = {};
			user.getOrderProductList()
			.then(result=>{

				order.payment = result.totalCartPrice;
				let productList = [];
				result.cartList.forEach(item=>{
					productList.push({
						productId:item.product._id,
						count:item.count,
						totalPrice:item.totalPrice,
						price:item.product.price,
						images:item.product.images,
						name:item.product.name
					})
				})
				order.productList = productList;
				//地址信息
				let shipping = user.shipping.id(req,body.shippingId);
				order.shipping = {
					shippingId:shipping._id,
					name:shipping.name,
					province:shipping.province,
					city:shipping.city,
					address:shipping.address,
					phone:shipping.phone,
					zip:shipping.zip
				}
				order.orderNo = Date.noe().toString()+parseInt(Math.random()*10000);
				order.user = user._id;

				new OrderModel(order)
				.save()
				.then(newOrder=>{
					res.json({
						code:0,
						data:newOrder	
					})
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
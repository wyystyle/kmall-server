const Router = require('express').Router;
const router = Router();
const OrderModel = require('../models/order.js');
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js');
const ProductModel = require('../models/product.js');
router.get('/',(req,res)=>{
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
			user.getCart()
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
				let shipping = user.shipping.id(req.body.shippingId);
				order.shipping = {
					shippingId:shipping._id,
					name:shipping.name,
					province:shipping.province,
					city:shipping.city,
					address:shipping.address,
					phone:shipping.phone,
					zip:shipping.zip
				}
				order.orderNo = Date.now().toString()+parseInt(Math.random()*10000);
				order.user = user._id;

				new OrderModel(order)
				.save()
				.then(newOrder=>{
					UserModel.findById(req.userInfo._id)
					.then(userUser=>{
						let newCartList = user.cart.cartList.filter(item=>{
							return item.checked == false;
						})
						user.cart.cartList = newCartList;
					})
					user.save()
					.then(newUser=>{
						res.json({
							code:0,
							data:newOrder	
						})
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
router.get('/list',(req,res)=>{
	let page = req.query.page;
	let query = {user:req.userInfo._id}; 
	let projection = "-__v";
	let sort = {_id:-1};
	OrderModel
		.getPaginationProducts(page,query,projection,sort)
		.then((result)=>{
			res.json({
				code:0,
				message:'获取成功',
				data:{
					current:result.current,
					total:result.total,
					pageSize:result.pageSize,
					list:result.list			
				}
			})	
		})

})	
router.get('/detail',(req,res)=>{
	let orderNo = req.query.orderNo;
	OrderModel.findOne({orderNo:orderNo,user:req.userInfo._id})
		.then(order=>{
			res.json({
				code:0,
				data:order
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"获取订单失败"
			})
		})

})	
router.put('/cancel',(req,res)=>{
	let orderNo = req.body.orderNo;
	OrderModel.findOneAndUpdate(
		{orderNo:orderNo,user:req.userInfo._id},
		{status:'20',statusDesc:"取消"},
		{new:true}
		)
		.then(order=>{
			res.json({
				code:0,
				data:order
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"更新订单失败"
			})
		})

})

router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send({
			code:10
		})	
	}
	
})
router.get('/home/list',(req,res)=>{
	let page = req.query.page;
	let query = {}; 
	let projection = "-__v";
	let sort = {_id:-1};
	OrderModel
		.getPaginationProducts(page,query,projection,sort)
		.then((result)=>{
			res.json({
				code:0,
				data:{
					current:result.current,
					total:result.total,
					pageSize:result.pageSize,
					list:result.list			
				}
			})	
		})

})	
router.get('/home/detail',(req,res)=>{
	let orderNo = req.query.orderNo;
	OrderModel.findOne({orderNo:orderNo})
		.then(order=>{
			res.json({
				code:0,
				data:order
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"获取订单失败"
			})
		})

})	
	

router.get("/home/search",(req,res)=>{
	let keyword = req.query.keyword;
	let page = req.query.page;
		OrderModel
		.getPaginationProducts(page,{orderNo:
			{$regex:new RegExp(keyword,'i')}
		})
		.then((result)=>{
			res.json({
				code:0,
				message:'获取成功',
				data:{
					keyword:keyword,
					current:result.current,
					total:result.total,
					pageSize:result.pageSize,
					list:result.list			
				}
			})	
		})
});	
router.put('/home/deliver',(req,res)=>{
	let orderNo = req.body.orderNo;
	OrderModel.findOneAndUpdate(
		{orderNo:orderNo},
		{status:'40',statusDesc:"已发货"},
		{new:true}
		)
		.then(order=>{
			res.json({
				code:0,
				data:order
			})
		})
		.catch(e=>{
			res.json({
				code:1,
				message:"更新订单失败"
			})
		})

})

module.exports = router;
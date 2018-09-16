const Router = require('express').Router;
const router = Router();
const OrderModel = require('../models/order.js');
router.get('/info',(req,res)=>{
	res.json({
		code:0,
		data:{
			orderNo:req.query.orderNo,
			qrUrl:"http://127.0.0.1:3000/alipay-qr/pay.gif"
		}
	})
});
router.get('/status',(req,res)=>{
	let orderNo = req.query.orderNo;
	OrderModel.findOne({orderNo:orderNo},'status')
		.then(order=>{
			res.json({
				code:0,
				data:order.status == 30 
			})
		})
});

module.exports = router;
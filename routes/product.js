const Router = require('express').Router;
const ProductModel = require('../models/product.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product_images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })
const router = Router();

router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send({
			code:10
		})	
	}
	
})
router.post("/uploadimage",upload.single('file'),(req,res)=>{
	
	const filePath = 'http://127.0.0.1:3000/product_images/'+req.file.filename;
	res.send(filePath)

})

router.post("/uploadDetalimage",upload.single('upload'),(req,res)=>{
	
	const filePath = 'http://127.0.0.1:3000/product_images/'+req.file.filename;
	res.json({
		"success": true,
		"msg": "上传成功",
		"file_path": filePath
	})

})
router.post("/save",(req,res)=>{
	let body = req.body;
		new ProductModel({
			Sketch:body.Sketch,
			images:body.images,
			price:body.price,
			shopnum:body.shopnum,
			name:body.name,
			details:body.details,
			CategoryId:body.categoryId
		})
		.save()
		.then((newProduct)=>{
			if(newProduct){
				ProductModel
				.getPaginationProducts(1,{})
				.then((result)=>{
					res.json({
						code:0,
						data:{
							Sketch:newProduct.Sketch,
							images:newProduct.images,
							price:newProduct.price,
							shopnum:newProduct.shopnum,
							name:newProduct.name,
							details:newProduct.details,

							current:result.current,
							total:result.total,
							pageSize:result.pageSize,
							list:result.list					
						}
					})	
				})
			}
		})
	})

router.get("/",(req,res)=>{

	let page = req.query.page;
	// console.log(id)
		ProductModel
		.getPaginationProducts(page,{})
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
});

router.put("/updateOrder",(req,res)=>{
	let body = req.body;
	console.log(body)
		ProductModel
		.update({_id:body.id},{order:body.order})
		.then((cate)=>{
			if(cate){
				ProductModel
				.getPaginationProducts(body.page,{})
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
			}else{
				res.json({
				code:1,
				message:"更新排序失败，服务器数据错误"						
			})
		}
	})	

});
router.put("/updateStates",(req,res)=>{
	let body = req.body;
		ProductModel
		.update({_id:body.id},{states:body.states})
		.then((cate)=>{
			if(cate){
				ProductModel
				.getPaginationProducts(body.page,{})
				.then((result)=>{
					res.json({
						code:0,
						states:result.states,
						message:'更新成功'
					})	
				})
			}else{
				res.json({
				code:1,
				message:"更新失败，服务器数据错误"	,
				data:{
					current:result.current,
					total:result.total,
					pageSize:result.pageSize,
					list:result.list					
				}					
			})
		}
	})	

});

router.get("/edit",(req,res)=>{

	let id = req.query.id;
	// console.log(id)
		ProductModel.findById(id,'-__v -order -states -createdAt -updatedAt')
			.populate({path:"CategoryId",select:"_id pid"})
			.then((result)=>{
				if(result){
					res.json({
						code:0,
						data:result				
					})
				}else{
					res.json({
						code:1,
						message:"获取数据失败"			
					})
				}
			});	
	});









/*router.get("/",(req,res)=>{

	let pid = req.query.pid;
	let page = req.query.page;
	// console.log(id)
	if(page){
		ProductModel
		.getPaginationProducts(page,{pid:pid})
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
	}else{
		ProductModel.find("_id name pid order states")
			.then((product)=>{
					res.json({
						code:0,
						data:product
					})		
			})
			.catch(e=>{
				message:"获取商品失败，服务器数据错误"	
		})
	}	
});*/














module.exports = router;
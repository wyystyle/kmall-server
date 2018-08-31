const Router = require('express').Router;
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









router.post("/",(req,res)=>{
	let body = req.body;
	CategoryModel
		.findOne({name:body.name,pid:body.pid})
		.then((cate)=>{
			if(cate){//提示错误信息
				res.json({
					code:1,
					message:"添加失败，分类已存在"
				})
			}else{
				new CategoryModel({
					name:body.name,
					pid:body.pid
				})
				.save()
				.then((newCate)=>{
					if(newCate){
						if(body.pid==0){
							CategoryModel.find({pid:0},"_id neme")
							.then((data)=>{
									res.json({
										code:0,
										data:data
									})
							})
						}else{
							res.json({
								code:0
							})
						}
					}

				})
				.catch((e)=>{
					res.json({
						code:1,
						message:"添加失败，服务器数据错误"						
					})
				})
			}
		})
	
	})

router.get("/",(req,res)=>{

	let pid = req.query.pid;
	let page = req.query.page;
	// console.log(id)
	if(page){
		CategoryModel
		.getPaginationCategories(page,{pid:pid})
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
		CategoryModel.find({pid:pid},"_id name pid order")
			.then((categories)=>{
					res.json({
						code:0,
						data:categories
					})		
			})
			.catch(e=>{
				message:"获取分类失败，服务器数据错误"	
		})
	}	
});
router.put("/updateName",(req,res)=>{
	let body = req.body;
	CategoryModel
		.findOne({_id:body.id,pid:body.pid,name:body.name})
		.then((cate)=>{
			if(cate){//提示错误信息
				res.json({
					code:1,
					message:"分类已存在，从新分类"
				})
			}else{
				CategoryModel
				.update({_id:body.id},{name:body.name})
				.then((cate)=>{
					if(cate){
						CategoryModel
						.getPaginationCategories(body.page,{pid:body.pid})
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
						message:"更新失败，服务器数据错误"						
					})
				}
			})
			.catch((e)=>{
				res.json({
					code:1,
					message:"添加失败，服务器数据错误"						
				})
			})
		}
	})

});
router.put("/updateOrder",(req,res)=>{
	let body = req.body;
	console.log(body)
		CategoryModel
		.update({_id:body.id},{order:body.order})
		.then((cate)=>{
			if(cate){
				CategoryModel
				.getPaginationCategories(body.page,{pid:body.pid})
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







/*router.post("/add",(req,res)=>{

		res.render('admin/category_add_edit',{
			userInfo:req.userInfo
		});
	});
router.post("/add",(req,res)=>{
	let body = req.body;
	CategoryModel
		.findOne({name:body.name})
		.then((cate)=>{
			if(cate){//提示错误信息
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'分类名已经存在',
					url:'/category/add',
				})
			}else{
				new CategoryModel({
					name:body.name,
					order:body.order
				})
				.save()
				.then((newCate)=>{
					if(newCate){
						res.render('admin/success',{
							userInfo:req.userInfo,
							message:'新增分类成功',
							url:'/category/add',
							
						})
					}

				})
				.catch((e)=>{
					res.render('admin/error',{
						userInfo:req.userInfo,
						message:'数据库插入数据失败',
						url:'/category/add',
					})
				})
			}
		})
	
	})*/

router.get("/edit/:id",(req,res)=>{

	let id = req.params.id;
	// console.log(id)
		CategoryModel.findById(id)
			.then((category)=>{

				res.render('admin/category_add_edit',{
						userInfo:req.userInfo,
						category:category

					});
				
			});	
	});
router.post('/edit',(req,res)=>{
	let body = req.body;
	// console.log(body)
	CategoryModel.findOne({name:body.name})
		.then((category)=>{
			if(category && category.order == body.order){
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'编辑失败，分类名已经存在',
					url:'/category',
				})
			}else{
					CategoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
						if(!err){
							res.render('admin/success',{
								userInfo:req.userInfo,
								message:'编辑分类成功',
								url:'/category',
							})
						}else{
							res.render('admin/error',{
								userInfo:req.userInfo,
								message:'编辑失败，数据库插入数据失败',
								url:'/category',
							})
						}
					})
				}
			})
})
router.get("/delete/:id",(req,res)=>{

	let id = req.params.id;
	// console.log(id)
		CategoryModel.remove({_id:id},(err,raw)=>{
			if(!err){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除分类成功',
					url:'/category',
				})
			}else{
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'删除分类失败',
					url:'/category',
				})
			}
		})
			
	});
module.exports = router;
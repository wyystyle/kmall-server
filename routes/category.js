const Router = require('express').Router;
const CategoryModel = require('../models/category.js');
const pagination = require('../util/pagination.js');

const router = Router();




router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send('<h1>请用管理员账号登录</h1>')	
	}
	
})
router.get("/",(req,res)=>{
	/*CategoryModel
	.find()
	.then((user)=>{

		res.render('admin/category_list',{
			userInfo:req.userInfo,
			users:user,
		});
	})*/
	let options={
		page:req.query.page,
		model:CategoryModel,
		query:{},
		projection:'_id name order',
		sort:{order:1}
	}



	pagination(options)
		.then((data)=>{
			res.render('admin/category_list',{
				userInfo:req.userInfo,
				categories:data.docs,
				page:data.page,
				list:data.list,
				url:'/category',
				pages:data.pages
			
			})
		})		
});
router.get("/add",(req,res)=>{

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
	
	})

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
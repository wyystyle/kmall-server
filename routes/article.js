
const Router = require('express').Router;
const ArticleModel = require('../models/article.js');
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
/*	let options={
		page:req.query.page,
		model:ArticleModel,
		query:{},
		projection:'-__v',
		sort:{_id:-1},
		populate:[{path:'user',select:'username'},{path:'category',select:'name'}]	
	}
	pagination(options)*/

	ArticleModel.getPaginationArticles(req)
		.then((data)=>{
			// console.log(data)
			res.render('admin/article',{
				userInfo:req.userInfo,
				articles:data.docs,
				page:data.page,
				list:data.list,
				url:'/article',
				pages:data.pages
			
			})
		})		
});

router.get('/add',(req,res)=>{
	CategoryModel.find({},'_id name')
		.sort({order:1})
		.then((categories)=>{
			res.render('admin/article_add',{
				userInfo:req.userInfo,
				categories:categories
			})

		})
});

router.post('/add',(req,res)=>{
	let body = req.body;
	new ArticleModel({
		category:body.category,
		user:req.userInfo._id,
		title:body.title,
		intro:body.intro,
		content:body.content
	})
	.save()
	.then((article)=>{
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'新增分类成功',
			url:'/article',
		})
	})
	.catch((e)=>{
		res.render('admin/error',{
			userInfo:req.userInfo,
			message:'新增分类失败',
			url:'/article',
		})
	})
})
router.get("/delete/:id",(req,res)=>{

	let id = req.params.id;
	
		ArticleModel.remove({_id:id},(err,raw)=>{
			if(!err){
				res.render('admin/success',{
					userInfo:req.userInfo,
					message:'删除文章成功',
					url:'/article',
				})
			}else{
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'删除文章失败',
					url:'/article',
				})
			}
		})
			
	});
// router.post('/edit',(req,res)=>{
// 	let body = req.body;
// 	// console.log(body)
// 	CategoryModel.findOne({name:body.name})
// 		.then((category)=>{
// 			if(category && category.order == body.order){
// 				res.render('admin/error',{
// 					userInfo:req.userInfo,
// 					message:'编辑失败，分类名已经存在',
// 					url:'/category',
// 				})
// 			}else{
// 					CategoryModel.update({_id:body.id},{name:body.name,order:body.order},(err,raw)=>{
// 						if(!err){
// 							res.render('admin/success',{
// 								userInfo:req.userInfo,
// 								message:'编辑分类成功',
// 								url:'/category',
// 							})
// 						}else{
// 							res.render('admin/error',{
// 								userInfo:req.userInfo,
// 								message:'编辑失败，数据库插入数据失败',
// 								url:'/category',
// 							})
// 						}
// 					})
// 				}
// 			})
// })

router.get('/edit/:id',(req,res)=>{
	let id = req.params.id;
	// console.log(id)
	CategoryModel.find({},'_id name')
		.sort({order:-1})
		.then((category)=>{
			// console.log(category)
			ArticleModel.findById(id)
			
			.then((article)=>{
				
				res.render('admin/article_edit',{
						userInfo:req.userInfo,
						categories:category,
						articles:article


					})
				
			})
			.catch((e)=>{
				res.render('admin/error',{
					userInfo:req.userInfo,
					message:'获取的文章失败',
					url:'/article',
				})


			})
		})

		
})
router.post('/edit',(req,res)=>{
	let body = req.body;

	let options={
		category:body.category,
		title:body.title,
		intro:body.intro,
		content:body.content
	}
	ArticleModel.update('body._id',options,(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'编辑文章成功',
				url:'/article',
			})
		}else{
			res.render('admin/error',{
				userInfo:req.userInfo,
				message:'编辑文章失败',
				url:'/article',
			})
		}

	})
})



module.exports = router;
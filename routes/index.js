const Router = require('express').Router;
const ArticleModel = require('../models/article.js');
const CategoryModel = require('../models/category.js');
const CommentModel = require('../models/comment.js');
const pagination = require('../util/pagination.js');
const getCommonData  = require('../util/getCommonData.js');

const router = Router();

/*router.get('/',(req,res)=>{
	CategoryModel.find({},'_id name')
		.sort({order:1})
		.then((categories)=>{
				
			ArticleModel.getPaginationArticles(req)
				.then((data)=>{
					ArticleModel.find({},'_id title click')
					.sort({click:-1})
					.limit(10)
					.then((topArticles)=>{
						res.render('main/index',{
							userInfo:req.userInfo,
							articles:data.docs,
							page:data.page,
							list:data.list,
							url:'/article',
							pages:data.pages,
							categories:categories,
							site:data.site,
							topArticles:topArticles

						})
					
					})
				})		

		})
})*/
router.get("/",(req,res)=>{
	ArticleModel.getPaginationArticles(req)
	.then(pageData=>{
		getCommonData()
		.then(data=>{
			res.render('main/index',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				site:data.site,
				url:'/articles'
			});				
		})
	})
})
router.get('/articles',(req,res)=>{


			// let options={
			// 	page:req.query.page,
			// 	model:ArticleModel,
			// 	query:{},
			// 	projection:'-__v',
			// 	sort:{_id:-1},
			// 	populate:[{path:'user',select:'username'},{path:'category',select:'name'}]	
			// }



			// pagination(options)
			ArticleModel.getPaginationArticles(req)
				.then((data)=>{
					res.json({
						code:0,
						data:data
					})
				})		
})

router.get("/view/:id",(req,res)=>{
	let id = req.params.id;
	ArticleModel.findByIdAndUpdate(id,{$inc:{click:1}},{new:true})
	.populate('category','name')
	.then(article=>{
		getCommonData()
		.then(data=>{
			CommentModel.getPaginationComments(req,{article:id})
			.then(pageData=>{
				res.render('main/detail',{
					userInfo:req.userInfo,
					article:article,
					categories:data.categories,
					topArticles:data.topArticles,
					comments:pageData.docs,
					page:pageData.page,
					list:pageData.list,
					pages:pageData.pages,
					site:data.site,
					category:article.category._id.toString()
				})			      	
			})
		})
	})
})
router.get("/list/:id",(req,res)=>{
	let id = req.params.id;
	ArticleModel.getPaginationArticles(req,{category:id})
	.then(pageData=>{
		getCommonData()
		.then(data=>{
			res.render('main/list',{
				userInfo:req.userInfo,
				articles:pageData.docs,
				page:pageData.page,
				list:pageData.list,
				pages:pageData.pages,
				categories:data.categories,
				topArticles:data.topArticles,
				category:id,
				site:data.site,
				url:'/articles'
			});	

		})
	})

})



module.exports = router;
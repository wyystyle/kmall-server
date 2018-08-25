const Router = require('express').Router;

const UserModel = require('../models/user.js');
const pagination = require('../util/pagination.js');
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
const CommentModel = require('../models/comment.js')
const hmac = require('../util/hmac.js');

const fs = require('fs');
const path = require('path');
const router = Router();
/*//初始化管理账户
router.get("/init",(req,res)=>{
	//插入数据到数据库
	new UserModel({
		username:'admin',
		password:hmac('admin'),
		isAdmin:true
	})
	.save((err,newUser)=>{
		if(!err){//插入成功
			res.send('ok')
		}else{
			res.send('err')				
		}
	})
});*/

router.post("/login",(req,res)=>{
	let body = req.body;
	//定义返回数据
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}
	UserModel
	.findOne({username:body.username,password:hmac(body.password),isAdmin:true})
	.then((user)=>{
		if(user){//登录成功
			 req.session.userInfo = {
			 	_id:user._id,
			 	username:user.username,
			 	isAdmin:user.isAdmin
			 }
			 result.data = {
			 	username:user.username
			 }
			 res.json(result);
		}else{
			result.code = 1;
			result.message = '用户名和密码错误'
			res.json(result);
		}
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
router.get('/count',(req,res)=>{
	let result = {
		code : 0,
		message:'',
		data:{
			usernum:555,
			ordernum:666,
			productnum:777
		}
	}
	res.json(result)
})




/*router.use((req,res,next)=>{
	if(req.userInfo.isAdmin){
		next()
	}else{
		res.send('<h1>请用管理员账号登录</h1>')	
	}
	
})*/
router.get("/",(req,res)=>{

		res.render('admin/index',{
			userInfo:req.userInfo
		});
	});
router.get("/users",(req,res)=>{

	

	let options={
		page:req.query.page,
		model:UserModel,
		query:{},
		projection:'_id username isAdmin',
		sort:{_id:1}
	}



	pagination(options)
		.then((data)=>{
			res.render('admin/user_list',{
				userInfo:req.userInfo,
				users:data.docs,
				page:data.page,
				list:data.list,
				url:'/admin/users',
				pages:data.pages
			
			})
		})
})

router.post('/uploadImages',upload.single('upload'),(req,res)=>{
	let path = "/uploads/"+req.file.filename;
	res.json({
		uploaded:true,
        url:path
	})
})

router.get('/comments',(req,res)=>{
	CommentModel.getPaginationComments(req)
	.then(data=>{
		res.render('admin/comment_list',{
			userInfo:req.userInfo,
			comments:data.docs,
			page:data.page,
			pages:data.pages,
			list:data.list
		})
	})
})
router.get("/comment/delete/:id",(req,res)=>{
	let id = req.params.id;
	CommentModel.remove({_id:id},(err,raw)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'删除评论成功',
				url:'/admin/comments'
			})				
		}else{
	 		res.render('admin/error',{
				userInfo:req.userInfo,
				message:'删除评论失败,数据库操作失败'
			})				
		}		
	})

});
router.get("/site",(req,res)=>{
	let filePath = path.normalize(__dirname + '/../site-info.json');
	fs.readFile(filePath,(err,data)=>{
		if(!err){
			let site = JSON.parse(data);
			res.render('admin/site',{
					userInfo:req.userInfo,
					site:site
			});	
		}else{
			console.log(err)
		}
	})

})

router.post('/site',(req,res)=>{
	let body = req.body;

	let site = {
		name:body.name,
		author:{
			name:body.authorName,
			intro:body.authorIntro,
			image:body.authorImage,
			wechat:body.authorWechat
		},
		icp:body.icp
	}
	site.carouseles = [];
if(body.carouselUrl.length && (typeof body.carouselUrl == 'object')){
		for(let i = 0;i<body.carouselUrl.length;i++){
			site.carouseles.push({
				url:body.carouselUrl[i],
				path:body.carouselPath[i]
			})			
		}
	}else{
		site.carouseles.push({
			url:body.carouselUrl,
			path:body.carouselPath
		})
	}


	site.ads = [];

	if(body.adUrl.length && (typeof body.adUrl == 'object')){
		for(let i = 0;i<body.adUrl.length;i++){
			site.ads.push({
				url:body.adUrl[i],
				path:body.adPath[i]
			})			
		}
	}else{
		site.ads.push({
			url:body.adUrl,
			path:body.adPath
		})
	}
let strSite = JSON.stringify(site);

let filePath = path.normalize(__dirname + '/../site-info.json');

	fs.writeFile(filePath,strSite,(err)=>{
		if(!err){
			res.render('admin/success',{
				userInfo:req.userInfo,
				message:'更新站点信息成功',
				url:'/admin/site'
			})				
		}else{
	 		res.render('admin/error',{
				userInfo:req.userInfo,
				message:'更新站点信息失败',
				url:'/admin/site'
			})				
		}
	})
})

router.get("/password",(req,res)=>{

	res.render('admin/password',{
		userInfo:req.userInfo
	});
});

router.post('/password',(req,res)=>{
	UserModel.update({_id:req.userInfo._id},{
		password:hmac(req.body.password)
	})
	.then(raw=>{
		req.session.destroy();
		res.render('admin/success',{
			userInfo:req.userInfo,
			message:'更新密码成功',
			url:'/'
		})			
	})
})
module.exports = router;

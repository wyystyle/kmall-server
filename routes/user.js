const Router = require('express').Router;
const router = Router();
const UserModel = require('../models/user.js');
const hmac = require('../util/hmac.js')


/*router.get('/init',(req,res)=>{
	const users =[];
	for(let i=0;i<100;i++){
		users.push({
			username:'test'+i,
			password:hmac('test'+i),
			isAdmin:false,
			phone:'18864628'+i,
			email:'test'+i+'@baidu.com'
		})
	}
	UserModel.create(users)
	.then((result)=>{
		res.send('ok')
	})
})*/

router.post("/register",(req,res)=>{
	let body = req.body;
	//定义返回数据
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}

	UserModel
	.findOne({username:body.username})
	.then((user)=>{
		if(user){//已经有该用户
			 result.code = 1;
			 result.message = '用户已存在'
			 res.json(result);
		}else{
			//插入数据到数据库
			new UserModel({
				username:body.username,
				password:hmac(body.password),
				email:body.email,
				phone:body.phone
			})
			.save((err,newUser)=>{
				if(!err){//插入成功
					res.json(result)
				}else{
					result.code = 1;
					result.message = '注册失败'
					res.json(result);					
				}
			})
		}
	})

})

router.post("/login",(req,res)=>{
	let body = req.body;
	//定义返回数据
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}

	UserModel
	.findOne({username:body.username,password:hmac(body.password),isAdmin:false})
	.then((user)=>{
		if(user){//已经有该用户
			/* result.data={
			 	_id:user._id,
			 	username:user.username,
			 	isAdmin:user.isAdmin
			 }
			  req.cookies.set('userInfo',JSON.stringify(result.data));*/
			  req.session.userInfo = {
			 	_id:user._id,
			 	username:user.username,
			 	isAdmin:user.isAdmin
			 }

			 res.json(result)
		}else{
			//插入数据到数据库
			result.code=1;
			result.message = "用户名和密码错误";
			res.json(result);
			
		}
	})

})
router.get("/checkUsername",(req,res)=>{
	let username = req.query.username
	UserModel
	.findOne({username:username})
	.then((user)=>{
		if(user){//已经有该用户
			 res.json({
			 	code:1,
			 	message:'用户名已存在'
			 });
		}else{
			 res.json({
			 	code:0
			 })
		}
	})

})
router.get('/logout',(req,res)=>{
	let result  = {
		code:0,// 0 代表成功 
		message:''
	}
	/*	
	req.cookies.set('userInfo',null);
	*/
	req.session.destroy(); // 销毁session

	res.json(result);

})
/*router.use((req,res,next)=>{
	if(req.userInfo._id){
		res.json({
			code:0
		})
		next()
	}else{
		res.json({
			code:10
		});
	}
})*/
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
router.get('/userConent',(req,res)=>{
	if(req.userInfo._id){
		UserModel
		.findById(req.userInfo._id,"username phone email")
		.then((user)=>{
			if(user){
				res.json({
					code:0,
					data:user
				})
			}else{
				res.json({
					code:1
				})
			}
		})
	}

})
router.put("/updatePassword",(req,res)=>{
	UserModel.update({_id:req.userInfo._id},{password:hmac(req.body.password)})
	.then(raw=>{
		res.json({
			code:0,
			message:'更新密码成功'
		})
	})
	.catch(e=>{
		res.json({
			code:1,
			message:'更新密码失败'
		})
	})
})

module.exports = router;
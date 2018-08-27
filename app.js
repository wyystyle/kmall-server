const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Cookies = require('cookies');
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);

//数据
mongoose.connect('mongodb://localhost:27017/kmall',{ useNewUrlParser: true });

const db = mongoose.connection;
const app = express();

db.on('error',(err)=>{
	throw err
});

db.once('open',()=>{
	console.log('DB connected....');
});
//跨域请求设置
app.use((req,res,next)=>{
    res.append("Access-Control-Allow-Origin","http://localhost:8080");
    res.append("Access-Control-Allow-Credentials",true);
    res.append("Access-Control-Allow-Methods","GET, POST, PUT,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type, X-Requested-With"); 
    next();
})
app.use((req,res,next)=>{
    if(req.method == 'POSTIONS'){
        res.send('ok')
    }else{
        next()
    }
})



//加载静态
app.use(express.static('public'));

app.use(session({
    //设置cookie名称
    name:'blid',
    //用它来对session cookie签名，防止篡改
    secret:'dsjfkdfd',
    //强制保存session即使它并没有变化
    resave: true,
    //强制将未初始化的session存储
    saveUninitialized: true, 
    //如果为true,则每次请求都更新cookie的过期时间
    rolling:true,
    //cookie过期时间 1天
    cookie:{maxAge:1000*60*60*24},    
    //设置session存储在数据库中
    store:new MongoStore({ mongooseConnection: mongoose.connection })   
}))

app.use((req,res,next)=>{

	req.userInfo  = req.session.userInfo || {};

	next();	

})




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//加载动态请求
app.use('/admin',require('./routes/admin.js'));
app.use('/user',require('./routes/user.js'));
app.use('/category',require('./routes/category.js'));
app.use('/',require('./routes/index.js'));


app.use('/article',require('./routes/article.js'));
app.use("/comment",require('./routes/comment.js'));
app.use('/resource',require('./routes/resource.js'));
app.use("/home",require('./routes/home.js'));




app.listen(3000,'127.0.0.1',()=>{
	console.log("server is running 127.0.0.1:3000")
})

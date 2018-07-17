//引入模块
let express = require ('express');
let svgCaptcha = require('svg-captcha');
let path = require ('path');
let session = require('express-session');
let bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

// mongoDB 需要使用到的 配置
//数据库地址
const url = 'mongodb://localhost:27017';
// 库的名字
const dbName = 'SZHM19';

//创建app
let app = express();

//express-session 必选
app.use(session({
    secret: 'keyboard cat'
  }))

//body中间件
app.use(bodyParser.urlencoded({ extended: false }))


//设置托管静态资源
app.use(express.static('static'));

//路由1
//使用get方法 访问登录页面时 直接读取登录页面 并返回
app.get('/login', (req,res) => {
    //直接读取文件 并返回
    res.sendFile(path.join(__dirname,"./static/views/login.html"));
})

//路由2
//使用post .提交数据过来 验证用户登陆
app.post('/login',(req,res)=>{
    //获取form表单提交的数据
    //接收数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
//    console.log(req.body);
    //验证码
    let code = req.body.code;

    // 跟session中的验证码进行比较
    if(code == req.session.captcha){
        console.log("验证码正确");
        //设置session 
        req.session.userInfo={
            userName,
            userPass
        }
        //去首页
        res.redirect('/index');
    }else{
        console.log("失败");
        res.setHeader('content-type',"text/html");
        res.send('<script> alert("验证失败"); window.location.href="/login"</script>')
    }
})

//路由3
//生成图片的功能
//把这个地址 设置给 登录页的图片的src属性
app.get('/login/captchaImg', function (req, res) {
    //生成了一张图片 并返回
    var captcha = svgCaptcha.create();
    
    //保存验证码的值 到session方便后续的使用
    //为了比较是简单 直接转为小写
     req.session.captcha = captcha.text.toLocaleLowerCase();

    //打印验证码
    // console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);
});

//路由4
//访问首页 index
app.get("/index",(req,res)=>{
    //有session 欢迎
    if(req.session.userInfo){
        //登陆了
        res.sendFile(path.join(__dirname,'static/views/index.html'));
    }else{
        //没有session 去登录页
        res.setHeader('content-type',"text/html");
        res.send('<script> alert("请登陆"); window.location.href="/login"</script>')
    }
})

//路由5
//登出操作
//删除session的值即可
app.get('/logout',(req,res)=>{
    //删除session中的userInfo
    delete req.session.userInfo;
    
    //去登录页即可
    res.redirect('/login');
})

//路由6
//展示注册页面
app.get('/register',(req,res)=>{
    //直接读取并返回注册页
    res.sendFile(path.join(__dirname,'static/views/register.html'));
})

//路由7
app.post('/register',(req,res)=>{
    //获取用户数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    // console.log(userName);
    // console.log(userPass);

    MongoClient.connect(url, function (err, client) {
        //连上mongo之后 选择使用的库
        const db = client.db(dbName);
        //选择使用的集合
        const collection = db.collection('userList');
        console.log("成功连接数据库");

        //查询数据
        collection.find({
            userName
        }).toArray((err, doc)=>{
            console.log(doc);
           if(doc.length==0){
               //没有人注册过
               //新增数据
               collection.insertOne({
                   userName,
                   userPass
               },(err,result)=>{
                   console.log(err);
                   //注册成功
                   res.setHeader('content-type',"text/html");
                   res.send('<script> alert("欢迎入坑"); window.location.href="/login"</script>')
                   //关闭数据库
                   client.close();
               })
           }else{
               //如果存在
           }
            
           
          });



        // client.close();
    });

})

//开始监听
app.listen(80,"127.0.0.1",()=>{
    console.log("监听成功");
})

//引入模块
let express = require ('express');
let svgCaptcha = require('svg-captcha');
let path = require ('path');

//创建app
let app = express();

//设置托管静态资源
app.use(express.static('static'));

//路由1
//使用get方法 访问登录页面时 直接读取登录页面 并返回
app.get('/login', (req,res) => {
    //直接读取文件 并返回
    res.sendFile(path.join(__dirname,"./static/views/login.html"));
})

//路由2
//生成图片的功能
//把这个地址 设置给 登录页的图片的src属性
app.get('/login/captchaImg', function (req, res) {
    //生成了一张图片 并返回
    var captcha = svgCaptcha.create();
    
    //打印验证码
    console.log(captcha.text);
    res.type('svg');
    res.status(200).send(captcha.data);
});

//开始监听
app.listen(80,"127.0.0.1",()=>{
    console.log("监听成功");
})

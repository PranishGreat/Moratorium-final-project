// imports
var mongoose = require("mongoose");
const express= require('express');
const app=  express();
const bodyParser=require('body-parser')
const session = require('express-session');
const swal =require('sweetalert')
var aes256 = require('aes256');
const logger=require('./logger');
const axios = require('axios');
const cheerio = require('cheerio');
const { createLogger } = require("winston");
const nodemailer = require('nodemailer');

//Links
const url = 'https://www.business-standard.com/topic/banking-sector'
const url1 ='https://www.moneycontrol.com/personal-finance/banking/?classic=true'

//Middle wares
app.use(bodyParser.json()); 
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));

//Static Files
app.use(express.static("public"));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/fonts', express.static(__dirname + 'public/fonts'));
app.use('/assets', express.static(__dirname + 'public/assets'));
app.use('/contactform', express.static(__dirname + 'public/contactform'));
app.set("views", "./views");
app.set("view engine", "ejs");

// PORT 
const port=process.env.PORT || 8040;

app.listen(port, ()=>logger.log('info',`Server connected to ${port}`));


//Mongo Connection section
mongoose.connect("mongodb+srv://abcd:abcd@cluster0.ksrqf.mongodb.net/myDB?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  logger.log('info',"Connection Successful!");
});
//Mongo Connection section end

//News
var schema = mongoose.Schema({
  text: { type: String},
  Link1: { type: String},
  time : { type : Date, default: Date.now }
});
// Mongooes cha model
var Model = mongoose.model("model", schema, "news");


//Mongo Schema 
var userSchema = mongoose.Schema({
  username:String,email:String,password:String,mobile:Number,name:String,dob:String,aadhar:Number,address:String,bank_name:String,moratorium_acc:Number,status:Boolean
});


//Mongo Model
var userModel = mongoose.model('usermodel', userSchema,'user');

var sess;
var loginState=false;
var registerState=false;
var registerFail=false;
var logout=false;
var updateState=false;
var key = 'my passphrase';
// ROUTES

app.get("/",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=false;
      registerState=false;
      registerFail=false;
      logout=false;
      res.render('index', { result:result ,status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout});  
    });
});

// index Route
app.get("/index",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=false;
      registerState=false;
      registerFail=false;
      logout=false;
      
      res.render('index', { result:result,status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout });
    });
});


// login Route
app.get('/login',(req,res)=>{
  sess = req.session;
    if(sess.email) {
        console.log("User on Session:-  "+sess.email) 
    }
    else {
        console.log('User Not Found');   
        console.log('Please, Login first'); 
        res.redirect('/index');
    }
  var mysort = { time: -1 };
  loginState=false;
  registerState=false;
  registerFail=false;
  logout=false;
  var details=[];
  

db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
  if (err) throw err;
  var detail=[];
          for(var i=0;i<result1.length;i++)
          {
            detail=[{
              account_no: aes256.decrypt(key,result1[i]['account_no']),
              loan_no: aes256.decrypt(key,result1[i]['loan_no']),
              loan_name: result1[i]['loan_name'],
              income: result1[i]['income'],
              month: result1[i]['month'],
              status: result1[i]['status'] 
            }];
            details=details.concat(detail);
          }
})

   db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(loginState)
if(result[0]['status']===false)
      {
        result5=result
      }
      else
      {
        result5=[{
          username: result[0]['username'],
          name: result[0]['name'],
          address: result[0]['address'],
          mobile: aes256.decrypt(key,result[0]['mobile']),
          aadhar: aes256.decrypt(key,result[0]['aadhar']),
          bank_name: aes256.decrypt(key,result[0]['bank_name']),
          moratorium_acc: aes256.decrypt(key,result[0]['moratorium_acc'])
        }]
      }
    res.render('login', {result:result5,status:result[0]['status'],state:loginState,details:details,updateState:false,updateState1:false});


})
})

app.get('/loginsuccess',(req,res)=>{

    sess = req.session;
      if(sess.email) {
          logger.log('info',"Session Created for User:-  "+sess.email) 
      }
      else {
          logger.log('error','User Not Found');   
          logger.log('error','Please, Login first'); 
          res.redirect('/index');
      }
      var details=[];
    
      db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
        if (err) throw err;
           var detail=[];
          for(var i=0;i<result1.length;i++)
          {
            detail=[{
              account_no: aes256.decrypt(key,result1[i]['account_no']),
              loan_no: aes256.decrypt(key,result1[i]['loan_no']),
              loan_name: result1[i]['loan_name'],
              income: result1[i]['income'],
              month: result1[i]['month'],
              status: result1[i]['status'] 
            }];
            details=details.concat(detail);
          }
      })

    var mysort = { time: -1 };
    loginState=true;
     db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      console.log(loginState)
     
     if(result[0]['status']===false)
      {
        result5=result
      }
      else
      {
        result5=[{
          username: result[0]['username'],
          name: result[0]['name'],
          address: result[0]['address'],
          mobile: aes256.decrypt(key,result[0]['mobile']),
          aadhar: aes256.decrypt(key,result[0]['aadhar']),
          bank_name: aes256.decrypt(key,result[0]['bank_name']),
          moratorium_acc: aes256.decrypt(key,result[0]['moratorium_acc'])
        }]
      }
     res.render('login', {result:result5,status:result[0]['status'],state:loginState,details:details,updateState:false,updateState1:false});
    });
  })

  app.get("/loginfail",(req,res)=>{
    var mysort = { time: -1 };
    db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
      if (err) throw err;
      loginState=true;
      registerState=false;
      registerFail=false;
      logout=false;
      var details=[];
      res.render('index', { result:result, status:result[0]['status'],state:loginState,regstate:registerState,regfail:registerFail,logout:logout,details:details});
    });
  });
  
  
// home Route
app.get('/home',(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    res.render('home', {result:result });
  });
});

// register Route
app.post('/register', urlencodedParser, function (req, res) {
    var username = req.body.username; 
    module.exports=username
    var email =req.body.email1; 
    var pass = req.body.password; 
    var pass1 = req.body.password1; 
    var status=false;
     var encrypted = aes256.encrypt(key, pass);
  var data =new userModel({ 
      "username": username, 
      "email": email, 
      "password": encrypted,
      "status":status
  }) 
 
if(pass===pass1){
    db.collection('user').findOne({ email: email }, function(err, doc){
      if(err) throw err;
      if(!doc) {
        console.log('Not Found:'+email)
        db.collection('user').insertOne(data,function(err, collection){ 
          if (err) throw err;
          console.log(data);
          logger.log('info',"Record inserted Successfully"); 
          }); 
        res.redirect('/registersuccess')
      }else {
          logger.log('info',"Found: " + email);
          res.redirect('/registerfail')
      }

    });
}else{
  logger.log('error','Password not matched');
  res.redirect('/registerfail')
}
})

app.get("/registersuccess",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    registerState=true;
    loginState=false;
    registerFail=false;
    logout=false;
    res.render('index', { result:result,regstate:registerState,state:loginState,regfail:registerFail,logout:logout });
  });
});

app.get("/registerfail",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    registerState=false;
    loginState=false;
    registerFail=true;
    logout=false;
    res.render('index', { result:result,regstate:registerState,state:loginState,regfail:registerFail,logout:logout });
  });
});

// auth Route
app.post('/auth', urlencodedParser, function (req, res) {
  var email = req.body.login_email; 
  var pass = req.body.login_pass; 
  
  db.collection('user').findOne({  email: email}, function(err, doc){
    if(err) throw err;
    if(doc) {
      if(aes256.decrypt(key, doc.password) === pass)
      {
        console.log("Login Successfully!!");
        console.log("Welcome, "+email); 
  
        sess = req.session;
        sess.email = req.body.login_email;
        if(sess.email) {
          return res.redirect('/loginsuccess');
        }
        res.redirect('/login');
      }
      else {
        logger.log('error',"Wrong Credentials ");
        res.redirect('/loginfail');
      }
      
    } 
    else {
        logger.log('error',"Wrong Credentials ");
        res.redirect('/loginfail')
    }
    
});
})

// logout Route
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        logger.log('info','Logout!!')
        logger.log('warn','Session Terminated!!!')
        res.redirect('/logoutsuccess');
    });

});
app.get("/logoutsuccess",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    loginState=false;
    registerState=false;
    registerFail=false;
    logout=true;
    res.render('index', { result:result,state:loginState,regstate:registerState,regfail:registerFail,logout:logout });
  });
});

// update Route
app.post('/update', urlencodedParser, function (req, res) {
  var name = req.body.update_name; 
  var mobile = aes256.encrypt(key,req.body.update_mobile); 
  var aadhar = aes256.encrypt(key,req.body.update_aadhar); 
  var bank = aes256.encrypt(key,req.body.update_bank); 
  var acc =aes256.encrypt(key,req.body.update_acc); 
  var address = req.body.update_address; 
  var dob = req.body.update_dob; 


  var myquery = { email: sess.email };
  var newvalues = { $set: {"name":name,"mobile":mobile,"dob":dob,"aadhar":aadhar,"address":address,"moratorium_acc":acc,"bank_name":bank,"status":true } };

   db.collection('aadhar').findOne({  aadhar: aes256.decrypt(key,aadhar)}, function(err, doc){
    if (err) throw err;
    if(doc)
    {
      db.collection("user").updateOne(myquery, newvalues, function(err,r) {
        if (err) throw err;
      
        logger.log('info',"Information Updated!!");
        
      });
      res.redirect('/updatesuccess');
    }
    else
    {
      res.redirect('/updatefail');
    }
  });
});
app.get('/updatesuccess',(req,res)=>{
  sess = req.session;
    if(sess.email) {
        logger.log('info',"Session Created for User:-  "+sess.email) 
    }
    else {
        logger.log('error','User Not Found');   
        logger.log('error','Please, Login first'); 
        res.redirect('/index');
    }
    var details=[];
  
    db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
      if (err) throw err;
      var detail=[];
          for(var i=0;i<result1.length;i++)
          {
            detail=[{
              account_no: aes256.decrypt(key,result1[i]['account_no']),
              loan_no: aes256.decrypt(key,result1[i]['loan_no']),
              loan_name: result1[i]['loan_name'],
              income: result1[i]['income'],
              month: result1[i]['month'],
              status: result1[i]['status'] 
            }];
            details=details.concat(detail);
          }
    })

  var mysort = { time: -1 };
  loginState=true;
  updateState=true;
   db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(loginState)
    if(result[0]['status']===false)
    {
      result5=result
    }
    else
    {
      result5=[{
        username: result[0]['username'],
        name: result[0]['name'],
        address: result[0]['address'],
        mobile: aes256.decrypt(key,result[0]['mobile']),
        aadhar: aes256.decrypt(key,result[0]['aadhar']),
        bank_name: aes256.decrypt(key,result[0]['bank_name']),
        moratorium_acc: aes256.decrypt(key,result[0]['moratorium_acc'])    
      }]
    }
    res.render('login', {result:result5,status:result[0]['status'],state:loginState,details:details,updateState:updateState,updateState1:true});
  });
})

app.get('/updatefail',(req,res)=>{
  sess = req.session;
    if(sess.email) {
        logger.log('info',"Session Created for User:-  "+sess.email) 
    }
    else {
        logger.log('error','User Not Found');   
        logger.log('error','Please, Login first'); 
        res.redirect('/index');
    }
    var details=[];
  
    db.collection("moratorium").find({email:sess.email}).toArray(function(err, result1) {
      if (err) throw err;
     var detail=[];
          for(var i=0;i<result1.length;i++)
          {
            detail=[{
              account_no: aes256.decrypt(key,result1[i]['account_no']),
              loan_no: aes256.decrypt(key,result1[i]['loan_no']),
              loan_name: result1[i]['loan_name'],
              income: result1[i]['income'],
              month: result1[i]['month'],
              status: result1[i]['status'] 
            }];
            details=details.concat(detail);
          }
    })

  var mysort = { time: -1 };
  loginState=true;
  updateState=true;
   db.collection("user").find({email:sess.email}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    console.log(loginState)
    if(result[0]['status']===false)
    {
      result5=result
    }
    else
    {
      result5=[{
        username: result[0]['username'],
        name: result[0]['name'],
        address: result[0]['address'],
        mobile: aes256.decrypt(key,result[0]['mobile']),
        aadhar: aes256.decrypt(key,result[0]['aadhar']),
        bank_name: aes256.decrypt(key,result[0]['bank_name']),
        moratorium_acc: aes256.decrypt(key,result[0]['moratorium_acc'])    
      }]
    }
    res.render('login', {result:result5,status:result[0]['status'],state:loginState,details:details,updateState:updateState,updateState1:false});
  });
})
  // contact route
  app.post('/contact', urlencodedParser, function (req, res) {
    var contact_name = req.body.contact_name; 
    var contact_email =req.body.contact_email; 
    var contact_subject = req.body.contact_subject; 
    var contact_message = req.body.contact_message; 
    
    // console.log("session in contact"+sess.email)
     sess=req.session;
     console.log(sess.email)
  var data ={
      "contact_name": contact_name, 
      "contact_email": contact_email, 
      "contact_subject": contact_subject,
      "contact_message":contact_message }
    db.collection('contact').insertOne(data,function(err,result){ 
      if (err) throw err;
      console.log(data);
      logger.log('info',"Record inserted Successfully"); 
      }); 
      if(sess.email!=null){
        res.redirect('/home')
      }else{
      res.redirect('/index')
      }
})

//News Routes
app.get('/url',(req,res,next)=>{
  axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html)
    const l=[];
    $('.listing-txt').each(function(){
      var text=$(this).find('a').text();
      var link ="https://www.business-standard.com/"+$(this).find('a').attr('href');
      if (text!=undefined || link!='' || text!=''){
        var d=new Model({text:text,Link1:link});
        d.save(function(err, doc) {
          if (err) return console.error(err);
          });    
      }
    })
   
}).catch(console.error);
  res.redirect('/index');
})

app.get('/url1',(req,res,next)=>{
 axios(url1)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html)
    const l=[];
    $('.news_heading').each(function(){
      var text=$(this).find('a').attr('title');
      var link ='https://www.moneycontrol.com/'+ $(this).find('a').attr('href');
      if($(this).find('a').attr('href')!=undefined){
        var d=new Model({text:text,Link1:link});
        d.save(function(err, doc) {
          if (err) return console.error(err);
          });  
      }  
    })
  
}).catch(console.error);
res.redirect('/index');
})


//Admin Routes
app.get('/admin_index', (req, res) =>{
  // Count the total documents
  var approved_count=null;
  var pending_count=null;
  var rejected_count=null;
  var user_count=null;
  var contact_count=null;
  //Approved Count
  db.collection('moratorium').countDocuments({status:"Approved"}, function (err, count) {
      if (err){
          console.log(err)
      }else{
          approved_count=count; 
      }
  });
  //Rejected Count
  db.collection('moratorium').countDocuments({status:"Rejected"}, function (err, count) {
      if (err){
          console.log(err)
      }else{
          rejected_count=count; 
      }
  });
  //User Count
  db.collection('admin').countDocuments({}, function (err, count) {
      if (err){
          console.log(err)
      }else{
          user_count=count; 
      }
  });
  //Contact Count
  db.collection('contact').countDocuments({}, function (err, count) {
      if (err){
          console.log(err)
      }else{
          contact_count=count; 
      }
  });
  //Pending Count
  db.collection('moratorium').countDocuments({status:"Pending"}, function (err, count) {
      if (err){
          console.log(err)
      }else{
          pending_count=count;   
      }
      res.render('admin_index',{pending_count:pending_count,approved_count:approved_count,rejected_count:rejected_count,user_count:user_count,contact_count:contact_count})
  });
});

//Admin Login
app.get('/admin_login', (req, res) =>{
  res.render('admin_login');
});

//Admin Contact 
app.get('/admin_contact', (req, res) =>{
  db.collection('contact').find({}).toArray(function(err, doc){
      if (err) {
          console.log(err);
      } else {
          res.render('admin_contact_section', { contact: doc})
      }
  });
});

//Pending Records Table
app.get('/pending', (req, res) =>{
  var details=[];
  db.collection('moratorium').find({status:"Pending"}).toArray(function(err, doc){
      if (err) {
          console.log(err);
      } else{
          var detail=[];
        for(var i=0;i<doc.length;i++)
        {
          detail=[{
            account_no: aes256.decrypt(key,doc[i]['account_no']),
            loan_no: aes256.decrypt(key,doc[i]['loan_no']),
            income_source: doc[i]['income_source'],
            income: doc[i]['income'],
            month: doc[i]['month'],
            reason: doc[i]['reason'],
            covid_effect: doc[i]['covid_effect'],
            rent_pay: doc[i]['rent_pay'],
            area_zone: doc[i]['area_zone'],
            applied_date: doc[i]['applied_date'],
            status: doc[i]['status']
            
          }]
          details=details.concat(detail);
        }
          res.render('pending_table', { details: details,status:"Pending"})
      
      }
  });
});

//Approved Records Table
app.get('/approved', (req, res) =>{
  var details=[];
  db.collection('moratorium').find({status:"Approved"}).toArray(function(err, doc){
      if (err) {
          console.log(err);  
      }else{
     var detail=[];
        for(var i=0;i<doc.length;i++)
        {
          detail=[{
            account_no: aes256.decrypt(key,doc[i]['account_no']),
            loan_no: aes256.decrypt(key,doc[i]['loan_no']),
            income_source: doc[i]['income_source'],
            income: doc[i]['income'],
            month: doc[i]['month'],
            reason: doc[i]['reason'],
            covid_effect: doc[i]['covid_effect'],
            rent_pay: doc[i]['rent_pay'],
            area_zone: doc[i]['area_zone'],
            applied_date: doc[i]['applied_date'],
            status: doc[i]['status']
          }]
          details=details.concat(detail);
        }
          res.render('approved_table', { details: details,status:"Approved"})
      }
    
  });
});

//Rejected Records Table
app.get('/rejected', (req, res) =>{
  var details=[];
  db.collection('moratorium').find({status:"Rejected"}).toArray(function(err, doc){
      if (err) {
          console.log(err);
      }else{
       var detail=[];
        for(var i=0;i<doc.length;i++)
        {
          detail=[{
            account_no: aes256.decrypt(key,doc[i]['account_no']),
            loan_no: aes256.decrypt(key,doc[i]['loan_no']),
            income_source: doc[i]['income_source'],
            income: doc[i]['income'],
            month: doc[i]['month'],
            reason: doc[i]['reason'],
            covid_effect: doc[i]['covid_effect'],
            rent_pay: doc[i]['rent_pay'],
            area_zone: doc[i]['area_zone'],
            applied_date: doc[i]['applied_date'],
            status: doc[i]['status']
          }]
          details=details.concat(detail);
        }
          res.render('rejected_table', { details: details,status:"Rejected"})
      
      }
  });
});

//Approve Record by updating month
app.post('/approve', urlencodedParser, function (req, res) {
  var month_no = req.body.month_no; 
  var loan_no = req.body.loan_no;
  var l,myquery,newvalues;
  console.log(month_no);
  console.log(req.body.loan_no); //prints john
  db.collection('moratorium').find({}).toArray(function(err, doc){
    for(var i=0;i<doc.length;i++)
    {
      if(aes256.decrypt(key,doc[i]['loan_no'])===loan_no)
    {
      l=aes256.decrypt(key,doc[i]['loan_no']);
      console.log("Loan No");
      console.log(l);
      console.log(doc[i]['loan_no'])
      myquery = { loan_no: doc[i]['loan_no'] };
      newvalues = { $set: {month: month_no, status: "Approved" } };

      db.collection("moratorium").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
       // console.log(res);
      });
      var email=doc[i]['email'];
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moratoriumbank@gmail.com',
        pass: 'moratorium@13'
      }
    });
    var mailOptions = {
      from: 'moratoriumbank@gmail.com',
      to: email,
      subject: 'Moratorium Request Approved',
      text: 'Hi, '+email+' Your Moratorium Request for Loan No: '+loan_no+' is Approved for '+month_no+' months.'
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/approved'); 
    }
    }
  });
});

//Reject Record
app.post('/reject', urlencodedParser, function (req, res) {
  var loan_no = req.body.loan_no;
  var l,myquery,newvalues;
  console.log(req.body.loan_no); //prints john
  db.collection('moratorium').find({}).toArray(function(err, doc){
    for(var i=0;i<doc.length;i++)
    {
      if(aes256.decrypt(key,doc[i]['loan_no'])===loan_no)
    {
      l=aes256.decrypt(key,doc[i]['loan_no']);
      console.log("Loan No");
      console.log(l);
      console.log(doc[i]['loan_no'])
      myquery = { loan_no: doc[i]['loan_no'] };
      newvalues = { $set: {status: "Rejected" } };
      db.collection("moratorium").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
       // console.log(res);
    });
    var email=doc[i]['email'];
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moratoriumbank@gmail.com',
        pass: 'moratorium@13'
      }
    });
    var mailOptions = {
      from: 'moratoriumbank@gmail.com',
      to: email,
      subject: 'Moratorium Request Rejected',
      text: 'Hi, '+email+' Sorry, Your Moratorium Request for Loan No: '+loan_no+' is Rejected.'
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/rejected');
  }
    }
  });
});

//Admin Login Authentication
app.post('/admin_auth', urlencodedParser, function (req, res) {
  var adminid = req.body.admin_id; 
  var adminpass = req.body.admin_password; 
  console.log(adminid);
  console.log(adminpass);
  db.collection('admin').findOne({  adminid: adminid, password: adminpass }, function(err, doc){
    if(err) throw err;
    if(doc) {
      console.log("Login Successfully!!");
      res.redirect('/admin_index')
    } else {
        console.log("Wrong Credentials ");
        res.redirect('/admin_login')
    }      
});
});


//Andriod API's

// login Route
app.post("/api_auth", urlencodedParser, function (req, res) {
  var email = req.body.email;
  var pass = req.body.password;

  // var pass = aes256.encrypt(key, reqpass);
  // var pass_dec = aes256.decrypt(key, pass);
  // console.log("STR Here Encrypted \t" + pass + "\n");
  // console.log("STR Here Decrypted \t" + pass_dec + "\n");
  //Getting particular moratorium details of user
  db.collection("moratorium")
    .find({ email: email })
    .toArray(function (err, doc) {
      if (err) throw err;
      details = [{
            loan_no: aes256.decrypt(key,doc['loan_no']),
            loan_name: doc['loan_name'],
            month: doc['month'],
            applied_date: doc['applied_date'],
            status: doc['status']
      }]
    });
  // Getting details of user
  db.collection("user")
    .find({ email: email })
    .toArray(function (err, result) {
      if (err) throw err;
      // userdata = result;
      // console.log(aes256.decrypt(key, result[0]["aadhar"]));
      userdata = [
        {
          _id: result[0]["_id"],
          username: result[0]["username"],
          email: result[0]["email"],
          password: aes256.decrypt(key, result[0]["password"]),
          status: result[0]["status"],
          aadhar: aes256.decrypt(key, result[0]["aadhar"]),
          address: result[0]["address"],
          bank_name: aes256.decrypt(key, result[0]["bank_name"]),
          dob: result[0]["dob"],
          mobile: aes256.decrypt(key, result[0]["mobile"]),
          moratorium_acc: aes256.decrypt(key, result[0]["moratorium_acc"]),
          name: result[0]["name"],
        },
      ];
    });

  //Checking Credentials for User Login
  db.collection("user").findOne({ email: email }, function (err, doc) {
    if (err) throw err;
    if (doc) {
      console.log("dec\t" + aes256.decrypt(key, doc.password));
      if (aes256.decrypt(key, doc.password) === pass) {
        res.send({
          login_status: "Success",
          userdata: userdata,
          details: details,
        });
      } else {
        res.send({ login_status: "Fail" });
      }
    } else {
      console.log(email, pass);
      res.send({ login_status: "Fail" });
    }
  });
});

app.post('/api_reg', urlencodedParser, function (req, res) {
  var username = req.body.username; 
  var email =req.body.email1; 
  var pass = req.body.password; 
  var status=false;
var data =new userModel({ 
    "username": username, 
    "email": email, 
    "password": pass,
    "status":status
}) 
  db.collection('user').findOne({ email: email }, function(err, doc){
    if(err) throw err;
    if(!doc) {
      db.collection('user').insertOne(data,function(err, collection){ 
        if (err) throw err;
        console.log(data);
        logger.log('info',"Record inserted Successfully"); 
        }); 
      res.send({register_status:"Success",userdata:data})
    }else {
        logger.log('info',"Found: " + email);
        res.send({register_status:"Fail,Email already exist!"})
    }

  });

})

app.get("/api_news",(req,res)=>{
  var mysort = { time: -1 };
  db.collection("news").find({}).sort(mysort).toArray(function(err, result) {
    if (err) throw err;
    loginState=false;
    registerState=false;
    registerFail=false;
    logout=false;
    res.send({news:result});  
  });
})


require('dotenv').config();
const express=require("express");
const bodyParser=require('body-parser');
const ejs=require('ejs');
const nodemailer = require("nodemailer");

const mongoose=require('mongoose');
const request=require('request');
const session=require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "our littel secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://Admin_Fida:Fida%40Shar%23786@cluster1-5iygr.mongodb.net/blogwepDB?retryWrites=true&w=majority",{useNewUrlParser:true, useUnifiedTopology: true,  useFindAndModify: false});
mongoose.set("useCreateIndex", true);


const inc= "";
let clientStatus = "";
let logButton = "";
let reportId = String;
var x = Number;
let userEmail = String;
let err = String;
let errOtp = String;


const clientSchema= new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  googleId: String,
  thumbnail: String,
 
});
const blogpostsSchema=new mongoose.Schema({
  title: String,
  content: String,
  thumbnail: String,
  postDate: String,
  by: String
});
const answersSchema = new mongoose.Schema({
  description: String,
  code: String,
  postDate: String,
  by: String
});

const questionsSchema=new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  postDate: String,
  answers: [answersSchema],
  by: String
  
});
clientSchema.plugin(passportLocalMongoose);
clientSchema.plugin(findOrCreate);

const Client = mongoose.model("Client",clientSchema);
const BlogPost= mongoose.model("BlogPost",blogpostsSchema);
const Answer = mongoose.model("Answer", answersSchema);
const Question =mongoose.model("Question",questionsSchema);

passport.use(Client.createStrategy());

passport.serializeUser(function(client, done) {
  done(null, client.id);
});

passport.deserializeUser(function(id, done) {
  Client.findById(id, function(err, client) {
    done(err, client);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRETS,
  callbackURL: "http://localhost:3000/auth/google/blog",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  Client.findOrCreate({ googleId: profile.id, thumbnail: profile._json.picture, username: profile.displayName}, function (err, user) {
    return cb(err, user);
  });
}
));

const menu = [
  {
      name: 'Home',
      url: '/'
  },
  {
      name: 'Blog',
      url: '/blog'
  },
  {
      name: 'Q & A',
      url: '/questions'

  },
  {
      name: 'Contact',
      url: '/contact'
  },
  {
      name: 'About',
      url: '/about'
  }
  
]

app.get("/",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("home", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/verify"
  logButton = "signup"
    res.render("home", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
});

app.get("/auth/google", 
  passport.authenticate("google", {scope: ["profile"] })
);

app.get("/auth/google/blog", 
  passport.authenticate("google", { failureRedirect: "/signin" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/blog');
  });


app.get("/signup",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  err = ""
  
  res.render("signup", {clientStatus: clientStatus, logButton: logButton, LoginAs: userEmail, err: err,menu:menu,url: req.url})
})


app.get("/signin",function(req,res){
  clientStatus = "/verify"
  logButton = "SignUp"
  
  res.render("signin",{var1:inc, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
})

app.get("/contact",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("contact", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/verify"
  logButton = "signup"
    res.render("signin", {var1: inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
});

app.post("/contact",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'blogwepbyteckgeeks@gmail.com',
        pass: process.env.CLIENT_PASS
      }
    });
    
    var mailOptions = {
      from: 'blogwepbyteckgeeks@gmail.com',
      to: 'blogwepbyteckgeeks@gmail.com',
      subject: "Report: "+req.body.subject+" Contact Mail From "+req.body.name,
      text: req.body.message+" User Email: "+req.body.email+" User ID: "+req.user._id
    };
    
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
    res.redirect("/blog");
} else {
  clientStatus = "/verify"
  logButton = "signup"
    res.render("signin", {var1: inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
});

app.get("/about",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("about", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/verify"
  logButton = "signUp"
    res.render("about", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
})

app.get("/verify",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  res.render("verify", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
})
app.post("/verify",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  userEmail = req.body.email;
  x= random();
  let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'blogwepbyteckgeeks@gmail.com',
      pass: process.env.CLIENT_PASS
    }
  });
  
  var mailOptions = {
    from: 'blogwepbyteckgeeks@gmail.com',
    to: userEmail,
    subject: "OTP",   
    text: "Your OTP for BlogWep verification: "+x
  };
  
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });

  res.redirect("/verify/OTP");
})

app.get("/verify/OTP",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  errOtp = ""
  res.render("otp", {clientStatus: clientStatus, logButton: logButton,errOtp: errOtp,menu:menu,url: req.url})
})
app.post("/verify/OTP",function(req,res){
  clientStatus = "/signin"
  logButton = "SignIn"
  if(Number(req.body.otp) === x){
    err = ""
    res.render("signup", {var1:inc,clientStatus: clientStatus, logButton: logButton,  LoginAs: userEmail, err: err,menu:menu,url: req.url})
  } else {
    errOtp = "Invalid OTP"
    res.render("otp",{clientStatus: clientStatus, logButton: logButton,errOtp: errOtp,menu:menu,url: req.url})
  }
  
})

app.get("/questions", function(req,res){

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.find().sort({_id: -1}).exec(function(err, foundQuestions){
      if(!err){
        res.render("questions", {questions: foundQuestions, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
      } else {
        res.send(err);
      }
    })
   
} else {
  clientStatus = "/verify"
  logButton = "SignUp"
  Question.find().sort({_id: -1}).exec(function(err, foundQuestions){
    if(!err){
      res.render("questions", {questions: foundQuestions, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
    } else {
      res.send(err);
    }
  })
    
}
})

app.post("/questions/search", function(req,res){

    clientStatus = "/logout"
    logButton = "Logout"
    Question.find({$text: {$search: req.body.search}}).sort({_id: -1}).exec(function(err, foundQuestions){
      if(!err){
        res.render("questions", {questions: foundQuestions, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
      } else {
        res.send(err);
      }
    })
})

app.get("/ask_question", function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("ask_question", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
    res.render("signin", {var1:inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
 
})


app.post("/blog/report", function(req,res){
  if(req.isAuthenticated()){
    reportId = req.body.reportId;
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("report", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
    res.render("signin", {var1:inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}

})

app.post("/blog/report/mail", function(req,res){
  if(req.isAuthenticated()){

    let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'blogwepbyteckgeeks@gmail.com',
        pass: process.env.CLIENT_PASS
      }
    });
    
    var mailOptions = {
      from: 'blogwepbyteckgeeks@gmail.com',
      to: 'blogwepbyteckgeeks@gmail.com',
      subject: "Report: "+req.body.reportSubject,
      text: req.body.reportReason+" with Report Id: "+reportId+", and  User Id: "+req.user._id
    };
    
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
    
    res.redirect("/blog",);
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
    res.render("signin", {var1:inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
})

app.post("/questions/report", function(req,res){
  if(req.isAuthenticated()){
    reportId = req.body.reportId;
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("report", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/signin"
  logButton = "SignIn"
    res.render("signin", {var1:inc,clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}

})

app.post("/ask_question", function (req, res) {

  const newQuestion = new Question({
     title: req.body.questionTitle,
     description: req.body.questionContent,
     code: req.body.questionCode,
     postDate: currentDate(),
     by: req.user.username
  });

  newQuestion.save(function(err){
    if(!err){
      console.log("Succesflly added question");
    } else {
      console.log(err);
    }
  })
res.redirect("/questions");
});

app.get("/blog",function(req,res){

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    BlogPost.find().sort({_id: -1}).exec(function(err,foundPost){
      if(err) console.log(err);
      res.render("blog",{BlogPost: foundPost, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
  })

} else {
  clientStatus = "/verify"
  logButton = "SignUp"
  BlogPost.find().sort({_id: -1}).exec(function(err,foundPost){
    if(err) console.log(err);
    res.render("blog",{BlogPost: foundPost, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
})
}
})

app.post("/blog/search", function(req, res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    BlogPost.find({$text: {$search: req.body.search}}).sort({_id: -1}).exec(function(err,foundPost){
      if(err) console.log(err);
      res.render("blog",{BlogPost: foundPost, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
  })

} else {
  clientStatus = "/signin"
  logButton = "Login"
  BlogPost.find({$text: {$search: req.body.search}}).sort({_id: -1}).exec(function(err,foundPost){
    if(err) console.log(err);
    res.render("blog",{BlogPost: foundPost, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
})
}
})

app.get("/blogsubmit",function(req,res){
  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    res.render("blogsubmit", {clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
} else {
  clientStatus = "/verify"
  logButton = "signup"
  res.render("signin", {var1:inc, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url});
}
})


app.post("/blogsubmit",function(req,res){
  const newblog= new BlogPost({
    title:req.body.blogtitle,
    content:req.body.content,
    thumbnail: req.user.thumbnail,
    postDate: currentDate(),
    by: req.user.username
  });
  newblog.save(function(err){
    if(!err){
      console.log("successfully added blog");
    }
    else{
      console.log(err)
    }
  })
        res.redirect("blog")

})



app.post("/signup",function(req,res){

if(req.body.pass === req.body.password){
  Client.register({username :req.body.username}, req.body.password,function(err,user){
    if(err){
      console.log(err);
    res.redirect("/signup");
  }else{
    passport.authenticate("local")(req, res, function(){
      Client.updateOne({username: req.body.username},{$set: {thumbnail: "/images/user.png"}}, function(err){
        if(err){
          console.log(err);
        }
      }) 
      res.redirect("/blog");
    })
  }
})
} else {
  err = "Password Dosen't Match";
  res.render("signup", {var1:inc,clientStatus: clientStatus, logButton: logButton,LoginAs: userEmail, err: err,menu:menu,url: req.url});
}


});



app.post("/signin",function(req,res){
  const client = new Client({
    email: req.body.username,
    password: req.body.password,
    
})

req.login(client, function(err){
    if(err){
        console.log(err);
    }else {
        passport.authenticate("local")(req, res,function(){
            res.redirect("blog");
        })
    }
})
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
})



app.get("/:questionTitle", function(req,res){

  const questionTitle = req.params.questionTitle;

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.findOne({title: questionTitle}, function(err, foundQuestion){
      if(foundQuestion){
        res.render("singleQuestion",{_id: foundQuestion._id, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
      } else {
        console.log(err);
      }
    })
} else {
  clientStatus = "/verify"
  logButton = "signup"
  Question.findOne({title: questionTitle}, function(err, foundQuestion){
    if(foundQuestion){
      res.render("singleQuestion",{_id: foundQuestion._id, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
    } else {
      console.log(err);
    }
  })
}

 
})

app.post("/questions/:questionId", function(req, res){

  const questionId = req.params.questionId;
  const newAnswer = new Answer({
    description: req.body.answerDescription,
    code: req.body.answerCode,
    postDate: currentDate(),
    by: req.user.username
  })

  if(req.isAuthenticated()){
    clientStatus = "/logout"
    logButton = "Logout"
    Question.findOne({_id: questionId}, function(err, foundQuestion){
      if(foundQuestion){
        foundQuestion.answers.push(newAnswer);
        foundQuestion.save();
        res.render("singleQuestion",{_id: questionId, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
      } else {
        res.send(err);
      }
    }) 

} else {
  clientStatus = "/verify"
  logButton = "signup"
  Question.findOne({_id: questionId}, function(err, foundQuestion){
    if(foundQuestion){
      foundQuestion.answers.push(newAnswer);
      foundQuestion.save();
      res.render("singleQuestion",{_id: questionId, title: foundQuestion.title, description: foundQuestion.description, code: foundQuestion.code, answers: foundQuestion.answers, clientStatus: clientStatus, logButton: logButton,menu:menu,url: req.url})
    } else {
      res.send(err);
    }
  }) 
}   
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = process.env.PORT || 3000;
}
app.listen(port , function(){
  console.log("Server HAs Started Successfully")
});

// functions

function currentDate(){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd + '/' + mm + '/' + yyyy;

  return today;
}


function random(){
  var x = Math.floor(1000 + Math.random() * 9000);
  return x;
}
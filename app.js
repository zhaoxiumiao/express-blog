var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const blogRouter = require('./routes/blog')
const userRouter = require('./routes/user')

const session = require('express-session')
const RedisStore = require('connect-redis')(session)

var app = express();
var ENV = process.env.NODE_ENV

if(ENV !== "production"){
  //开发环境
  app.use(logger('dev'));
}else{
  //线上环境
  const logFileName = path.join(__dirname,'logs','access.log')
  const writeStream = fs.createWriteStream(logFileName,{
    flags:'a'
  })
  app.use(logger('combined',{
    stream:writeStream
  }))
}


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

const redisClient = require('./db/redis')
const sessionStore = new RedisStore({
  client:redisClient
})
console.log(1);
app.use(session({
  store: sessionStore,
  secret: "wHSj_.ff1s",
  cookie:{
    // httpOnly:true,//默认配置
    // path: "/",//默认配置
    maxAge: 24 * 60 * 60 * 1000
  }
}))
console.log(2);
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/blog',blogRouter)
app.use('/api/user',userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  // res.json({ error: err })
});

module.exports = app;

const express = require('express');
const session = require('express-session');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fileStore = require('session-file-store')(session); // session file store

const index = require('./routes/index');
const login = require('./routes/login');
const users = require('./routes/users');

// MySQL Connect 설정.
const config = require('./routes/common/dbconfig');
global.dbConn = mysql.createConnection(config);
handleDisconnect(global.dbConn);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'system!@$',	// 암호화
  resave: false,	
  saveUninitialized: true,	
  cookie: {	
    httpOnly: true,
  },
  store: new fileStore() // 세션 객체에 세션스토어를 적용
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/login', login);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * DB ReConnect 함수.
 * @param client
 */
 function handleDisconnect(client) {
  client.on('error', (error) => {
      if (!error.fatal) return;
      if (error.code !== 'PROTOCOL_CONNECTION_LOST') throw err;
      console.error('> Re-connecting lost MySQL connection: ' + error.stack);

      // NOTE: This assignment is to a constiable from an outer scope; this is extremely important
      // If this said `client =` it wouldn't do what you want. The assignment here is implicitly changed
      // to `global.mysqlClient =` in node.
      global.dbcon = mysql.createConnection(client.config);
      handleDisconnect(global.dbcon);
      global.dbcon.connect();
  });
}

module.exports = app;

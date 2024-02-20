var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personaRouter = require('./routes/persona');
var rolRouter = require('./routes/rol');
var cuentaRouter = require('./routes/cuenta');
var noticiaRouter = require('./routes/noticia');
var comentarioRouter = require('./routes/comentario');

var app = express();

//? Para traer archivos estaticos
app.use(express.static('public'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/persona', personaRouter);
app.use('/rol', rolRouter);
app.use('/cuenta', cuentaRouter);
app.use('/noticia', noticiaRouter);
app.use('/comentario', comentarioRouter);


//* Init SYNC models
//? Los modelos solo se cargan una sola vez al levantar el servidor
let models = require('./app/models');
models.sequelize.sync().then(() => {
  console.log("Se ha sincronizado");
}).catch(err => {
  console.log("error al sincronizar los modelos", err);
})

//* End SYNC models



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;

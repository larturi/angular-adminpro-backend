// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

// Inicializar variables
var app = express();

// CORS Middleware
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.get('/', function(req, res, next) {
  // Handle the get for this route
});
 
app.post('/', function(req, res, next) {
 // Handle the post for this route
});

// BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var loginRoutes = require('./routes/login');
var imagenesRoutes = require('./routes/imagenes');

// Conexion a la BD
mongoose.connection.openUri(process.env.URLDB, 
  { useNewUrlParser: true, useCreateIndex: true},
  (err, res) => {
    if(err) {
        throw(err);
    } else {
      console.log('Base de datos: \x1b[32m%s\x1b[0m', 'Online');
    }
  });

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/login', loginRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(process.env.PORT, () => {
    console.log('Express Server corriendo en el puerto ' + process.env.PORT + ': \x1b[32m%s\x1b[0m', 'Online');
});


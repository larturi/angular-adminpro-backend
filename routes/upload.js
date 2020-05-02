var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion validos
    var tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar un tipo de coleccion valido',
            errors: {message: 'Las extensiones validas son: ' + tiposValidos.join(', ')}
        });
    }

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Debe seleccionar un archivo',
            errors: {message: 'Debe seleccionar una imagen'}
        });
    }

    // Archivo recibido
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Valido extension del archivo
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {message: 'Las extensiones validas son: ' + extensionesValidas.join(', ')}
        });
    }

    // Nombre del archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    
    // Mover el archivo del temporal a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo al servidor',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if(tipo === 'usuarios') {
      Usuario.findById(id, (err, usuario) => {

        if(!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no existe',
                errors: {message: 'Usuario no existe'}
            });
        }
        
        var pathViejo = './uploads/usuarios/' + usuario.img;

        if(fs.existsSync(pathViejo)) {
           fs.unlinkSync(pathViejo); // Elimina la imagen anterior
        }

        usuario.img = nombreArchivo;

        usuario.save( (err, usuarioActualizado) => {

            usuarioActualizado.password = ':)';

            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen de usuario actualizada',
                usuario: usuarioActualizado
            });
        });

      });
    }

    if(tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

        if(!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital no existe',
                errors: {message: 'Hospital no existe'}
            });
        }
          
          var pathViejo = './uploads/hospitales/' + hospital.img;
  
          if(fs.existsSync(pathViejo)) {
             fs.unlinkSync(pathViejo); // Elimina la imagen anterior
          }
  
          hospital.img = nombreArchivo;
  
          hospital.save( (err, hospitalActualizado) => {
              return res.status(200).json({
                  ok: true,
                  mensaje: 'Imagen de hospital actualizada',
                  hospital: hospitalActualizado
              });
          });
  
        });
    }

    if(tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

        if(!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Medico no existe',
                errors: {message: 'Medico no existe'}
            });
        }
        
          var pathViejo = './uploads/medicos/' + medico.img;
  
          if(fs.existsSync(pathViejo)) {
             fs.unlinkSync(pathViejo); // Elimina la imagen anterior
          }
  
          medico.img = nombreArchivo;
  
          medico.save( (err, medicoActualizado) => {
              return res.status(200).json({
                  ok: true,
                  mensaje: 'Imagen de medico actualizada',
                  medico: medicoActualizado
              });
          });
  
        });
    }

}

 module.exports = app;
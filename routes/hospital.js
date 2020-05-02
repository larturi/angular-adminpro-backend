var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

var app = express();

// ==============================================================
// Obtener todos los hospitales
// ==============================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    
    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
        (err, hospitales) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar hospitales en la BD',
                errors: err
            });
        }

        Hospital.count({}, (err, cantidad) => {
            res.status(200).json({
                ok: true,
                hospitales,
                total: cantidad
            });
        });
    });
});

// ==============================================================
// Crear un nuevo hospital
// ==============================================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
       nombre: body.nombre,
       usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital en la BD',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});


// ==============================================================
// Actualizar Hospital
// ==============================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital en la BD',
                errors: err
            });
        }

        if(!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        
        hospital.save( (err, hospitalGuardado) => {

            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital en la BD',
                    errors: err
                });
            }

            hospitalGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


// ==============================================================
// Borrar hospital
// ==============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital en la BD',
                errors: err
            });
        }

        if(!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});


 module.exports = app;
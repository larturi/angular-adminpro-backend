var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

// ==============================================================
// Busqeda general por coleccion especifica
// ==============================================================

app.get('/coleccion/:tabla/:search', (req, res, next) => {

    const table = req.params.tabla;
    const search = req.params.search;
    var regex = new RegExp(search, 'i');
    var promesa;

    switch (table) {
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
    
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: medicos, usuarios, hospitales',
                error: { message: 'Tipo de tabla / coleccion valida'}
            });
    }

    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });

});

// ==============================================================
// Busqeda general por todas las tablas
// ==============================================================

app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
    
});

function buscarHospitales(regex) {
    return new Promise( (resolve, reject) => {

        Hospital.find({nombre: regex})
        .populate('usuario', 'nombre email img')
        .exec((err, hospitales) => {
            if(err) {
               reject('Error al cargar hospitales', err);
            } else {
               resolve(hospitales);
            }
        });
    });
}

function buscarMedicos(regex) {
    return new Promise( (resolve, reject) => {

        Medico.find({nombre: regex})
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medicos) => {
            if(err) {
               reject('Error al cargar medicos', err);
            } else {
               resolve(medicos);
            }
        });
    });
}

function buscarUsuarios(regex) {
    return new Promise( (resolve, reject) => {

        Usuario.find({}, 'nombre email role img')
        .or([ {'nombre': regex}, {'email': regex} ])
        .exec( (err, usuarios) => {
            if(err) {
                reject('Error al cargar usuarios', err);
             } else {
                resolve(usuarios);
             }
        });
    });
}

 module.exports = app;
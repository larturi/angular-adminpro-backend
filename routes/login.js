var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var SEED = require('../config/config').SEED;
var Usuario = require('../models/usuario');

// Google
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// ==============================================================
// Autenticacion por Google
// ==============================================================

app.post('/google', async (req, res) => {

    var token = req.body.token || '';

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    const ticket = client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });

    var googleUser = ticket.then(data => {
        res.status(200).json({
            ok: true,
            ticket: data.payload,
            userid: data.payload.sub
        });
    }).catch(err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }
    });

    Usuario.findOne({ email: googleuser.email}, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (usuarioBD) {
            if(usuarioBD.google === false) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Debe autenticarse con credenciales (no google)',
                    errors: err
                });
            } else {
                // Crear token
                var token = jwt.sign({ usuario: usuarioBD}, SEED, {expiresIn : 14400});
                usuarioBD.password = ':)';

                res.status(200).json({
                    ok: true,
                    usuarioBD,
                    token,
                    id: usuarioBD.id
                });
            }
        } else {
            // El usuario no existe, hay que crearlo

            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD}, SEED, {expiresIn : 14400});

                res.status(200).json({
                    ok: true,
                    usuarioBD,
                    token,
                    id: usuarioBD.id
                });
            });
        }

    });

});


// ==============================================================
// Autenticacion de la aplicacion
// ==============================================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email } , (err, usuarioBD) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if(!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        // Crear token
        var token = jwt.sign({ usuario: usuarioBD}, SEED, {expiresIn : 14400});
        usuarioBD.password = ':)';

        res.status(200).json({
            ok: true,
            usuarioBD,
            token,
            id: usuarioBD.id
        });

    });
});

module.exports = app;
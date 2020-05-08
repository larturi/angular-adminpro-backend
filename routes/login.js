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

app.post('/google', (req, res, next) =>{  
    var token = req.body.token;  
    const oAuth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,     
        GOOGLE_SECRET   
    );   
    
    const ticket = oAuth2Client.verifyIdToken({
        idToken: token, 
        audience: GOOGLE_CLIENT_ID 
    });   
    
    ticket.then(data =>{     

        Usuario.findOne({ email: data.payload.email}, (err, usuarioBD) => {

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

                var googleUser = data.payload;
    
                var usuario = new Usuario();

                usuario.nombre = googleUser.name;
                usuario.email = googleUser.email;
                usuario.img = googleUser.picture;
                usuario.google = true;
                usuario.password = ':)';
    
                usuario.save( (err, usuarioBD) => {

                    if(err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario en la BD',
                            errors: err
                        });
                    }

                    var token = jwt.sign({ usuario: usuarioBD}, SEED, {expiresIn : 14400});
    
                    res.status(200).json({
                        ok: true,
                        usuario,
                        token,
                        id: usuario.id
                    });
                });
            }

        });
    })
    .catch((err) => {
        // next(err);
        return res.status(400).json({
            ok: true,
            mensaje: 'Token no valido',
            errors: err
        });
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
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==============================================================
// Verificar Token
// ==============================================================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if(err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido!',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

};

// ==============================================================
// Verificar Admin
// ==============================================================
exports.verificaAdminRole = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {

      return res.status(401).json({
         ok: false,
         mensaje: 'Token no valido!',
         errors: { message: 'No es administrador'}
      });

    }

};

// ==============================================================
// Verificar Admin o Mismo Usuario
// ==============================================================
exports.verificaAdminOMismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    // console.log('1', id);
    // console.log('2', usuario);


    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {

      return res.status(401).json({
         ok: false,
         mensaje: 'Token no valido 2!',
         errors: { message: 'No es administrador'}
      });

    }

};


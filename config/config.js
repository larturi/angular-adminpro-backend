
// Seed Token
module.exports.SEED = 'SEDD-SISTEMA-HOSPITALARIO';

// Google
module.exports.GOOGLE_CLIENT_ID = '682059001098-1at0l6aqugrm47g89jgtri3gjigtgbf1.apps.googleusercontent.com';
module.exports.GOOGLE_SECRET = 'Zb9XNRhOXWtOH3KVrUlt9UzN';

// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// MongoDB
let urlDB;

if(process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/hospitalDB';
} else {
    urlDB = 'mongodb+srv://larturi:7phDlBnauhOlY4J1@cluster0-eubhx.mongodb.net/hospitalBD';
}

process.env.URLDB = urlDB;


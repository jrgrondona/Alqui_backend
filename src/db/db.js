const mysql = require('mysql');
const mysqlConeccion= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '095462',
    database: 'alquileres'
});
mysqlConeccion.connect(function(err){
    if(err){
        console.log('mi error es', err);
        return;
    }else{
        console.log('Conectado a la db');
    }
})
module.exports= mysqlConeccion;
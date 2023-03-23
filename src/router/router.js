const express = require('express');
const router = express();

//// conecta a la base de datos ////
const mysqlConeccion = require('../db/db');
//////fin archivo de coneccion

//// Aca inician las rutas ////
router.get('/', (req, res) => {
    res.send('Hola Juan');
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los inquilinos /////
router.get('/inquilinos', (req, res)=>{
        mysqlConeccion.query('SELECT * FROM inquilinos', (err, registro)=>{
            if(!err){
                res.json(registro);
            }else{
                console.log(err)
            }
    })
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los pagos /////
router.get('/pagos', (req, res)=>{
    mysqlConeccion.query('SELECT * FROM pagos', (err, registro)=>{
        if(!err){
            res.json(registro);
        }else{
            console.log(err)
        }
   })
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los propiedad /////
router.get('/propiedad', (req, res)=>{
    mysqlConeccion.query('SELECT * FROM propiedad', (err, registro)=>{
        if(!err){
            res.json(registro);
        }else{
            console.log(err)
        }
   })
});
module.exports = router;
const express = require('express');
const router = express();
const cors = require('cors')
//--------- CONSULTA FECHA -------//
const moment = require('moment');
//----------Para encriptar password----------//
const bcrypt = require('bcrypt');
//----------Para generar token-------------//
const jwt = require('jsonwebtoken');

//// conecta a la base de datos ////
const mysqlConeccion = require('../db/db');
//////fin archivo de coneccion

//// Aca inician las rutas ////
router.get('/', (req, res) => {
    res.send('Hola Juan');
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los inquilinos /////
router.get('/inquilinos',verificarToken, (req, res) => {
    jwt.verify(req.token, 'InKey', (error) => {
        if (error) {
            res.sendStatus(403);
        } else {
    mysqlConeccion.query('SELECT *,DATE_FORMAT(fecha_inicio,"%Y-%m-%d") as fecha, DATE_FORMAT(fecha_finalizacion,"%Y-%m-%d") as fecha_finalizacion FROM inquilinos',(err, registro) => {
        if (!err) {
            res.json(registro);
        } else {
            console.log(err)
        }
      })
    }
  })
});
//// Para eliminar registros de Inquilino /////
router.delete('/delete/:id_inquilinos', verificarToken, (req, res) => {
    let id_inquilinos = req.params.id_inquilinos;
    jwt.verify(req.token, 'InKey', (error) => {
        if (error) {
            res.sendStatus(403);
        } else {
            let query = `DELETE FROM inquilinos WHERE id_inquilinos = '${id_inquilinos}'`;
            mysqlConeccion.query(query, (err) => {
                if (!err) {
                    res.json({
                        status: true,
                        mensaje: 'SE ELIMINO EL REGISTRO DE LA BASE DE DATOS !'
                    })
                    // res.send('Se eliminó físicamente el id venta: ' + id_inquilinos);
                } else {
                    res.send('El error es: ' + err);
                }
            })
        }
    })
});
//// Into inquilinos /////
router.post('/inquilinos', verificarToken, (req, res) => {
    const { nombre, numero_telefono, fecha_inicio } = req.body;
    const nombreRegex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/; // Expresión regular que sólo coincide con caracteres de texto
    const telefonoRegex = /^\d{1,3}\d{9,10}$/; // Valida solo numero de telefono
    
    if (!moment(fecha_inicio, 'YYYY-MM-DD', true).isValid()) {
        res.status(400).json({
            status: false,
            mensaje: 'La fecha proporcionada no es válida. Por favor proporcione una fecha válida en el formato YYYY-MM-DD'
        });
    } else if (!nombre.match(nombreRegex)) {
        res.status(400).json({
            status: false,
            mensaje: 'El campo "nombre" solo puede contener letras y espacios'
        });
    } else if (!numero_telefono.match(telefonoRegex)) {
            res.status(400).json({
                status: false,
                mensaje: 'El campo "TELEFONO" debe tener solo numeros'
            });
        } else {    
        jwt.verify(req.token, 'InKey', (error) => {
            if (error) {
                res.sendStatus(403);
            } else {
                let querySelect = `SELECT COUNT(*) AS count FROM inquilinos WHERE nombre = '${nombre}' AND numero_telefono = '${numero_telefono}' AND fecha_inicio = '${fecha_inicio}'`;
                mysqlConeccion.query(querySelect, (errSelect, resultSelect) => {
                    if (!errSelect && resultSelect[0].count === 0) {
                        let queryInsert = `INSERT INTO inquilinos (nombre, numero_telefono, fecha_inicio) VALUES ('${nombre}', '${numero_telefono}', '${fecha_inicio}')`;
                        mysqlConeccion.query(queryInsert, (errInsert, resultInsert) => {
                            if (!errInsert) {
                                res.json({
                                    status: true,
                                    mensaje: 'Se agregó nuevo inquilino'
                                });
                            } else {
                                console.log(errInsert);
                            }
                        });
                    } else if (!errSelect) {
                        res.json({
                            status: false,
                            mensaje: 'Ya existe este inquilino'
                        });
                    } else {
                        console.log(errSelect);
                    }
                });
            }
        });
    }
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los pagos /////
router.get('/pagos', (req, res) => {
    mysqlConeccion.query('SELECT * FROM pagos', (err, registro) => {
        if (!err) {
            res.json(registro);
        } else {
            console.log(err)
        }
    })
});
// ------------------------------------------------------------------------------------------------------//
//// devuele todos los propiedad /////
router.get('/propiedad', (req, res) => {
    mysqlConeccion.query('SELECT * FROM propiedad', (err, registro) => {
        if (!err) {
            res.json(registro);
        } else {
            console.log(err)
        }
    })
});
// ---------------------------------------------Usuario-----------------------------------------------------//
router.get('/usuarios', verificarToken, (req, res) => {
    jwt.verify(req.token, 'InKey', (error, valido) => {
        if (error) {
            res.sendStatus(403);
        } else {
            mysqlConeccion.query('select * from usuarios', (err, registro) => {
                if (!err) {
                    res.json(registro);
                } else {
                    console.log(err)
                }
            })
        }

    })

});
// ------------------------------------------Login---------------------------------------------------------//
router.post('/login', (req, res) => {
    const { username, password } = req.body
    if (username != undefined && password != undefined) {
        mysqlConeccion.query('select u.id_usuario, u.username,  u.password,  u.email, u.apellido_nombre from usuarios u where u.estado="1" AND username=?', [username], (err, rows) => {
            if (!err) {
                if (rows.length != 0) {
                    const bcryptPassword = bcrypt.compareSync(password, rows[0].password);
                    if (bcryptPassword) {
                        jwt.sign({ rows }, 'InKey', { expiresIn: '9600s' }, (err, token) => {
                            res.json(
                                {
                                    status: true,
                                    datos: rows,
                                    token: token
                                });
                        })
                    } else {
                        res.json(
                            {
                                status: false,
                                mensaje: "La Contraseña es incorrecta"
                            });
                    }
                } else {
                    res.json(
                        {
                            status: false,
                            mensaje: "El usuario no existe "
                        });

                }
            } else {
                res.json(
                    {
                        status: false,
                        mensaje: "Error en el servidor"
                    });

            }
        });
    } else {
        res.json({
            status: false,
            mensaje: "Faltan completar datos"
        });
    }
});
// ------------------------------------------Registro---------------------------------------------------------//
router.post('/registro', async (req, res) => {
    const { username, password, email, apellido_nombre } = req.body
    let hash = bcrypt.hashSync(password, 10);

    let query = `INSERT INTO usuarios (username, password, email, apellido_nombre, fecha_creacion) VALUES ('${username}','${hash}','${email}','${apellido_nombre}',NOW())`;
    mysqlConeccion.query(query, (err, registros) => {
        if (!err) {
            res.json({
                status: true,
                mensaje: "El usuario se creó correctamente"
            });
        } else {
            res.json({
                status: false,
                mensaje: "El usuario ya existe"
            })
        }
    })
});
// ------------------------------------------Reset Password---------------------------------------------------//
router.put('/resetpassword/:id', (req, res) => {
    let id = req.params.id;
    const { password } = req.body
    let hash = bcrypt.hashSync(password, 10);
    let query = `UPDATE usuarios SET password='${hash}' WHERE id='${id}'`;
    mysqlConeccion.query(query, (err, registros) => {
        if (!err) {
            res.send('Cambiamos el password! Muchas gracias!');
        } else {
            console.log(err)
        }
    })


});
// ------------------------------------------Funciones---------------------------------------------------//
function verificarToken(req, res, next) {
    const BearerHeader = req.headers['authorization']
    if (typeof BearerHeader !== 'undefined') {
        const bearerToken = BearerHeader.split(" ")[1]
        req.token = bearerToken;
        next();
    } else {
        res.send('Para consultar las Apis debe estar autenticado. Gracias !');
    }
}

function esNumero(parametro) {
    if (!isNaN(parseInt(parametro))) {
        return false
    } else {
        return true
    }
}
module.exports = router;
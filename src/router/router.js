const express = require('express');
const router = express();

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
router.get('/inquilinos', (req, res) => {
    mysqlConeccion.query('SELECT * FROM inquilinos', (err, registro) => {
        if (!err) {
            res.json(registro);
        } else {
            console.log(err)
        }
    })
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
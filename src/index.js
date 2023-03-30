const express= require('express');
const app = express();
app.use(express.json());

// const cors = require('cors')
// const ListaBlanca = ['http://localhost:5173/']
// app.use(cors({ListaBlanca}));

const morgan = require('morgan');
//configuraciones
app.set('puerto' , process.env.PORT || 3301);
// middlewares
app.use(morgan('dev'));

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, UPDATE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
 });

//  rutas para mi aplicacion
app.use(require('./router/router'))
// inicia el servidor NODE
app.listen(app.get('puerto'), ()=>{
    console.log('Servidor en el puerto',app.get('puerto'))
})

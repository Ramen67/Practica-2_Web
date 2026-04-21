const mysql = require('mysql2');
require('dotenv').config();
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
conexion.connect((error) =>{
    if(error){
        console.error('Error al conectar ', error);
        return;
    }
    console.log('Conexion exitosa');
});
module.exports = conexion;
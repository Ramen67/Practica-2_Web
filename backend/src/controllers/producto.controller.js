const db = require('../config/db');

const getProductos = (req, res) =>{
    const sql ="SELECT * FROM productos";
    db.query(sql,(error, resultados)=>{
        if(error){
            return res.status(500).json({error: 'Error al obtener productos'});
        }
        res.json(resultados);
    });
};

module.exports={getProductos};
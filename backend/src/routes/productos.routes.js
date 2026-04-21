const express=require('express');
const router=express.Router();
const {getProductos} = require('../controllers/producto.controller');

router.get('/productos', getProductos);

module.exports = router;
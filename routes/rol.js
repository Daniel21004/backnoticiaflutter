var express = require('express');
var router = express.Router();

const rolC = require('../app/controllers/rolController')
let rolController = new rolC()

/* LIST rol */
router.get('/list', rolController.listar);

/* GET rol*/
router.get('/obtener/:external', rolController.obtener); 

module.exports = router;
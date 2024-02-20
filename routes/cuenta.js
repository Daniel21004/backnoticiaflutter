var express = require('express');
var router = express.Router();

const CuentaC = require('../app/controllers/cuentaController')
let cuentaController = new CuentaC()

/* LIST cuentas */
router.get('/list', cuentaController.listar);

/* GET cuenta */
router.get('/obtener/:external', cuentaController.obtener);

/* POST inciio sesion */
router.post('/login', cuentaController.inicio_sesion);

/* POST inciio sesion */
router.post('/updatestate', cuentaController.actualizarEstado);

module.exports = router;

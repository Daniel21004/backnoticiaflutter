var express = require('express');
var router = express.Router();

const auth = require('../app/middleware/auth')

const personaC = require('../app/controllers/personaController')
let personaController = new personaC()

/* LIST personas */
router.get('/list', auth(['ADMIN', 'USUARIO']), personaController.listar);

/* GET persona */
router.get('/obtener/:external', personaController.obtener);

/* SAVE persona */
router.post('/save', personaController.guardar);

/* UPDATE persona */
router.post('/update', personaController.actualizar);

module.exports = router;

var express = require('express');
var router = express.Router();

const auth = require('../app/middleware/auth')


const ComentarioC = require('../app/controllers/comentarioController');
let comentarioController = new ComentarioC()


/* LIST comentarios */
router.get('/list', comentarioController.listar);

/* LIST comentarios by external_noticia*/
router.get('/list/noticia/:externalNoticia', comentarioController.listExternalNoticia);

/* GET comentario by external*/
router.get('/obtener/:external', comentarioController.obtener);

/* GET comentario by external persona*/
router.get('/obtener/persona/:externalPersona', comentarioController.obtenerExternalPersona);

/* SAVE comentario */
router.post('/save', comentarioController.guardar);

/* UPDATE comentario */
router.post('/update', comentarioController.actualizar);


module.exports = router;

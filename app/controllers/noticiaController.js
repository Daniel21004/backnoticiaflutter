const MIMETYPES = ['image/jpeg', 'image/png'];
const extensionsImagen = ['png', 'jpg'] // Para validar las extensiones de IMAGEN
const sizeMax = 2000000; // 2MB

var models = require('../models')
const uuid = require('uuid')

var noticia = models.noticia

class NoticiaController {

    async listar(req, res) {
        var lista = await noticia.findAll({
            include: [{ model: models.persona, as: 'persona', attributes: ['apellidos', 'nombres'] }],
            attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha']
        });
        res.status(200);
        res.json({ msg: "OK", datos: lista });
        return res;
    }
    
    async listarDisponible(req, res) {
        var lista = await noticia.findAll({
            where: { estado: 1 },
            include: [{ model: models.persona, as: 'persona', attributes: ['apellidos', 'nombres'] }],
            attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha']
        });
        res.status(200);
        res.json({ msg: "OK", datos: lista });
        return res;
    }


    async obtener(req, res) {
        const external = req.params.external;
        var getNoticia = await noticia.findOne({
            where: { external_id: external },
            include: [{ model: models.persona, as: 'persona', attributes: ['apellidos', 'nombres'] }],
            attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha']
        });
        if (getNoticia) {
            res.status(200);
            res.json({ msg: "OK", datos: getNoticia });
        } else {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la noticia' });
        }
    }


    async guardar(req, res) {
        if (!(req.body.hasOwnProperty('titulo') &&
            req.body.hasOwnProperty('cuerpo') &&
            req.body.hasOwnProperty('tipo_noticia') &&
            req.body.hasOwnProperty('archivo') &&
            req.body.hasOwnProperty('external_persona'))) {

            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid') // Si no esta, se debe instalar
        var personaA = await models.persona.findOne({ where: { external_id: req.body.external_persona } }) // Se busca la persona

        console.log({ personaA });

        if (!personaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "El dato a buscar no existe", code: 400 });
            return res;
        }

        var data = {
            titulo: req.body.titulo,
            cuerpo: req.body.cuerpo,
            tipo_noticia: req.body.tipo_noticia,
            archivo: req.body.archivo,
            fecha: Date.now(),
            id_persona: personaA.id,
            external_id: uuid.v4(),
        }

        //? Realiza un transtion con roll back
        let transaction = await models.sequelize.transaction();

        try {
            var result = await models.noticia.create(data, transaction);
            await transaction.commit();
            if (!result) {
                res.status(401);
                res.json({ msg: "ERROR", tag: "No se ha guardado", code: 401 });
                return res;
            }

            res.status(200);
            res.json({ msg: "OK", tag: "Se ha guardado con exito", code: 200 });

        } catch (error) {
            // Si hubo un error, que se revierta los cambios
            if (transaction) await transaction.rollback();
            res.status(203);
            var error_msg = {
                message: {
                    error: error.errors[0].message
                },
                fields: error.fields
            }
            res.json({ msg: "ERROR", code: 200, error_msg: error_msg });
        } finally {
            return res;
        }
    }

}

module.exports = NoticiaController;

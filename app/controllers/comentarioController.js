'use strict';

const jwt = require('jsonwebtoken');

var models = require('../models')
const comentario = models.comentario


class ComentarioController {

    async listar(req, res) {
        const page = req.query.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        var lista = await comentario.findAll({
            attributes: ['external_id', 'fecha', 'cuerpo', 'latitud', 'longitud', 'estado', 'external_persona'],
            include: [{ model: models.noticia, as: 'noticia', attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha'] }],
            // * Ordenar 
            order: [['fecha', 'DESC']],
            // * paginación
            limit: limit,
            offset: offset
        });

        const totalPages = await comentario.count({})

        var resultados = await Promise.all(lista.map(async (item) => {
            const getPersona = await models.persona.findOne({ where: { external_id: item.external_persona }, attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento'] })
            if (!getPersona) {
                res.status(400);
                res.json({ msg: "Error", tag: 'No se encontro la persona' });
                return res;
            }

            return {
                external_id: item.external_id,
                fecha: item.fecha,
                cuerpo: item.cuerpo,
                latitud: item.latitud,
                longitud: item.longitud,
                estado: item.estado,
                persona: getPersona,
                noticia: {
                    external_id: item.noticia.external_id,
                    titulo: item.noticia.titulo,
                    cuerpo_noticia: item.noticia.cuerpo,
                    tipo_noticia: item.noticia.tipo_noticia,
                    archivo: item.noticia.archivo,
                    fecha_noticia: item.noticia.fecha
                }
            };
        }));

        res.status(200);
        res.json({
            msg: "OK", datos: resultados, currentPage: parseInt(page, 10),
            totalPages: totalPages
        });
        return res;
    }

    async obtener(req, res) {
        const external = req.params.external;
        var getComentario = await comentario.findOne({
            where: { external_id: external },
            attributes: ['external_id', 'fecha', 'cuerpo', 'latitud', 'longitud', 'estado', 'external_persona'], include: [{ model: models.noticia, as: 'noticia', attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha'] }],
        });
        if (!getComentario) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro el comentario' });
            return res;
        }

        const getPersona = await models.persona.findOne({ where: { external_id: getComentario.external_persona }, attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento'] })
        if (!getPersona) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la persona' });
            return res;
        }

        const data = {
            external_id: getComentario.external_id,
            fecha: getComentario.fecha,
            cuerpo: getComentario.cuerpo,
            latitud: getComentario.latitud,
            longitud: getComentario.longitud,
            estado: getComentario.estado,
            persona: getPersona,
            noticia: {
                external_id: getComentario.noticia.external_id,
                titulo: getComentario.noticia.titulo,
                cuerpo_noticia: getComentario.noticia.cuerpo,
                tipo_noticia: getComentario.noticia.tipo_noticia,
                archivo: getComentario.noticia.archivo,
                fecha_noticia: getComentario.noticia.fecha
            }
        };

        res.status(200);
        res.json({ msg: "OK", datos: data });

    }

    async obtenerExternalPersona(req, res) {
        const externalPersona = req.params.externalPersona;

        const getPersona = await models.persona.findOne({ where: { external_id: externalPersona }, attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento'] })
        if (!getPersona) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la persona' });
            return res;
        }

        var getComentario = await comentario.findOne({
            where: { external_persona: externalPersona },
            attributes: ['external_id', 'fecha', 'cuerpo', 'latitud', 'longitud', 'estado', 'external_persona'], include: [{ model: models.noticia, as: 'noticia', attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha'] }],
        });

        if (!getComentario) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro el comentario' });
            return res;
        }

        const data = {
            external_id: getComentario.external_id,
            fecha: getComentario.fecha,
            cuerpo: getComentario.cuerpo,
            latitud: getComentario.latitud,
            longitud: getComentario.longitud,
            estado: getComentario.estado,
            persona: getPersona,
            noticia: {
                external_id: getComentario.noticia.external_id,
                titulo: getComentario.noticia.titulo,
                cuerpo_noticia: getComentario.noticia.cuerpo,
                tipo_noticia: getComentario.noticia.tipo_noticia,
                archivo: getComentario.noticia.archivo,
                fecha_noticia: getComentario.noticia.fecha
            }
        };

        res.status(200);
        res.json({ msg: "OK", datos: data });

    }

    async listExternalNoticia(req, res) {
        const externalNoticia = req.params.externalNoticia;

        const page = req.query.page || 1;
        const limit = 10;
        const offset = (page - 1) * limit;


        // Obtengo la noticia a partir del external
        const getNoticia = await models.noticia.findOne({ where: { external_id: externalNoticia } })
        if (!getNoticia) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la noticia' });
            return res;
        }

        var lista = await comentario.findAll({
            where: {id_noticia: getNoticia.id},
            attributes: ['external_id', 'fecha', 'cuerpo', 'latitud', 'longitud', 'estado', 'external_persona'],
            include: [{ model: models.noticia, as: 'noticia', attributes: ['external_id', 'titulo', 'cuerpo', 'tipo_noticia', 'archivo', 'fecha'] }],
            // * Ordenar 
            order: [['fecha', 'DESC']],
            // * paginación
            limit: limit,
            offset: offset
        });        

        const totalPages = await comentario.count({where: {id_noticia: getNoticia.id},})

        var resultados = await Promise.all(lista.map(async (item) => {
            const getPersona = await models.persona.findOne({ where: { external_id: item.external_persona }, attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento'] })
            if (!getPersona) {
                res.status(400);
                res.json({ msg: "Error", tag: 'No se encontro la persona' });
                return res;
            }

            return {
                external_id: item.external_id,
                fecha: item.fecha,
                cuerpo: item.cuerpo,
                latitud: item.latitud,
                longitud: item.longitud,
                estado: item.estado,
                persona: getPersona,
                noticia: {
                    external_id: item.noticia.external_id,
                    titulo: item.noticia.titulo,
                    cuerpo_noticia: item.noticia.cuerpo,
                    tipo_noticia: item.noticia.tipo_noticia,
                    archivo: item.noticia.archivo,
                    fecha_noticia: item.noticia.fecha
                }
            };
        }));

        res.status(200);
        res.json({
            msg: "OK", datos: resultados, currentPage: parseInt(page, 10),
            totalPages: totalPages
        });
    }

    async guardar(req, res) {
        if (!(req.body.hasOwnProperty('cuerpo') &&
            req.body.hasOwnProperty('latitud') &&
            req.body.hasOwnProperty('longitud') &&
            req.body.hasOwnProperty('external_noticia') &&
            req.body.hasOwnProperty('external_persona')
        )) {

            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid')
        var noticiaA = await models.noticia.findOne({ where: { external_id: req.body.external_noticia } }) // Se busca la noticia

        if (!noticiaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La noticia no existe", code: 400 });
            return res;
        }

        var personaA = await models.persona.findOne({ where: { external_id: req.body.external_persona } }) // Se busca la persona
        if (!personaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La persona no existe", code: 400 });
            return res;
        }

        var cuentaA = await models.cuenta.findOne({ where: { id: personaA.id_cuenta } }) // Se busca la cuenta
        if (!cuentaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La cuenta no existe", code: 400 });
            return res;
        }

        var rolA = await models.rol.findOne({ where: { id: cuentaA.id_rol } }) // Se busca el rol

        if (rolA.nombre !== 'USUARIO') {
            res.status(401);
            res.json({ msg: "ERROR", tag: "Solo el usuario puede realizar comentarios", code: 401 });
            return res;
        }

        if (cuentaA.estado != 1) {
            res.status(401);
            res.json({ msg: "ERROR", tag: "El usuario esta baneado", code: 401 });
            return res;
        }

        var data = {
            fecha: Date.now(),
            cuerpo: req.body.cuerpo,
            latitud: req.body.latitud,
            longitud: req.body.longitud,
            id_noticia: noticiaA.id,
            external_persona: personaA.external_id,
            external_id: uuid.v4(),
        }

        console.log({ data });

        let transaction = await models.sequelize.transaction();

        try {
            //? Guarda tanto persona como cuenta. Guarda la entidad fuerte y la debil
            var result = await comentario.create(data, transaction); // Se agrega el transaccion
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

    async actualizar(req, res) {
        if (!(req.body.hasOwnProperty('cuerpo') &&
            req.body.hasOwnProperty('external_id')
        )) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid') // Si no esta, se debe instalar
        var comentarioA = await models.comentario.findOne({ where: { external_id: req.body.external_id } }) // Se busca el comentario
        if (!comentarioA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "El dato a buscar no existe", code: 400 });
            return res;
        }

        var personaA = await models.persona.findOne({ where: { external_id: comentarioA.external_persona } }) // Se busca la persona
        if (!personaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La persona no existe", code: 400 });
            return res;
        }

        var cuentaA = await models.cuenta.findOne({ where: { id: personaA.id_cuenta } }) // Se busca la cuenta
        if (!cuentaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La cuenta no existe", code: 400 });
            return res;
        }

        if (cuentaA.estado != 1) {
            res.status(401);
            res.json({ msg: "ERROR", tag: "El usuario esta baneado", code: 401 });
            return res;
        }

        var data = {
            cuerpo: req.body.cuerpo,
        }

        console.log({ comentarioA: comentarioA });
        console.log({ data });

        let transaction = await models.sequelize.transaction();

        try {
            await comentarioA.set(data)
            var result = await comentarioA.save(transaction);
            await transaction.commit();

            if (!result) {
                res.status(401);
                res.json({ msg: "ERROR", tag: "No se ha guardado", code: 401 });
                return res;
            }

            // Se actualiza el external_id
            // personaA.external_id = uuid.v4();
            // await personaA.save();

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

module.exports = ComentarioController;

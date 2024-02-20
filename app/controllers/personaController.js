'use strict';

var models = require('../models')
var persona = models.persona
var rol = models.rol

const USUARIO = 'USUARIO'

class PersonaController {

    async listar(req, res) {
        var lista = await persona.findAll({
            include: [{ model: models.cuenta, as: "cuenta", attributes: ['external_id', 'correo', 'estado'], include: [{ model: models.rol, as: "rol", attributes: [['external_id', 'id'], 'nombre'] }] }],

            attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento']
        });
        res.status(200);
        res.json({ msg: "OK", datos: lista });
    }

    async obtener(req, res) {
        const external = req.params.external;
        var getPersona = await persona.findOne({
            where: { external_id: external }, 
            include: [{ model: models.cuenta, as: "cuenta", attributes: ['external_id', 'correo'], include: [{ model: models.rol, as: "rol", attributes: [['external_id', 'id'], 'nombre'] }] }],
            attributes: ['external_id', 'nombres', 'apellidos', 'direccion', 'celular', 'fecha_nacimiento']
        });

        if (!getPersona) {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la persona' });
            return res;
        }

        res.status(200);
        res.json({ msg: "OK", datos: getPersona });
        return res;
    }

    async guardar(req, res) {
        if (!(req.body.hasOwnProperty('nombres') &&
            req.body.hasOwnProperty('apellidos') &&
            req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('clave'))) {

            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid') // Si no esta, se debe instalar

        var rolA = req.query.rol

        if (rolA) {
            rolA = await rol.findOne({ where: { nombre: rolA } }) // Se busca el rol    
        } else {
            rolA = await rol.findOne({ where: { nombre: USUARIO } }) // Se busca el rol    
        }

        if (!rolA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "El dato a buscar no existe", code: 400 });
            return res;
        }

        var data = {
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            external_id: uuid.v4(),
            cuenta: {
                correo: req.body.correo,
                clave: req.body.clave,
                id_rol: rolA.id,
            }
        }

        let transaction = await models.sequelize.transaction();

        try {
            var result = await persona.create(data, { include: [{ model: models.cuenta, as: "cuenta" }], transaction });
            await transaction.commit();
            if (!result) {
                res.status(401);
                res.json({ msg: "ERROR", tag: "No se ha guardado", code: 401 });
                return res;
            }
            // Al crear una persona, se actualiza el external_id del rol
            // rolA.external_id = uuid.v4();
            // await rolA.save();

            res.status(200);
            res.json({ msg: "OK", tag: "Se ha guardado con exito", code: 200 });

        } catch (error) {
            // Si hubo un error, que se revierta los cambios
            if (transaction) await transaction.rollback();
            console.log({error});
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
        if (!req.body.hasOwnProperty('external_id')) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid') // Si no esta, se debe instalar
        var personaA = await models.persona.findOne({ where: { external_id: req.body.external_id } }) // Se busca la persona

        if (!personaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "El dato a buscar no existe", code: 400 });
            return res;
        }

        const data = {};

        if (req.body.hasOwnProperty('nombres') && req.body.nombres.length != 0) {
            data.nombres = req.body.nombres;
        }
        if (req.body.hasOwnProperty('apellidos') && req.body.apellidos.length != 0) {
            data.apellidos = req.body.apellidos;
        }
        if (req.body.hasOwnProperty('celular') && req.body.celular.length != 0) {
            data.celular = req.body.celular;
        }
        if (req.body.hasOwnProperty('direccion') && req.body.direccion.length != 0) {
            data.direccion = req.body.direccion;
        }
        if (req.body.hasOwnProperty('fecha_nacimiento')) {
            data.fecha_nacimiento = req.body.fecha_nacimiento;
        }
        if (req.body.hasOwnProperty('estado')) {
            data.estado = req.body.estado;
        }

        console.log({ personaA });
        console.log({ data });


        let transaction = await models.sequelize.transaction();

        try {
            await personaA.set(data)
            var result = await personaA.save(transaction);
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

module.exports = PersonaController;

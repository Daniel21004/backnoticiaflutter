'use strict';

const jwt = require('jsonwebtoken');

var models = require('../models')
var cuenta = models.cuenta
var persona = models.persona

class CuentaController {

    async inicio_sesion(req, res) {
        if (!(req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('clave'))) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        let cuentaA = await cuenta.findOne({ where: { correo: req.body.correo }, include: [{ model: models.persona, as: "persona", attributes: ['external_id','nombres', 'apellidos']}, { model: models.rol, as: "rol", attributes: ['external_id', 'nombre'] }] })

        if (!cuentaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La cuenta no existe", code: 400 });
            return res;
        } else if (cuentaA.estado == false) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La cuenta esta desactivada", code: 400 });
            return res;
        } else if (cuentaA.clave !== req.body.clave) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "La clave no existe", code: 400 });
            return res;
        }

        let token = {
            external: cuentaA.external_id,
            // Se de enviar el rol para la autorizacion
            rol: cuentaA.rol.nombre,
            check: true
        }

        console.log(cuentaA.persona);

        require('dotenv').config();
        const key = process.env.KEY;

        token = jwt.sign(token, key, { expiresIn: '1h' })

        let info = {
            token: token,
            // user: `${cuentaA.persona.nombres} ${cuentaA.persona.apellidos}`,
            external_user: cuentaA.persona.external_id
        }

        res.status(200);
        res.json({ msg: "OK", msg: 'Has iniciado sesion correctamente', datos: info });
        return res;
    }

    async listar(req, res) {
        var lista = await cuenta.findAll();
        res.status(200);
        res.json({ msg: "OK", datos: lista });
        return res;
    }

    async obtener(req, res) {
        const external = req.params.external;
        var getCuenta = await cuenta.findOne({
            where: { external_id: external },
            attributes: [['external_id', 'id'], 'correo', 'estado']
        });
        if (getCuenta) {
            res.status(200);
            res.json({ msg: "OK", datos: getCuenta });
        } else {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro la cuenta' });
        }
    }


    async actualizarEstado(req, res) {

        if (!(req.body.hasOwnProperty('estado') &&
            req.body.hasOwnProperty('external_id'))) {

            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
            return res;
        }

        var uuid = require('uuid') // Si no esta, se debe instalar
        var cuentaA = await models.cuenta.findOne({ where: { external_id: req.body.external_id } }) // Se busca la cuenta

        if (!cuentaA) {
            res.status(400);
            res.json({ msg: "ERROR", tag: "El dato a buscar no existe", code: 400 });
            return res;
        }

        var data = {
            estado: req.body.estado
        }


        let transaction = await models.sequelize.transaction();

        try {
            await cuentaA.set(data)
            var result = await cuentaA.save(transaction);
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

module.exports = CuentaController;

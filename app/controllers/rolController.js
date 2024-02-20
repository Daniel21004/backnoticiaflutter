'use strict';

var models = require('../models')
var rol = models.rol

class RolController {

    async listar(req, res) {
        var lista = await rol.findAll({
            attributes: ['nombre', ['external_id', 'id']] // El external_id va a aparecer como id (alias)
        });
        res.status(200);
        res.json({ msg: "OK", datos: lista });
        return res;
    }

    async obtener(req, res) {
        const external = req.params.external;
        var getRol = await rol.findOne({
            where: { external_id: external },
            attributes: [['external_id', 'id'], 'nombre']
        });
        if (getRol) {
            res.status(200);
            res.json({ msg: "OK", datos: getRol });
        } else {
            res.status(400);
            res.json({ msg: "Error", tag: 'No se encontro el rol' });
        }
    }
}

module.exports = RolController;

const jwt = require('jsonwebtoken'); //! OJO IMPORTAR
const models = require('../models')

/* MIDDLEWARE */
const auth = (roles) => async (req, res, next) => {
    require('dotenv').config();
    const key = process.env.KEY;

    const token = req.headers['jwt'];

    if (!token) {
        res.status(400);
        res.json({ msg: "ERROR", tag: "Falta el token", code: 400 });
        return res;
    }

    jwt.verify(token, key, async (err, decoded) => {

        if (err) {
            res.status(401);
            res.json({ msg: "ERROR", tag: "Token no valido o expirado", code: 401 });
            return res;
        }

        if (!roles.includes(decoded.rol)) {
            res.status(401);
            res.json({ msg: "ERROR", tag: "No tienes los permisos necesarios", code: 401 });
            return res;
        }

        const cuenta = models.cuenta;
        const cuentaA = await cuenta.findOne({ where: { external_id: decoded.external } })

        if (!cuentaA) {
            res.status(401);
            res.json({ msg: "ERROR", tag: "Token no valido o expirado", code: 401 });
            return res;
        }

        console.log({ decoded });

        next();
    })
}

module.exports = auth;
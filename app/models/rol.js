"use strict";

// Automaticamente, sequelize agrega el id a las entidades

module.exports = (sequelize, DataTypes) => {
    const rol = sequelize.define('rol', {
        nombre: { type: DataTypes.STRING(100) },
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
        // No quiero timestamps(createAt y UpdateAt) y que me mantenga el nombre de la tabla
        { timestamps: false, freezeTableName: true });

    rol.afterSync((options) => {
        const insertarRoles = async () => {
            var estaVacio = await rol.findAll(); // Solo lo inserta una vez
            if (estaVacio.length == 0) {
                await rol.create({ nombre: "ADMIN" });
                await rol.create({ nombre: "USUARIO" });
            }
        };

        insertarRoles();
    });

    rol.associate = (models) => {
        models.rol.hasMany(models.cuenta, { foreignKey: 'id_rol', as: 'cuenta' });
    }
    return rol;
};
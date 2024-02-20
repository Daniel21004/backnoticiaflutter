"use strict";

module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        correo: { type: DataTypes.STRING, unique: true },
        clave: { type: DataTypes.STRING(12), allowNull: false },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
        // No quiero timestamps(createAt y UpdateAt) y que me mantenga el nombre de la tabla
        { timestamps: false, freezeTableName: true });

    cuenta.associate = (models) => {
        models.cuenta.belongsTo(models.rol, { foreignKey: 'id_rol', as: 'rol'  });
        models.cuenta.hasOne(models.persona, { foreignKey: 'id_cuenta', as: 'persona' });
    }

    return cuenta;
}; 
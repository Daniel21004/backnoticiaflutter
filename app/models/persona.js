"use strict";

module.exports = (sequelize, DataTypes) => {
    const persona = sequelize.define('persona', {
        nombres: { type: DataTypes.STRING(100), allowNull: false },
        apellidos: { type: DataTypes.STRING(100), defaultValue: "NONE" },
        celular: { type: DataTypes.STRING(20), defaultValue: "0000000000" },
        direccion: { type: DataTypes.STRING, defaultValue: "S/N" },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY, allowNull: true,
            defaultValue: sequelize.fn('now')
        },
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
        // No quiero timestamps(createAt y UpdateAt) y que me mantenga el nombre de la tabla
        { timestamps: false, freezeTableName: true });

    persona.associate = function (models) {
        models.persona.belongsTo(models.cuenta, { foreignKey: 'id_cuenta', as: 'cuenta' });
        models.cuenta.hasMany(models.noticia, { foreignKey: 'id_persona', as: 'noticia' });
    }

    return persona;
}; 
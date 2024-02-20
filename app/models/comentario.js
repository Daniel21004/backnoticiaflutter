"use strict";

module.exports = (sequelize, DataTypes) => {
    const comentario = sequelize.define('comentario', {
        cuerpo: { type: DataTypes.STRING(100), defaultValue: "NONE" },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        latitud: { type: DataTypes.DOUBLE, defaultValue: 0.0 },
        longitud: { type: DataTypes.DOUBLE, defaultValue: 0.0 },
        fecha: { type: DataTypes.DATEONLY },
        external_persona: { type: DataTypes.STRING },
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
        // No quiero timestamps(createAt y UpdateAt) y que me mantenga el nombre de la tabla
        { timestamps: false, freezeTableName: true });

    comentario.associate = (models) => {
        models.comentario.belongsTo(models.noticia, { foreignKey: 'id_noticia', as: 'noticia' }); 
    }

    return comentario;
};
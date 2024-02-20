"use strict";

// Automaticamente, sequelize agrega el id a las entidades

module.exports = (sequelize, DataTypes) => {
    const noticia = sequelize.define('noticia', {
        titulo: { type: DataTypes.STRING(100), defaultValue: "SIN TITULO" },
        cuerpo: { type: DataTypes.STRING, defaultValue: "SIN CUERPO" },
        tipo_noticia: { type: DataTypes.ENUM(['NORMAL', 'FLASH', 'POLITICA', 'DEPORTIVA', 'CULTURAL', 'CIENTIFICA']) },
        archivo: { type: DataTypes.STRING, defaultValue: 'sin_archivo.jpg' },
        fecha: { type: DataTypes.DATEONLY },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        external_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    },
        // No quiero timestamps(createAt y UpdateAt) y que me mantenga el nombre de la tabla
        { timestamps: false, freezeTableName: true });

    noticia.associate = (models) => {
        models.noticia.hasMany(models.comentario, { foreignKey: 'id_noticia', as: 'comentario' });
        models.noticia.belongsTo(models.persona, { foreignKey: 'id_persona', as: 'persona' });
    }

    return noticia;
}; 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpaceTag = sequelize.define('SpaceTag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    space_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'spaces', key: 'space_id' },
    },
    tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tags', key: 'tag_id' },
    },
}, {
    tableName: 'space_tags',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['space_id', 'tag_id'] },
    ],
});

module.exports = SpaceTag;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Space = sequelize.define('Space', {
    space_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    creator_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    visibility: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public',
    },
    is_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'spaces',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Space;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpaceMember = sequelize.define('SpaceMember', {
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
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    role: {
        type: DataTypes.ENUM('creator', 'member'),
        defaultValue: 'member',
    },
}, {
    tableName: 'space_members',
    timestamps: true,
    createdAt: 'joined_at',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['space_id', 'user_id'] },
    ],
});

module.exports = SpaceMember;

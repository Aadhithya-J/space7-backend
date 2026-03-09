const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageLike = sequelize.define('MessageLike', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    message_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'messages', key: 'message_id' },
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
}, {
    tableName: 'message_likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { unique: true, fields: ['message_id', 'user_id'] },
    ],
});

module.exports = MessageLike;

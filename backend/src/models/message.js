const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    message_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    space_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'spaces', key: 'space_id' },
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    media_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
    },
    media_type: {
        type: DataTypes.ENUM('image', 'video', 'audio'),
        allowNull: true,
        defaultValue: null,
    },
    word_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = Message;

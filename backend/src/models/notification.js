const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    notification_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    type: {
        type: DataTypes.ENUM(
            'invite_used',
            'new_message',
            'space_archived',
            'space_locked',
            'appreciation_received'
        ),
        allowNull: false,
    },
    reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    message: {
        type: DataTypes.STRING(500),
        defaultValue: '',
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = Notification;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InviteCode = sequelize.define('InviteCode', {
    code_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    space_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'spaces', key: 'space_id' },
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    used_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null,
        // FK relationship defined in models/index.js via belongsTo
    },
}, {
    tableName: 'invite_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = InviteCode;

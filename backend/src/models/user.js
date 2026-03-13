const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
            this.setDataValue(
                'email',
                typeof value === 'string' ? value.trim().toLowerCase() : value
            );
        },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    profile_picture: {
        type: DataTypes.STRING(500),
        defaultValue: '',
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;

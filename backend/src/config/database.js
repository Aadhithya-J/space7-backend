require('dotenv').config();
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const logging = process.env.NODE_ENV === 'development' ? console.log : false;

const baseConfig = {
    dialect: 'postgres',
    logging,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: isProduction
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        }
        : {},
};

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, baseConfig)
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            ...baseConfig,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
        }
    );

module.exports = sequelize;

const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'almara_plus';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'Alvi252627+';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false,
  define: {
    underscored: true,
  },
});

module.exports = sequelize;





const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Size = sequelize.define(
    'Size',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'sizes',
      timestamps: false,
    }
  );

  return Size;
};





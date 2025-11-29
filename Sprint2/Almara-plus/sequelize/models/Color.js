const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Color = sequelize.define(
    'Color',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: 'colors',
      timestamps: false,
    }
  );

  return Color;
};





const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductColor = sequelize.define(
    'ProductColor',
    {
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      color_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
    },
    {
      tableName: 'product_colors',
      timestamps: false,
    }
  );

  return ProductColor;
};





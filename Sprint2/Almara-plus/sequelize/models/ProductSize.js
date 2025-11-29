const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductSize = sequelize.define(
    'ProductSize',
    {
      product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      size_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
    },
    {
      tableName: 'product_sizes',
      timestamps: false,
    }
  );

  return ProductSize;
};





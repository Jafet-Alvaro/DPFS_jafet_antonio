const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cart = sequelize.define(
    'Cart',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active',
        allowNull: false,
      },
    },
    {
      tableName: 'carts',
      timestamps: true,
    }
  );

  return Cart;
};





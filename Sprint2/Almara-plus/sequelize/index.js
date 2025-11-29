const { Sequelize } = require('sequelize');
const sequelize = require('./config');

const defineUser = require('./models/User');
const defineCategory = require('./models/Category');
const defineColor = require('./models/Color');
const defineSize = require('./models/Size');
const defineProduct = require('./models/Product');
const defineProductColor = require('./models/ProductColor');
const defineProductSize = require('./models/ProductSize');
const defineCart = require('./models/Cart');
const defineCartItem = require('./models/CartItem');

// Inicialización de modelos
const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Color = defineColor(sequelize);
const Size = defineSize(sequelize);
const Product = defineProduct(sequelize);
const ProductColor = defineProductColor(sequelize);
const ProductSize = defineProductSize(sequelize);
const Cart = defineCart(sequelize);
const CartItem = defineCartItem(sequelize);

// Relaciones

// Usuario -> Carritos
User.hasMany(Cart, {
  foreignKey: 'user_id',
  as: 'carts',
});
Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Categoría -> Productos
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products',
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Productos <-> Colores
Product.belongsToMany(Color, {
  through: ProductColor,
  as: 'colors',
  foreignKey: 'product_id',
  otherKey: 'color_id',
});
Color.belongsToMany(Product, {
  through: ProductColor,
  as: 'products',
  foreignKey: 'color_id',
  otherKey: 'product_id',
});

// Productos <-> Talles
Product.belongsToMany(Size, {
  through: ProductSize,
  as: 'sizes',
  foreignKey: 'product_id',
  otherKey: 'size_id',
});
Size.belongsToMany(Product, {
  through: ProductSize,
  as: 'products',
  foreignKey: 'size_id',
  otherKey: 'product_id',
});

// Carrito -> Items
Cart.hasMany(CartItem, {
  foreignKey: 'cart_id',
  as: 'items',
});
CartItem.belongsTo(Cart, {
  foreignKey: 'cart_id',
  as: 'cart',
});

// Productos en items de carrito
Product.hasMany(CartItem, {
  foreignKey: 'product_id',
  as: 'cartItems',
});
CartItem.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

const db = {
  sequelize,
  Sequelize,
  User,
  Category,
  Color,
  Size,
  Product,
  ProductColor,
  ProductSize,
  Cart,
  CartItem,
};

module.exports = db;





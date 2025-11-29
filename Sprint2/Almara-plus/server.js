const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const {
  productValidator,
  handleValidationErrors,
} = require('./middlewares/validation');

// Sequelize
const db = require('./sequelize');
const { Product, Category, Color, Size, User } = db;

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIGURACIÓN GLOBAL ===

// Seguridad básica
app.use(
  helmet({
    contentSecurityPolicy: false, // para no romper scripts inline existentes
  })
);

// Compresión gzip/brotli
app.use(compression());

// Body parsers para formularios y JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sesiones en memoria (para el sprint está bien; en producción usar store persistente)
app.use(
  session({
    secret: 'almara-plus-super-secret', // idealmente process.env.SESSION_SECRET
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Servir assets estáticos (imágenes, CSS, JS)
app.use(
  express.static(path.join(__dirname), {
    maxAge: '7d',
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // HTML sin cache agresivo
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// Helper para enviar archivos de views
const view = (file) => path.join(__dirname, 'views', file);

// Router de usuarios
const usersRouter = require('./routes/users');

// Helper para normalizar arrays (colores, talles)
function normalizeArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

// === RUTAS HTML PRINCIPALES ===

app.get('/', (req, res) => {
  res.sendFile(view('index.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(view('shop.html'));
});

app.get('/productDetail', (req, res) => {
  res.sendFile(view('productDetail.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(view('productCart.html'));
});

app.get('/coleccion', (req, res) => {
  res.sendFile(view('coleccion.html'));
});

app.get('/giftcard', (req, res) => {
  res.sendFile(view('giftcard.html'));
});

app.get('/talles', (req, res) => {
  res.sendFile(view('talles.html'));
});

app.get('/nosotros', (req, res) => {
  res.sendFile(view('nosotros.html'));
});

app.get('/contacto', (req, res) => {
  res.sendFile(view('contacto.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(view('dashboard.html'));
});

// Rutas de usuario (login, registro, perfil, logout)
app.use('/users', usersRouter);

// === API REST PRODUCTOS (Sequelize) ===

// 1) Listado de productos
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
      order: [['sku', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 2) Formulario de creación (metadatos de campos)
app.get('/products/create', (req, res) => {
  res.json({
    fields: [
      'sku',
      'category',
      'name',
      'fabric',
      'sizes',
      'wholesalePrice',
      'retailPrice',
      'colors',
      'image',
      'description',
    ],
  });
});

// 3) Detalle de un producto por sku
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { sku: req.params.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// 4) Acción de creación (POST)
app.post('/products', productValidator, handleValidationErrors, async (req, res) => {
  const {
    sku,
    category,
    name,
    fabric,
    sizes,
    wholesalePrice,
    retailPrice,
    colors,
    image,
    description,
  } = req.body;

  try {
    const existing = await Product.findOne({ where: { sku } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un producto con ese SKU' });
    }

    let categoryInstance = null;
    if (category) {
      const [cat] = await Category.findOrCreate({ where: { name: category } });
      categoryInstance = cat;
    }

    const product = await Product.create({
      sku,
      name,
      fabric,
      wholesale_price: wholesalePrice,
      retail_price: retailPrice,
      image,
      description,
      category_id: categoryInstance ? categoryInstance.id : null,
    });

    const colorNames = normalizeArrayField(colors);
    if (colorNames.length) {
      const colorInstances = [];
      for (const c of colorNames) {
        const [colorInstance] = await Color.findOrCreate({ where: { name: c } });
        colorInstances.push(colorInstance);
      }
      await product.setColors(colorInstances);
    }

    const sizeNames = normalizeArrayField(sizes);
    if (sizeNames.length) {
      const sizeInstances = [];
      for (const s of sizeNames) {
        const [sizeInstance] = await Size.findOrCreate({ where: { name: s } });
        sizeInstances.push(sizeInstance);
      }
      await product.setSizes(sizeInstances);
    }

    const fullProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// 5) Formulario de edición (devuelve datos del producto)
app.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { sku: req.params.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto para edición:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// 6) Acción de edición (PUT)
app.put('/products/:id', productValidator, handleValidationErrors, async (req, res) => {
  const {
    category,
    name,
    fabric,
    sizes,
    wholesalePrice,
    retailPrice,
    colors,
    image,
    description,
  } = req.body;

  try {
    const product = await Product.findOne({ where: { sku: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let categoryInstance = null;
    if (category) {
      const [cat] = await Category.findOrCreate({ where: { name: category } });
      categoryInstance = cat;
    }

    await product.update({
      name: name ?? product.name,
      fabric: fabric ?? product.fabric,
      wholesale_price:
        wholesalePrice !== undefined ? wholesalePrice : product.wholesale_price,
      retail_price:
        retailPrice !== undefined ? retailPrice : product.retail_price,
      image: image ?? product.image,
      description: description ?? product.description,
      category_id: categoryInstance ? categoryInstance.id : product.category_id,
    });

    if (colors !== undefined) {
      const colorNames = normalizeArrayField(colors);
      const colorInstances = [];
      for (const c of colorNames) {
        const [colorInstance] = await Color.findOrCreate({ where: { name: c } });
        colorInstances.push(colorInstance);
      }
      await product.setColors(colorInstances);
    }

    if (sizes !== undefined) {
      const sizeNames = normalizeArrayField(sizes);
      const sizeInstances = [];
      for (const s of sizeNames) {
        const [sizeInstance] = await Size.findOrCreate({ where: { name: s } });
        sizeInstances.push(sizeInstance);
      }
      await product.setSizes(sizeInstances);
    }

    const fullProduct = await Product.findOne({
      where: { id: product.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    res.json(fullProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// 7) Acción de borrado (DELETE)
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ where: { sku: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await product.destroy();
    res.json({ deleted: product.sku });
  } catch (error) {
    console.error('Error al borrar producto:', error);
    res.status(500).json({ error: 'Error al borrar producto' });
  }
});

// === API REST USERS & PRODUCTS PARA DASHBOARD (JSON) ===

// Helper para construir URLs absolutas
function buildUrl(req, pathValue) {
  return `${req.protocol}://${req.get('host')}${pathValue}`;
}

// --- API Usuarios ---

app.get('/api/users', async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    const users = rows.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      detail: buildUrl(req, `/api/users/${user.id}`),
    }));

    const totalPages = Math.ceil(count / limit) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const basePath = req.baseUrl + req.path; // normalmente '' + '/api/users'
    const next = hasNext ? buildUrl(req, `${basePath}?page=${page + 1}`) : null;
    const previous = hasPrev ? buildUrl(req, `${basePath}?page=${page - 1}`) : null;

    res.json({
      count,
      users,
      page,
      totalPages,
      next,
      previous,
    });
  } catch (error) {
    console.error('Error en /api/users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const json = user.toJSON();
    // Remover información sensible
    delete json.password_hash;

    json.avatarUrl = json.avatar ? buildUrl(req, json.avatar) : null;

    res.json(json);
  } catch (error) {
    console.error('Error en /api/users/:id:', error);
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

// --- API Productos ---

app.get('/api/products', async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    // Para countByCategory tomamos todos los productos (sin paginar)
    const allProducts = await Product.findAll({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    const countByCategory = {};
    allProducts.forEach((p) => {
      const catName = p.category ? p.category.name : 'Sin categoría';
      countByCategory[catName] = (countByCategory[catName] || 0) + 1;
    });

    const products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      categories: product.category ? [product.category.name] : [],
      detail: buildUrl(req, `/api/products/${product.id}`),
    }));

    const totalPages = Math.ceil(count / limit) || 1;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const basePath = req.baseUrl + req.path;
    const next = hasNext ? buildUrl(req, `${basePath}?page=${page + 1}`) : null;
    const previous = hasPrev ? buildUrl(req, `${basePath}?page=${page - 1}`) : null;

    res.json({
      count,
      countByCategory,
      products,
      page,
      totalPages,
      next,
      previous,
    });
  } catch (error) {
    console.error('Error en /api/products:', error);
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Color, as: 'colors', through: { attributes: [] } },
        { model: Size, as: 'sizes', through: { attributes: [] } },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const json = product.toJSON();

    json.categories = json.category ? [json.category] : [];
    delete json.category;

    json.colors = (json.colors || []).map((c) => ({
      id: c.id,
      name: c.name,
    }));

    json.sizes = (json.sizes || []).map((s) => ({
      id: s.id,
      name: s.name,
    }));

    json.imageUrl = json.image
      ? buildUrl(req, `/assets/img/${json.image}`.replace(/\/+/g, '/'))
      : null;

    res.json(json);
  } catch (error) {
    console.error('Error en /api/products/:id:', error);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
});

// === API REST TABLAS SECUNDARIAS (categorías, colores, talles) ===

// Categorías
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

app.post('/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const [category] = await Category.findOrCreate({ where: { name } });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

app.put('/categories/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    if (name) {
      category.name = name;
    }
    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    await category.destroy();
    res.json({ deleted: category.id });
  } catch (error) {
    console.error('Error al borrar categoría:', error);
    res.status(500).json({ error: 'Error al borrar categoría' });
  }
});

// Colores
app.get('/colors', async (req, res) => {
  try {
    const colors = await Color.findAll({ order: [['name', 'ASC']] });
    res.json(colors);
  } catch (error) {
    console.error('Error al listar colores:', error);
    res.status(500).json({ error: 'Error al obtener colores' });
  }
});

app.post('/colors', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const [color] = await Color.findOrCreate({ where: { name } });
    res.status(201).json(color);
  } catch (error) {
    console.error('Error al crear color:', error);
    res.status(500).json({ error: 'Error al crear color' });
  }
});

app.delete('/colors/:id', async (req, res) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ error: 'Color no encontrado' });
    }
    await color.destroy();
    res.json({ deleted: color.id });
  } catch (error) {
    console.error('Error al borrar color:', error);
    res.status(500).json({ error: 'Error al borrar color' });
  }
});

// Talles
app.get('/sizes', async (req, res) => {
  try {
    const sizes = await Size.findAll({ order: [['name', 'ASC']] });
    res.json(sizes);
  } catch (error) {
    console.error('Error al listar talles:', error);
    res.status(500).json({ error: 'Error al obtener talles' });
  }
});

app.post('/sizes', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  try {
    const [size] = await Size.findOrCreate({ where: { name } });
    res.status(201).json(size);
  } catch (error) {
    console.error('Error al crear talle:', error);
    res.status(500).json({ error: 'Error al crear talle' });
  }
});

app.delete('/sizes/:id', async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (!size) {
      return res.status(404).json({ error: 'Talle no encontrado' });
    }
    await size.destroy();
    res.json({ deleted: size.id });
  } catch (error) {
    console.error('Error al borrar talle:', error);
    res.status(500).json({ error: 'Error al borrar talle' });
  }
});

// Fallback para cualquier otra ruta de vista .html
app.get('/*.html', (req, res) => {
  res.sendFile(view(path.basename(req.path)));
});

// 404 genérico
app.use((req, res) => {
  res.status(404).sendFile(view('index.html'));
});

// Inicializar base de datos y arrancar servidor
async function start() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a base de datos establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Almara+ server escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
}

start();



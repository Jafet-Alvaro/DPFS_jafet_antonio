## Proyecto Integrador · Almara+

Tienda mayorista de indumentaria femenina, desarrollada como proyecto integrador con Node.js, Express, Sequelize, MySQL y un dashboard en React que consume APIs propias.

Tablero de trabajo (Trello): `https://trello.com/b/mDz4bKmd/proyecto-integrador`

---

### 1. Tecnologías principales

- **Backend**: Node.js + Express
- **Base de datos**: MySQL + Sequelize ORM
- **Frontend**: HTML5, CSS3 (`styles/main.css`), JavaScript vanilla
- **Autenticación**: `express-session` + `bcryptjs`
- **Subida de archivos**: `multer`
- **Validaciones**:
  - Back-end: `express-validator`
  - Front-end: validaciones custom en `assets/js/forms.js`
- **Dashboard**: React 18 (UMD + Babel en el navegador), archivo `assets/js/dashboard.js`

---

### 2. Estructura del proyecto (resumen)

- `server.js`: servidor Express, configuración global, rutas HTML y APIs.
- `sequelize/`
  - `config.js`: conexión a la base de datos (Sequelize).
  - `index.js`: inicialización de modelos y relaciones.
  - `models/*.js`: modelos (`User`, `Product`, `Category`, `Color`, `Size`, `Cart`, etc.).
- `database/`
  - `schema.sql`: creación de base de datos y tablas.
  - `seed.sql`: datos básicos de ejemplo (categorías, algunos productos y usuario admin).
- `controllers/usersController.js`: lógica de registro, login y logout de usuarios.
- `routes/users.js`: rutas de usuario (vistas y acciones).
- `views/`: vistas HTML estáticas (home, shop, login, register, dashboard, etc.).
- `assets/js/`
  - `auth.js`: modal de login en el home.
  - `forms.js`: validaciones de formularios en front (registro/login).
  - `dashboard.js`: app React para el dashboard.
- `styles/main.css`: estilos globales del sitio y dashboard.

---

### 3. Requisitos previos

- **Node.js** 18+ (o versión LTS equivalente).
- **MySQL** 8+ (o MariaDB compatible).

Opcionalmente, un cliente tipo MySQL Workbench / DBeaver para ejecutar los scripts SQL.

---

### 4. Configuración de la base de datos

1. Crear la base de datos y tablas ejecutando `schema.sql`:

   ```sql
   SOURCE /ruta/al/proyecto/database/schema.sql;
   ```

2. (Opcional pero recomendado) Cargar datos básicos y usuario admin:

   ```sql
   SOURCE /ruta/al/proyecto/database/seed.sql;
   ```

   > Nota: el hash de contraseña del usuario admin en `seed.sql` es de ejemplo y se debería reemplazar por un hash real generado con bcrypt para producción.

3. Por defecto, la app se conecta con:

   - BD: `almara_plus`
   - Usuario: `root`
   - Password: *(vacía)*
   - Host: `127.0.0.1`
   - Dialecto: `mysql`

   Estos valores se pueden sobrescribir con variables de entorno:

   ```bash
   DB_NAME=almara_plus
   DB_USER=mi_usuario
   DB_PASS=mi_password
   DB_HOST=127.0.0.1
   DB_DIALECT=mysql
   ```

---

### 5. Instalación y ejecución

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Asegurarse de que MySQL esté corriendo y que la base `almara_plus` exista.

3. Levantar el servidor:

   ```bash
   npm start
   ```

4. Abrir en el navegador:

   - Sitio principal: `http://localhost:3000/`
   - Dashboard React: `http://localhost:3000/dashboard`

---

### 6. Validaciones (back + front)

**Back-end** (`middlewares/validation.js`):

- **Registro de usuarios**
  - `name`: obligatorio, mínimo 2 caracteres.
  - `email`: obligatorio, formato válido, no repetido en base.
  - `password`: obligatoria, mínimo 8 caracteres, con mayúsculas, minúsculas, número y carácter especial.
  - `confirmPassword`: obligatoria, debe coincidir con `password`.
  - `avatar`: si se envía, sólo JPG/JPEG/PNG/GIF.

- **Login de usuarios**
  - `email`: obligatorio, formato válido.
  - `password`: obligatoria.
  - La existencia en base y coincidencia de contraseña se validan en `usersController.login`.

- **Productos (creación/edición)**
  - `name`: obligatorio, mínimo 5 caracteres.
  - `description`: obligatoria, mínimo 20 caracteres.
  - `image`: si se envía, extensión JPG/JPEG/PNG/GIF.

**Front-end** (`assets/js/forms.js`):

- Replica las reglas principales de registro y login.
- Evita enviar formularios inválidos y muestra errores en un bloque `.form-errors` con estilo acorde a la marca.
- Envía los formularios de registro/login por `fetch` (AJAX) y muestra los errores que vengan desde el back sin recargar la página.

---

### 7. APIs para el dashboard

#### 7.1 API de usuarios

- **GET `/api/users?page=N`**

  Devuelve:

  - `count`: total de usuarios en base.
  - `users`: array de usuarios, cada uno con:
    - `id`
    - `name`
    - `email`
    - `detail`: URL para obtener el detalle (`/api/users/:id`).
  - `page`, `totalPages`
  - `next`, `previous`: URLs de paginado (10 resultados por página).

- **GET `/api/users/:id`**

  Devuelve:

  - Una propiedad por cada campo de la tabla `users` **sin** `password_hash`.
  - `avatarUrl`: URL absoluta para mostrar la imagen de perfil (o `null` si no tiene).

#### 7.2 API de productos

- **GET `/api/products?page=N`**

  Devuelve:

  - `count`: total de productos.
  - `countByCategory`: objeto `{ nombreCategoria: cantidad }` calculado sobre todos los productos.
  - `products`: array de productos, cada uno con:
    - `id`
    - `name`
    - `description`
    - `categories`: array con la categoría principal (ej: `["REMERAS"]`).
    - `detail`: URL para obtener el detalle (`/api/products/:id`).
  - `page`, `totalPages`
  - `next`, `previous`: URLs de paginado (10 resultados por página).

- **GET `/api/products/:id`**

  Devuelve:

  - Una propiedad por cada campo en la tabla `products`.
  - Arrays por cada relación:
    - `categories`: array (en este modelo, 0 o 1 elemento).
    - `colors`: array de `{ id, name }`.
    - `sizes`: array de `{ id, name }`.
  - `imageUrl`: URL absoluta para la imagen del producto.

Todas las respuestas están en formato JSON y listas para ser consumidas desde el dashboard o herramientas como Postman.

---

### 8. Dashboard en React

Ruta: `GET /dashboard`

Implementado en:

- Vista: `views/dashboard.html`
- App React: `assets/js/dashboard.js`
- Estilos: sección `/* 13) DASHBOARD */` en `styles/main.css`

El dashboard consume las APIs:

- `/api/users`
- `/api/products`

Y muestra al menos:

- **Totales**
  - Total de productos.
  - Total de usuarios.
  - Total de categorías.

- **Paneles de detalle**
  - Último producto creado (nombre, descripción corta, categoría, link a JSON).
  - Último usuario registrado (nombre, email, link a JSON).

- **Panel de categorías**
  - Lista de categorías con total de productos (`countByCategory`).

- **Listado de productos**
  - Tabla con ID, nombre, categoría, descripción recortada y link a detalle JSON.

La app está montada usando React 18 UMD y Babel en el navegador para simplificar la entrega (no requiere build adicional).

---

### 9. Rutas principales del sitio

- Páginas públicas:
  - `/` → Home (landing principal).
  - `/shop` → Listado de productos (catálogo).
  - `/productDetail` → Detalle estático de producto.
  - `/cart` → Carrito.
  - `/coleccion`, `/giftcard`, `/talles`, `/nosotros`, `/contacto`.
- Usuarios:
  - `/users/register` → Registro.
  - `/users/login` → Login.
  - `/users/profile` → Perfil (requiere sesión).
  - `/users/logout` → Logout.
- Dashboard:
  - `/dashboard` → Panel React consumiendo `/api/users` y `/api/products`.

---

### 10. Notas para corrección

- El proyecto incluye:
  - Esquema SQL de base de datos (`database/schema.sql`) con relaciones y tablas secundarias.
  - Scripts opcionales de seeds (`database/seed.sql`).
  - Modelos Sequelize con asociaciones correctas.
  - CRUD de usuarios y productos sobre MySQL.
  - Validaciones back/front alineadas con las consignas del sprint.
  - APIs de usuarios y productos en formato JSON, con paginado opcional.
  - Dashboard React simple pero funcional que consume dichas APIs.

Para cualquier duda adicional sobre configuración o endpoints, revisar `server.js` y la carpeta `sequelize/`.

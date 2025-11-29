const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const usersController = require('../controllers/usersController');
const {
  registerValidator,
  loginValidator,
  handleValidationErrors,
} = require('../middlewares/validation');

// Configuración de subida de avatar
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'images', 'users'),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + safeName);
  },
});

const upload = multer({ storage });

// Middlewares de acceso
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/users/profile');
  }
  next();
}

// GET /users/register
router.get('/register', requireGuest, usersController.showRegister);

// POST /users/register (con imagen de perfil)
router.post(
  '/register',
  requireGuest,
  upload.single('avatar'),
  registerValidator,
  handleValidationErrors,
  usersController.register
);

// GET /users/login
router.get('/login', requireGuest, usersController.showLogin);

// POST /users/login
router.post('/login', requireGuest, loginValidator, handleValidationErrors, usersController.login);

// GET /users/profile
router.get('/profile', requireAuth, usersController.showProfile);

// GET /users/logout
router.get('/logout', requireAuth, usersController.logout);

module.exports = router;



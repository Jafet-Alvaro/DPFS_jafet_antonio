const path = require('path');
const { body, validationResult } = require('express-validator');
const { User } = require('../sequelize');

// RegEx opcional para complejidad de contraseña:
// al menos una minúscula, una mayúscula, un número y un caracter especial.
const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

// --- VALIDACIONES USUARIOS ---

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre y apellido son obligatorios.')
    .isLength({ min: 2 })
    .withMessage('El nombre y apellido deben tener al menos 2 caracteres.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio.')
    .bail()
    .isEmail()
    .withMessage('Debes ingresar un email válido.')
    .bail()
    .custom(async (value) => {
      const existing = await User.findOne({
        where: { email: value.toLowerCase() },
      });
      if (existing) {
        throw new Error('Ya existe un usuario con ese email.');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres.')
    .bail()
    .matches(passwordComplexityRegex)
    .withMessage(
      'La contraseña debe tener mayúsculas, minúsculas, un número y un carácter especial.'
    ),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Debes confirmar la contraseña.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden.');
      }
      return true;
    }),

  body('avatar').custom((value, { req }) => {
    if (!req.file) return true;
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowed.includes(ext)) {
      throw new Error('La imagen debe ser JPG, JPEG, PNG o GIF.');
    }
    return true;
  }),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es obligatorio.')
    .bail()
    .isEmail()
    .withMessage('Debes ingresar un email válido.'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.'),
];

// --- VALIDACIONES PRODUCTOS ---

const productValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ min: 5 })
    .withMessage('El nombre debe tener al menos 5 caracteres.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es obligatoria.')
    .isLength({ min: 20 })
    .withMessage('La descripción debe tener al menos 20 caracteres.'),

  body('image')
    .optional({ checkFalsy: true })
    .custom((value) => {
      const ext = path.extname(String(value)).toLowerCase();
      if (!ext) return true;
      const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
      if (!allowed.includes(ext)) {
        throw new Error('La imagen debe ser JPG, JPEG, PNG o GIF.');
      }
      return true;
    }),
];

// --- MIDDLEWARE GENÉRICO PARA MANEJAR ERRORES ---

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

module.exports = {
  registerValidator,
  loginValidator,
  productValidator,
  handleValidationErrors,
};





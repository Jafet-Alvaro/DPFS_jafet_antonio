const path = require('path');
const bcrypt = require('bcryptjs');
const { User } = require('../sequelize');

// ==== VISTAS ====

exports.showRegister = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'users', 'register.html'));
};

exports.showLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'users', 'login.html'));
};

exports.showProfile = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'users', 'profile.html'));
};

// ==== ACCIONES ====

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword, whatsapp } = req.body;

  try {
    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Si se subió un archivo, guardamos la ruta pública
    let avatar = null;
    if (req.file) {
      avatar = `/images/users/${req.file.filename}`;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      whatsapp: whatsapp || '',
      avatar,
      password_hash: passwordHash,
      role: 'user',
    });

    // Logueamos al usuario automáticamente
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const wantsJson =
      req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

    if (wantsJson) {
      return res.json({ success: true, redirectTo: '/users/profile', user: req.session.user });
    }

    res.redirect('/users/profile');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ errors: [{ msg: 'Error al registrar usuario.' }] });
  }
};

exports.login = async (req, res) => {
  const { email, password, remember } = req.body;

  try {
    const user = await User.findOne({
      where: { email: (email || '').toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ errors: [{ msg: 'Credenciales inválidas.' }] });
    }

    const ok = await bcrypt.compare(password || '', user.password_hash);
    if (!ok) {
      return res.status(401).json({ errors: [{ msg: 'Credenciales inválidas.' }] });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Recordarme: extiende la vida de la cookie
    if (remember === 'on') {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 días
    } else {
      req.session.cookie.expires = false; // cookie de sesión
    }

    const wantsJson =
      req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

    if (wantsJson) {
      return res.json({ success: true, redirectTo: '/users/profile', user: req.session.user });
    }

    res.redirect('/users/profile');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ errors: [{ msg: 'Error al iniciar sesión.' }] });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};



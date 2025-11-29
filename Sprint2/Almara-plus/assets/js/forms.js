document.addEventListener('DOMContentLoaded', () => {
  // Utilidad para mostrar errores en un contenedor común del formulario
  function showFormErrors(form, errors) {
    let box = form.querySelector('.form-errors');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-errors';
      form.prepend(box);
    }

    if (!errors.length) {
      box.innerHTML = '';
      box.style.display = 'none';
      return;
    }

    box.style.display = 'block';
    box.innerHTML = `
      <ul>
        ${errors.map((e) => `<li>${e}</li>`).join('')}
      </ul>
    `;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function hasStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
  }

  function validateRegisterForm(form) {
    const errors = [];
    const name = form.elements.name?.value.trim() || '';
    const email = form.elements.email?.value.trim() || '';
    const password = form.elements.password?.value || '';
    const confirmPassword = form.elements.confirmPassword?.value || '';
    const avatarInput = form.elements.avatar;

    if (!name) {
      errors.push('El nombre y apellido son obligatorios.');
    } else if (name.length < 2) {
      errors.push('El nombre y apellido deben tener al menos 2 caracteres.');
    }

    if (!email) {
      errors.push('El email es obligatorio.');
    } else if (!isValidEmail(email)) {
      errors.push('Debes ingresar un email válido.');
    }

    if (!password) {
      errors.push('La contraseña es obligatoria.');
    } else if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres.');
    } else if (!hasStrongPassword(password)) {
      errors.push(
        'La contraseña debe tener mayúsculas, minúsculas, un número y un carácter especial.'
      );
    }

    if (!confirmPassword) {
      errors.push('Debes confirmar la contraseña.');
    } else if (confirmPassword !== password) {
      errors.push('Las contraseñas no coinciden.');
    }

    if (avatarInput && avatarInput.files && avatarInput.files[0]) {
      const file = avatarInput.files[0];
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowed.includes(file.type)) {
        errors.push('La imagen debe ser JPG, JPEG, PNG o GIF.');
      }
    }

    showFormErrors(form, errors);
    return errors.length === 0;
  }

  function validateLoginForm(form) {
    const errors = [];
    const email = form.elements.email?.value.trim() || '';
    const password = form.elements.password?.value || '';

    if (!email) {
      errors.push('El email es obligatorio.');
    } else if (!isValidEmail(email)) {
      errors.push('Debes ingresar un email válido.');
    }

    if (!password) {
      errors.push('La contraseña es obligatoria.');
    }

    showFormErrors(form, errors);
    return errors.length === 0;
  }

  async function submitFormAjax(form, validateFn) {
    const ok = validateFn(form);
    if (!ok) return false;

    const formData = new FormData(form);
    const errors = [];

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
        },
      });

      const contentType = response.headers.get('Content-Type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json() : null;

      if (!response.ok) {
        if (data && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            if (err && err.msg) {
              errors.push(err.msg);
            }
          });
        } else if (data && data.error) {
          errors.push(data.error);
        } else {
          errors.push('Ocurrió un error al enviar el formulario. Intentalo de nuevo.');
        }
        showFormErrors(form, errors);
        return false;
      }

      // Éxito
      if (data && data.success && data.redirectTo) {
        window.location.href = data.redirectTo;
        return true;
      }

      // Si por alguna razón no viene JSON estándar, hacemos fallback a recargar
      window.location.reload();
      return true;
    } catch (err) {
      console.error(err);
      errors.push('No se pudo conectar con el servidor. Verificá tu conexión.');
      showFormErrors(form, errors);
      return false;
    }
  }

  // Formularios de registro
  const registerForms = document.querySelectorAll('form[action="/users/register"]');
  registerForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitFormAjax(form, validateRegisterForm);
    });
  });

  // Formularios de login (página y modal)
  const loginForms = document.querySelectorAll('form[action="/users/login"]');
  loginForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitFormAjax(form, validateLoginForm);
    });
  });
});



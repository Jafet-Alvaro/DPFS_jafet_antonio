document.addEventListener('DOMContentLoaded', () => {
  const loginLinks = document.querySelectorAll('a.header__link[href="/users/login"]');
  if (!loginLinks.length) return;

  // Crear modal solo una vez
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-modal__overlay" data-auth-close></div>
    <div class="auth-modal__content">
      <button class="auth-modal__close" type="button" data-auth-close>×</button>
      <h2>Ingresar</h2>
      <p class="auth__subtitle">Accedé a tu cuenta para seguir tus pedidos y guardar tu carrito.</p>
      <form class="form" method="POST" action="/users/login">
        <label>Email
          <input type="email" name="email" required />
        </label>
        <label>Contraseña
          <input type="password" name="password" required />
        </label>
        <label class="checkbox">
          <input type="checkbox" name="remember" />
          <span>Mantenerme conectada por 30 días en este dispositivo</span>
        </label>
        <p class="auth__hint">Usá esta opción solo en tu computadora o celular personal.</p>
        <button type="submit" class="btn btn--primary btn--full">Ingresar</button>
        <p class="auth__alt">¿No tenés cuenta?
          <a href="/users/register">Crear cuenta</a>
        </p>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const openModal = () => {
    modal.classList.add('auth-modal--open');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    modal.classList.remove('auth-modal--open');
    document.body.classList.remove('no-scroll');
  };

  loginLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-auth-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});






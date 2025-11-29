const { useState, useEffect } = React;

function StatCard({ title, value, description }) {
  return (
    <div className="dashboard-card">
      <h3>{title}</h3>
      <p className="dashboard-card__value">{value}</p>
      {description && <p className="dashboard-card__desc">{description}</p>}
    </div>
  );
}

function DashboardApp() {
  const [usersData, setUsersData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/products'),
        ]);

        if (!usersRes.ok || !productsRes.ok) {
          throw new Error('Error al cargar datos del dashboard');
        }

        const [usersJson, productsJson] = await Promise.all([
          usersRes.json(),
          productsRes.json(),
        ]);

        setUsersData(usersJson);
        setProductsData(productsJson);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos. Intentalo de nuevo más tarde.');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }

  if (error) {
    return <div className="form-errors"><ul><li>{error}</li></ul></div>;
  }

  const totalUsers = usersData ? usersData.count : 0;
  const totalProducts = productsData ? productsData.count : 0;
  const totalCategories = productsData ? Object.keys(productsData.countByCategory || {}).length : 0;

  const productsList = productsData ? productsData.products || [] : [];
  const lastProduct = productsList[productsList.length - 1] || null;

  const lastUser = usersData && Array.isArray(usersData.users) && usersData.users.length
    ? usersData.users[usersData.users.length - 1]
    : null;

  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        <StatCard
          title="Total de productos"
          value={totalProducts}
        />
        <StatCard
          title="Total de usuarios"
          value={totalUsers}
        />
        <StatCard
          title="Total de categorías"
          value={totalCategories}
        />
      </div>

      <section className="dashboard__section">
        <h2>Últimos registros</h2>
        <div className="dashboard__grid dashboard__grid--two">
          <div className="dashboard-panel">
            <h3>Último producto creado</h3>
            {lastProduct ? (
              <div>
                <p><strong>{lastProduct.name}</strong></p>
                <p className="dashboard-muted">{lastProduct.description}</p>
                {lastProduct.categories && lastProduct.categories.length > 0 && (
                  <p className="dashboard-pill">
                    {lastProduct.categories[0]}
                  </p>
                )}
                <a href={lastProduct.detail} target="_blank" rel="noreferrer" className="link">
                  Ver detalle JSON
                </a>
              </div>
            ) : (
              <p className="dashboard-muted">No hay productos todavía.</p>
            )}
          </div>

          <div className="dashboard-panel">
            <h3>Último usuario registrado</h3>
            {lastUser ? (
              <div>
                <p><strong>{lastUser.name}</strong></p>
                <p className="dashboard-muted">{lastUser.email}</p>
                <a href={lastUser.detail} target="_blank" rel="noreferrer" className="link">
                  Ver detalle JSON
                </a>
              </div>
            ) : (
              <p className="dashboard-muted">No hay usuarios registrados.</p>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard__section">
        <h2>Categorías y cantidad de productos</h2>
        <div className="dashboard__chips">
          {productsData && productsData.countByCategory
            ? Object.entries(productsData.countByCategory).map(([category, count]) => (
              <span key={category} className="dashboard-chip">
                <strong>{category}</strong>
                <span>{count} productos</span>
              </span>
            ))
            : <p className="dashboard-muted">Sin categorías.</p>}
        </div>
      </section>

      <section className="dashboard__section">
        <h2>Listado de productos</h2>
        {productsList.length === 0 ? (
          <p className="dashboard-muted">No hay productos para mostrar.</p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{(p.categories && p.categories[0]) || '—'}</td>
                    <td className="dashboard-table__desc">
                      {p.description ? `${p.description.slice(0, 80)}...` : '—'}
                    </td>
                    <td>
                      <a href={p.detail} target="_blank" rel="noreferrer" className="link">
                        JSON
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const rootEl = document.getElementById('dashboard-root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<DashboardApp />);
}





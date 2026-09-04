import React from 'react';
import { 
  Store, 
  Tag, 
  BarChart3, 
  Boxes, 
  Sun, 
  Moon, 
  Plus, 
  RotateCcw
} from 'lucide-react';

/**
 * Topbar Superior Fijo con estética de Tienda Familiar
 * @param {Object} props
 * @param {string} props.activeTab - Pestaña actual ('store' | 'offers' | 'dashboard' | 'inventory')
 * @param {Function} props.setActiveTab - Callback para cambiar de pestaña
 * @param {string} props.theme - Tema actual ('light' | 'dark')
 * @param {Function} props.toggleTheme - Callback para alternar modo claro/oscuro
 * @param {Object} props.stats - Estadísticas calculadas (ofertas activas, alertas, etc.)
 * @param {Function} props.onOpenNewProduct - Abrir modal de nuevo producto
 * @param {Function} props.onRefresh - Sincronizar datos con json-server
 */
export function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  stats,
  onOpenNewProduct,
  onRefresh,
}) {
  const { activeOffersCount, totalAlerts } = stats;

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* Marca de Tienda Familiar */}
        <div 
          className="topbar-brand" 
          onClick={() => setActiveTab('store')}
          role="button"
          tabIndex={0}
          title="Ir a la Tienda Principal"
        >
          <div className="brand-badge-icon" style={{ padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/store-logo.svg" alt="Logo La Tiendita Familiar" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          </div>
          <div className="brand-titles">
            <h1 className="brand-main-name">
              La Tiendita <span className="brand-name-accent">Familiar</span>
            </h1>
            <span className="brand-tagline">Boutique & Market · Calidad & Ahorro</span>
          </div>
        </div>

        {/* Pestañas de Navegación Principal */}
        <nav className="topbar-nav" aria-label="Navegación principal">
          {/* 1. Tienda / Catálogo */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <Store size={17} />
            <span>Tienda</span>
          </button>

          {/* 2. Ofertas y Descuentos */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <Tag size={17} />
            <span>Ofertas</span>
            {activeOffersCount > 0 && (
              <span className="nav-offer-count-badge" title={`${activeOffersCount} ofertas activas`}>
                {activeOffersCount}
              </span>
            )}
          </button>

          {/* 3. Dashboard Administrativo */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={17} />
            <span>Dashboard</span>
          </button>

          {/* 4. Gestión de Inventario */}
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Boxes size={17} />
            <span>Inventario</span>
            {totalAlerts > 0 && (
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-rose)',
                  display: 'inline-block',
                }}
                title="Hay productos con stock bajo o agotados"
              />
            )}
          </button>
        </nav>

        {/* Acciones del Topbar */}
        <div className="topbar-actions">
          {/* Selector de Modo Claro / Oscuro */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Botón Sincronizar */}
          <button
            type="button"
            className="btn-icon-only"
            onClick={onRefresh}
            title="Sincronizar con base de datos (json-server)"
          >
            <RotateCcw size={17} />
          </button>

          {/* Botón Nuevo Producto */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenNewProduct}
            id="btn-navbar-new-product"
          >
            <Plus size={17} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

import React from 'react';
import { Store, Plus, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

/**
 * Componente Navbar: Barra superior con marca del negocio, alertas rápidas y acción principal
 * @param {Object} props
 * @param {Object} props.stats - Métricas calculadas (alertas, stock bajo, agotados)
 * @param {Function} props.onOpenNewProduct - Callback para abrir modal de nuevo producto
 * @param {Function} props.onFilterAlerts - Callback para filtrar rápidamente productos en alerta
 * @param {Function} props.onResetDemo - Callback para restaurar datos demo
 */
export function Navbar({ stats, onOpenNewProduct, onFilterAlerts, onRefresh }) {
  const { totalAlerts, outOfStockCount, lowStockCount } = stats;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Marca y Nombre del Negocio */}
        <div className="navbar-brand">
          <div className="brand-icon">
            <Store size={22} />
          </div>
          <div>
            <h1 className="brand-title">
              StockFlow <span style={{ color: 'var(--primary)', fontSize: '0.85em' }}>Local</span>
            </h1>
            <p className="brand-subtitle">Control de Inventario & Existencias</p>
          </div>
        </div>

        {/* Acciones y Alertas Rápidas */}
        <div className="navbar-actions">
          {/* Badge interactivo de Alertas */}
          {totalAlerts > 0 ? (
            <button
              className={`alert-pill ${outOfStockCount > 0 ? 'critical-alerts' : 'has-alerts'}`}
              onClick={onFilterAlerts}
              title="Haz clic para ver los productos en alerta"
              type="button"
            >
              <AlertTriangle size={15} />
              <span>
                {outOfStockCount > 0 ? `${outOfStockCount} Agotado(s)` : ''}
                {outOfStockCount > 0 && lowStockCount > 0 ? ' · ' : ''}
                {lowStockCount > 0 ? `${lowStockCount} Stock Bajo` : ''}
              </span>
            </button>
          ) : (
            <div className="alert-pill all-good" title="Todo el inventario está en niveles óptimos">
              <CheckCircle2 size={15} />
              <span>Stock Óptimo</span>
            </div>
          )}

          {/* Botón secundario para recargar datos desde la API REST */}
          <button
            onClick={onRefresh}
            className="btn-icon-only"
            title="Sincronizar y recargar datos desde la API (json-server)"
            type="button"
          >
            <RotateCcw size={17} />
          </button>

          {/* Botón Principal para registrar nuevo producto */}
          <button
            className="btn btn-primary"
            onClick={onOpenNewProduct}
            type="button"
            id="btn-add-new-product"
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>
    </header>
  );
}
export default Navbar;

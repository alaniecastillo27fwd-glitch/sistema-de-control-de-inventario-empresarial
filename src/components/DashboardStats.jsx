import React from 'react';
import { Package, Layers, AlertTriangle, AlertOctagon } from 'lucide-react';

/**
 * Componente DashboardStats: Muestra tarjetas con las métricas clave del negocio
 * @param {Object} props
 * @param {Object} props.stats - Objeto de estadísticas calculadas
 * @param {Function} props.onSelectFilter - Permite filtrar la tabla al hacer clic en una tarjeta
 * @param {string} props.activeFilter - Filtro actual seleccionado
 */
export function DashboardStats({ stats, onSelectFilter, activeFilter }) {
  const {
    totalProducts,
    totalUnits,
    lowStockCount,
    outOfStockCount,
    totalInventoryValue,
  } = stats;

  return (
    <section className="stats-grid" aria-label="Métricas del negocio">
      {/* 1. Total Productos Registrados */}
      <div
        className={`stat-card primary ${activeFilter === 'ALL' ? 'active-card' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('ALL')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        title="Ver todos los productos"
      >
        <div className="stat-info">
          <span className="stat-label">Total Productos</span>
          <span className="stat-value">{totalProducts}</span>
          <span className="stat-subtext">Registrados en catálogo</span>
        </div>
        <div className="stat-icon-wrapper primary">
          <Package size={24} />
        </div>
      </div>

      {/* 2. Unidades Totales en Stock */}
      <div className="stat-card emerald">
        <div className="stat-info">
          <span className="stat-label">Unidades Totales</span>
          <span className="stat-value">{totalUnits.toLocaleString()}</span>
          <span className="stat-subtext">
            Valor est.: ${totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="stat-icon-wrapper emerald">
          <Layers size={24} />
        </div>
      </div>

      {/* 3. Productos con Stock Bajo */}
      <div
        className={`stat-card amber ${activeFilter === 'LOW' ? 'active-card' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('LOW')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        title="Filtrar productos con stock bajo"
      >
        <div className="stat-info">
          <span className="stat-label">Stock Bajo</span>
          <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            {lowStockCount}
          </span>
          <span className="stat-subtext">
            {lowStockCount === 1 ? 'Requiere reposición pronto' : 'Requieren reposición'}
          </span>
        </div>
        <div className="stat-icon-wrapper amber">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* 4. Productos Agotados (Crítico) */}
      <div
        className={`stat-card rose ${activeFilter === 'OUT' ? 'active-card' : ''}`}
        onClick={() => onSelectFilter && onSelectFilter('OUT')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        title="Filtrar productos agotados"
      >
        <div className="stat-info">
          <span className="stat-label">Agotados</span>
          <span className="stat-value" style={{ color: 'var(--accent-rose)' }}>
            {outOfStockCount}
          </span>
          <span className="stat-subtext">
            {outOfStockCount > 0 ? 'Sin existencias disponibles' : 'Sin faltantes críticos'}
          </span>
        </div>
        <div className="stat-icon-wrapper rose">
          <AlertOctagon size={24} />
        </div>
      </div>
    </section>
  );
}

export default DashboardStats;

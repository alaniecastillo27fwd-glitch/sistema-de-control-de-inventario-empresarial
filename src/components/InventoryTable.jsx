import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit2, 
  Trash2, 
  PackageOpen
} from 'lucide-react';

/**
 * Tabla interactiva para la gestión de productos con búsqueda en tiempo real,
 * filtros de estado (Todos, Óptimo, Stock Bajo, Agotado) y botones de acción rápida.
 * 
 * @param {Object} props
 * @param {Array} props.products - Lista completa de productos
 * @param {Function} props.onOpenMovement - Callback para registrar Entrada/Salida (p, type)
 * @param {Function} props.onEditProduct - Callback para editar producto (p)
 * @param {Function} props.onDeleteProduct - Callback para eliminar producto (id)
 * @param {string} props.activeFilter - Filtro de estado seleccionado externamente
 * @param {Function} props.setActiveFilter - Actualizar filtro de estado
 */
export function InventoryTable({
  products,
  onOpenMovement,
  onEditProduct,
  onDeleteProduct,
  activeFilter,
  setActiveFilter,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Obtener categorías únicas presentes en los productos actuales
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Lógica de filtrado combinado: Búsqueda + Filtro de Estado + Filtro de Categoría
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // 1. Filtro de búsqueda por texto
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Filtro de categoría
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Filtro por nivel de stock
      if (activeFilter === 'LOW') {
        return item.stock <= item.minStock && item.stock > 0;
      }
      if (activeFilter === 'OUT') {
        return item.stock === 0;
      }
      if (activeFilter === 'NORMAL') {
        return item.stock > item.minStock;
      }

      return true; // 'ALL'
    });
  }, [products, searchTerm, selectedCategory, activeFilter]);

  /**
   * Determina el badge de estado visual según el nivel de existencias
   */
  const renderStockBadge = (product) => {
    if (product.stock === 0) {
      return (
        <span className="status-badge out" title="Sin existencias disponibles">
          <span className="badge-dot" />
          Agotado
        </span>
      );
    }
    if (product.stock <= product.minStock) {
      return (
        <span className="status-badge low" title={`Por debajo o igual al mínimo de ${product.minStock}`}>
          <span className="badge-dot" />
          Stock Bajo
        </span>
      );
    }
    return (
      <span className="status-badge normal" title="Nivel de inventario saludable">
        <span className="badge-dot" />
        Óptimo
      </span>
    );
  };

  const handleDeleteClick = (product) => {
    const confirmMessage = `¿Estás seguro de eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`;
    if (window.confirm(confirmMessage)) {
      onDeleteProduct(product.id);
    }
  };

  return (
    <div className="table-panel">
      {/* Barra de herramientas superior: Búsqueda y Filtros */}
      <div className="table-header-toolbar">
        <div className="toolbar-title-group">
          <h2>Catálogo de Existencias</h2>
          <p>
            {filteredProducts.length} de {products.length} productos listados
          </p>
        </div>

        <div className="toolbar-filters">
          {/* Campo de búsqueda */}
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por Categoría */}
          {availableCategories.length > 0 && (
            <select
              className="form-select"
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">Todas las Categorías</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {/* Tabs de Filtro de Estado */}
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('NORMAL')}
            >
              Óptimo
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'LOW' ? 'active' : ''}`}
              onClick={() => setActiveFilter('LOW')}
            >
              Stock Bajo
            </button>
            <button
              type="button"
              className={`filter-tab ${activeFilter === 'OUT' ? 'active' : ''}`}
              onClick={() => setActiveFilter('OUT')}
            >
              Agotado
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Estado</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Precio Unitario</th>
              <th>Valor Total</th>
              <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <PackageOpen size={24} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        No se encontraron productos
                      </p>
                      <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                        {searchTerm || activeFilter !== 'ALL' || selectedCategory !== 'ALL'
                          ? 'Intenta ajustar los criterios de búsqueda o filtros.'
                          : 'Aún no hay productos registrados. Haz clic en "Nuevo Producto" para comenzar.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const totalValue = (product.stock * product.price).toFixed(2);

                return (
                  <tr key={product.id}>
                    {/* Nombre y Categoría */}
                    <td>
                      <div className="product-name-cell">
                        <span className="product-name">{product.name}</span>
                        <span className="product-category-tag">{product.category}</span>
                      </div>
                    </td>

                    {/* Badge de Estado */}
                    <td>{renderStockBadge(product)}</td>

                    {/* Stock Actual */}
                    <td>
                      <span className="stock-value-cell">{product.stock}</span>
                      <span className="stock-min-hint">unidades</span>
                    </td>

                    {/* Stock Mínimo */}
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{product.minStock} u.</span>
                    </td>

                    {/* Precio Unitario */}
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        ${product.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Valor Económico en Existencia */}
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ${totalValue}
                      </span>
                    </td>

                    {/* Acciones Rápidas */}
                    <td>
                      <div className="actions-group">
                        {/* Botón Entrada de Stock */}
                        <button
                          type="button"
                          className="btn-action in"
                          onClick={() => onOpenMovement(product, 'IN')}
                          title={`Registrar Entrada para ${product.name}`}
                        >
                          <ArrowUpRight size={14} />
                          <span>Entrada</span>
                        </button>

                        {/* Botón Salida de Stock */}
                        <button
                          type="button"
                          className="btn-action out"
                          onClick={() => onOpenMovement(product, 'OUT')}
                          title={`Registrar Salida para ${product.name}`}
                          disabled={product.stock === 0}
                          style={{
                            opacity: product.stock === 0 ? 0.45 : 1,
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <ArrowDownRight size={14} />
                          <span>Salida</span>
                        </button>

                        {/* Editar Producto */}
                        <button
                          type="button"
                          className="btn-icon-only"
                          onClick={() => onEditProduct(product)}
                          title="Editar detalles del producto"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Eliminar Producto */}
                        <button
                          type="button"
                          className="btn-icon-only danger"
                          onClick={() => handleDeleteClick(product)}
                          title="Eliminar producto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryTable;

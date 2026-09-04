import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit2, 
  Trash2, 
  PackageOpen, 
  Tag
} from 'lucide-react';

/**
 * Tabla Administrativa de Inventario:
 * Soporte para filtrado, edición, eliminación, entradas/salidas y asignación rápida de ofertas.
 * 
 * @param {Object} props
 * @param {Array} props.products - Lista de productos
 * @param {Function} props.onOpenMovement - Callback para registrar Entrada/Salida (p, type)
 * @param {Function} props.onEditProduct - Callback para editar producto (p)
 * @param {Function} props.onDeleteProduct - Callback para eliminar producto (id)
 * @param {Function} props.onOpenOfferModal - Callback para gestionar oferta (p)
 * @param {string} props.activeFilter - Filtro de estado
 * @param {Function} props.setActiveFilter - Actualizar filtro de estado
 */
export function InventoryTable({
  products,
  onOpenMovement,
  onEditProduct,
  onDeleteProduct,
  onOpenOfferModal,
  activeFilter = 'ALL',
  setActiveFilter,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Categorías únicas
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).filter(Boolean).sort();
  }, [products]);

  // Lógica de filtrado combinado
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      if (activeFilter === 'LOW') {
        return item.stock <= item.minStock && item.stock > 0;
      }
      if (activeFilter === 'OUT') {
        return item.stock === 0;
      }
      if (activeFilter === 'NORMAL') {
        return item.stock > item.minStock;
      }
      if (activeFilter === 'OFFERS') {
        return Boolean(item.enOferta);
      }

      return true; // 'ALL'
    });
  }, [products, searchTerm, selectedCategory, activeFilter]);

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
    if (onDeleteProduct) {
      onDeleteProduct(product);
    }
  };

  return (
    <div className="table-panel">
      {/* Barra de herramientas superior */}
      <div className="table-header-toolbar">
        <div className="section-title-group">
          <h2>Gestión Administrativa de Existencias</h2>
          <p>
            {filteredProducts.length} de {products.length} productos listados
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Buscador */}
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
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
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

          {/* Filtros de Estado */}
          <div className="time-range-toggle">
            <button
              type="button"
              className={`time-range-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter && setActiveFilter('ALL')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`time-range-btn ${activeFilter === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setActiveFilter && setActiveFilter('NORMAL')}
            >
              Óptimo
            </button>
            <button
              type="button"
              className={`time-range-btn ${activeFilter === 'LOW' ? 'active' : ''}`}
              onClick={() => setActiveFilter && setActiveFilter('LOW')}
            >
              Stock Bajo
            </button>
            <button
              type="button"
              className={`time-range-btn ${activeFilter === 'OUT' ? 'active' : ''}`}
              onClick={() => setActiveFilter && setActiveFilter('OUT')}
            >
              Agotado
            </button>
            <button
              type="button"
              className={`time-range-btn ${activeFilter === 'OFFERS' ? 'active' : ''}`}
              onClick={() => setActiveFilter && setActiveFilter('OFFERS')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Tag size={13} />
              <span>Ofertas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Producto & Categoría</th>
              <th>Estado de Stock</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Precio Regular</th>
              <th>Oferta Activa</th>
              <th>Valor Total</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <PackageOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.7 }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      No se encontraron productos coincidentes
                    </p>
                    <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
                      Intenta ajustar los criterios de búsqueda o filtros.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const effectivePrice = product.enOferta && product.precioOferta ? product.precioOferta : product.price;
                const totalValue = (product.stock * effectivePrice).toFixed(2);

                return (
                  <tr key={product.id}>
                    {/* Nombre y Categoría */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {product.name}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {product.category}
                        </span>
                      </div>
                    </td>

                    {/* Badge de Estado */}
                    <td>{renderStockBadge(product)}</td>

                    {/* Stock Actual */}
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{product.stock}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>u.</span>
                    </td>

                    {/* Stock Mínimo */}
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>{product.minStock} u.</span>
                    </td>

                    {/* Precio Regular */}
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Oferta Activa */}
                    <td>
                      {product.enOferta ? (
                        <button
                          type="button"
                          className="promo-tag"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => onOpenOfferModal && onOpenOfferModal(product)}
                          title="Hacer clic para editar oferta"
                        >
                          <Tag size={11} />
                          <span>-${product.porcentajeDescuento}% (${Number(product.precioOferta).toFixed(2)})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenOfferModal && onOpenOfferModal(product)}
                          style={{
                            background: 'transparent',
                            border: '1px dashed var(--border-color)',
                            borderRadius: 'var(--radius-pill)',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                          title="Activar oferta en este producto"
                        >
                          + Ofertar
                        </button>
                      )}
                    </td>

                    {/* Valor Total en Existencia */}
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-mint-600)' }}>
                        ${totalValue}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        {/* Entrada de Stock */}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          onClick={() => onOpenMovement(product, 'IN')}
                          title={`Registrar Entrada para ${product.name}`}
                        >
                          <ArrowUpRight size={13} />
                          <span>Entrada</span>
                        </button>

                        {/* Salida de Stock */}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.75rem',
                            opacity: product.stock === 0 ? 0.45 : 1,
                            cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() => onOpenMovement(product, 'OUT')}
                          title={`Registrar Salida para ${product.name}`}
                          disabled={product.stock === 0}
                        >
                          <ArrowDownRight size={13} />
                          <span>Salida</span>
                        </button>

                        {/* Editar Producto */}
                        <button
                          type="button"
                          className="btn-icon-only"
                          onClick={() => onEditProduct(product)}
                          title="Editar detalles del producto"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Eliminar Producto */}
                        <button
                          type="button"
                          className="btn-icon-only danger"
                          onClick={() => handleDeleteClick(product)}
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
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

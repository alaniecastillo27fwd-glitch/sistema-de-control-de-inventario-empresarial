import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  PackageOpen,
  Trash2,
  Edit2
} from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

/**
 * Vista Tienda / Catálogo (Boutique & Market Familiar)
 * @param {Object} props
 * @param {Array} props.products - Lista de productos
 * @param {Function} props.onOpenMovement - Callback para Entrada/Salida rápida
 * @param {Function} props.onOpenOfferModal - Callback para abrir configuración de oferta
 * @param {Function} props.onOpenNewProduct - Callback para crear nuevo producto
 */
export function StoreCatalog({
  products,
  onOpenMovement,
  onOpenOfferModal,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterOnlyOffers, setFilterOnlyOffers] = useState(false);

  // Lista única de categorías
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).filter(Boolean).sort();
  }, [products]);

  // Filtrado reactivo
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
      if (filterOnlyOffers && !p.enOferta) return false;

      return true;
    });
  }, [products, searchTerm, selectedCategory, filterOnlyOffers]);

  return (
    <section className="store-catalog-section" aria-label="Catálogo de productos de la tienda">
      {/* Encabezado de la Sección */}
      <div className="section-header-banner">
        <div className="section-title-group">
          <h2>
            <Sparkles size={24} color="var(--color-gold-500)" />
            <span>Nuestros Productos & Existencias</span>
          </h2>
          <p>Explora el catálogo fresco, consulta disponibilidad en tiempo real y aprovecha las mejores ofertas.</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={onOpenNewProduct}>
          <Plus size={17} />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="filter-bar-container">
        {/* Pills de Categorías */}
        <div className="category-pills">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'ALL' && !filterOnlyOffers ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('ALL');
              setFilterOnlyOffers(false);
            }}
          >
            Todos los Productos ({products.length})
          </button>

          <button
            type="button"
            className={`category-pill ${filterOnlyOffers ? 'active' : ''}`}
            onClick={() => setFilterOnlyOffers(!filterOnlyOffers)}
            style={{
              borderColor: 'var(--color-gold-400)',
              color: filterOnlyOffers ? '#FFFFFF' : 'var(--color-gold-700)',
              background: filterOnlyOffers ? 'var(--color-gold-500)' : 'var(--accent-gold-bg)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>Solo en Oferta</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat && !filterOnlyOffers ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setFilterOnlyOffers(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar en la tienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="table-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <PackageOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No encontramos productos con estos filtros</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Intenta cambiar los términos de búsqueda o selecciona otra categoría.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setFilterOnlyOffers(false);
            }}
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="store-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock <= product.minStock && product.stock > 0;
            const hasOffer = product.enOferta;

            return (
              <article
                key={product.id}
                className={`product-card ${hasOffer ? 'has-offer' : ''}`}
                aria-label={product.name}
              >
                <div>
                  {/* Tags Superiores */}
                  <div className="card-top-tags">
                    <span className="category-tag">{product.category}</span>
                    {hasOffer ? (
                      <span className="promo-tag" title={`Descuento del ${product.porcentajeDescuento}%`}>
                        <Tag size={12} />
                        <span>-{product.porcentajeDescuento}%</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenOfferModal(product)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Poner en oferta este producto"
                      >
                        <Tag size={12} />
                        <span>Ofertar</span>
                      </button>
                    )}
                  </div>

                  {/* Nombre */}
                  <h3 className="card-product-name">{product.name}</h3>

                  {/* Precios */}
                  <div className="card-price-section">
                    {hasOffer ? (
                      <>
                        <span className="price-offer-highlight">
                          ${Number(product.precioOferta).toFixed(2)}
                        </span>
                        <span className="price-original-strikethrough">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="price-regular">${Number(product.price).toFixed(2)}</span>
                    )}
                  </div>

                  {/* Temporizador Regresivo si tiene fecha de fin */}
                  {hasOffer && product.fechaFinOferta && (
                    <CountdownTimer targetDate={product.fechaFinOferta} />
                  )}

                  {/* Indicador de Stock */}
                  <div className="stock-indicator-row">
                    <span>Existencias:</span>
                    {isOutOfStock ? (
                      <span className="status-badge out">Agotado</span>
                    ) : isLowStock ? (
                      <span className="status-badge low">Quedan {product.stock} u.</span>
                    ) : (
                      <span className="status-badge normal">{product.stock} disponibles</span>
                    )}
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                    onClick={() => onOpenMovement(product, 'IN')}
                    title="Registrar llegada o compra de mercadería"
                  >
                    <ArrowUpRight size={14} />
                    <span>Entrada</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      opacity: isOutOfStock ? 0.45 : 1,
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    }}
                    disabled={isOutOfStock}
                    onClick={() => onOpenMovement(product, 'OUT')}
                    title="Registrar venta o consumo de producto"
                  >
                    <ArrowDownRight size={14} />
                    <span>Vender / Salida</span>
                  </button>

                  {hasOffer && (
                    <button
                      type="button"
                      className="btn-icon-only"
                      onClick={() => onOpenOfferModal(product)}
                      title="Modificar oferta"
                    >
                      <Tag size={15} color="var(--color-gold-600)" />
                    </button>
                  )}

                  {onEditProduct && (
                    <button
                      type="button"
                      className="btn-icon-only"
                      onClick={() => onEditProduct(product)}
                      title="Editar producto"
                    >
                      <Edit2 size={15} />
                    </button>
                  )}

                  {onDeleteProduct && (
                    <button
                      type="button"
                      className="btn-icon-only danger"
                      onClick={() => onDeleteProduct(product)}
                      title="Eliminar producto de la tienda"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default StoreCatalog;

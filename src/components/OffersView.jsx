import React, { useMemo } from 'react';
import { 
  Tag, 
  Sparkles, 
  Flame, 
  ArrowDownRight, 
  Plus, 
  Gift, 
  Percent,
  Trash2
} from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

/**
 * Pestaña de Ofertas y Descuentos (Promotions & Offers)
 * @param {Object} props
 * @param {Array} props.products - Lista completa de productos
 * @param {Function} props.onOpenMovement - Callback para registrar venta/salida
 * @param {Function} props.onOpenOfferModal - Abrir modal de configuración de oferta
 */
export function OffersView({
  products,
  onOpenMovement,
  onOpenOfferModal,
  onDeleteProduct,
}) {
  // Filtrar productos con ofertas activas
  const offerProducts = useMemo(() => {
    const nowTimestamp = Date.now();
    return products.filter((p) => {
      if (!p.enOferta) return false;
      if (p.fechaFinOferta) {
        const isExpired = new Date(p.fechaFinOferta).getTime() <= nowTimestamp;
        return !isExpired;
      }
      return true;
    });
  }, [products]);

  // Identificar si hay alguna oferta por vencer en menos de 48 o 24 horas
  const urgentOffers = useMemo(() => {
    const nowTimestamp = Date.now();
    return offerProducts.filter((p) => {
      if (!p.fechaFinOferta) return false;
      const diffMs = new Date(p.fechaFinOferta).getTime() - nowTimestamp;
      const hours = diffMs / (1000 * 60 * 60);
      return hours > 0 && hours <= 48;
    });
  }, [offerProducts]);

  // Lista de productos sin oferta activa para sugerir crearlas
  const nonOfferProducts = useMemo(() => {
    return products.filter((p) => !p.enOferta && p.stock > 0);
  }, [products]);

  return (
    <section className="offers-view-section" aria-label="Sección de promociones y ofertas">
      {/* Encabezado Principal */}
      <div className="section-header-banner">
        <div className="section-title-group">
          <h2>
            <Tag size={26} color="var(--color-gold-500)" />
            <span>Ofertas & Descuentos Especiales</span>
          </h2>
          <p>Precios promocionales por tiempo limitado para consentir a nuestras familias clientes.</p>
        </div>

        {nonOfferProducts.length > 0 && (
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => onOpenOfferModal(nonOfferProducts[0])}
          >
            <Plus size={17} />
            <span>Lanzar Nueva Oferta</span>
          </button>
        )}
      </div>

      {/* Banner Animado de Urgencia (<48h o <24h) */}
      {urgentOffers.length > 0 && (
        <div className="urgent-offer-banner" role="alert">
          <div className="urgent-banner-content">
            <div className="urgent-banner-icon">
              <Flame size={28} />
            </div>
            <div className="urgent-banner-text">
              <h3>¡Atención! A esta oferta le quedan muy pocas horas. ¡No la dejes escapar!</h3>
              <p>
                Hay <strong>{urgentOffers.length} {urgentOffers.length === 1 ? 'producto' : 'productos'}</strong> con descuentos de liquidación inmediata por vencer.
              </p>
            </div>
          </div>

          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Flame size={15} />
            <span>Últimas Horas</span>
          </span>
        </div>
      )}

      {/* Cuadrícula de Ofertas Activas */}
      {offerProducts.length === 0 ? (
        <div className="table-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Gift size={52} style={{ color: 'var(--color-gold-500)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No hay ofertas activas en este momento</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 24px' }}>
            Activa una promoción con descuento porcentual y temporizador en cualquiera de tus productos para impulsar las ventas.
          </p>
          {products.length > 0 && (
            <button
              type="button"
              className="btn btn-gold"
              onClick={() => onOpenOfferModal(products[0])}
            >
              <Sparkles size={16} />
              <span>Crear Primera Oferta</span>
            </button>
          )}
        </div>
      ) : (
        <div className="store-grid">
          {offerProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const savings = (product.price - (product.precioOferta || product.price)).toFixed(2);

            return (
              <article
                key={product.id}
                className="product-card has-offer"
                aria-label={`Oferta: ${product.name}`}
              >
                <div>
                  {/* Tags Superiores */}
                  <div className="card-top-tags">
                    <span className="category-tag">{product.category}</span>
                    <span className="promo-tag">
                      <Percent size={12} />
                      <span>{product.porcentajeDescuento}% DTO</span>
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="card-product-name">{product.name}</h3>

                  {/* Precios y Ahorro */}
                  <div className="card-price-section">
                    <span className="price-offer-highlight">
                      ${Number(product.precioOferta).toFixed(2)}
                    </span>
                    <span className="price-original-strikethrough">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-mint-600)',
                        background: 'var(--accent-mint-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        marginLeft: 'auto',
                      }}
                    >
                      Ahorras ${savings}
                    </span>
                  </div>

                  {/* Temporizador Regresivo */}
                  {product.fechaFinOferta && (
                    <CountdownTimer targetDate={product.fechaFinOferta} />
                  )}

                  {/* Estado de Existencias */}
                  <div className="stock-indicator-row">
                    <span>Disponibilidad:</span>
                    {isOutOfStock ? (
                      <span className="status-badge out">Agotado</span>
                    ) : (
                      <span className="status-badge normal">{product.stock} u. disponibles</span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="card-actions-row">
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.82rem' }}
                    disabled={isOutOfStock}
                    onClick={() => onOpenMovement(product, 'OUT')}
                    title="Vender a precio de oferta"
                  >
                    <ArrowDownRight size={15} />
                    <span>Vender a Oferta</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem' }}
                    onClick={() => onOpenOfferModal(product)}
                    title="Modificar precio o vigencia de la oferta"
                  >
                    Editar
                  </button>

                  {onDeleteProduct && (
                    <button
                      type="button"
                      className="btn-icon-only danger"
                      onClick={() => onDeleteProduct(product)}
                      title="Eliminar producto"
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

      {/* Sugerencias de Productos para poner en oferta */}
      {nonOfferProducts.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div className="section-header-banner" style={{ marginBottom: '16px' }}>
            <div className="section-title-group">
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--color-sky-500)" />
                <span>¿Deseas activar más promociones?</span>
              </h3>
              <p style={{ fontSize: '0.82rem' }}>Selecciona cualquier producto con stock para programar una oferta con descuento.</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {nonOfferProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600 }}>{p.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    ${Number(p.price).toFixed(2)} · {p.stock} u.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  onClick={() => onOpenOfferModal(p)}
                >
                  <Tag size={13} />
                  <span>Ofertar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default OffersView;

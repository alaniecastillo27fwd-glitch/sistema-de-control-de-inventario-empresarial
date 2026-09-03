import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, AlertCircle, Check, Percent } from 'lucide-react';

/**
 * Modal para configurar o actualizar una oferta/descuento temporal en un producto.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object|null} props.product - Producto al que se le aplicará la oferta
 * @param {Function} props.onSubmitOffer - Callback para guardar la oferta
 * @param {Function} props.onRemoveOffer - Callback para cancelar la oferta
 */
export function OfferFormModal({
  isOpen,
  onClose,
  product,
  onSubmitOffer,
  onRemoveOffer,
}) {
  const [discountPercent, setDiscountPercent] = useState(15);
  const [promoPrice, setPromoPrice] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  // Inicializar fechas por defecto (hoy hasta 7 días después mínimo)
  useEffect(() => {
    if (product && isOpen) {
      const regularPrice = product.price || 0;
      const initialPercent = product.porcentajeDescuento || 15;
      setDiscountPercent(initialPercent);

      const calculatedPromo = product.precioOferta || (regularPrice * (1 - initialPercent / 100)).toFixed(2);
      setPromoPrice(calculatedPromo);

      const now = new Date();
      const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const formatInputDate = (d) => {
        const dateObj = new Date(d);
        return dateObj.toISOString().slice(0, 16);
      };

      setStartDate(product.fechaInicioOferta ? formatInputDate(product.fechaInicioOferta) : formatInputDate(now));
      setEndDate(product.fechaFinOferta ? formatInputDate(product.fechaFinOferta) : formatInputDate(inOneWeek));
      setError(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handlePercentChange = (val) => {
    const num = Number(val);
    setDiscountPercent(num);
    if (!isNaN(num) && num >= 0 && num <= 99) {
      const regular = product.price || 0;
      const calculated = (regular * (1 - num / 100)).toFixed(2);
      setPromoPrice(calculated);
    }
  };

  const handlePriceChange = (val) => {
    const num = Number(val);
    setPromoPrice(num);
    const regular = product.price || 0;
    if (!isNaN(num) && num > 0 && num < regular) {
      const calculatedPercent = Math.round(((regular - num) / regular) * 100);
      setDiscountPercent(calculatedPercent);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const regular = Number(product.price || 0);
    const promo = Number(promoPrice);
    const percent = Number(discountPercent);

    if (isNaN(percent) || percent <= 0 || percent >= 100) {
      setError('El porcentaje de descuento debe estar entre 1% y 99%.');
      return;
    }
    if (isNaN(promo) || promo <= 0 || promo >= regular) {
      setError('El precio de oferta debe ser menor al precio regular.');
      return;
    }
    if (!endDate) {
      setError('Debes especificar la fecha de fin de la oferta.');
      return;
    }

    const startTimestamp = new Date(startDate || Date.now()).getTime();
    const endTimestamp = new Date(endDate).getTime();

    if (endTimestamp <= startTimestamp) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    onSubmitOffer(product.id, {
      enOferta: true,
      porcentajeDescuento: percent,
      precioOferta: parseFloat(promo.toFixed(2)),
      fechaInicioOferta: new Date(startDate).toISOString(),
      fechaFinOferta: new Date(endDate).toISOString(),
    });

    onClose();
  };

  const handleCancelOffer = () => {
    if (window.confirm(`¿Deseas finalizar la oferta de "${product.name}"?`)) {
      onRemoveOffer(product.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <div className="modal-title">
            <Tag size={20} color="var(--color-gold-500)" />
            <span>Gestionar Oferta: {product.name}</span>
          </div>
          <button className="btn-icon-only" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Banner Informativo */}
            <div
              style={{
                background: 'var(--accent-gold-bg)',
                border: '1px solid var(--color-gold-400)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Sparkles size={22} color="var(--color-gold-600)" />
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--color-gold-700)' }}>
                  Precio Regular de Venta: ${Number(product.price).toFixed(2)}
                </strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  La oferta destacará en la Tienda y en la sección de Descuentos con temporizador activo.
                </p>
              </div>
            </div>

            {error && (
              <div className="form-error-text" style={{ padding: '8px 12px', background: 'var(--accent-rose-bg)', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Configuración de Descuento */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="discount-percent">
                  % Descuento a Aplicar
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="discount-percent"
                    type="number"
                    min="1"
                    max="99"
                    className="form-input"
                    value={discountPercent}
                    onChange={(e) => handlePercentChange(e.target.value)}
                  />
                  <Percent size={15} style={{ position: 'absolute', right: 12, top: 12, color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="promo-price">
                  Precio de Oferta Final ($)
                </label>
                <input
                  id="promo-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={product.price}
                  className="form-input"
                  value={promoPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
              </div>
            </div>

            {/* Fechas de Inicio y Fin (Duración mínima recomendada de 1 semana) */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="offer-start-date">
                  Fecha de Inicio
                </label>
                <input
                  id="offer-start-date"
                  type="datetime-local"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="offer-end-date">
                  Fecha de Finalización *
                </label>
                <input
                  id="offer-end-date"
                  type="datetime-local"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Sugerido: mínimo 7 días de duración
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            {product.enOferta ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelOffer}
                style={{ fontSize: '0.82rem', padding: '8px 14px' }}
              >
                Quitar Oferta
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-gold">
                <Check size={16} />
                <span>Guardar Promoción</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OfferFormModal;

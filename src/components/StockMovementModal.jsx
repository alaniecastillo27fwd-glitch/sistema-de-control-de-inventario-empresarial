import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, AlertTriangle, AlertCircle, Check, Layers, Loader2 } from 'lucide-react';

/**
 * Modal para registrar Entradas (ingreso de mercadería) o Salidas (venta o merma).
 * Cuenta con validaciones estrictas en tiempo real:
 * 1. Cantidad estrictamente entera y mayor a 0 (sin 0, negativos ni texto).
 * 2. En Salidas, valida que la cantidad no supere el stock disponible con alerta:
 *    "Stock insuficiente: solo tienes X unidades disponibles".
 * 3. Motivo o concepto obligatorio (no se permiten campos vacíos).
 * 4. Botón de confirmación deshabilitado mientras el formulario sea inválido.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibilidad del modal
 * @param {Function} props.onClose - Cerrar modal
 * @param {Object|null} props.product - Producto sobre el cual se realiza el movimiento
 * @param {'IN'|'OUT'} props.initialType - Tipo inicial del movimiento ('IN' o 'OUT')
 * @param {Function} props.onSubmitMovement - Callback para ejecutar el movimiento
 */
export function StockMovementModal({
  isOpen,
  onClose,
  product,
  initialType = 'IN',
  onSubmitMovement,
}) {
  const [movementType, setMovementType] = useState(initialType);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState({ quantity: false, reason: false });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reiniciar estado al abrir el modal o cambiar de producto
  useEffect(() => {
    setMovementType(initialType);
    setQuantity('');
    setReason('');
    setTouched({ quantity: false, reason: false });
    setSubmitError('');
    setIsSubmitting(false);
  }, [isOpen, initialType, product]);

  if (!isOpen || !product) return null;

  const currentStock = product.stock;
  const numQuantity = Number(quantity);

  // -------------------------------------------------------------
  // VALIDACIONES ESTRICTAS
  // -------------------------------------------------------------

  // 1. Validación de Cantidad: estrictamente entero positivo > 0
  let quantityError = '';
  const trimmedQty = quantity.trim();

  if (trimmedQty === '') {
    quantityError = 'La cantidad es obligatoria.';
  } else if (!/^\d+$/.test(trimmedQty)) {
    quantityError = 'Debe ser un número entero positivo (sin decimales ni letras).';
  } else if (numQuantity <= 0) {
    quantityError = 'La cantidad debe ser estrictamente mayor a 0 (no se permite 0 ni negativos).';
  }

  // 2. Validación de Stock Insuficiente en Salida
  const isOverWithdrawal = movementType === 'OUT' && !quantityError && numQuantity > currentStock;
  const stockInsufficientMessage = `Stock insuficiente: solo tienes ${currentStock} unidades disponibles.`;

  // 3. Validación de Motivo: campo no vacío
  let reasonError = '';
  if (!reason.trim()) {
    reasonError = 'El motivo o concepto del movimiento es obligatorio.';
  }

  // 4. Estado de Validez Global del Formulario
  const isFormValid = !quantityError && !isOverWithdrawal && !reasonError;

  // Proyección del nuevo stock en tiempo real
  const projectedStock =
    !quantityError && numQuantity > 0
      ? movementType === 'IN'
        ? currentStock + numQuantity
        : currentStock - numQuantity
      : currentStock;

  // Sugerencias de motivos rápidos según el tipo de movimiento
  const quickReasons =
    movementType === 'IN'
      ? ['Compra a proveedor', 'Devolución de cliente', 'Ajuste de inventario', 'Producción interna']
      : ['Venta directa', 'Merma / Rotura', 'Caducidad / Descompuesto', 'Uso interno'];

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleQuickReasonClick = (quickText) => {
    setReason(quickText);
    setTouched((prev) => ({ ...prev, reason: true }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ quantity: true, reason: true });

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await onSubmitMovement({
        productId: product.id,
        type: movementType,
        quantity: numQuantity,
        reason: reason.trim(),
      });

      if (result && !result.success) {
        setSubmitError(result.error || 'Error al procesar el movimiento.');
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err) {
      console.error('Error al enviar movimiento:', err);
      setSubmitError(err.message || 'Error al procesar el movimiento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <div className="modal-title">
            {movementType === 'IN' ? (
              <ArrowUpRight size={22} color="var(--accent-emerald)" />
            ) : (
              <ArrowDownRight size={22} color="var(--accent-rose)" />
            )}
            <span>Registrar Movimiento de Inventario</span>
          </div>
          <button className="btn-icon-only" onClick={onClose} title="Cerrar modal" type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Resumen del producto seleccionado */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Producto Seleccionado</span>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {product.name}
                </p>
                <span className="product-category-tag" style={{ marginTop: 2 }}>
                  {product.category}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Disponible</span>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
                  {currentStock} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>u.</span>
                </p>
              </div>
            </div>

            {/* Selector de Tipo: Entrada vs Salida */}
            <div className="form-group">
              <label className="form-label">Tipo de Movimiento *</label>
              <div className="type-selector">
                <button
                  type="button"
                  className={`type-option-btn ${movementType === 'IN' ? 'selected-in' : ''}`}
                  onClick={() => {
                    setMovementType('IN');
                    setSubmitError('');
                  }}
                >
                  <ArrowUpRight size={20} />
                  <span>Entrada (+)</span>
                </button>
                <button
                  type="button"
                  className={`type-option-btn ${movementType === 'OUT' ? 'selected-out' : ''}`}
                  onClick={() => {
                    setMovementType('OUT');
                    setSubmitError('');
                  }}
                  disabled={currentStock === 0}
                  style={{
                    opacity: currentStock === 0 ? 0.4 : 1,
                    cursor: currentStock === 0 ? 'not-allowed' : 'pointer',
                  }}
                  title={currentStock === 0 ? 'Producto agotado: no es posible registrar salidas' : ''}
                >
                  <ArrowDownRight size={20} />
                  <span>Salida (-)</span>
                </button>
              </div>
            </div>

            {/* Campo: Cantidad con validación estricta */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="movement-quantity">
                  Cantidad a {movementType === 'IN' ? 'Ingresar' : 'Retirar'} *
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (Número entero &gt; 0)
                </span>
              </div>
              <input
                id="movement-quantity"
                type="number"
                min="1"
                step="1"
                placeholder="Ej. 5"
                className="form-input"
                style={{
                  borderColor:
                    (touched.quantity && quantityError) || isOverWithdrawal
                      ? 'var(--accent-rose)'
                      : undefined,
                }}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setSubmitError('');
                }}
                onBlur={() => handleBlur('quantity')}
                autoFocus
              />

              {/* Mensaje de error de formato/cantidad */}
              {touched.quantity && quantityError && (
                <span className="form-error-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} />
                  {quantityError}
                </span>
              )}
            </div>

            {/* REQUERIMIENTO 2: Alerta visual clara cuando la salida supera el stock disponible */}
            {isOverWithdrawal && (
              <div
                className="banner-alert error"
                role="alert"
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid var(--status-out-border)',
                  color: '#fda4af',
                }}
              >
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent-rose)' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>Operación Bloqueada</strong>
                  <span style={{ fontWeight: 600 }}>{stockInsufficientMessage}</span>
                </div>
              </div>
            )}

            {/* Proyección del nuevo saldo si los datos son válidos */}
            {!isOverWithdrawal && !quantityError && numQuantity > 0 && (
              <div className="banner-alert info">
                <Layers size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <span>Stock proyectado: </span>
                  <strong>{currentStock} u.</strong> &rarr;{' '}
                  <strong
                    style={{
                      color: movementType === 'IN' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    }}
                  >
                    {projectedStock} u.
                  </strong>
                </div>
              </div>
            )}

            {/* REQUERIMIENTO 3: Motivo o concepto obligatorio */}
            <div className="form-group">
              <label className="form-label" htmlFor="movement-reason">
                Motivo o Concepto del Movimiento *
              </label>
              <input
                id="movement-reason"
                type="text"
                placeholder={
                  movementType === 'IN'
                    ? 'Ej. Compra factura #4089'
                    : 'Ej. Venta al mostrador / Merma'
                }
                className="form-input"
                style={{
                  borderColor: touched.reason && reasonError ? 'var(--accent-rose)' : undefined,
                }}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setSubmitError('');
                }}
                onBlur={() => handleBlur('reason')}
              />

              {/* Error si el motivo está vacío */}
              {touched.reason && reasonError && (
                <span className="form-error-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} />
                  {reasonError}
                </span>
              )}

              {/* Botones de sugerencias rápidas para facilitar el llenado */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Sugerencias:
                </span>
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => handleQuickReasonClick(qr)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      background: reason === qr ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${reason === qr ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: reason === qr ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Error de envío devuelto por el backend o hook si ocurriese */}
            {submitError && (
              <div className="banner-alert error">
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* REQUERIMIENTO 4: Deshabilitar el botón de confirmación mientras haya errores */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn ${movementType === 'IN' ? 'btn-success' : 'btn-danger'}`}
              disabled={!isFormValid || isSubmitting}
              style={{
                opacity: !isFormValid || isSubmitting ? 0.45 : 1,
                cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
                filter: !isFormValid || isSubmitting ? 'grayscale(40%)' : 'none',
              }}
              title={
                !isFormValid
                  ? isOverWithdrawal
                    ? stockInsufficientMessage
                    : 'Completa todos los campos requeridos correctamente'
                  : ''
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirmar {movementType === 'IN' ? 'Entrada' : 'Salida'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StockMovementModal;

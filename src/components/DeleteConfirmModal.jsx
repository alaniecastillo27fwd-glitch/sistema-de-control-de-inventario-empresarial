import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Modal de Confirmación de Eliminación de Producto
 * Ofrece una experiencia visual premium con aviso de irreversibilidad y detalles del producto.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal sin eliminar
 * @param {Function} props.onConfirm - Callback asíncrono para confirmar la eliminación
 * @param {Object|null} props.product - Producto a eliminar
 */
export function DeleteConfirmModal({ isOpen, onClose, onConfirm, product }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(product.id);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        {/* Cabecera del modal */}
        <div className="modal-header" style={{ borderBottomColor: 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-rose-bg)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <h3 id="delete-dialog-title" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                ¿Eliminar Producto?
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Confirmación de borrado permanente
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon-only"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 24px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            ¿Estás seguro de que deseas eliminar permanentemente el producto{' '}
            <strong style={{ color: 'var(--text-primary)' }}>"{product.name}"</strong>?
          </p>

          {/* Tarjeta resumen del producto a borrar */}
          <div
            style={{
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.84rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Categoría:</span>
              <span style={{ fontWeight: 600 }}>{product.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Existencias actuales:</span>
              <span style={{ fontWeight: 700, color: product.stock === 0 ? 'var(--accent-rose)' : 'inherit' }}>
                {product.stock} unidades
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Precio:</span>
              <span style={{ fontWeight: 700 }}>
                ${Number(product.enOferta ? product.precioOferta : product.price).toFixed(2)}
                {product.enOferta && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-gold-600)', marginLeft: '6px' }}>
                    (-{product.porcentajeDescuento}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Advertencia de irreversibilidad */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-bg)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose-text)',
              fontSize: '0.8rem',
              lineHeight: 1.4,
            }}
          >
            <AlertTriangle size={18} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '1px' }} />
            <span>
              Esta acción no se puede deshacer. El registro se eliminará de la base de datos (REST API) y del catálogo de la tienda.
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="modal-footer" style={{ borderTopColor: 'var(--border-subtle)', padding: '16px 24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={isDeleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Sí, Eliminar Producto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;

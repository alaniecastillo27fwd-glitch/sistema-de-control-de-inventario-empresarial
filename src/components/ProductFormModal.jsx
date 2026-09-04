import React, { useState, useEffect, useMemo } from 'react';
import { X, PackagePlus, Check, AlertCircle, Trash2 } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/initialProducts';

/**
 * Modal para registrar o editar un producto en el inventario.
 * Incluye validaciones estrictas en tiempo real: campos requeridos no vacíos y valores no negativos.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Cerrar modal
 * @param {Function} props.onSubmit - Callback con la data del producto
 * @param {Object|null} props.initialData - Datos del producto si se está editando
 * @param {string[]} props.categories - Lista de categorías existentes para autocompletar
 */
export function ProductFormModal({ isOpen, onClose, onSubmit, onDelete, initialData = null, categories = [] }) {
  // Combinar categorías existentes con las categorías por defecto
  const allCategories = useMemo(
    () => Array.from(new Set([...INITIAL_CATEGORIES, ...categories])),
    [categories]
  );

  const [formData, setFormData] = useState({
    name: '',
    category: allCategories[0] || 'Abarrotes',
    customCategory: '',
    stock: 0,
    minStock: 5,
    price: 0.00,
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (initialData) {
      const isKnown = allCategories.includes(initialData.category);
      setFormData({
        name: initialData.name || '',
        category: isKnown ? initialData.category : 'OTRO',
        customCategory: isKnown ? '' : initialData.category,
        stock: initialData.stock ?? 0,
        minStock: initialData.minStock ?? 5,
        price: initialData.price ?? 0,
      });
      setIsCustomCategory(!isKnown);
    } else {
      setFormData({
        name: '',
        category: allCategories[0] || 'Abarrotes',
        customCategory: '',
        stock: 0,
        minStock: 5,
        price: 0,
      });
      setIsCustomCategory(false);
    }
    setErrors({});
  }, [initialData, isOpen, allCategories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo específico si existía
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === '__NEW__') {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '', customCategory: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: val }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio.';
    }

    const effectiveCategory = isCustomCategory ? formData.customCategory : formData.category;
    if (!effectiveCategory.trim()) {
      newErrors.category = 'Debes seleccionar o escribir una categoría.';
    }

    // Validaciones numéricas: no negativos
    const numStock = Number(formData.stock);
    if (formData.stock === '' || isNaN(numStock) || numStock < 0) {
      newErrors.stock = 'El stock inicial debe ser un número entero mayor o igual a 0.';
    }

    const numMinStock = Number(formData.minStock);
    if (formData.minStock === '' || isNaN(numMinStock) || numMinStock < 0) {
      newErrors.minStock = 'El stock mínimo de alerta no puede ser negativo.';
    }

    const numPrice = Number(formData.price);
    if (formData.price === '' || isNaN(numPrice) || numPrice < 0) {
      newErrors.price = 'El precio unitario no puede ser negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const effectiveCategory = isCustomCategory ? formData.customCategory.trim() : formData.category.trim();

    const payload = {
      name: formData.name.trim(),
      category: effectiveCategory,
      stock: Math.floor(Number(formData.stock)),
      minStock: Math.floor(Number(formData.minStock)),
      price: parseFloat(Number(formData.price).toFixed(2)),
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <div className="modal-title">
            <PackagePlus size={20} color="var(--primary)" />
            <span>{initialData ? 'Editar Producto' : 'Registrar Nuevo Producto'}</span>
          </div>
          <button className="btn-icon-only" onClick={onClose} title="Cerrar modal" type="button">
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Campo: Nombre */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-name">
                Nombre del Producto *
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                placeholder="Ej. Café Espresso Grano (500g)"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                autoFocus
              />
              {errors.name && (
                <span className="form-error-text">
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {errors.name}
                </span>
              )}
            </div>

            {/* Campo: Categoría */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-category">
                Categoría *
              </label>
              {!isCustomCategory ? (
                <select
                  id="product-category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleCategorySelect}
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__NEW__">+ Agregar nueva categoría...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="customCategory"
                    className="form-input"
                    placeholder="Escribe la nueva categoría"
                    value={formData.customCategory}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCustomCategory(false)}
                    style={{ padding: '0 12px', fontSize: '0.75rem' }}
                  >
                    Volver
                  </button>
                </div>
              )}
              {errors.category && (
                <span className="form-error-text">
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {errors.category}
                </span>
              )}
            </div>

            {/* Grid: Stock Inicial y Stock Mínimo */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="product-stock">
                  {initialData ? 'Stock Actual' : 'Stock Inicial'} *
                </label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className="form-input"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={!!initialData} // En edición se recomienda usar movimientos de entrada/salida para trazabilidad
                />
                {initialData && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Para ajustar stock usa Entrada/Salida.
                  </span>
                )}
                {errors.stock && (
                  <span className="form-error-text">
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {errors.stock}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="product-min-stock">
                  Stock Mínimo (Alerta) *
                </label>
                <input
                  id="product-min-stock"
                  name="minStock"
                  type="number"
                  min="0"
                  step="1"
                  className="form-input"
                  value={formData.minStock}
                  onChange={handleChange}
                />
                {errors.minStock && (
                  <span className="form-error-text">
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {errors.minStock}
                  </span>
                )}
              </div>
            </div>

            {/* Campo: Precio Unitario */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-price">
                Precio Unitario de Venta ($) *
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && (
                <span className="form-error-text">
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {errors.price}
                </span>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="modal-footer" style={{ justifyContent: initialData && onDelete ? 'space-between' : 'flex-end' }}>
            {initialData && onDelete ? (
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  onClose();
                  onDelete(initialData);
                }}
                title="Eliminar este producto permanentemente"
              >
                <Trash2 size={15} />
                <span>Eliminar Producto</span>
              </button>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} />
                <span>{initialData ? 'Guardar Cambios' : 'Registrar Producto'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductFormModal;

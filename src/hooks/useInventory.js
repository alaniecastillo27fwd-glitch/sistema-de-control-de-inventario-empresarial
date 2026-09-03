import { useState, useEffect, useMemo, useCallback } from 'react';
import * as inventoryService from '../services/inventoryService';

/**
 * Hook centralizado useInventory adaptado para trabajar de forma asíncrona
 * con la API REST local (json-server / db.json).
 * 
 * Expone:
 * - products: lista de productos
 * - movements: lista de movimientos
 * - loading: estado booleano de carga
 * - error: mensaje de error en caso de fallo de red
 * - stats: métricas del negocio calculadas en tiempo real
 * - categories: lista única de categorías
 * - addProduct: registrar nuevo producto en la API (POST)
 * - updateProduct: actualizar producto en la API (PATCH)
 * - deleteProduct: eliminar producto en la API (DELETE)
 * - registerMovement: registrar Entrada/Salida actualizando stock (PATCH) y movimiento (POST)
 * - refreshData: recargar datos desde el servidor
 */
export function useInventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga inicial y sincronización de datos desde el backend (json-server)
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProducts, fetchedMovements] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getMovements(),
      ]);
      setProducts(fetchedProducts);
      setMovements(fetchedMovements);
    } catch (err) {
      console.error('Error al cargar datos desde json-server:', err);
      setError(
        'No se pudo conectar con el servidor de la API (json-server). Verifica que esté ejecutándose en http://localhost:5000.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Registra un nuevo producto de forma asíncrona (POST /products)
   */
  const addProduct = async (productData) => {
    setError(null);
    try {
      const { name, category, stock, minStock, price } = productData;

      if (!name?.trim()) {
        return { success: false, error: 'El nombre del producto es obligatorio.' };
      }
      if (!category?.trim()) {
        return { success: false, error: 'La categoría es obligatoria.' };
      }
      const numStock = Number(stock);
      const numMinStock = Number(minStock);
      const numPrice = Number(price);

      if (isNaN(numStock) || numStock < 0) {
        return { success: false, error: 'El stock no puede ser negativo.' };
      }
      if (isNaN(numMinStock) || numMinStock < 0) {
        return { success: false, error: 'El stock mínimo no puede ser negativo.' };
      }
      if (isNaN(numPrice) || numPrice < 0) {
        return { success: false, error: 'El precio unitario no puede ser negativo.' };
      }

      // Enviar a la API
      const created = await inventoryService.addProduct({
        nombre: name.trim(),
        categoria: category.trim(),
        stockActual: Math.floor(numStock),
        stockMinimo: Math.floor(numMinStock),
        precio: parseFloat(numPrice.toFixed(2)),
      });

      // Si tiene stock inicial > 0, registrar automáticamente el movimiento de alta
      if (created.stock > 0) {
        const initialMov = await inventoryService.registerMovement({
          productoId: created.id,
          nombreProducto: created.name,
          tipo: 'IN',
          cantidad: created.stock,
          motivo: 'Inventario Inicial',
          stockResultante: created.stock,
        });
        setMovements((prev) => [initialMov, ...prev]);
      }

      setProducts((prev) => [created, ...prev]);
      return { success: true, product: created };
    } catch (err) {
      console.error('Error al agregar producto:', err);
      const msg = err.message || 'Error al comunicarse con la API.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Actualiza datos de un producto (PATCH /products/:id)
   */
  const updateProduct = async (id, updatedFields) => {
    setError(null);
    try {
      const updated = await inventoryService.updateProduct(id, updatedFields);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { success: true, product: updated };
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      const msg = err.message || 'Error al actualizar producto en la API.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Elimina un producto (DELETE /products/:id)
   */
  const deleteProduct = async (id) => {
    setError(null);
    try {
      await inventoryService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      const msg = err.message || 'Error al eliminar producto en la API.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Registra un movimiento de entrada o salida:
   * 1. Valida reglas de negocio (no inventarios negativos).
   * 2. Actualiza el stock del producto vía PATCH en la API.
   * 3. Registra el movimiento vía POST en la colección movements.
   */
  const registerMovement = async ({ productId, type, quantity, reason }) => {
    setError(null);
    try {
      const product = products.find((p) => String(p.id) === String(productId));
      if (!product) {
        return { success: false, error: 'El producto seleccionado no existe.' };
      }

      const qty = Math.floor(Number(quantity));
      if (isNaN(qty) || qty <= 0) {
        return { success: false, error: 'La cantidad debe ser un número entero mayor a 0.' };
      }

      if (type !== 'IN' && type !== 'OUT') {
        return { success: false, error: 'Tipo de movimiento inválido (debe ser IN o OUT).' };
      }

      // Validación estricta contra inventario negativo
      if (type === 'OUT' && qty > product.stock) {
        return {
          success: false,
          error: `Stock insuficiente: solo tienes ${product.stock} unidades disponibles.`,
        };
      }

      const newStock = type === 'IN' ? product.stock + qty : product.stock - qty;

      // Paso 1: Actualizar stock del producto en la API (PATCH)
      const updatedProduct = await inventoryService.updateProductStock(product.id, newStock);

      // Paso 2: Registrar el movimiento en la API (POST)
      const movementRecord = await inventoryService.registerMovement({
        productoId: product.id,
        nombreProducto: product.name,
        tipo: type,
        cantidad: qty,
        motivo: reason?.trim() || (type === 'IN' ? 'Entrada de mercadería' : 'Venta / Salida'),
        stockResultante: newStock,
      });

      // Actualizar estado local reactivo
      setProducts((prev) => prev.map((p) => (String(p.id) === String(productId) ? updatedProduct : p)));
      setMovements((prev) => [movementRecord, ...prev]);

      return { success: true, newStock };
    } catch (err) {
      console.error('Error en registerMovement:', err);
      const msg = err.message || 'Error al procesar el movimiento en la API.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // 5. Métricas del negocio calculadas de forma reactiva
  const stats = useMemo(() => {
    const totalProducts = products.length;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    const alertProducts = [];

    products.forEach((p) => {
      totalUnits += p.stock;
      totalInventoryValue += p.stock * p.price;

      if (p.stock === 0) {
        outOfStockCount++;
        alertProducts.push({ ...p, status: 'OUT_OF_STOCK' });
      } else if (p.stock <= p.minStock) {
        lowStockCount++;
        alertProducts.push({ ...p, status: 'LOW_STOCK' });
      }
    });

    return {
      totalProducts,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      totalAlerts: lowStockCount + outOfStockCount,
      totalInventoryValue,
      alertProducts,
    };
  }, [products]);

  // Lista única de categorías
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return Array.from(unique).sort();
  }, [products]);

  return {
    products,
    movements,
    loading,
    error,
    stats,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    registerMovement,
    refreshData: fetchData,
  };
}

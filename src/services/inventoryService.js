/**
 * Capa de Servicios: inventoryService.js
 * Módulo para interactuar con la API REST local simulada (json-server).
 * Implementa llamadas asíncronas con fetch, async/await y manejo de errores HTTP.
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Normaliza un producto para que sea compatible tanto con las propiedades en español (db.json)
 * como con los identificadores habituales en componentes React (name, stock, etc.).
 */
export function normalizeProduct(raw) {
  if (!raw) return null;
  return {
    ...raw,
    id: String(raw.id),
    name: raw.nombre || raw.name || '',
    nombre: raw.nombre || raw.name || '',
    category: raw.categoria || raw.category || 'General',
    categoria: raw.categoria || raw.category || 'General',
    stock: raw.stockActual !== undefined ? Number(raw.stockActual) : Number(raw.stock ?? 0),
    stockActual: raw.stockActual !== undefined ? Number(raw.stockActual) : Number(raw.stock ?? 0),
    minStock: raw.stockMinimo !== undefined ? Number(raw.stockMinimo) : Number(raw.minStock ?? 5),
    stockMinimo: raw.stockMinimo !== undefined ? Number(raw.stockMinimo) : Number(raw.minStock ?? 5),
    price: raw.precio !== undefined ? Number(raw.precio) : Number(raw.price ?? 0),
    precio: raw.precio !== undefined ? Number(raw.precio) : Number(raw.price ?? 0),
    createdAt: raw.fechaRegistro || raw.createdAt || new Date().toISOString(),
    fechaRegistro: raw.fechaRegistro || raw.createdAt || new Date().toISOString(),
  };
}

/**
 * Normaliza un movimiento de inventario para compatibilidad de atributos.
 */
export function normalizeMovement(raw) {
  if (!raw) return null;
  return {
    ...raw,
    id: String(raw.id),
    timestamp: raw.fecha || raw.timestamp || new Date().toISOString(),
    fecha: raw.fecha || raw.timestamp || new Date().toISOString(),
    productId: raw.productoId || raw.productId,
    productoId: raw.productoId || raw.productId,
    productName: raw.nombreProducto || raw.productName || 'Producto',
    nombreProducto: raw.nombreProducto || raw.productName || 'Producto',
    type: raw.tipo || raw.type || 'IN',
    tipo: raw.tipo || raw.type || 'IN',
    quantity: Number(raw.cantidad ?? raw.quantity ?? 0),
    cantidad: Number(raw.cantidad ?? raw.quantity ?? 0),
    reason: raw.motivo || raw.reason || 'Movimiento de inventario',
    motivo: raw.motivo || raw.reason || 'Movimiento de inventario',
    resultingStock: raw.stockResultante ?? raw.resultingStock,
    stockResultante: raw.stockResultante ?? raw.resultingStock,
  };
}

/**
 * Obtiene todos los productos registrados desde la API REST.
 * GET /products
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
    }
    const data = await response.json();
    return data.map(normalizeProduct);
  } catch (error) {
    console.error('Error en getProducts:', error);
    throw error;
  }
}

/**
 * Registra un nuevo producto en la colección de productos.
 * POST /products
 */
export async function addProduct(newProduct) {
  try {
    const payload = {
      id: newProduct.id ? String(newProduct.id) : `prod-${Date.now()}`,
      nombre: newProduct.nombre || newProduct.name,
      categoria: newProduct.categoria || newProduct.category,
      stockActual: Number(newProduct.stockActual ?? newProduct.stock ?? 0),
      stockMinimo: Number(newProduct.stockMinimo ?? newProduct.minStock ?? 5),
      precio: Number(newProduct.precio ?? newProduct.price ?? 0),
      fechaRegistro: newProduct.fechaRegistro || newProduct.createdAt || new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo registrar el producto.`);
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error('Error en addProduct:', error);
    throw error;
  }
}

/**
 * Actualiza el stock de un producto específico mediante PATCH.
 * PATCH /products/:id
 */
export async function updateProductStock(id, newStock) {
  try {
    const patchPayload = {
      stockActual: Number(newStock),
    };

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchPayload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo actualizar el stock del producto con ID ${id}.`);
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(`Error en updateProductStock (${id}):`, error);
    throw error;
  }
}

/**
 * Actualiza datos de un producto (nombre, categoría, precio, stock mínimo).
 * PATCH /products/:id
 */
export async function updateProduct(id, updatedFields) {
  try {
    const payload = {};
    if (updatedFields.name !== undefined || updatedFields.nombre !== undefined) {
      payload.nombre = updatedFields.nombre || updatedFields.name;
    }
    if (updatedFields.category !== undefined || updatedFields.categoria !== undefined) {
      payload.categoria = updatedFields.categoria || updatedFields.category;
    }
    if (updatedFields.minStock !== undefined || updatedFields.stockMinimo !== undefined) {
      payload.stockMinimo = Number(updatedFields.stockMinimo ?? updatedFields.minStock);
    }
    if (updatedFields.price !== undefined || updatedFields.precio !== undefined) {
      payload.precio = Number(updatedFields.precio ?? updatedFields.price);
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo actualizar el producto con ID ${id}.`);
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(`Error en updateProduct (${id}):`, error);
    throw error;
  }
}

/**
 * Elimina un producto por su ID.
 * DELETE /products/:id
 */
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo eliminar el producto con ID ${id}.`);
    }

    return true;
  } catch (error) {
    console.error(`Error en deleteProduct (${id}):`, error);
    throw error;
  }
}

/**
 * Obtiene el listado de movimientos de inventario registrados.
 * GET /movements
 */
export async function getMovements() {
  try {
    const response = await fetch(`${API_BASE_URL}/movements`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo obtener el historial de movimientos.`);
    }
    const data = await response.json();
    // Ordenar del más reciente al más antiguo
    return data
      .map(normalizeMovement)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error en getMovements:', error);
    throw error;
  }
}

/**
 * Registra un nuevo movimiento (Entrada o Salida) en la colección movements.
 * POST /movements
 */
export async function registerMovement(movementData) {
  try {
    const payload = {
      id: movementData.id ? String(movementData.id) : `mov-${Date.now()}`,
      fecha: movementData.fecha || movementData.timestamp || new Date().toISOString(),
      productoId: String(movementData.productoId || movementData.productId),
      nombreProducto: movementData.nombreProducto || movementData.productName || '',
      tipo: movementData.tipo || movementData.type,
      cantidad: Number(movementData.cantidad ?? movementData.quantity),
      motivo: movementData.motivo || movementData.reason,
      stockResultante: Number(movementData.stockResultante ?? movementData.resultingStock),
    };

    const response = await fetch(`${API_BASE_URL}/movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo registrar el movimiento en la API.`);
    }

    const data = await response.json();
    return normalizeMovement(data);
  } catch (error) {
    console.error('Error en registerMovement:', error);
    throw error;
  }
}

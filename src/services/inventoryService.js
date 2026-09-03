/**
 * Capa de Servicios: inventoryService.js
 * Módulo para interactuar con la API REST local simulada (json-server).
 * Implementa llamadas asíncronas con fetch, async/await y soporte para:
 * - Productos con promociones y ofertas temporales
 * - Movimientos de Entrada y Salida
 * - Historial y trazabilidad
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * Normaliza un producto para compatibilidad con las propiedades en español y con las ofertas temporales.
 */
export function normalizeProduct(raw) {
  if (!raw) return null;
  const price = raw.precio !== undefined ? Number(raw.precio) : Number(raw.price ?? 0);
  const enOferta = Boolean(raw.enOferta);
  const porcentajeDescuento = raw.porcentajeDescuento ? Number(raw.porcentajeDescuento) : 0;
  
  let precioOferta = raw.precioOferta !== undefined ? Number(raw.precioOferta) : null;
  if (enOferta && (!precioOferta || precioOferta >= price) && porcentajeDescuento > 0) {
    precioOferta = parseFloat((price * (1 - porcentajeDescuento / 100)).toFixed(2));
  }

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
    price: price,
    precio: price,
    // Atributos de Oferta / Descuento Temporal
    enOferta: enOferta,
    precioOferta: enOferta ? (precioOferta || price) : null,
    porcentajeDescuento: porcentajeDescuento,
    fechaInicioOferta: raw.fechaInicioOferta || null,
    fechaFinOferta: raw.fechaFinOferta || null,
    // Historial de cambios de precio / promociones
    historialPrecios: Array.isArray(raw.historialPrecios) ? raw.historialPrecios : [],
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
    productId: String(raw.productoId || raw.productId),
    productoId: String(raw.productoId || raw.productId),
    productName: raw.nombreProducto || raw.productName || 'Producto',
    nombreProducto: raw.nombreProducto || raw.productName || 'Producto',
    type: raw.tipo || raw.type || 'IN',
    tipo: raw.tipo || raw.type || 'IN',
    quantity: Number(raw.cantidad ?? raw.quantity ?? 0),
    cantidad: Number(raw.cantidad ?? raw.quantity ?? 0),
    reason: raw.motivo || raw.reason || 'Movimiento de inventario',
    motivo: raw.motivo || raw.reason || 'Movimiento de inventario',
    resultingStock: raw.stockResultante !== undefined ? Number(raw.stockResultante) : (raw.resultingStock !== undefined ? Number(raw.resultingStock) : 0),
    stockResultante: raw.stockResultante !== undefined ? Number(raw.stockResultante) : (raw.resultingStock !== undefined ? Number(raw.resultingStock) : 0),
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
    const price = Number(newProduct.precio ?? newProduct.price ?? 0);
    const enOferta = Boolean(newProduct.enOferta);
    const porcentajeDescuento = newProduct.porcentajeDescuento ? Number(newProduct.porcentajeDescuento) : 0;
    const precioOferta = enOferta
      ? Number(newProduct.precioOferta || (price * (1 - porcentajeDescuento / 100)).toFixed(2))
      : null;

    const payload = {
      id: newProduct.id ? String(newProduct.id) : `prod-${Date.now()}`,
      nombre: newProduct.nombre || newProduct.name,
      categoria: newProduct.categoria || newProduct.category || 'General',
      stockActual: Number(newProduct.stockActual ?? newProduct.stock ?? 0),
      stockMinimo: Number(newProduct.stockMinimo ?? newProduct.minStock ?? 5),
      precio: price,
      enOferta: enOferta,
      precioOferta: precioOferta,
      porcentajeDescuento: porcentajeDescuento,
      fechaInicioOferta: newProduct.fechaInicioOferta || (enOferta ? new Date().toISOString() : null),
      fechaFinOferta: newProduct.fechaFinOferta || (enOferta ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null),
      historialPrecios: [
        {
          fecha: new Date().toISOString(),
          precio: price,
          tipo: 'CREACION',
          motivo: 'Precio Inicial de Lanzamiento',
        }
      ],
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
 * Actualiza datos de un producto (nombre, categoría, precio, stock mínimo, ofertas).
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
    if (updatedFields.enOferta !== undefined) {
      payload.enOferta = Boolean(updatedFields.enOferta);
    }
    if (updatedFields.precioOferta !== undefined) {
      payload.precioOferta = updatedFields.precioOferta ? Number(updatedFields.precioOferta) : null;
    }
    if (updatedFields.porcentajeDescuento !== undefined) {
      payload.porcentajeDescuento = Number(updatedFields.porcentajeDescuento);
    }
    if (updatedFields.fechaInicioOferta !== undefined) {
      payload.fechaInicioOferta = updatedFields.fechaInicioOferta;
    }
    if (updatedFields.fechaFinOferta !== undefined) {
      payload.fechaFinOferta = updatedFields.fechaFinOferta;
    }
    if (updatedFields.historialPrecios !== undefined) {
      payload.historialPrecios = updatedFields.historialPrecios;
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
 * Configura o remueve una oferta en un producto específico.
 */
export async function setProductOffer(id, { enOferta, porcentajeDescuento, precioOferta, fechaInicioOferta, fechaFinOferta, currentProduct }) {
  try {
    const existingHist = currentProduct?.historialPrecios || [];
    const newEntry = {
      fecha: new Date().toISOString(),
      precio: enOferta ? Number(precioOferta) : Number(currentProduct?.price || 0),
      tipo: enOferta ? 'OFERTA_APLICADA' : 'OFERTA_FINALIZADA',
      motivo: enOferta ? `Oferta especial: -${porcentajeDescuento}%` : 'Finalización de oferta',
      porcentajeDescuento: enOferta ? Number(porcentajeDescuento) : 0,
    };

    const payload = {
      enOferta: Boolean(enOferta),
      porcentajeDescuento: enOferta ? Number(porcentajeDescuento) : 0,
      precioOferta: enOferta ? Number(precioOferta) : null,
      fechaInicioOferta: enOferta ? (fechaInicioOferta || new Date().toISOString()) : null,
      fechaFinOferta: enOferta ? (fechaFinOferta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) : null,
      historialPrecios: [newEntry, ...existingHist],
    };

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudo actualizar la oferta del producto.`);
    }

    const data = await response.json();
    return normalizeProduct(data);
  } catch (error) {
    console.error(`Error en setProductOffer (${id}):`, error);
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

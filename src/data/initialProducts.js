// Datos iniciales de demostración para inicializar el inventario si localStorage está vacío
// Representa un negocio local típico (ej. cafetería / tienda de abarrotes)
export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Café Grano Especialidad (1kg)',
    category: 'Granos y Café',
    stock: 14,
    minStock: 5,
    price: 18.50,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Leche Entera Barista (1L)',
    category: 'Lácteos',
    stock: 4,
    minStock: 8, // Stock bajo
    price: 2.10,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Jarabe de Vainilla Francesa (750ml)',
    category: 'Jarabes y Sabores',
    stock: 0, // Agotado
    minStock: 3,
    price: 12.00,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Vasos Biodegradables 12oz (Paquete x50)',
    category: 'Desechables',
    stock: 22,
    minStock: 10,
    price: 7.80,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Té Matcha Japonés Ceremonial (100g)',
    category: 'Té e Infusiones',
    stock: 2,
    minStock: 4, // Stock bajo
    price: 24.00,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Servilletas Ecológicas (Fardo 500u)',
    category: 'Desechables',
    stock: 18,
    minStock: 6,
    price: 4.50,
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_CATEGORIES = [
  'Granos y Café',
  'Lácteos',
  'Jarabes y Sabores',
  'Té e Infusiones',
  'Desechables',
  'Repostería',
  'Abarrotes',
  'Otros'
];

import React, { useState } from 'react';
import { useInventory } from './hooks/useInventory';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { InventoryTable } from './components/InventoryTable';
import { ProductFormModal } from './components/ProductFormModal';
import { StockMovementModal } from './components/StockMovementModal';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';

/**
 * Componente Principal Integrador: StockFlow Pro
 * Conectado con la API REST local (json-server en http://localhost:5000)
 */
export function App() {
  const {
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
    refreshData,
  } = useInventory();

  // Estados de control de modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');

  // Filtro activo en la tabla ('ALL' | 'NORMAL' | 'LOW' | 'OUT')
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Estado para notificaciones Toast efímeras
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers asíncronos para Productos
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (productData) => {
    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, productData);
      if (res.success) {
        showToast(`Producto "${productData.name}" actualizado en la base de datos.`);
      }
    } else {
      const res = await addProduct(productData);
      if (res.success) {
        showToast(`Producto "${productData.name}" registrado en la base de datos.`);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    const target = products.find((p) => String(p.id) === String(id));
    const res = await deleteProduct(id);
    if (res.success) {
      showToast(`Producto "${target?.name || ''}" eliminado de la base de datos.`);
    }
  };

  // Handlers asíncronos para Movimientos de Stock
  const handleOpenMovement = (product, type = 'IN') => {
    setMovementProduct(product);
    setMovementType(type);
    setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = async (movementPayload) => {
    const res = await registerMovement(movementPayload);
    if (res.success) {
      const actionName = movementPayload.type === 'IN' ? 'Entrada' : 'Salida';
      showToast(
        `${actionName} de ${movementPayload.quantity} u. guardada en la base de datos. Nuevo stock: ${res.newStock} u.`
      );
    }
    return res;
  };

  const handleFilterAlerts = () => {
    if (stats.outOfStockCount > 0) {
      setActiveFilter('OUT');
    } else if (stats.lowStockCount > 0) {
      setActiveFilter('LOW');
    } else {
      setActiveFilter('ALL');
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    showToast('Datos sincronizados con la API REST.');
  };

  return (
    <div className="app-container">
      {/* 1. Barra Superior con estado de conexión */}
      <Navbar
        stats={stats}
        onOpenNewProduct={handleOpenNewProduct}
        onFilterAlerts={handleFilterAlerts}
        onRefresh={handleRefresh}
      />

      {/* Contenido Principal */}
      <main className="main-content">
        {/* Banner de Error si json-server no responde */}
        {error && (
          <div
            className="banner-alert error"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={24} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Error de conexión con la API REST</strong>
                <span style={{ fontSize: '0.85rem' }}>{error}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={refreshData}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <RefreshCw size={14} />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Indicador visual de Carga Inicial */}
        {loading && products.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '350px',
              gap: '16px',
              color: 'var(--text-secondary)',
            }}
          >
            <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Cargando inventario desde la base de datos local...</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Petición HTTP a http://localhost:5000</span>
          </div>
        ) : (
          <>
            {/* 2. Dashboard con Métricas Clave */}
            <DashboardStats
              stats={stats}
              onSelectFilter={setActiveFilter}
              activeFilter={activeFilter}
            />

            {/* 3. Tabla Interactiva de Inventario */}
            <InventoryTable
              products={products}
              onOpenMovement={handleOpenMovement}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            {/* 4. Historial de Movimientos persistido en json-server */}
            {movements.length > 0 && (
              <section className="history-section" aria-label="Historial de movimientos">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History size={18} color="var(--primary)" />
                    Historial de Movimientos en Base de Datos
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {movements.length} movimientos registrados en db.json
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {movements.slice(0, 6).map((mov) => {
                    const isEntry = mov.type === 'IN';
                    const formattedDate = new Date(mov.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                    });

                    return (
                      <div key={mov.id} className="history-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isEntry ? 'var(--status-normal-bg)' : 'var(--status-out-bg)',
                              color: isEntry ? 'var(--status-normal-text)' : 'var(--status-out-text)',
                            }}
                          >
                            {isEntry ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {mov.productName}
                            </span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.75rem' }}>
                              ({mov.reason})
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isEntry ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                            }}
                          >
                            {isEntry ? `+${mov.quantity}` : `-${mov.quantity}`} u.
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* 5. Modal de Formulario de Producto */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* 6. Modal de Movimiento de Stock con validaciones estrictas */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        product={movementProduct}
        initialType={movementType}
        onSubmitMovement={handleMovementSubmit}
      />

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--bg-modal)',
            border: '1px solid var(--border-active)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="var(--accent-emerald)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useInventory } from './hooks/useInventory';
import { Navbar } from './components/Navbar';
import { StoreCatalog } from './components/StoreCatalog';
import { OffersView } from './components/OffersView';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryTable } from './components/InventoryTable';
import { ProductFormModal } from './components/ProductFormModal';
import { StockMovementModal } from './components/StockMovementModal';
import { OfferFormModal } from './components/OfferFormModal';
import { 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';

/**
 * Componente Principal: La Tiendita Familiar
 * Integra Catálogo Boutique, Promociones con Cuenta Regresiva, Dashboard Analítico
 * y Control de Inventario con sincronización a json-server y persistencia de Tema.
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
    applyOffer,
    removeOffer,
    deleteProduct,
    registerMovement,
    refreshData,
  } = useInventory();

  // 1. Pestaña Activa de Navegación ('store' | 'offers' | 'dashboard' | 'inventory')
  const [activeTab, setActiveTab] = useState('store');

  // 2. Soporte Dual de Tema (Light / Dark Mode) persistido en localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tiendita_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tiendita_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Estados de Control de Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState(null);
  const [movementType, setMovementType] = useState('IN');

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerProduct, setOfferProduct] = useState(null);

  // Filtro activo en la tabla de inventario
  const [inventoryFilter, setInventoryFilter] = useState('ALL');

  // Notificaciones Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers para Productos
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
        showToast(`Producto "${productData.name}" actualizado correctamente.`);
      }
    } else {
      const res = await addProduct(productData);
      if (res.success) {
        showToast(`Producto "${productData.name}" agregado a la tienda.`);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    const target = products.find((p) => String(p.id) === String(id));
    const res = await deleteProduct(id);
    if (res.success) {
      showToast(`Producto "${target?.name || ''}" eliminado.`);
    }
  };

  // Handlers para Movimientos de Stock
  const handleOpenMovement = (product, type = 'IN') => {
    setMovementProduct(product);
    setMovementType(type);
    setIsMovementModalOpen(true);
  };

  const handleMovementSubmit = async (movementPayload) => {
    const res = await registerMovement(movementPayload);
    if (res.success) {
      const actionName = movementPayload.type === 'IN' ? 'Entrada' : 'Venta / Salida';
      showToast(
        `${actionName} de ${movementPayload.quantity} u. registrada. Nuevo stock: ${res.newStock} u.`
      );
    }
    return res;
  };

  // Handlers para Ofertas y Promociones
  const handleOpenOfferModal = (product) => {
    setOfferProduct(product);
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = async (productId, offerData) => {
    const res = await applyOffer(productId, offerData);
    if (res.success) {
      showToast(`¡Oferta del ${offerData.porcentajeDescuento}% aplicada con éxito!`);
    }
  };

  const handleRemoveOffer = async (productId) => {
    const res = await removeOffer(productId);
    if (res.success) {
      showToast('Oferta finalizada. Producto restablecido a su precio normal.');
    }
  };

  const handleRefresh = async () => {
    await refreshData();
    showToast('Datos sincronizados con la base de datos.');
  };

  return (
    <div className="app-container">
      {/* 1. Topbar Superior Fijo con Navegación y Toggle de Tema */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        stats={stats}
        onOpenNewProduct={handleOpenNewProduct}
        onRefresh={handleRefresh}
      />

      {/* Contenido Principal según la Pestaña Activa */}
      <main className="main-content">
        {/* Banner de Error si json-server no responde */}
        {error && (
          <div
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-rose-bg)',
              border: '1px solid var(--accent-rose)',
              color: 'var(--accent-rose-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
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

        {/* Indicador de Carga Inicial */}
        {loading && products.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
              gap: '16px',
              color: 'var(--text-secondary)',
            }}
          >
            <Loader2 size={42} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Cargando catálogo familiar...</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Conectando a http://localhost:5000</span>
          </div>
        ) : (
          <>
            {/* PESTAÑA 1: TIENDA / CATÁLOGO */}
            {activeTab === 'store' && (
              <StoreCatalog
                products={products}
                onOpenMovement={handleOpenMovement}
                onOpenOfferModal={handleOpenOfferModal}
                onOpenNewProduct={handleOpenNewProduct}
              />
            )}

            {/* PESTAÑA 2: OFERTAS Y DESCUENTOS */}
            {activeTab === 'offers' && (
              <OffersView
                products={products}
                onOpenMovement={handleOpenMovement}
                onOpenOfferModal={handleOpenOfferModal}
              />
            )}

            {/* PESTAÑA 3: DASHBOARD ADMINISTRATIVO */}
            {activeTab === 'dashboard' && (
              <AdminDashboard
                products={products}
                movements={movements}
                stats={stats}
                onSelectProductForEdit={handleEditProduct}
              />
            )}

            {/* PESTAÑA 4: GESTIÓN DE INVENTARIO */}
            {activeTab === 'inventory' && (
              <InventoryTable
                products={products}
                onOpenMovement={handleOpenMovement}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onOpenOfferModal={handleOpenOfferModal}
                activeFilter={inventoryFilter}
                setActiveFilter={setInventoryFilter}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL 1: Formulario de Producto */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* MODAL 2: Movimiento de Stock (Entradas y Salidas) */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        product={movementProduct}
        initialType={movementType}
        onSubmitMovement={handleMovementSubmit}
      />

      {/* MODAL 3: Configurar Oferta Temporal */}
      <OfferFormModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        product={offerProduct}
        onSubmitOffer={handleSubmitOffer}
        onRemoveOffer={handleRemoveOffer}
      />

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '14px 22px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={20} color="var(--color-mint-500)" />
          <span style={{ fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;

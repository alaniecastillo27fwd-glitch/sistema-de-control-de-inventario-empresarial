import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Tag, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Clock,
  Sparkles,
  Package,
  Award,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

/**
 * Vista: Dashboard Administrativo & Gráficas de Rendimiento
 * @param {Object} props
 * @param {Array} props.products - Lista de productos
 * @param {Array} props.movements - Historial de movimientos
 * @param {Object} props.stats - Métricas generales
 * @param {Function} [props.onOpenMovement] - Callback para compra / salida rápida
 * @param {Function} [props.onNavigateToStore] - Callback para navegar a la tienda
 */
export function AdminDashboard({
  products,
  movements,
  stats,
  onOpenMovement,
  onNavigateToStore,
}) {
  // Filtro temporal para la gráfica: 'DAYS' | 'WEEKS' | 'YEAR'
  const [timeRange, setTimeRange] = useState('DAYS');

  // Producto seleccionado para la Trazabilidad Individual
  const [selectedProductId, setSelectedProductId] = useState(
    products.length > 0 ? String(products[0].id) : ''
  );

  // Producto más destacado de la tienda (mayor demanda o mejor promoción activa)
  const featuredProduct = useMemo(() => {
    if (!products || products.length === 0) return null;

    const salesMap = {};
    movements
      .filter((m) => m.type === 'OUT')
      .forEach((m) => {
        const pid = String(m.productId);
        salesMap[pid] = (salesMap[pid] || 0) + (Number(m.quantity) || 0);
      });

    const sorted = [...products].filter((p) => p.stock > 0).sort((a, b) => {
      const salesA = salesMap[String(a.id)] || 0;
      const salesB = salesMap[String(b.id)] || 0;

      // 1. Priorizar ofertas activas
      if (a.enOferta && !b.enOferta) return -1;
      if (!a.enOferta && b.enOferta) return 1;
      // 2. Mayor volumen de salidas/ventas
      if (salesB !== salesA) return salesB - salesA;
      // 3. Mayor stock disponible
      return b.stock - a.stock;
    });

    return sorted[0] || products[0] || null;
  }, [products, movements]);

  // 1. Métricas KPI
  const {
    totalProducts,
    totalUnits,
    totalInventoryValue,
    activeOffersCount,
    lowStockCount,
    outOfStockCount,
    totalAlerts,
  } = stats;

  // Total de salidas/ventas registradas
  const totalSalesCount = useMemo(() => {
    return movements
      .filter((m) => m.type === 'OUT')
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [movements]);

  const totalEntriesCount = useMemo(() => {
    return movements
      .filter((m) => m.type === 'IN')
      .reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [movements]);

  // 2. Procesamiento de Datos para Gráficas Estadísticas según el Filtro Temporal
  const chartData = useMemo(() => {
    const now = new Date();

    if (timeRange === 'DAYS') {
      // Últimos 7 días con desglose diario
      const daysMap = {};
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = `${dayNames[d.getDay()]} ${d.getDate()}`;
        daysMap[key] = { label, entradas: 0, salidas: 0, balance: 0 };
      }

      movements.forEach((mov) => {
        const movDate = new Date(mov.timestamp).toISOString().slice(0, 10);
        if (daysMap[movDate]) {
          if (mov.type === 'IN') {
            daysMap[movDate].entradas += mov.quantity;
          } else {
            daysMap[movDate].salidas += mov.quantity;
          }
          daysMap[movDate].balance = daysMap[movDate].entradas - daysMap[movDate].salidas;
        }
      });

      return Object.values(daysMap);
    } else if (timeRange === 'WEEKS') {
      // Últimas 4 semanas (Meses / Semanal)
      const weeksData = [
        { label: 'Semana 1', entradas: 0, salidas: 0 },
        { label: 'Semana 2', entradas: 0, salidas: 0 },
        { label: 'Semana 3', entradas: 0, salidas: 0 },
        { label: 'Semana 4 (Actual)', entradas: 0, salidas: 0 },
      ];

      movements.forEach((mov) => {
        const diffDays = Math.floor((now - new Date(mov.timestamp)) / (1000 * 60 * 60 * 24));
        let weekIndex = 3;
        if (diffDays > 21) weekIndex = 0;
        else if (diffDays > 14) weekIndex = 1;
        else if (diffDays > 7) weekIndex = 2;

        if (mov.type === 'IN') {
          weeksData[weekIndex].entradas += mov.quantity;
        } else {
          weeksData[weekIndex].salidas += mov.quantity;
        }
      });

      return weeksData;
    } else {
      // Último Año (Mensual)
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const currentMonth = now.getMonth();
      const monthsData = [];

      for (let i = 11; i >= 0; i--) {
        const mIndex = (currentMonth - i + 12) % 12;
        monthsData.push({
          label: monthNames[mIndex],
          monthNum: mIndex,
          entradas: 0,
          salidas: 0,
        });
      }

      movements.forEach((mov) => {
        const m = new Date(mov.timestamp).getMonth();
        const found = monthsData.find((item) => item.monthNum === m);
        if (found) {
          if (mov.type === 'IN') {
            found.entradas += mov.quantity;
          } else {
            found.salidas += mov.quantity;
          }
        }
      });

      return monthsData;
    }
  }, [movements, timeRange]);

  // 3. Trazabilidad por Producto: Producto seleccionado y su historial unificado
  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(selectedProductId)) || products[0] || null;
  }, [products, selectedProductId]);

  const productTimeline = useMemo(() => {
    if (!selectedProduct) return [];

    const events = [];

    // Evento de Creación
    if (selectedProduct.createdAt) {
      events.push({
        id: `create-${selectedProduct.id}`,
        date: selectedProduct.createdAt,
        type: 'CREATION',
        title: 'Alta y Registro del Producto',
        details: `Producto registrado en categoría "${selectedProduct.category}" con stock base de ${selectedProduct.stock} u. y precio $${Number(selectedProduct.price).toFixed(2)}.`,
      });
    }

    // Eventos de Cambios de Precio / Ofertas
    if (Array.isArray(selectedProduct.historialPrecios)) {
      selectedProduct.historialPrecios.forEach((hp, idx) => {
        events.push({
          id: `price-${idx}`,
          date: hp.fecha || selectedProduct.createdAt,
          type: hp.tipo === 'OFERTA_APLICADA' ? 'OFFER' : 'PRICE',
          title: hp.tipo === 'OFERTA_APLICADA' ? 'Promoción Especial Aplicada' : 'Ajuste de Precio de Venta',
          details: `${hp.motivo || 'Actualización de valor comercial'}: Precio ajustado a $${Number(hp.precio).toFixed(2)}${hp.porcentajeDescuento ? ` (-${hp.porcentajeDescuento}%)` : ''}.`,
        });
      });
    }

    // Eventos de Movimientos (Entradas / Salidas)
    movements
      .filter((m) => String(m.productId) === String(selectedProduct.id))
      .forEach((m) => {
        events.push({
          id: `mov-${m.id}`,
          date: m.timestamp,
          type: m.type === 'IN' ? 'IN' : 'OUT',
          title: m.type === 'IN' ? `Entrada: +${m.quantity} unidades` : `Salida / Venta: -${m.quantity} unidades`,
          details: `Motivo: "${m.reason}". Stock resultante en almacén: ${m.resultingStock} u.`,
          quantity: m.quantity,
          resultingStock: m.resultingStock,
        });
      });

    // Ordenar cronológicamente del más reciente al más antiguo
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedProduct, movements]);

  return (
    <div className="admin-dashboard-view">
      {/* Encabezado */}
      <div className="section-header-banner">
        <div className="section-title-group">
          <h2>
            <BarChart3 size={26} color="var(--color-sky-500)" />
            <span>Dashboard Administrativo & Rendimiento</span>
          </h2>
          <p>Métricas clave en tiempo real, análisis de flujo de mercadería y trazabilidad individual.</p>
        </div>
      </div>

      {/* 1. Tarjetas Resumen KPI */}
      <section className="stats-grid" aria-label="Métricas del negocio">
        {/* KPI 1: Ventas / Salidas Totales */}
        <div className="stat-card sky">
          <div className="stat-info">
            <span className="stat-label">Movimientos Totales</span>
            <span className="stat-value">{movements.length}</span>
            <span className="stat-subtext">
              {totalSalesCount} u. vendidas / {totalEntriesCount} u. ingresadas
            </span>
          </div>
          <div className="stat-icon-wrapper sky">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* KPI 2: Valor Total del Inventario */}
        <div className="stat-card mint">
          <div className="stat-info">
            <span className="stat-label">Valor del Inventario</span>
            <span className="stat-value">
              ${totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="stat-subtext">{totalUnits} unidades en {totalProducts} productos</span>
          </div>
          <div className="stat-icon-wrapper mint">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 3: Ofertas Activas */}
        <div className="stat-card gold">
          <div className="stat-info">
            <span className="stat-label">Ofertas Activas</span>
            <span className="stat-value" style={{ color: 'var(--color-gold-600)' }}>
              {activeOffersCount}
            </span>
            <span className="stat-subtext">
              {activeOffersCount > 0 ? 'Con temporizador en tienda' : 'Sin promociones en curso'}
            </span>
          </div>
          <div className="stat-icon-wrapper gold">
            <Tag size={24} />
          </div>
        </div>

        {/* KPI 4: Alertas de Stock */}
        <div className="stat-card rose">
          <div className="stat-info">
            <span className="stat-label">Alertas de Stock</span>
            <span className="stat-value" style={{ color: totalAlerts > 0 ? 'var(--accent-rose)' : 'var(--color-mint-600)' }}>
              {totalAlerts}
            </span>
            <span className="stat-subtext">
              {outOfStockCount} agotados · {lowStockCount} stock bajo
            </span>
          </div>
          <div className="stat-icon-wrapper rose">
            <AlertTriangle size={24} />
          </div>
        </div>
      </section>

      {/* Apartado Especial: Producto Más Destacado de la Tienda */}
      {featuredProduct && (
        <section 
          className="featured-product-hero" 
          aria-label="Producto más destacado de la tienda"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--color-gold-400)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Fondo decorativo sutil */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '320px',
              height: '100%',
              background: 'radial-gradient(circle at 80% 20%, var(--accent-gold-bg) 0%, transparent 70%)',
              pointerEvents: 'none',
              opacity: 0.8,
            }}
          />

          {/* Insignia superior */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--accent-gold-bg)',
                color: 'var(--color-gold-700)',
                border: '1px solid var(--color-gold-300)',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              <Award size={16} style={{ color: 'var(--color-gold-500)' }} />
              <span>Producto Más Destacado · Selección Especial de la Tienda</span>
            </div>

            {featuredProduct.enOferta && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-mint-bg)',
                  color: 'var(--color-mint-700)',
                  border: '1px solid var(--color-mint-400)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                <Sparkles size={14} />
                <span>Oferta Especial: -{featuredProduct.porcentajeDescuento}%</span>
              </span>
            )}
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {/* Columna Izquierda: Información del Producto */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-sky-500) 0%, var(--color-sky-700) 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <ShoppingBag size={34} />
              </div>

              <div>
                <span 
                  style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: 'var(--color-sky-600)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {featuredProduct.category}
                </span>
                <h3 
                  style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 800, 
                    margin: '4px 0 8px', 
                    color: 'var(--text-primary)',
                    lineHeight: 1.25,
                  }}
                >
                  {featuredProduct.name}
                </h3>
                
                {/* Precios */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                  {featuredProduct.enOferta && featuredProduct.precioOferta ? (
                    <>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold-600)' }}>
                        ${Number(featuredProduct.precioOferta).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        ${Number(featuredProduct.price).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${Number(featuredProduct.price).toFixed(2)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ por unidad</span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} style={{ color: 'var(--color-mint-600)' }} />
                  <span><strong>{featuredProduct.stock} unidades</strong> disponibles en existencias</span>
                </p>
              </div>
            </div>

            {/* Columna Derecha: Mensaje Entusiasta de Compra & Llamado a la Acción */}
            <div 
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 
                style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 700, 
                  color: 'var(--color-gold-700)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px' 
                }}
              >
                <Sparkles size={16} />
                <span>¡El consentido de nuestros clientes!</span>
              </h4>

              <p 
                style={{ 
                  fontSize: '0.92rem', 
                  lineHeight: '1.55', 
                  color: 'var(--text-primary)', 
                  marginBottom: '14px' 
                }}
              >
                ¡No dejes pasar la oportunidad de disfrutar este producto estrella! Ha sido seleccionado especialmente por su incomparable frescura, calidad artesanal y el entusiasmo que despierta en cada hogar. <strong>¡Aprovecha hoy mismo y llévatelo antes de que se agoten las existencias!</strong>
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {onOpenMovement && (
                  <button
                    type="button"
                    className="btn btn-gold"
                    onClick={() => onOpenMovement(featuredProduct, 'OUT')}
                    style={{ fontSize: '0.88rem', padding: '10px 18px' }}
                    title="Registrar venta directa de este producto estrella"
                  >
                    <ShoppingBag size={16} />
                    <span>¡Comprar Ahora!</span>
                  </button>
                )}

                {onNavigateToStore && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onNavigateToStore}
                    style={{ fontSize: '0.88rem', padding: '10px 16px' }}
                    title="Ir a la vista completa de la tienda"
                  >
                    <span>Ver en Tienda</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Gráficas Estadísticas Interactivas con Filtro Temporal */}
      <section className="dashboard-chart-card" aria-label="Gráfica de movimientos y flujo de stock">
        <div className="chart-header-row">
          <div className="chart-title-group">
            <h3>Flujo de Existencias: Entradas vs Salidas de Mercadería</h3>
            <p>Visualiza el volumen de reposiciones (IN) y ventas/salidas (OUT) a lo largo del tiempo.</p>
          </div>

          {/* Selector de Rango Temporal */}
          <div className="time-range-toggle">
            <button
              type="button"
              className={`time-range-btn ${timeRange === 'DAYS' ? 'active' : ''}`}
              onClick={() => setTimeRange('DAYS')}
            >
              Días (Última Semana)
            </button>
            <button
              type="button"
              className={`time-range-btn ${timeRange === 'WEEKS' ? 'active' : ''}`}
              onClick={() => setTimeRange('WEEKS')}
            >
              Meses (Semanas)
            </button>
            <button
              type="button"
              className={`time-range-btn ${timeRange === 'YEAR' ? 'active' : ''}`}
              onClick={() => setTimeRange('YEAR')}
            >
              Último Año (Mensual)
            </button>
          </div>
        </div>

        {/* Componente Gráfico Responsive */}
        <div style={{ width: '100%', height: 320, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '0.82rem',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 10, fontSize: '0.85rem' }} 
              />
              <Bar 
                dataKey="entradas" 
                name="Entradas (Reposición)" 
                fill="#10B981" 
                radius={[6, 6, 0, 0]} 
              />
              <Bar 
                dataKey="salidas" 
                name="Salidas (Ventas / Consumo)" 
                fill="#0284C7" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Sección de Historial y Trazabilidad por Producto */}
      <section className="traceability-card" aria-label="Trazabilidad individual por producto">
        <div className="traceability-header">
          <div className="section-title-group">
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} color="var(--color-sky-500)" />
              <span>Línea de Tiempo & Trazabilidad por Producto</span>
            </h3>
            <p>Selecciona un producto para auditar su ciclo de vida completo: registro, cambios de precios, ofertas y movimientos.</p>
          </div>

          {/* Selector de Producto */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ minWidth: '240px' }}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock} u. disponibles)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen del Producto Seleccionado */}
        {selectedProduct ? (
          <div>
            <div
              style={{
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedProduct.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Categoría: <strong>{selectedProduct.category}</strong> · ID: {selectedProduct.id}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Precio Actual:
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedProduct.enOferta ? 'var(--color-gold-600)' : 'var(--text-primary)' }}>
                    ${(selectedProduct.enOferta && selectedProduct.precioOferta ? selectedProduct.precioOferta : selectedProduct.price).toFixed(2)}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Stock Actual:
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {selectedProduct.stock} u.
                  </span>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo Cronológica */}
            <div className="timeline-container">
              {productTimeline.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No se han registrado eventos para este producto.
                </p>
              ) : (
                productTimeline.map((ev) => {
                  const isEntry = ev.type === 'IN';
                  const isExit = ev.type === 'OUT';
                  const isPrice = ev.type === 'PRICE' || ev.type === 'OFFER';

                  const dateFormatted = new Date(ev.date).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={ev.id} className="timeline-node">
                      <div className={`timeline-dot ${isEntry ? 'in' : isExit ? 'out' : isPrice ? 'price' : ''}`}>
                        {isEntry ? (
                          <ArrowUpRight size={13} />
                        ) : isExit ? (
                          <ArrowDownRight size={13} />
                        ) : isPrice ? (
                          <Tag size={13} />
                        ) : (
                          <Sparkles size={13} />
                        )}
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-header-meta">
                          <span className="timeline-event-title">{ev.title}</span>
                          <span className="timeline-date">
                            <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                            {dateFormatted}
                          </span>
                        </div>
                        <p className="timeline-details">{ev.details}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No hay productos disponibles.</p>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;

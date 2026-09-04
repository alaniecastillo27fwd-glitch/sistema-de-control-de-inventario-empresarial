import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  ShoppingBag, 
  Tag, 
  Package, 
  HelpCircle,
  Key,
  Check
} from 'lucide-react';

/**
 * Asistente Virtual Inteligente: Tiendita IA
 * Diseñado para La Tiendita Familiar con paleta corporativa (celeste, dorado y menta).
 * @param {Object} props
 * @param {Array} props.products - Catálogo actual de productos
 * @param {Array} props.movements - Registro de movimientos
 * @param {Object} props.stats - Métricas del inventario
 * @param {Function} [props.onNavigateTab] - Navegación entre pestañas ('store' | 'offers' | 'dashboard' | 'inventory')
 * @param {Function} [props.onOpenMovement] - Apertura de modal de compra/movimiento
 */
export function GeminiChatbot({
  products = [],
  movements = [],
  stats = {},
  onNavigateTab,
  onOpenMovement,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('tiendita_ai_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const messagesEndRef = useRef(null);

  // Historial de mensajes inicial de Tiendita IA
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: '¡Hola! Soy Tiendita IA, tu asistente virtual de La Tiendita Familiar. Estoy aquí para recomendarte los mejores productos, mostrarte nuestras ofertas exclusivas con temporizador y orientarte en cualquier función de la página. ¿Qué te gustaría descubrir hoy?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Auto-scroll al final del chat cuando llegan mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Guardar clave API en localStorage
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem('tiendita_ai_api_key', cleanKey);
    } else {
      localStorage.removeItem('tiendita_ai_api_key');
    }
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
      setShowKeyPanel(false);
    }, 1200);
  };

  // Consultar a la IA (con API Key remota o motor autónomo integrado)
  const generateAIResponse = async (userQuery) => {
    const activeKey =
      localStorage.getItem('tiendita_ai_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      apiKeyInput.trim();

    const cleanQuery = userQuery.toLowerCase().trim();

    // 1. Si existe clave API configurada, conectar directamente con el modelo de IA
    if (activeKey) {
      try {
        const systemPrompt = `Eres Tiendita IA, el asistente oficial y promotor comercial de "La Tiendita Familiar", una boutique y mercado familiar de alta calidad.
Tienes acceso al inventario en tiempo real:
Productos en catálogo (${products.length}): ${JSON.stringify(
          products.map((p) => ({
            nombre: p.name,
            categoria: p.category,
            precio: p.price,
            stock: p.stock,
            enOferta: p.enOferta,
            precioOferta: p.precioOferta,
            descuento: p.porcentajeDescuento,
          }))
        )}
Métricas del negocio: ${JSON.stringify(stats)}
Instrucciones:
1. Responde siempre identificándote como "Tiendita IA".
2. Sé cálido, entusiasta, familiar y ayuda activamente a vender y promocionar los productos con ofertas o stock disponible.
3. Si preguntan sobre la web, orienta sobre las pestañas: Tienda, Ofertas, Dashboard e Inventario.
4. Responde en español de forma concisa y profesional.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    { text: `Pregunta del usuario: ${userQuery}` },
                  ],
                },
              ],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              text: replyText,
              matchedProducts: findMatchedProducts(cleanQuery),
            };
          }
        }
      } catch (err) {
        console.warn('Conexión con API remota no disponible, ejecutando motor local autónomo:', err);
      }
    }

    // 2. Motor autónomo inteligente de Tiendita IA (funciona 100% de forma óptima sin internet ni claves)
    return processLocalEngine(cleanQuery);
  };

  // Buscar productos coincidentes en el catálogo
  const findMatchedProducts = (query) => {
    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.category.toLowerCase();
      return query.split(' ').some((word) => word.length > 2 && (name.includes(word) || cat.includes(word)));
    });
  };

  // Motor semántico autónomo de Tiendita IA
  const processLocalEngine = (query) => {
    // A. Consultas sobre Ofertas y Descuentos
    if (query.includes('oferta') || query.includes('descuento') || query.includes('promo') || query.includes('rebaja')) {
      const offers = products.filter((p) => p.enOferta);
      if (offers.length === 0) {
        return {
          text: 'Actualmente no tenemos promociones activas, pero todo nuestro catálogo familiar cuenta con precios justos y accesibles. ¡Puedes revisar la sección de Catálogo para ver nuestras novedades!',
          matchedProducts: products.slice(0, 2),
        };
      }

      const offerListText = offers
        .map(
          (o) =>
            `• ${o.name}: ¡Ahora solo $${Number(o.precioOferta).toFixed(2)}! (Antes $${Number(o.price).toFixed(2)}, ahorras un ${o.porcentajeDescuento}%)`
        )
        .join('\n');

      return {
        text: `¡Tenemos promociones increíbles preparadas para ti en La Tiendita Familiar! Mira las ofertas activas por tiempo limitado:\n\n${offerListText}\n\n¡Aprovecha hoy mismo antes de que se agoten las existencias!`,
        matchedProducts: offers,
      };
    }

    // B. Producto estrella / recomendación destacada
    if (query.includes('estrella') || query.includes('recomiend') || query.includes('destacad') || query.includes('mejor')) {
      const topOffer = products.find((p) => p.enOferta && p.stock > 0) || products[0];
      if (topOffer) {
        return {
          text: `¡Mi recomendación número 1 hoy es el "${topOffer.name}"! Es el producto preferido por las familias por su incomparable frescura y calidad. Disponemos de ${topOffer.stock} unidades listas para entrega. ${
            topOffer.enOferta
              ? `¡Está con un súper descuento del ${topOffer.porcentajeDescuento}%, quedando en solo $${Number(topOffer.precioOferta).toFixed(2)}!`
              : `Puedes llevártelo hoy por solo $${Number(topOffer.price).toFixed(2)}.`
          } ¡Te aseguro que te encantará!`,
          matchedProducts: [topOffer],
        };
      }
    }

    // C. Consultas sobre el estado del inventario o alertas
    if (query.includes('inventario') || query.includes('stock') || query.includes('agotad') || query.includes('alerta') || query.includes('cuanto')) {
      const outOfStock = products.filter((p) => p.stock === 0);
      const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 5));
      const totalSales = movements
        .filter((m) => m.type === 'OUT')
        .reduce((acc, curr) => acc + (curr.quantity || 0), 0);

      return {
        text: `Aquí tienes el balance en tiempo real del inventario:\n• Total de productos: ${products.length} artículos\n• Unidades en almacén: ${stats.totalUnits || 0} unidades\n• Ofertas activas: ${stats.activeOffersCount || 0}\n• Ventas/Salidas registradas: ${totalSales} unidades\n• En stock bajo: ${lowStock.length} productos\n• Agotados: ${outOfStock.length} productos.\n\nTodo se sincroniza automáticamente con nuestro servidor local de base de datos.`,
        matchedProducts: lowStock.length > 0 ? lowStock.slice(0, 3) : products.slice(0, 2),
      };
    }

    // D. Información sobre la página web y cómo usarla
    if (query.includes('pagina') || query.includes('web') || query.includes('como funciona') || query.includes('seccion') || query.includes('pestaña')) {
      return {
        text: `La Tiendita Familiar está organizada en 4 pestañas diseñadas para ti:\n\n1. Tienda: Catálogo visual con tarjetas de productos y compras rápidas.\n2. Ofertas: Promociones temporales con temporizador regresivo y avisos de urgencia.\n3. Dashboard: Métricas de negocio, producto destacado, gráficas de movimientos y trazabilidad.\n4. Inventario: Tabla técnica para control de existencias, filtros y edición.\n\nAdemás, puedes cambiar entre modo claro y oscuro con el botón superior.`,
        matchedProducts: [],
      };
    }

    // E. Búsqueda por coincidencia de nombre o categoría (café, pan, leche, etc.)
    const matched = findMatchedProducts(query);
    if (matched.length > 0) {
      const itemsDetail = matched
        .map(
          (m) =>
            `• ${m.name} (${m.category}): $${Number(m.enOferta ? m.precioOferta : m.price).toFixed(2)} - ${
              m.stock > 0 ? `${m.stock} disponibles` : 'Agotado temporalmente'
            }`
        )
        .join('\n');

      return {
        text: `¡Encontré estos productos para ti en nuestro catálogo!\n\n${itemsDetail}\n\n¿Deseas que te ayude a registrar una compra o quieres conocer más detalles?`,
        matchedProducts: matched,
      };
    }

    // F. Respuesta amistosa por defecto
    return {
      text: `¡Con gusto te ayudo! En La Tiendita Familiar tenemos productos de primera calidad, promociones con descuentos y un sistema completo de control de stock. Puedes pedirme que busque productos como café, leche, pan o preguntarme por las ofertas del día. ¿Qué producto estás buscando hoy?`,
      matchedProducts: products.filter((p) => p.enOferta).slice(0, 2),
    };
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simular tiempo de respuesta natural
    setTimeout(async () => {
      const response = await generateAIResponse(userText);
      const botMsg = {
        id: `tiendita-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        products: response.matchedProducts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      handleSendMessage();
    }, 80);
  };

  return (
    <>
      {/* Botón Flotante para Abrir Tiendita IA */}
      {!isOpen && (
        <button
          type="button"
          className="gemini-float-btn"
          onClick={() => setIsOpen(true)}
          title="Abrir Asistente Virtual Tiendita IA"
          aria-label="Abrir Asistente Virtual Tiendita IA"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Store size={16} color="#ffffff" />
          </div>
          <span style={{ color: '#ffffff', fontWeight: 800 }}>Tiendita IA · Asistente</span>
        </button>
      )}

      {/* Ventana Flotante de Tiendita IA */}
      {isOpen && (
        <div className="gemini-chat-window" role="dialog" aria-label="Asistente Tiendita IA">
          {/* Cabecera del Chat */}
          <div className="gemini-chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                }}
              >
                <Store size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Tiendita IA
                </h4>
                <span style={{ fontSize: '0.74rem', color: '#ffffff', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                  En línea · Asistente Oficial
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Botón para Configurar API Key */}
              <button
                type="button"
                className="btn-icon-only"
                onClick={() => setShowKeyPanel(!showKeyPanel)}
                title="Configurar Clave API de la IA"
                style={{
                  background: showKeyPanel ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                }}
              >
                <Key size={16} />
              </button>

              <button
                type="button"
                className="btn-icon-only"
                onClick={() => setIsOpen(false)}
                title="Minimizar chat"
                style={{ background: 'transparent', border: 'none', color: '#ffffff', width: '32px', height: '32px' }}
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                className="btn-icon-only"
                onClick={() => setIsOpen(false)}
                title="Cerrar chat"
                style={{ background: 'transparent', border: 'none', color: '#ffffff', width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Panel Desplegable de Configuración de API Key ("APK de la IA") */}
          {showKeyPanel && (
            <div
              style={{
                background: 'var(--bg-surface-alt)',
                borderBottom: '1px solid var(--border-color)',
                padding: '12px 16px',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <form onSubmit={handleSaveApiKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Clave de API de la IA (Google AI Studio)
                  </label>
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-gold-600)', fontWeight: 600 }}>Opcional</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="Pega aquí tu API Key (o déjala vacía)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-gold"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    {apiKeySaved ? <Check size={14} /> : 'Guardar'}
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  Configurada en <code>.env</code> como <code>VITE_GEMINI_API_KEY</code>. Si no tienes una clave, <strong>Tiendita IA funciona de forma autónoma al 100%</strong> con el catálogo local.
                </p>
              </form>
            </div>
          )}

          {/* Historial de Mensajes */}
          <div className="gemini-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`gemini-bubble ${msg.sender}`}>
                {/* Texto del mensaje */}
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>

                {/* Tarjetas interactivas de productos recomendados si existen */}
                {msg.products && msg.products.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.products.slice(0, 3).map((prod) => (
                      <div
                        key={prod.id}
                        style={{
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 10px',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ fontSize: '0.82rem', display: 'block', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prod.name}
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-gold-600)', fontWeight: 700 }}>
                            ${Number(prod.enOferta ? prod.precioOferta : prod.price).toFixed(2)}
                            {prod.enOferta && ` (-${prod.porcentajeDescuento}%)`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {onNavigateTab && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                onNavigateTab('store');
                                setIsOpen(false);
                              }}
                              style={{ fontSize: '0.72rem', padding: '4px 8px', flexShrink: 0 }}
                              title="Ver en el catálogo de la tienda"
                            >
                              Ver
                            </button>
                          )}

                          {onOpenMovement && prod.stock > 0 && (
                            <button
                              type="button"
                              className="btn btn-gold"
                              onClick={() => {
                                onOpenMovement(prod, 'OUT');
                                setIsOpen(false);
                              }}
                              style={{ fontSize: '0.72rem', padding: '4px 8px', flexShrink: 0 }}
                              title="Comprar / Registrar salida de este producto"
                            >
                              <ShoppingBag size={12} />
                              <span>Comprar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span
                  style={{
                    display: 'block',
                    fontSize: '0.65rem',
                    opacity: 0.65,
                    marginTop: '4px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}
                >
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="gemini-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} className="spinner" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-sky-500)' }} />
                <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  Tiendita IA está preparando la mejor respuesta...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="gemini-quick-suggestions">
            <button
              type="button"
              className="gemini-quick-chip"
              onClick={() => handleQuickQuestion('¿Qué ofertas y descuentos hay hoy?')}
            >
              <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Ofertas de hoy
            </button>
            <button
              type="button"
              className="gemini-quick-chip"
              onClick={() => handleQuickQuestion('Recomiéndame el producto estrella')}
            >
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Producto estrella
            </button>
            <button
              type="button"
              className="gemini-quick-chip"
              onClick={() => handleQuickQuestion('¿Cómo está el inventario y stock?')}
            >
              <Package size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Estado del stock
            </button>
            <button
              type="button"
              className="gemini-quick-chip"
              onClick={() => handleQuickQuestion('¿Qué puedo hacer en esta página?')}
            >
              <HelpCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Ayuda de la tienda
            </button>
          </div>

          {/* Caja de Entrada de Texto */}
          <form onSubmit={handleSendMessage} className="gemini-chat-footer">
            <input
              type="text"
              className="gemini-chat-input"
              placeholder="Pregúntale a Tiendita IA sobre productos, ofertas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!input.trim() || isTyping}
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--color-sky-500) 0%, var(--primary) 100%)',
              }}
              title="Enviar mensaje"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

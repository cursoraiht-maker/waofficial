import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { POSTRELAND_MENU } from '../data/menu';
import {
  Send,
  Sparkles,
  RefreshCw,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  Clock,
  Cake,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';

interface WhatsAppSimulatorProps {
  onMessageProcessed?: () => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ onMessageProcessed }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: '¡Hola! 🍰 Bienvenidos a *Postreland*, pastelería artesanal de alta repostería.\n\n¿En qué podemos endulzar tu día hoy? Puedes consultarnos por nuestros pasteles para eventos, tartas, alfajores o conocer las opciones disponibles para entrega inmediata ✨.',
      timestamp: '10:00',
      status: 'read',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('+52 1 55 4123 9876');
  const [customerName, setCustomerName] = useState('Sofía Martínez');
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg_' + Date.now();

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: userTimestamp,
      status: 'read',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Formatear historial para el bot
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          customerPhone: `${customerName} (${customerPhone})`,
          conversationHistory: history,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const botMsg: ChatMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: data.reply || '¡Gracias por escribirnos a Postreland!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          latencyMs: data.latencyMs,
        };
        setMessages((prev) => [...prev, botMsg]);
        setLastLatency(data.latencyMs);
        if (onMessageProcessed) onMessageProcessed();
      } else {
        throw new Error(data.error || 'Error al obtener respuesta del bot');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'bot',
        text: `⚠️ No pudimos conectar con el asistente: ${err.message || 'Error de red'}. Por favor intenta de nuevo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'bot',
        text: '¡Hola de nuevo! 🍰 Estamos listos en *Postreland* para ayudarte con tus postres o pedidos especiales. ¿Qué te gustaría consultar hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Side Info & Shortcuts */}
      <div className="lg:col-span-4 space-y-4">
        {/* Customer Simulator Controller */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Perfil del Cliente Simulado
            </h3>
            <button
              onClick={resetChat}
              className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              title="Reiniciar conversación"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-stone-500 font-medium block mb-1">Nombre del Remitente</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-800"
              />
            </div>
            <div>
              <label className="text-stone-500 font-medium block mb-1">Número WhatsApp (+Código)</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-800 font-mono"
              />
            </div>

            {lastLatency !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-stone-600">
                <span className="flex items-center gap-1 text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Latencia de respuesta:
                </span>
                <span className="font-mono font-semibold text-emerald-600 text-[11px]">
                  {lastLatency} ms
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Question Pills */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 mb-2.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Preguntas Rápidas de Prueba
          </h3>
          <p className="text-xs text-stone-500 mb-3">
            Haz clic para enviar un mensaje instantáneo al bot de Postreland:
          </p>

          <div className="space-y-2">
            {[
              {
                icon: '🍓',
                text: '¡Hola! ¿Qué postres tienen disponibles para este fin de semana?',
                tag: 'Disponibilidad',
              },
              {
                icon: '🎂',
                text: 'Quisiera cotizar un pastel para 20 personas para el sábado en la tarde.',
                tag: 'Cotización',
              },
              {
                icon: '🍫',
                text: '¿Cuánto cuesta la Tarta Bombón de Chocolate Belga y cuántas porciones rinde?',
                tag: 'Precios',
              },
              {
                icon: '🚚',
                text: '¿Hacen entregas a domicilio y cuáles son sus horarios?',
                tag: 'Envíos & Horarios',
              },
              {
                icon: '🧁',
                text: '¿Tienen opciones de cajas de regalo como macarons o alfajores?',
                tag: 'Cajas Regalo',
              },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.text)}
                disabled={isTyping}
                className="w-full text-left p-2.5 rounded-xl border border-stone-200/80 hover:border-emerald-400 bg-stone-50/70 hover:bg-emerald-50/40 text-stone-700 transition-all text-xs flex items-start gap-2.5 group"
              >
                <span className="text-base leading-none group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-stone-800 block line-clamp-2">
                    {item.text}
                  </span>
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Este simulador ejecuta las mismas instrucciones de sistema y el modelo <strong>Gemini 2.5 Flash</strong> que responden a través de WhatsApp Cloud API en producción.
          </p>
        </div>
      </div>

      {/* WhatsApp Interface Mockup */}
      <div className="lg:col-span-8">
        <div className="bg-[#e5ddd5] rounded-3xl overflow-hidden border border-stone-300 shadow-xl flex flex-col h-[680px]">
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-amber-200 flex items-center justify-center text-xl shadow-inner border border-white/30">
                  🍰
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075e54] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm tracking-wide text-white">
                    Postreland Pastelería
                  </h2>
                  <span className="bg-emerald-400 text-[#075e54] rounded-full p-0.5 text-[9px] font-bold" title="Cuenta Oficial Verificada">
                    ✔
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-light flex items-center gap-1">
                  {isTyping ? (
                    <span className="italic font-medium text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
                      escribiendo...
                    </span>
                  ) : (
                    'en línea • Cuenta de empresa'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-emerald-100">
              <button
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title="Llamada de voz"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title="Videollamada"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={resetChat}
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title="Reiniciar chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body with WhatsApp pattern background */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2]"
            style={{
              backgroundImage: `radial-gradient(#d3c8ba 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Encryption notice */}
            <div className="flex justify-center mb-2">
              <div className="bg-[#ffeecd] text-[#54656f] text-[10px] px-3 py-1.5 rounded-lg shadow-sm border border-[#f5dfb8] max-w-sm text-center leading-relaxed">
                🔒 Los mensajes están cifrados. Tu conversación interactúa con el motor de IA de <strong>Postreland</strong> entrenado con el menú artesanal.
              </div>
            </div>

            {/* Message Bubbles */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm relative leading-relaxed ${
                      isUser
                        ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                        : 'bg-white text-[#111b21] rounded-tl-none border border-stone-200/50'
                    }`}
                  >
                    {/* Bot Title Tag */}
                    {!isUser && (
                      <div className="text-[10px] font-bold text-rose-700 mb-1 flex items-center gap-1">
                        🍰 Postreland Asistente
                        {msg.latencyMs && (
                          <span className="text-[9px] font-normal text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-full">
                            ⚡ {msg.latencyMs}ms
                          </span>
                        )}
                      </div>
                    )}

                    {/* Text formatted */}
                    <div className="whitespace-pre-wrap break-words text-stone-800 text-[13px] leading-relaxed">
                      {msg.text}
                    </div>

                    {/* Timestamp & Status */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-400">
                      <span>{msg.timestamp}</span>
                      {isUser && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-stone-200/50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Input Bar */}
          <div className="bg-[#f0f2f5] p-2.5 border-t border-stone-300 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-stone-500 hover:text-stone-700 transition-colors"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-stone-500 hover:text-stone-700 transition-colors"
              title="Adjuntar archivo o comprobante"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe un mensaje a Postreland..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="w-full bg-white rounded-full px-4 py-2.5 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none border border-stone-200 shadow-inner"
              />
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={`p-2.5 rounded-full transition-all shadow-md flex items-center justify-center ${
                inputText.trim() && !isTyping
                  ? 'bg-[#00a884] text-white hover:bg-[#008f6f] active:scale-95'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

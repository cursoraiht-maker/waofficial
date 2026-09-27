import React, { useState } from 'react';
import { LogItem } from '../types';
import {
  ListFilter,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';

interface LiveLogsProps {
  logs: LogItem[];
  onRefresh: () => void;
  onClear: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onRefresh, onClear }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.from.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        (log.reply && log.reply.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Registro de Eventos y Mensajes en Tiempo Real
            </h2>
            <p className="text-xs text-stone-500">
              Inspecciona cada solicitud HTTP recibida en <code>/webhook</code> y las respuestas generadas por Gemini
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onRefresh}
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-xs flex items-center gap-1.5"
              title="Actualizar logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
            <button
              onClick={onClear}
              className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors text-xs flex items-center gap-1.5"
              title="Limpiar historial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 justify-between">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'all', label: 'Todos los Eventos' },
              { id: 'incoming_webhook', label: 'Webhooks Recibidos' },
              { id: 'simulator_chat', label: 'Simulador Web' },
              { id: 'verify_attempt', label: 'Verificaciones GET' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  filterType === f.id
                    ? 'bg-[#2a1710] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar en mensajes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400/20"
            />
          </div>
        </div>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-semibold text-xs text-stone-700">No hay registros aún</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Interactúa con el bot en el simulador o ejecuta una prueba de webhook para ver los eventos aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isWebhook = log.type === 'incoming_webhook';
              const isVerify = log.type === 'verify_attempt';
              const isSim = log.type === 'simulator_chat';

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 hover:bg-white transition-all text-xs space-y-2 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-stone-400 text-[10px]">
                        {log.timestamp}
                      </span>

                      {isWebhook && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Webhook Meta
                        </span>
                      )}

                      {isSim && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold text-[10px] flex items-center gap-1">
                          💬 Simulador
                        </span>
                      )}

                      {isVerify && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" /> Verificación GET
                        </span>
                      )}

                      <span className="font-medium text-stone-700">
                        De: <code className="text-stone-900 bg-stone-100 px-1 py-0.2 rounded font-mono text-[11px]">{log.from}</code>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.latencyMs && (
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {log.latencyMs} ms
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'simulated'
                            ? 'bg-stone-200 text-stone-800'
                            : log.status === 'verified'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'delivered'
                          ? 'Enviado a Meta'
                          : log.status === 'simulated'
                          ? 'Simulado'
                          : log.status === 'verified'
                          ? 'Verificado'
                          : 'Error'}
                      </span>
                    </div>
                  </div>

                  {/* Message & Reply */}
                  <div className="bg-white p-3 rounded-xl border border-stone-200/70 space-y-2">
                    <div className="text-stone-800">
                      <span className="font-bold text-stone-500 mr-2 text-[10px] uppercase">
                        Mensaje entrante:
                      </span>
                      <span className="font-medium">{log.message}</span>
                    </div>

                    {log.reply && (
                      <div className="pt-2 border-t border-stone-100 text-stone-700 leading-relaxed">
                        <span className="font-bold text-rose-700 mr-2 text-[10px] uppercase">
                          Respuesta Gemini:
                        </span>
                        <span className="whitespace-pre-wrap">{log.reply}</span>
                      </div>
                    )}

                    {log.details && (
                      <div className="text-[10px] text-stone-400 font-mono italic">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

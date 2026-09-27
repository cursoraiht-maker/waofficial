import React from 'react';
import { DetectedOrder } from '../types';
import { Calendar, User, Cake, CheckCircle, Clock, ShoppingBag, MessageSquare } from 'lucide-react';

interface OrdersTrackerProps {
  orders: DetectedOrder[];
  onOpenChatWithCustomer?: (customerPhone: string) => void;
}

export const OrdersTracker: React.FC<OrdersTrackerProps> = ({ orders }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Pedidos &amp; Cotizaciones Detectadas por Gemini
                </h2>
                <p className="text-xs text-stone-500">
                  Extracción en tiempo real de intenciones de compra a partir de los mensajes de WhatsApp
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 self-start sm:self-auto">
            Total detectadas: <span className="text-rose-600 font-bold">{orders.length}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Cake className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-700 mb-1">
              Aún no hay pedidos registrados
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Escribe en el <strong>Simulador de WhatsApp</strong> o envía un mensaje al webhook solicitando una cotización (por ejemplo: "Quiero encargar un cheesecake para 12 personas el sábado") para ver cómo el sistema extrae automáticamente la orden.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Hora</th>
                  <th className="pb-3 px-3">Cliente / Teléfono</th>
                  <th className="pb-3 px-3">Postre de Interés</th>
                  <th className="pb-3 px-3">Porciones / Fecha</th>
                  <th className="pb-3 px-3">Mensaje Original</th>
                  <th className="pb-3 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-stone-500 whitespace-nowrap">
                      {order.timestamp}
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.customerNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-100">
                        {order.dessert}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      <div>
                        {order.portions && (
                          <span className="font-semibold text-stone-800 mr-2">
                            {order.portions}
                          </span>
                        )}
                        {order.eventDate && (
                          <span className="text-stone-500 text-[11px]">
                            📅 {order.eventDate}
                          </span>
                        )}
                        {!order.portions && !order.eventDate && (
                          <span className="text-stone-400 italic">Por definir</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={order.summary}>
                      "{order.summary}"
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

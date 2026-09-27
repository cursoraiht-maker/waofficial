/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BotStatus, LogItem, DetectedOrder } from './types';
import { Navbar } from './components/Navbar';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { WebhookTester } from './components/WebhookTester';
import { MenuCatalog } from './components/MenuCatalog';
import { OrdersTracker } from './components/OrdersTracker';
import { MetaSetupGuide } from './components/MetaSetupGuide';
import { LiveLogs } from './components/LiveLogs';
import { MessageSquare, Activity, ShieldCheck, Sparkles, RefreshCw, Cake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [orders, setOrders] = useState<DetectedOrder[]>([]);
  const [currentSystemInstruction, setCurrentSystemInstruction] = useState<string>('');
  const [selectedPromptForChat, setSelectedPromptForChat] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error('Error fetching status:', e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setOrders(data.orders || []);
        if (data.systemInstruction) {
          setCurrentSystemInstruction(data.systemInstruction);
        }
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLogs();

    // Polling ligero de estado y logs cada 6 segundos
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchLogs]);

  const handleUpdateSystemInstruction = async (instruction: string, reset = false): Promise<boolean> => {
    try {
      const res = await fetch('/api/config/system-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemInstruction: instruction, reset }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentSystemInstruction(data.systemInstruction);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
      setOrders([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPromptFromMenu = (prompt: string) => {
    setSelectedPromptForChat(prompt);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-[#fcf9f6] text-[#2c1810] flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navbar */}
      <Navbar
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => {
          fetchStatus();
          fetchLogs();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Mensajes Totales
              </p>
              <p className="text-xl font-extrabold text-[#2a1710] font-mono mt-0.5">
                {(status?.metrics?.totalIncoming || 0) + (status?.metrics?.totalSimulated || 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Respuestas Generadas
              </p>
              <p className="text-xl font-extrabold text-rose-700 font-mono mt-0.5">
                {(status?.metrics?.totalReplies || 0) + (status?.metrics?.totalSimulated || 0)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Verificaciones Webhook
              </p>
              <p className="text-xl font-extrabold text-sky-700 font-mono mt-0.5">
                {status?.metrics?.webhookVerifications || 0}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
                Pedidos Detectados
              </p>
              <p className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">
                {orders.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Cake className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Content Views */}
        <div className="transition-all duration-150">
          {activeTab === 'simulator' && (
            <WhatsAppSimulator
              onMessageProcessed={() => {
                fetchStatus();
                fetchLogs();
              }}
            />
          )}

          {activeTab === 'webhook' && (
            <WebhookTester
              status={status}
              onRefreshLogs={() => {
                fetchStatus();
                fetchLogs();
              }}
            />
          )}

          {activeTab === 'menu' && (
            <MenuCatalog onSelectPrompt={handleSelectPromptFromMenu} />
          )}

          {activeTab === 'orders' && <OrdersTracker orders={orders} />}

          {activeTab === 'guide' && (
            <MetaSetupGuide
              status={status}
              currentSystemInstruction={currentSystemInstruction}
              onUpdateSystemInstruction={handleUpdateSystemInstruction}
            />
          )}

          {activeTab === 'logs' && (
            <LiveLogs
              logs={logs}
              onRefresh={fetchLogs}
              onClear={handleClearLogs}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🍰 <strong>Postreland</strong> WhatsApp Bot</span>
            <span>•</span>
            <span>Integrado con Meta WhatsApp Cloud API v21.0 &amp; Google Gemini</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400 font-mono text-[11px]">
              Endpoint: /webhook (GET / POST)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

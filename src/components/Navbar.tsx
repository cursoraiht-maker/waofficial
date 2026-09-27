import React, { useState } from 'react';
import { BotStatus } from '../types';
import { Sparkles, Check, Copy, Activity, ShieldCheck, HelpCircle } from 'lucide-react';

interface NavbarProps {
  status: BotStatus | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ status, activeTab, setActiveTab }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const copyToClipboard = (text: string, isToken: boolean) => {
    navigator.clipboard.writeText(text);
    if (isToken) {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const webhookUrl = status?.webhookUrl || `${window.location.origin}/webhook`;
  const verifyToken = status?.verifyToken || 'postreland_secret_token';

  return (
    <header className="bg-[#2a1710] text-[#f7efe8] border-b border-[#43271c] shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e25569] to-[#bf2942] flex items-center justify-center shadow-md text-2xl shadow-rose-950/30">
              🍰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#fff6f0]">
                  Postreland
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#128c7e] text-white flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> WhatsApp Bot
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-[#d1b8ab]">
                Pastelería Artesanal • Centro de Control &amp; Simulador Meta Cloud API
              </p>
            </div>
          </div>

          {/* Quick Endpoint Info Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-[#1d0f0a] border border-[#4a2e21] rounded-lg px-2.5 py-1.5 gap-2">
              <span className="text-[#a89083]">Webhook:</span>
              <code className="text-emerald-400 font-mono text-[11px] truncate max-w-[170px] sm:max-w-[220px]">
                {webhookUrl}
              </code>
              <button
                onClick={() => copyToClipboard(webhookUrl, false)}
                title="Copiar URL del Webhook para Meta Developer Portal"
                className="hover:text-emerald-300 text-stone-400 transition-colors p-0.5 rounded hover:bg-[#341b12]"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center bg-[#1d0f0a] border border-[#4a2e21] rounded-lg px-2.5 py-1.5 gap-2">
              <span className="text-[#a89083]">Verify Token:</span>
              <code className="text-amber-300 font-mono text-[11px]">{verifyToken}</code>
              <button
                onClick={() => copyToClipboard(verifyToken, true)}
                title="Copiar Verify Token para Meta"
                className="hover:text-amber-200 text-stone-400 transition-colors p-0.5 rounded hover:bg-[#341b12]"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 px-2.5 py-1.5 rounded-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Bot Activo</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-1 border-t border-[#3e2319] pt-2 pb-1 text-sm scrollbar-none">
          {[
            { id: 'simulator', label: '💬 Simulador de WhatsApp', badge: 'En Vivo' },
            { id: 'webhook', label: '⚡ Meta Webhook Tester', badge: null },
            { id: 'menu', label: '🍰 Catálogo & Menú', badge: '7 postres' },
            { id: 'orders', label: '📋 Pedidos Detectados', badge: null },
            { id: 'guide', label: '📖 Guía Meta & Configuración', badge: null },
            { id: 'logs', label: '📜 Logs en Tiempo Real', badge: status?.metrics?.totalIncoming ? `${status.metrics.totalIncoming}` : null },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-t-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#fdfaf7] text-[#2a1710] shadow-sm font-semibold'
                    : 'text-[#d6c0b3] hover:text-white hover:bg-[#381f15]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#47291d] text-[#e0cfc5]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

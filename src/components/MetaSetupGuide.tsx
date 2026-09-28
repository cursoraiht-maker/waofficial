import React, { useState } from 'react';
import { BotStatus } from '../types';
import {
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Sparkles,
  Sliders,
  RotateCcw,
  Save,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface MetaSetupGuideProps {
  status: BotStatus | null;
  currentSystemInstruction: string;
  onUpdateSystemInstruction: (instruction: string, reset?: boolean) => Promise<boolean>;
}

export const MetaSetupGuide: React.FC<MetaSetupGuideProps> = ({
  status,
  currentSystemInstruction,
  onUpdateSystemInstruction,
}) => {
  const webhookUrl = status?.webhookUrl || `${window.location.origin}/webhook`;
  const verifyToken = status?.verifyToken || 'postreland_secret_token';

  const [promptText, setPromptText] = useState(currentSystemInstruction);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const copy = (text: string, isUrl: boolean) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSavePrompt = async () => {
    setIsSaving(true);
    const success = await onUpdateSystemInstruction(promptText);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleResetPrompt = async () => {
    setIsSaving(true);
    await onUpdateSystemInstruction('', true);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Step by step Meta Developer Portal Guide */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-[#008069] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Guía de Conexión: Meta WhatsApp Cloud API
            </h2>
            <p className="text-xs text-stone-500">
              Configura tu número de WhatsApp Business oficial para recibir y responder mensajes en tiempo real
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              1
            </div>
            <h3 className="font-bold text-xs text-stone-900 mb-1">
              Crear App en Meta Developers
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
              Ingresa a <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium inline-flex items-center gap-0.5">developers.facebook.com <ExternalLink className="w-2.5 h-2.5" /></a>, crea una aplicación de tipo <strong>Negocios (Business)</strong> y agrega el producto <strong>WhatsApp</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              2
            </div>
            <h3 className="font-bold text-xs text-stone-900 mb-1">
              Configurar Webhook
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed mb-2">
              En el menú lateral de WhatsApp &gt; <strong>Configuración</strong>, haz clic en <em>Editar</em> en la sección Webhook e ingresa estos valores:
            </p>
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="bg-white p-1.5 rounded border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 truncate mr-2">URL: {webhookUrl}</span>
                <button onClick={() => copy(webhookUrl, true)} className="text-emerald-600 hover:text-emerald-800">
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="bg-white p-1.5 rounded border border-stone-200 flex items-center justify-between">
                <span className="text-stone-500 truncate mr-2">Token: {verifyToken}</span>
                <button onClick={() => copy(verifyToken, false)} className="text-emerald-600 hover:text-emerald-800">
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mb-2">
              3
            </div>
            <h3 className="font-bold text-xs text-stone-900 mb-1">
              Suscribirse a Evento 'messages'
            </h3>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              En la lista de campos de Webhook de WhatsApp, busca el campo <strong>messages</strong> y pulsa <strong>Suscribirse</strong>. ¡Listo! Meta enviará los chats entrantes directo a Postreland.
            </p>
          </div>
        </div>

        {/* Credentials Status info */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-6">
          <div className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Estado de Integración con Meta:</span>{' '}
              {status?.isMetaConfigured ? (
                <span className="text-emerald-700 font-semibold">Credenciales configuradas (Producción activa)</span>
              ) : (
                <span className="text-amber-800">
                  Modo Simulador y Webhook Activo. Para despachar mensajes reales por WhatsApp hacia números de clientes, define <code>WHATSAPP_TOKEN</code> y <code>PHONE_NUMBER_ID</code>.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Guide: How to get WHATSAPP_TOKEN and PHONE_NUMBER_ID */}
        <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/60 space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Key className="w-4 h-4 text-emerald-600" />
            <h3>¿Dónde conseguir WHATSAPP_TOKEN y PHONE_NUMBER_ID en Meta?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Opción 1: Token Temporal */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Opción 1: Token Temporal (24 Horas)
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                  Pruebas Rápidas
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Ideal para probar envíos reales de inmediato sin configurar un usuario de sistema:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-[11px] pl-1">
                <li>Ve a <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Meta for Developers</a> y abre tu app.</li>
                <li>En el panel izquierdo, ve a <strong>WhatsApp &gt; Primeros pasos (Quickstart)</strong>.</li>
                <li>En la sección <em>Paso 1: Seleccionar números de teléfono</em>:
                  <ul className="list-disc list-inside pl-3 pt-1 text-stone-600 space-y-0.5">
                    <li>Verás el campo <strong>Identificador de número de teléfono (PHONE_NUMBER_ID)</strong>. Cópialo.</li>
                    <li>Arriba verás <strong>Token de acceso temporal</strong> (empieza con <code>EAA...</code>). Ese es tu <code>WHATSAPP_TOKEN</code>.</li>
                  </ul>
                </li>
                <li>Agrega tu propio número de teléfono personal en <em>Para (To)</em> para autorizar recibir mensajes en modo prueba.</li>
              </ol>
            </div>

            {/* Opción 2: Token Permanente */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Opción 2: Token Permanente (Producción)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Recomendado
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Para que el bot de Postreland funcione siempre sin que el token caduque:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-[11px] pl-1">
                <li>Ve a <a href="https://business.facebook.com/settings" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Meta Business Suite &gt; Configuración del negocio</a>.</li>
                <li>En el menú lateral, ve a <strong>Usuarios &gt; Usuarios del sistema</strong>.</li>
                <li>Crea un nuevo usuario del sistema con rol <strong>Administrador</strong>.</li>
                <li>Haz clic en <strong>Agregar activos</strong> y asígnale tu cuenta de WhatsApp Business y tu App con control total.</li>
                <li>Haz clic en <strong>Generar nuevo token</strong>, selecciona tu aplicación, elige caducidad <strong>Nunca (Never)</strong> y marca los permisos:
                  <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                    <span className="bg-stone-100 text-emerald-800 px-1.5 py-0.5 rounded border border-stone-200">whatsapp_business_messaging</span>
                    <span className="bg-stone-100 text-emerald-800 px-1.5 py-0.5 rounded border border-stone-200">whatsapp_business_management</span>
                  </div>
                </li>
                <li>Copia ese token generado: no caducará nunca y es tu <code>WHATSAPP_TOKEN</code> definitivo.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* System Instruction / Prompt Tuning */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-stone-900">
                Personalidad &amp; Instrucciones de Sistema de Gemini (Postreland)
              </h3>
              <p className="text-xs text-stone-500">
                Define las pautas de cortesía, catálogo, límites de párrafos para WhatsApp y reglas de cotización
              </p>
            </div>
          </div>

          <button
            onClick={handleResetPrompt}
            disabled={isSaving}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer por defecto
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            rows={10}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-stone-200 font-mono text-xs text-stone-800 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed"
            placeholder="Escribe la instrucción de sistema para Gemini..."
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              * El modelo en uso es <strong>gemini-2.5-flash</strong> optimizado para respuestas rápidas y formato chat.
            </span>
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ¡Guardado correctamente!
                </span>
              )}
              <button
                onClick={handleSavePrompt}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-[#2a1710] hover:bg-[#3d2319] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Guardando...' : 'Aplicar al Bot'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

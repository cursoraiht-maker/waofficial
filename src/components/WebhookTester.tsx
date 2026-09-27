import React, { useState } from 'react';
import { BotStatus } from '../types';
import {
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Terminal,
  Play,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface WebhookTesterProps {
  status: BotStatus | null;
  onRefreshLogs?: () => void;
}

export const WebhookTester: React.FC<WebhookTesterProps> = ({ status, onRefreshLogs }) => {
  const webhookUrl = status?.webhookUrl || `${window.location.origin}/webhook`;
  const defaultToken = status?.verifyToken || 'postreland_secret_token';

  // State for GET Verification Test
  const [testToken, setTestToken] = useState(defaultToken);
  const [getTestResult, setGetTestResult] = useState<any>(null);
  const [isLoadingGet, setIsLoadingGet] = useState(false);

  // State for POST Payload Simulation
  const [simPhone, setSimPhone] = useState('5215541239876');
  const [simText, setSimText] = useState('¡Hola Postreland! ¿Tienen cheesecake de frutos rojos disponible para el sábado?');
  const [postTestResult, setPostTestResult] = useState<any>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  const [copiedCurl, setCopiedCurl] = useState(false);

  const runVerificationTest = async () => {
    setIsLoadingGet(true);
    setGetTestResult(null);

    try {
      const res = await fetch(`/api/webhook/verify-test?token=${encodeURIComponent(testToken)}`);
      const data = await res.json();
      setGetTestResult({
        statusCode: res.status,
        data,
        success: res.ok && data.verified,
      });
      if (onRefreshLogs) onRefreshLogs();
    } catch (err: any) {
      setGetTestResult({
        statusCode: 500,
        data: { error: err.message },
        success: false,
      });
    } finally {
      setIsLoadingGet(false);
    }
  };

  const runSimulatedWebhookPost = async () => {
    setIsLoadingPost(true);
    setPostTestResult(null);

    try {
      const res = await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromNumber: simPhone,
          text: simText,
        }),
      });

      const data = await res.json();
      setPostTestResult({
        statusCode: res.status,
        data,
        success: res.ok,
      });
      if (onRefreshLogs) onRefreshLogs();
    } catch (err: any) {
      setPostTestResult({
        statusCode: 500,
        data: { error: err.message },
        success: false,
      });
    } finally {
      setIsLoadingPost(false);
    }
  };

  const curlVerificationCmd = `curl -X GET "${webhookUrl}?hub.mode=subscribe&hub.verify_token=${defaultToken}&hub.challenge=test_challenge_12345"`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlVerificationCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-[#2c1810] text-stone-100 p-6 rounded-3xl border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                Meta Cloud API Webhook
              </span>
              <span className="text-stone-400 text-xs">• Protocolo v21.0</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Consola de Pruebas de Webhook (GET &amp; POST)
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Verifica el endpoint de suscripción exigido por Meta (Facebook Developers) y simula eventos de mensajes entrantes de WhatsApp con procesamiento automático mediante <strong>Google Gemini 2.5 Flash</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCurl}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 border border-stone-700 transition-colors"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar cURL de Prueba</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test 1: GET /webhook Verification */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                  GET
                </span>
                <h3 className="font-bold text-sm text-stone-800">
                  Prueba de Verificación Meta Webhook
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">/webhook</span>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Meta envía una petición <code>GET</code> con <code>hub.mode=subscribe</code>, <code>hub.verify_token</code> y <code>hub.challenge</code>. El servidor debe responder con el mismo challenge y código 200 para validar la suscripción.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-stone-500 font-medium text-xs block mb-1">
                  Token a Probar (Esperado: <code className="text-stone-700">{defaultToken}</code>)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testToken}
                    onChange={(e) => setTestToken(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <button
                    onClick={() => setTestToken(defaultToken)}
                    className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-xl"
                    title="Restablecer al token correcto"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={runVerificationTest}
              disabled={isLoadingGet}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors mb-3 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {isLoadingGet ? 'Ejecutando verificación...' : 'Ejecutar Test de Suscripción GET'}
            </button>

            {/* Result Box */}
            {getTestResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  getTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {getTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    Código HTTP {getTestResult.statusCode}:{' '}
                    {getTestResult.success ? 'Meta Webhook Validado' : 'Fallo en Verificación'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed mb-1">
                  {getTestResult.data?.message}
                </p>
                {getTestResult.data?.challenge && (
                  <div className="font-mono text-[10px] bg-white/70 p-1.5 rounded-lg border border-emerald-200 text-emerald-800">
                    Challenge devuelto: {getTestResult.data.challenge}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test 2: POST /webhook Incoming Message */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  POST
                </span>
                <h3 className="font-bold text-sm text-stone-800">
                  Simular Mensaje Entrante de WhatsApp
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">/webhook</span>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Inyecta un payload oficial de Meta WhatsApp Cloud API al backend. El bot responde con 200 a Meta, ejecuta Gemini con la personalidad de Postreland y prepara el envío.
            </p>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="text-stone-500 font-medium block mb-1">Número de Teléfono del Cliente (wa_id)</label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-stone-500 font-medium block mb-1">Mensaje de Texto del Cliente</label>
                <textarea
                  rows={2}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={runSimulatedWebhookPost}
              disabled={isLoadingPost}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors mb-3 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoadingPost ? 'Generando respuesta con Gemini...' : 'Disparar Webhook POST (Meta Simulado)'}
            </button>

            {/* Result Box */}
            {postTestResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  postTestResult.success
                    ? 'bg-stone-50 border-stone-200 text-stone-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Webhook 200 OK
                  </span>
                  {postTestResult.data?.latencyMs && (
                    <span className="text-[10px] text-stone-500 font-mono bg-stone-200/60 px-1.5 py-0.5 rounded">
                      {postTestResult.data.latencyMs} ms
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200/70 text-[11px] leading-relaxed mb-2 text-stone-800">
                  <div className="text-[10px] font-bold text-rose-700 mb-0.5">Respuesta de Postreland (Gemini):</div>
                  <div className="whitespace-pre-wrap">{postTestResult.data?.botReply}</div>
                </div>

                <details className="text-[10px] text-stone-500 cursor-pointer">
                  <summary className="hover:text-stone-700">Ver JSON del payload simulado de Meta</summary>
                  <pre className="mt-1 p-2 bg-stone-900 text-emerald-300 rounded-lg overflow-x-auto font-mono text-[9px]">
                    {JSON.stringify(postTestResult.data?.simulatedPayload, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

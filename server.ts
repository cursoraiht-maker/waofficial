import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'postreland_secret_token';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Inicializar cliente oficial de Gemini
const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System Instruction por defecto para la personalidad de Postreland
export const DEFAULT_SYSTEM_INSTRUCTION = `
Eres el asistente virtual amable, dulce y eficiente de "Postreland", una pastelería artesanal de alta repostería.
Tu objetivo es:
1. Saludar cálidamente y responder dudas sobre postres, pasteles, pedidos y horarios.
2. Mantener respuestas concisas y claras, ideales para leer en un chat de WhatsApp (máximo 2 a 3 párrafos cortos).
3. Si el cliente quiere hacer un pedido o consultar precios especiales, pídele amablemente los detalles (tipo de postre, tamaño o número de porciones, fecha y hora del evento, y si requiere entrega a domicilio o retiro en tienda).
4. Usar emojis moderados (🍰, 🍓, ✨, 🧁, 🎂, 🍫) y un tono cordial, dulce y tentador.

Información clave de Postreland:
- Menú destacado:
  * Cheesecake de Frutos Rojos (10-12 porciones: $28 | Base crocante de galleta artesanal, salsa casera de frambuesas y moras).
  * Tarta Bombón de Chocolate Belga & Dulce de Leche (12-14 porciones: $32 | Ganache brillante y corazón cremoso).
  * Torta Tres Leches Tradicional (10 porciones: $25 | Bizcocho esponjoso bañado en tres leches con merengue suizo tostado).
  * Carrot Cake con Nuez y Frosting de Queso Crema (10-12 porciones: $26).
  * Caja de Alfajores Artesanales (12 unidades surtidas: Maicena y Marplatenses bañados en chocolate amargo: $16).
  * Caja de Macarons Franceses (10 unidades: Pistacho, Frutos Rojos, Chocolate, Vainilla: $18).
  * Pasteles de Cumpleaños & Eventos personalizados: Se cotizan según temática y cantidad de comensales.
- Horarios de atención: Lunes a Sábado de 9:00 AM a 8:00 PM, Domingos de 10:00 AM a 4:00 PM.
- Pedidos personalizados con anticipación mínima de 48 horas.
- Medios de pago: Transferencia bancaria, tarjetas de débito/crédito, y efectivo contra entrega.
`;

let currentSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION;

// Estructuras en memoria para logs y órdenes detectadas
export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'incoming_webhook' | 'whatsapp_outgoing' | 'simulator_chat' | 'verify_attempt';
  from: string;
  message: string;
  reply?: string;
  status: 'delivered' | 'simulated' | 'error' | 'verified' | 'failed';
  latencyMs?: number;
  details?: string;
  error?: string;
}

export interface DetectedOrder {
  id: string;
  timestamp: string;
  customerNumber: string;
  dessert: string;
  portions?: string;
  eventDate?: string;
  summary: string;
  status: 'Cotización solicitada' | 'En proceso' | 'Confirmada';
}

const memoryLogs: LogEntry[] = [];
const detectedOrders: DetectedOrder[] = [];

const metrics = {
  totalIncoming: 0,
  totalReplies: 0,
  totalSimulated: 0,
  webhookVerifications: 0,
  startTime: new Date().toISOString(),
};

function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
  const newEntry: LogEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    ...entry,
  };
  memoryLogs.unshift(newEntry);
  if (memoryLogs.length > 80) memoryLogs.pop();
  return newEntry;
}

// Analizador simple de intención de pedido para alimentar el tablero de pastelería
function detectOrderIntent(customerNumber: string, userText: string, botReply: string) {
  const lower = userText.toLowerCase();
  const keywords = ['pedido', 'encargar', 'pastel', 'torta', 'cheesecake', 'tarta', 'personas', 'porciones', 'cotizar', 'para el', 'sábado', 'domingo', 'viernes', 'cumpleaños'];
  const hasIntent = keywords.some(k => lower.includes(k));

  if (hasIntent) {
    let dessert = 'Consulta de repostería';
    if (lower.includes('cheesecake')) dessert = 'Cheesecake Frutos Rojos';
    else if (lower.includes('chocolate') || lower.includes('bombón')) dessert = 'Tarta Bombón de Chocolate';
    else if (lower.includes('tres leches')) dessert = 'Torta Tres Leches';
    else if (lower.includes('carrot') || lower.includes('zanahoria')) dessert = 'Carrot Cake';
    else if (lower.includes('alfajor')) dessert = 'Caja de Alfajores';
    else if (lower.includes('macaron')) dessert = 'Caja de Macarons';
    else if (lower.includes('pastel') || lower.includes('torta') || lower.includes('cumpleaños')) dessert = 'Pastel Personalizado';

    // Buscar cantidad de personas
    const portionsMatch = userText.match(/(\d+)\s*(personas|porciones)/i);
    const portions = portionsMatch ? `${portionsMatch[1]} personas` : undefined;

    // Buscar fecha aproximada
    const dateMatch = userText.match(/(para el|este|el)\s+([a-záéíóú0-9\s]+)/i);
    const eventDate = dateMatch ? dateMatch[0].trim() : undefined;

    const newOrder: DetectedOrder = {
      id: 'ord_' + Date.now(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
      customerNumber,
      dessert,
      portions,
      eventDate,
      summary: userText.length > 70 ? userText.substring(0, 67) + '...' : userText,
      status: 'Cotización solicitada',
    };

    detectedOrders.unshift(newOrder);
    if (detectedOrders.length > 30) detectedOrders.pop();
  }
}

// Función auxiliar para enviar mensaje de vuelta por WhatsApp (compatible con número de teléfono tradicional o BSUID)
async function sendWhatsAppMessage(target: { phone?: string; bsuid?: string }, text: string): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    const warningMsg = 'Faltan WHATSAPP_TOKEN o PHONE_NUMBER_ID en las variables de entorno. El bot responderá en modo simulador.';
    console.warn('⚠️ ' + warningMsg);
    return { success: false, error: warningMsg };
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  // Según la documentación oficial de Meta (Sep 2026):
  // Si hay número de teléfono se usa "to". Si es un usuario con username/BSUID se usa "recipient".
  const payload: Record<string, any> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    type: 'text',
    text: { body: text },
  };

  if (target.phone) {
    payload.to = target.phone;
  }
  if (target.bsuid) {
    payload.recipient = target.bsuid;
  }

  try {
    const res = await axios.post(
      url,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recipientId = target.phone || target.bsuid || 'desconocido';
    console.log(`📤 Respuesta enviada a WhatsApp Cloud API a ${recipientId}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    const errMsg = error.response?.data?.error?.message || error.message || 'Error en WhatsApp API';
    console.error('❌ Error enviando a WhatsApp Cloud API:', errMsg);
    return { success: false, error: errMsg };
  }
}

// Helper para invocar Gemini con fallback resiliente entre modelos válidos
async function generateGeminiContent(contents: any, systemInstruction: string): Promise<{ text: string; modelUsed: string }> {
  const candidateModels = [
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ];

  let lastError: any = null;
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`⚠️ Modelo ${model} no disponible (${err.message?.substring(0, 80)}). Probando siguiente...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Error al conectar con los modelos de Gemini.');
}

// 1. Ruta de Verificación de Meta Webhook (GET)
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook de Meta verificado correctamente.');
    metrics.webhookVerifications++;
    addLog({
      type: 'verify_attempt',
      from: req.ip || 'Meta Servers',
      message: `GET /webhook (mode: ${mode}, token match)`,
      status: 'verified',
      details: `Challenge: ${challenge}`,
    });
    return res.status(200).send(challenge);
  }

  console.warn('❌ Token de verificación inválido.');
  addLog({
    type: 'verify_attempt',
    from: req.ip || 'Unknown',
    message: `GET /webhook token inválido recibido: "${token}"`,
    status: 'failed',
    error: 'Token no coincide con VERIFY_TOKEN configurado',
  });
  return res.sendStatus(403);
});

// 2. Ruta para Recibir Mensajes de WhatsApp (POST)
app.post('/webhook', async (req: Request, res: Response) => {
  // Responder inmediatamente a Meta con 200 OK para evitar reintentos duplicados
  res.sendStatus(200);

  const startTime = Date.now();
  metrics.totalIncoming++;

  try {
    // Soporta tanto el formato de producción (entry[0].changes[0].value) como el formato de prueba de Meta (req.body.value)
    const value = req.body.entry?.[0]?.changes?.[0]?.value || req.body.value || req.body;
    const message = value?.messages?.[0];

    // Ignorar notificaciones de estado (entregado, leído) o mensajes que no sean texto
    if (!message || message.type !== 'text') {
      console.log('ℹ️ Evento recibido sin mensaje de texto (status update o formato no compatible).');
      return;
    }

    const fromNumber = message.from; // Número del cliente (si está disponible)
    const fromUserId = message.from_user_id || value?.contacts?.[0]?.user_id; // BSUID oficial de Meta (Sep 2026)
    const customerIdentifier = fromNumber || fromUserId || 'Usuario WhatsApp';
    const incomingText = message.text.body; // Mensaje enviado por el cliente

    console.log(`📩 Mensaje de ${customerIdentifier} (Phone: ${fromNumber || 'N/A'}, BSUID: ${fromUserId || 'N/A'}): "${incomingText}"`);

    // Consultar a Gemini usando Google GenAI SDK con fallback
    let replyText = '¡Hola! En un momento te atendemos en Postreland 🍰.';
    let latencyMs = 0;

    try {
      const geminiResult = await generateGeminiContent(incomingText, currentSystemInstruction);
      replyText = geminiResult.text;
      latencyMs = Date.now() - startTime;
    } catch (modelErr: any) {
      console.error('Error invocando Gemini:', modelErr.message);
      replyText = '¡Hola! En este momento tenemos alta demanda en Postreland 🍰. Déjanos tu consulta o pedido y te responderemos enseguida.';
      latencyMs = Date.now() - startTime;
    }

    metrics.totalReplies++;

    // Intentar enviar respuesta a WhatsApp Cloud API (usando teléfono o BSUID)
    const sendResult = await sendWhatsAppMessage({ phone: fromNumber, bsuid: fromUserId }, replyText);

    // Guardar en logs y registrar pedido potencial
    addLog({
      type: 'incoming_webhook',
      from: customerIdentifier,
      message: incomingText,
      reply: replyText,
      status: sendResult.success ? 'delivered' : 'simulated',
      latencyMs,
      details: sendResult.success
        ? 'Enviado exitosamente a Meta WhatsApp Cloud API'
        : `Simulado (Sin token activo en Meta): ${sendResult.error || 'Listo para conectar'}`,
    });

    detectOrderIntent(customerIdentifier, incomingText, replyText);
  } catch (error: any) {
    console.error('Error procesando webhook:', error.response?.data || error.message);
    addLog({
      type: 'incoming_webhook',
      from: 'Error en payload',
      message: 'Payload inválido o error en procesamiento',
      status: 'error',
      error: error.message,
    });
  }
});

// Endpoint para el Simulador de WhatsApp interactivo en la Web UI
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, customerPhone = '+52 1 55 4123 9876', conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El mensaje es requerido.' });
  }

  const startTime = Date.now();
  metrics.totalSimulated++;

  try {
    // Si hay historial previo, podemos formatear el contexto o usar generateContent con historial
    const contents: any[] = [];

    // Agregar últimos 4 turnos si existen
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-4);
      for (const turn of recent) {
        contents.push({
          role: turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.text }],
        });
      }
    }

    // Agregar el mensaje actual
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let replyText = '¡Hola! Bienvenido a Postreland 🍰 ¿En qué podemos endulzar tu día hoy?';

    try {
      const geminiResult = await generateGeminiContent(contents, currentSystemInstruction);
      replyText = geminiResult.text;
    } catch (modelErr: any) {
      console.warn('Error en generateGeminiContent para /api/chat:', modelErr.message);
      replyText = '¡Hola! Bienvenido a Postreland 🍰. En este momento tenemos muchas consultas dulces en cocina. Si buscas cotizar un pastel o tarta especial, déjanos los detalles (porciones, fecha y sabor) y te confirmamos de inmediato ✨.';
    }

    const latencyMs = Date.now() - startTime;

    addLog({
      type: 'simulator_chat',
      from: customerPhone,
      message,
      reply: replyText,
      status: 'simulated',
      latencyMs,
      details: 'Interacción desde el Simulador Web de WhatsApp Postreland',
    });

    detectOrderIntent(customerPhone, message, replyText);

    return res.json({
      reply: replyText,
      latencyMs,
      timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    });
  } catch (error: any) {
    console.error('Error en /api/chat:', error.message);
    return res.status(500).json({
      error: error.message || 'Error comunicándose con Gemini API.',
      fallbackReply: 'Lo sentimos, tuvimos un problema al preparar tu respuesta. ¡Por favor intenta de nuevo en un segundo! 🍰',
    });
  }
});

// Endpoint para simular un webhook de Meta desde la interfaz
app.post('/api/webhook/simulate', async (req: Request, res: Response) => {
  const { fromNumber = '5215541239876', text = 'Hola, ¿qué postres tienen para este sábado?' } = req.body;

  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550239876',
                phone_number_id: PHONE_NUMBER_ID || '104928374829102',
              },
              contacts: [
                {
                  profile: { name: 'Cliente Postreland' },
                  wa_id: fromNumber,
                },
              ],
              messages: [
                {
                  from: fromNumber,
                  id: 'wamid.HBgL' + Date.now(),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: text },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  // Reenviar localmente al webhook
  try {
    const startTime = Date.now();
    const geminiResult = await generateGeminiContent(text, currentSystemInstruction);
    const replyText = geminiResult.text;
    const latencyMs = Date.now() - startTime;

    // Registrar en log
    addLog({
      type: 'incoming_webhook',
      from: fromNumber,
      message: text,
      reply: replyText,
      status: 'simulated',
      latencyMs,
      details: 'Payload simulado de Meta WhatsApp Cloud API',
    });

    detectOrderIntent(fromNumber, text, replyText);

    return res.json({
      success: true,
      simulatedPayload: mockPayload,
      botReply: replyText,
      latencyMs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint para probar el test de verificación GET de Meta
app.get('/api/webhook/verify-test', (req: Request, res: Response) => {
  const sampleChallenge = 'meta_challenge_' + Math.random().toString(36).substring(2, 9);
  const match = req.query.token === VERIFY_TOKEN;

  if (match) {
    return res.json({
      verified: true,
      challenge: sampleChallenge,
      message: 'Token coincide con VERIFY_TOKEN. Meta aceptará el webhook con código HTTP 200.',
    });
  } else {
    return res.status(403).json({
      verified: false,
      message: 'Token no coincide. Meta rechazará la suscripción con código HTTP 403.',
      expectedToken: VERIFY_TOKEN,
      receivedToken: req.query.token || '',
    });
  }
});

// Endpoint de estado y diagnóstico
app.get('/api/status', (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  res.json({
    name: 'Postreland WhatsApp Bot',
    status: 'online',
    version: '1.0.0',
    model: 'gemini-2.5-flash',
    webhookUrl: `${appUrl}/webhook`,
    verifyToken: VERIFY_TOKEN,
    isMetaConfigured: Boolean(WHATSAPP_TOKEN && PHONE_NUMBER_ID),
    hasGeminiKey: Boolean(GEMINI_API_KEY),
    phoneNumberIdConfigured: Boolean(PHONE_NUMBER_ID),
    metrics,
  });
});

// Endpoint para ver y limpiar logs
app.get('/api/logs', (req: Request, res: Response) => {
  res.json({
    logs: memoryLogs,
    orders: detectedOrders,
    systemInstruction: currentSystemInstruction,
  });
});

app.delete('/api/logs', (req: Request, res: Response) => {
  memoryLogs.length = 0;
  detectedOrders.length = 0;
  res.json({ success: true, message: 'Logs limpiados.' });
});

// Endpoint para actualizar o reiniciar la instrucción de sistema
app.post('/api/config/system-instruction', (req: Request, res: Response) => {
  const { systemInstruction, reset } = req.body;
  if (reset) {
    currentSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION;
    return res.json({ success: true, systemInstruction: currentSystemInstruction });
  }
  if (typeof systemInstruction === 'string' && systemInstruction.trim().length > 10) {
    currentSystemInstruction = systemInstruction.trim();
    return res.json({ success: true, systemInstruction: currentSystemInstruction });
  }
  return res.status(400).json({ error: 'Instrucción de sistema no válida.' });
});

// Iniciar servidor Vite o estático
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      app.get('/', (_req: Request, res: Response) => {
        res.send('🍰 Postreland WhatsApp Bot Server está activo y escuchando en /webhook.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍰 Postreland Bot Server escuchando en http://0.0.0.0:${PORT}`);
    console.log(`🔗 Webhook GET/POST URL: /webhook`);
    console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`);
  });
}

startServer().catch((err) => {
  console.error('Error al arrancar el servidor:', err);
});

export interface BotStatus {
  name: string;
  status: string;
  version: string;
  model: string;
  webhookUrl: string;
  verifyToken: string;
  isMetaConfigured: boolean;
  hasGeminiKey: boolean;
  phoneNumberIdConfigured: boolean;
  metrics: {
    totalIncoming: number;
    totalReplies: number;
    totalSimulated: number;
    webhookVerifications: number;
    startTime: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  latencyMs?: number;
}

export interface LogItem {
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

export interface MenuItem {
  id: string;
  name: string;
  category: 'Tartas' | 'Pasteles' | 'Individuales' | 'Cajas de Regalo';
  price: string;
  portions: string;
  description: string;
  highlight: string;
  emoji: string;
  suggestedPrompt: string;
}

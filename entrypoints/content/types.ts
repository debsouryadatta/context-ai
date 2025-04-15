export interface Message {
  role: string;
  content: string;
}

export interface Chat {
  id: string;
  messages: Message[];
  page_content_included: boolean;
  search_tool_enabled: boolean;
  created_at: string;
  updated_at: string;
  title?: string;
}

export interface ChatDimensions {
  width: number;
  height: number;
}

export interface Config {
  geminiApiKey: string;
  geminiModel: string;
  extensionEnabled: boolean;
  chatDimensions?: ChatDimensions;
  chat_history: Chat[];
  current_chat_id?: string;
  theme?: 'light' | 'dark';
}

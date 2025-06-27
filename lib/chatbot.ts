import { supabase } from './supabaseClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  messages: ChatMessage[];
}

export interface ChatRecord {
  id: string;
  user_id: string;
  conversation_json: ChatConversation;
  created_at: string;
  updated_at: string;
}

// Save a new conversation
export async function saveConversation(userId: string, messages: ChatMessage[]) {
  const conversation: ChatConversation = { messages };
  
  const { data, error } = await supabase
    .from('chatbot')
    .insert([
      {
        user_id: userId,
        conversation_json: conversation
      }
    ])
    .select()
    .single();

  return { data, error };
}

// Update an existing conversation
export async function updateConversation(conversationId: string, messages: ChatMessage[]) {
  const conversation: ChatConversation = { messages };
  
  const { data, error } = await supabase
    .from('chatbot')
    .update({
      conversation_json: conversation
    })
    .eq('id', conversationId)
    .select()
    .single();

  return { data, error };
}

// Load a specific conversation
export async function loadConversation(conversationId: string) {
  const { data, error } = await supabase
    .from('chatbot')
    .select('*')
    .eq('id', conversationId)
    .single();

  return { data, error };
}

// Get all conversations for a user
export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from('chatbot')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return { data, error };
}

// Get or create the single conversation for a user
export async function getUserConversation(userId: string) {
  // First try to get existing conversation
  const { data, error } = await supabase
    .from('chatbot')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data) {
    return { data, error: null };
  }

  // If no conversation exists, create one with initial message
  const initialMessage = createMessage('assistant', `Hello! I'm DatrixAI, your intelligent data assistant. I can help you process and organize your data into your connected systems. 

You can:
• Upload files (CSV, Excel, PDF) and I'll extract and structure the data
• Paste or type data directly and I'll analyze it
• I'll recommend the best integration and table for your data
• Get confirmation before inserting anything into your systems

What data would you like me to help you with today?`);

  const conversation: ChatConversation = { messages: [initialMessage] };
  
  const { data: newData, error: createError } = await supabase
    .from('chatbot')
    .insert([
      {
        user_id: userId,
        conversation_json: conversation
      }
    ])
    .select()
    .single();

  return { data: newData, error: createError };
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
  const { data, error } = await supabase
    .from('chatbot')
    .delete()
    .eq('id', conversationId);

  return { data, error };
}

// Create a new message object
export function createMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date().toISOString()
  };
} 
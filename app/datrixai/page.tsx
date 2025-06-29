'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  Send,
  Paperclip,
  Upload,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  File,
  X,
  Database,
  Server,
  Calendar,
  Slack,
  Globe,
  Sparkles,
  Zap,
  Download,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import { useChat } from '@ai-sdk/react';
import { 
  saveConversation, 
  updateConversation, 
  createMessage,
  getUserConversation,
  type ChatMessage 
} from '@/lib/chatbot';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  status?: 'processing' | 'completed' | 'error';
  isStreaming?: boolean;
}

interface ConnectedSource {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
}

export default function DatrixAIPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Use the AI SDK's useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } = useChat({
    api: '/api/chat',
    body: {
      userId: user?.id
    },
    initialMessages: initialMessages,
    onFinish: async (message) => {
      // Save conversation after each AI response
      if (user?.id) {
        await saveConversationToDb();
      }
    }
  });

  // Function to save conversation to database
  const saveConversationToDb = async () => {
    if (!user?.id || messages.length === 0 || !currentConversationId) return;

    setIsSaving(true);
    try {
      // Convert AI SDK messages to our ChatMessage format
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date().toISOString()
      }));

      // Always update the existing conversation (since each user has only one)
      await updateConversation(currentConversationId, chatMessages);
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Mock connected sources
  const [connectedSources] = useState<ConnectedSource[]>([
    {
      id: 'airtable',
      name: 'Airtable',
      icon: Database,
      color: '#ffb700',
      connected: true
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      icon: Server,
      color: '#336791',
      connected: true
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      color: '#000000',
      connected: true
    }
  ]);

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages after user is authenticated and useChat is ready
  useEffect(() => {
    if (user?.id && initialMessages.length > 0 && setMessages) {
      setMessages(initialMessages);
    }
  }, [user, initialMessages, setMessages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
    
    // Load existing conversation
    await loadUserConversation(user.id);
    setLoading(false);
  };

  const loadUserConversation = async (userId: string) => {
    try {
      const { data, error } = await getUserConversation(userId);
      
      if (!error && data) {
        setCurrentConversationId(data.id);
        
        // Convert ChatMessage format to AI SDK message format
        const aiSdkMessages = data.conversation_json.messages.map((msg: ChatMessage) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content
        }));
        
        setInitialMessages(aiSdkMessages);
        
        // If useChat is already initialized, update messages
        if (setMessages) {
          setMessages(aiSdkMessages);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetChat = async () => {
    if (!user?.id || !currentConversationId) return;
    
    try {
      // Clear messages in the UI immediately
      setMessages([]);
      
      // Update the database to clear the conversation
      await updateConversation(currentConversationId, []);
      
      console.log('Chat reset successfully');
    } catch (error) {
      console.error('Error resetting chat:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Sorry, I only support CSV, Excel, PDF, and text files. Please upload a supported file type.');
      return;
    }

    try {
      // Send file to document processing API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', ""); // As shown in your curl example

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/test/process-document`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Document processing failed: ${response.status} ${response.statusText}`);
      }

      const documentData = await response.json();

      // Send the raw JSON response directly to the AI
      const filePrompt = `I've uploaded a document. Here is the processed document data in JSON format:

${JSON.stringify(documentData, null, 2)}
`;

      // Use append to send the file content directly to the AI
      await append({
        role: 'user',
        content: filePrompt
      });

      // Save conversation will be handled by onFinish callback

    } catch (error) {
      console.error('File processing error:', error);
      alert(`Sorry, I encountered an error while processing your file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('csv') || type.includes('excel') || type.includes('sheet')) {
      return FileSpreadsheet;
    } else if (type.includes('pdf')) {
      return FileText;
    }
    return File;
  };

  if (!mounted || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] relative overflow-hidden">
      {/* Background Animation Layer */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          className="absolute inset-0 size-full"
          squareSize={3}
          gridGap={8}
          color="#6e1d27"
          maxOpacity={0.15}
          flickerChance={0.08}
        />
      </div>

      {/* Navbar */}
      <OnboardingNavbar onLogout={logout} />

      {/* Main Content - Fixed height layout */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-4" style={{ height: 'calc(100vh - 1rem)' }}>
        <div className="max-w-6xl mx-auto h-full flex gap-6">
          
          {/* Sidebar - Connected Sources */}
          {/* <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block w-80 flex-shrink-0"
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative h-full overflow-y-auto">
              <div className="absolute top-2 left-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-drawn-path" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-6 flex items-center">
                <Database className="mr-2 h-5 w-5 text-[#6e1d27]" />
                Connected Sources
              </h2>

              <div className="space-y-4">
                {connectedSources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 border border-[#6e1d27]/20 hand-drawn-border"
                  >
                    <source.icon 
                      className="w-6 h-6" 
                      style={{ color: source.color }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#3d0e15] font-ibm-plex">
                        {source.name}
                      </p>
                      <p className="text-sm text-green-600 font-ibm-plex flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#6e1d27]/5 rounded-lg border border-[#6e1d27]/20">
                <h3 className="font-semibold text-[#3d0e15] font-ibm-plex mb-2 flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-[#6e1d27]" />
                  AI Features
                </h3>
                <div className="space-y-1 text-xs text-[#6e1d27] font-ibm-plex">
                  <p>• Intelligent data analysis</p>
                  <p>• Smart integration routing</p>
                  <p>• Schema-aware mapping</p>
                  <p>• Confirmation before insertion</p>
                  <p>• File processing & extraction</p>
                </div>
              </div>

              <div className="absolute bottom-2 left-2 w-6 h-3 opacity-20">
                <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                  <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 opacity-20">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
            </div>
          </motion.div> */}

          {/* Main Chat Area - Properly sized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 h-full"
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm relative h-full flex flex-col overflow-hidden">
              {/* Decorative corner doodles */}
              <div className="absolute top-2 left-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-drawn-path" />
                </svg>
              </div>

              {/* Chat Header - Fixed */}
              <div className="p-6 border-b border-[#6e1d27]/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                <h1 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center">
                  <Bot className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  DatrixAI Assistant
                </h1>
                <p className="text-[#6e1d27] font-ibm-plex mt-1">
                  Your intelligent data processing companion
                </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Reset Chat Button */}
                    <Button
                      onClick={resetChat}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border border-2 border-[#6e1d27]/30 text-[#6e1d27] hover:bg-[#6e1d27]/10 hover:border-[#6e1d27] font-ibm-plex"
                      disabled={messages.length === 0 || isLoading}
                      title="Reset chat and clear all messages"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Chat
                    </Button>
                    
                    {/* Saving Indicator */}
                    {isSaving && (
                      <div className="flex items-center text-sm text-[#6e1d27]/60 font-ibm-plex">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area - Scrollable with proper height */}
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#6e1d27 transparent'
                }}
              >
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-[#6e1d27] text-white' 
                              : 'bg-[#6e1d27]/10 text-[#6e1d27]'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-[#6e1d27] text-white hand-drawn-border'
                                : 'bg-white border border-[#6e1d27]/20 text-[#3d0e15] hand-drawn-border'
                            }`}>
                              <div className="font-ibm-plex whitespace-pre-line">
                                {message.content.split('**').map((part, i) => 
                                  i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-[#6e1d27]/60 font-ibm-plex mt-1">
                              {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Processing indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#6e1d27]/10 text-[#6e1d27] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-[#6e1d27]/20 text-[#3d0e15] p-4 rounded-lg hand-drawn-border">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#6e1d27] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#6e1d27] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#6e1d27] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-[#6e1d27] font-ibm-plex">DatrixAI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Drag & Drop Overlay */}
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#6e1d27]/10 backdrop-blur-sm flex items-center justify-center z-20"
                  >
                    <div className="text-center p-8 bg-white/80 rounded-lg border-2 border-dashed border-[#6e1d27] hand-drawn-border">
                      <Upload className="w-12 h-12 text-[#6e1d27] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex mb-2">
                        Drop your file here
                      </h3>
                      <p className="text-[#6e1d27] font-ibm-plex">
                        I'll process it and help you organize the data
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area - Fixed at bottom */}
              <div className="p-6 border-t border-[#6e1d27]/20 flex-shrink-0">
                <form onSubmit={handleSubmit}>
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                          value={input}
                          onChange={handleInputChange}
                        placeholder="Type your data or describe what you want to organize..."
                        className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex pr-12"
                          disabled={isLoading}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost"
                        size="sm"
                          type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6e1d27] hover:text-[#3d0e15] hover:bg-[#6e1d27]/10"
                          disabled={isLoading}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                </form>

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <p className="text-xs text-[#6e1d27]/60 font-ibm-plex mt-2 text-center">
                  Supported formats: CSV, Excel, PDF, Text • Max size: 10MB
                </p>
              </div>

              {/* Bottom decorative doodles */}
              <div className="absolute bottom-2 left-2 w-6 h-3 opacity-20 z-10">
                <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                  <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 opacity-20 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
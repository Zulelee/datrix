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
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';

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
  results?: {
    processed: number;
    added: number;
    errors: number;
    destination: string;
  };
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Hello! I'm DatrixAI, your intelligent data assistant. I can help you clean, organize, and import your data into your connected systems. 

You can:
• Upload files (CSV, Excel, PDF) by dragging & dropping or clicking the attachment button
• Ask me to process and organize your data
• Import cleaned data directly to your CRM or database
• Get summaries of your data imports

What would you like to do today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputText),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('upload') || lowerInput.includes('file')) {
      return "I'd be happy to help you process a file! You can drag and drop your file here or click the attachment button. I support CSV, Excel, and PDF files. Once uploaded, I'll analyze the data and help you organize it for import.";
    } else if (lowerInput.includes('history') || lowerInput.includes('last import')) {
      return "Here's a summary of your recent imports:\n\n• Yesterday: 45 contacts added to Airtable\n• 2 days ago: 23 deals imported to PostgreSQL\n• Last week: 67 leads processed to Notion\n\nWould you like more details about any of these imports?";
    } else if (lowerInput.includes('undo')) {
      return "I can help you undo your last import. However, please note that this action cannot be reversed. Which specific import would you like me to undo? Please provide the date or destination system.";
    } else if (lowerInput.includes('connect') || lowerInput.includes('integration')) {
      return "I can see you have Airtable, PostgreSQL, and Notion connected. Would you like to add more integrations? I can help you connect to Google Sheets, Slack, or other platforms through your profile settings.";
    } else {
      return "I understand you'd like help with your data. Could you be more specific? I can help you:\n\n• Process and clean uploaded files\n• Import data to your connected systems\n• Review import history\n• Undo recent imports\n• Connect new data sources\n\nWhat would you like to do?";
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I only support CSV, Excel, and PDF files. Please upload a supported file type.',
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add file upload message
    const fileMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded file: ${file.name}`,
      timestamp: new Date(),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

    setMessages(prev => [...prev, fileMessage]);

    // Simulate processing
    setTimeout(() => {
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I'm analyzing your file "${file.name}"... This may take a moment.`,
        timestamp: new Date(),
        status: 'processing'
      };
      setMessages(prev => [...prev, processingMessage]);

      // Simulate completion
      setTimeout(() => {
        const completedMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: `Great! I've successfully processed "${file.name}". Here's what I found:`,
          timestamp: new Date(),
          status: 'completed',
          results: {
            processed: 156,
            added: 142,
            errors: 14,
            destination: 'Airtable'
          }
        };
        setMessages(prev => [...prev, completedMessage]);
      }, 3000);
    }, 1000);
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

      {/* Main Content */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-4 h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex">
          
          {/* Sidebar - Connected Sources */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block w-80 mr-6"
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative h-full">
              <div className="absolute top-2 left-2 w-4 h-4 opacity-30">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-4 h-4 opacity-30">
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
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/onboarding')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs hand-drawn-border border border-[#6e1d27]/30 text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    Connect new source
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs hand-drawn-border border border-[#6e1d27]/30 text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    View import history
                  </Button>
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
          </motion.div>

          {/* Main Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm relative flex-1 flex flex-col">
              {/* Decorative corner doodles */}
              <div className="absolute top-2 left-2 w-4 h-4 opacity-30">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-4 h-4 opacity-30">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-drawn-path" />
                </svg>
              </div>

              {/* Chat Header */}
              <div className="p-6 border-b border-[#6e1d27]/20">
                <h1 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center">
                  <Bot className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  DatrixAI Assistant
                </h1>
                <p className="text-[#6e1d27] font-ibm-plex mt-1">
                  Your intelligent data processing companion
                </p>
              </div>

              {/* Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-6 space-y-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-[#6e1d27] text-white' 
                              : message.type === 'ai'
                              ? 'bg-[#6e1d27]/10 text-[#6e1d27]'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : message.type === 'ai' ? (
                              <Bot className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-4 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-[#6e1d27] text-white hand-drawn-border'
                                : message.type === 'ai'
                                ? 'bg-white border border-[#6e1d27]/20 text-[#3d0e15] hand-drawn-border'
                                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            }`}>
                              {/* File attachment display */}
                              {message.file && (
                                <div className="mb-3 p-3 bg-white/50 rounded-lg border border-[#6e1d27]/20 flex items-center space-x-3">
                                  {(() => {
                                    const FileIcon = getFileIcon(message.file.type);
                                    return <FileIcon className="w-5 h-5 text-[#6e1d27]" />;
                                  })()}
                                  <div className="flex-1">
                                    <p className="font-semibold text-[#3d0e15] font-ibm-plex text-sm">
                                      {message.file.name}
                                    </p>
                                    <p className="text-xs text-[#6e1d27] font-ibm-plex">
                                      {formatFileSize(message.file.size)}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <p className="font-ibm-plex whitespace-pre-line">
                                {message.content}
                              </p>

                              {/* Processing status */}
                              {message.status === 'processing' && (
                                <div className="mt-3 flex items-center space-x-2 text-blue-600">
                                  <Clock className="w-4 h-4 animate-spin" />
                                  <span className="text-sm font-ibm-plex">Processing...</span>
                                </div>
                              )}

                              {/* Results display */}
                              {message.results && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="grid grid-cols-2 gap-2 text-sm font-ibm-plex">
                                    <div>
                                      <span className="text-green-600 font-semibold">Processed:</span>
                                      <span className="ml-1 text-green-800">{message.results.processed} rows</span>
                                    </div>
                                    <div>
                                      <span className="text-green-600 font-semibold">Added:</span>
                                      <span className="ml-1 text-green-800">{message.results.added} records</span>
                                    </div>
                                    <div>
                                      <span className="text-red-600 font-semibold">Errors:</span>
                                      <span className="ml-1 text-red-800">{message.results.errors} rows</span>
                                    </div>
                                    <div>
                                      <span className="text-blue-600 font-semibold">Destination:</span>
                                      <span className="ml-1 text-blue-800">{message.results.destination}</span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="mt-2 hand-drawn-button bg-green-600 hover:bg-green-700 text-white font-ibm-plex"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download Report
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-[#6e1d27]/60 font-ibm-plex mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#6e1d27]/10 text-[#6e1d27] flex items-center justify-center">
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
                    className="absolute inset-0 bg-[#6e1d27]/10 backdrop-blur-sm flex items-center justify-center z-10"
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

              {/* Input Area */}
              <div className="p-6 border-t border-[#6e1d27]/20">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message or upload a file..."
                        className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex pr-12"
                        disabled={isProcessing}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6e1d27] hover:text-[#3d0e15] hover:bg-[#6e1d27]/10"
                        disabled={isProcessing}
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* File input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <p className="text-xs text-[#6e1d27]/60 font-ibm-plex mt-2 text-center">
                  Supported formats: CSV, Excel, PDF • Max size: 10MB
                </p>
              </div>

              {/* Bottom decorative doodles */}
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
          </motion.div>
        </div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
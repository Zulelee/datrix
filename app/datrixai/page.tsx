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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import { datrixAIAgent, type DataAnalysis, type IntegrationExecution } from '@/lib/datrix-ai-agent';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system' | 'confirmation';
  content: string;
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  status?: 'processing' | 'completed' | 'error';
  analysis?: DataAnalysis;
  executionResult?: IntegrationExecution;
  confirmationData?: {
    integration: string;
    table: string;
    recordCount: number;
    data: any[];
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
      content: `Hello! I'm DatrixAI, your intelligent data assistant. I can help you process and organize your data into your connected systems. 

You can:
• Upload files (CSV, Excel, PDF) and I'll extract and structure the data
• Paste or type data directly and I'll analyze it
• I'll recommend the best integration and table for your data
• Get confirmation before inserting anything into your systems

What data would you like me to help you with today?`,
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
    const currentInput = inputText;
    setInputText('');
    setIsProcessing(true);

    // Process the text input with AI
    await processDataWithAI(currentInput);
  };

  const processDataWithAI = async (input: string) => {
    // Add processing message
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `I'm analyzing your data... This may take a moment.`,
      timestamp: new Date(),
      status: 'processing'
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      // Analyze the data with AI
      const analysis = await datrixAIAgent.analyzeData(input, user.id);

      // Create analysis result message
      const analysisMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: `Great! I've analyzed your data. Here's what I found:

**Data Type:** ${analysis.dataType.charAt(0).toUpperCase() + analysis.dataType.slice(1)}
**Records Found:** ${analysis.recordCount}
**Summary:** ${analysis.summary}

**Recommendation:** I suggest adding this data to **${analysis.recommendedIntegration}** in the **${analysis.recommendedTable}** table.

**Confidence:** ${Math.round(analysis.confidence * 100)}%
**Reasoning:** ${analysis.reasoning}`,
        timestamp: new Date(),
        status: 'completed',
        analysis
      };

      setMessages(prev => [...prev, analysisMessage]);

      // If we have data to insert and good confidence, show confirmation
      if (analysis.recordCount > 0 && analysis.confidence > 0.5) {
        const confirmationMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'confirmation',
          content: `Would you like me to add ${analysis.recordCount} record${analysis.recordCount > 1 ? 's' : ''} to **${analysis.recommendedIntegration}.${analysis.recommendedTable}**?`,
          timestamp: new Date(),
          confirmationData: {
            integration: analysis.recommendedIntegration,
            table: analysis.recommendedTable,
            recordCount: analysis.recordCount,
            data: analysis.extractedData
          }
        };

        setMessages(prev => [...prev, confirmationMessage]);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: `Sorry, I encountered an error while analyzing your data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
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
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I only support CSV, Excel, PDF, and text files. Please upload a supported file type.',
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
    setIsProcessing(true);

    // Add processing message
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `I'm processing your file "${file.name}"... Extracting and analyzing the data.`,
      timestamp: new Date(),
      status: 'processing'
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      // Process file through document processor
      const extractedText = await datrixAIAgent.processFile(file, user.id);

      // Analyze the extracted data
      const analysis = await datrixAIAgent.analyzeData(extractedText, user.id);

      // Create analysis result message
      const analysisMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: `Excellent! I've processed your file and extracted the data. Here's what I found:

**Data Type:** ${analysis.dataType.charAt(0).toUpperCase() + analysis.dataType.slice(1)}
**Records Found:** ${analysis.recordCount}
**Summary:** ${analysis.summary}

**Recommendation:** I suggest adding this data to **${analysis.recommendedIntegration}** in the **${analysis.recommendedTable}** table.

**Confidence:** ${Math.round(analysis.confidence * 100)}%
**Reasoning:** ${analysis.reasoning}`,
        timestamp: new Date(),
        status: 'completed',
        analysis
      };

      setMessages(prev => [...prev, analysisMessage]);

      // If we have data to insert and good confidence, show confirmation
      if (analysis.recordCount > 0 && analysis.confidence > 0.5) {
        const confirmationMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'confirmation',
          content: `Would you like me to add ${analysis.recordCount} record${analysis.recordCount > 1 ? 's' : ''} to **${analysis.recommendedIntegration}.${analysis.recommendedTable}**?`,
          timestamp: new Date(),
          confirmationData: {
            integration: analysis.recommendedIntegration,
            table: analysis.recommendedTable,
            recordCount: analysis.recordCount,
            data: analysis.extractedData
          }
        };

        setMessages(prev => [...prev, confirmationMessage]);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: `Sorry, I encountered an error while processing your file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  };

  const handleConfirmation = async (messageId: string, confirmed: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (!message?.confirmationData) return;

    setIsProcessing(true);

    if (confirmed) {
      // Add confirmation message
      const confirmMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Yes, please proceed with adding the data.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);

      // Add processing message
      const processingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Processing... Adding ${message.confirmationData.recordCount} records to ${message.confirmationData.integration}.${message.confirmationData.table}`,
        timestamp: new Date(),
        status: 'processing'
      };
      setMessages(prev => [...prev, processingMessage]);

      try {
        // Execute the integration
        const executionResult = await datrixAIAgent.executeIntegration(
          user.id,
          message.confirmationData.integration,
          message.confirmationData.table,
          message.confirmationData.data
        );

        // Create result message
        const resultMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: `${executionResult.status === 'success' ? '✅' : '❌'} **${executionResult.explanation}**

**Status:** ${executionResult.status.charAt(0).toUpperCase() + executionResult.status.slice(1)}
**Records Inserted:** ${executionResult.insertedRecords}
**Integration:** ${message.confirmationData.integration}.${message.confirmationData.table}
**Timestamp:** ${new Date().toLocaleString()}

${executionResult.errors.length > 0 ? `**Errors:** ${executionResult.errors.join(', ')}` : ''}

Is there anything else you'd like me to help you with?`,
          timestamp: new Date(),
          status: executionResult.status === 'success' ? 'completed' : 'error',
          executionResult
        };

        setMessages(prev => [...prev, resultMessage]);

      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'system',
          content: `Sorry, I encountered an error while executing the integration: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          status: 'error'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // User declined
      const declineMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'No, please don\'t add the data.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, declineMessage]);

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Understood! I won\'t add the data to your integration. Is there anything else you\'d like me to help you with?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
    }

    setIsProcessing(false);
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
          <motion.div
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
          </motion.div>

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
                <h1 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center">
                  <Bot className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  DatrixAI Assistant
                </h1>
                <p className="text-[#6e1d27] font-ibm-plex mt-1">
                  Your intelligent data processing companion
                </p>
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
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user' 
                              ? 'bg-[#6e1d27] text-white' 
                              : message.type === 'ai'
                              ? 'bg-[#6e1d27]/10 text-[#6e1d27]'
                              : message.type === 'confirmation'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : message.type === 'ai' ? (
                              <Bot className="w-4 h-4" />
                            ) : message.type === 'confirmation' ? (
                              <CheckCircle className="w-4 h-4" />
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
                                : message.type === 'confirmation'
                                ? 'bg-blue-50 border border-blue-200 text-blue-800'
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

                              <div className="font-ibm-plex whitespace-pre-line">
                                {message.content.split('**').map((part, i) => 
                                  i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                                )}
                              </div>

                              {/* Processing status */}
                              {message.status === 'processing' && (
                                <div className="mt-3 flex items-center space-x-2 text-blue-600">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm font-ibm-plex">Processing...</span>
                                </div>
                              )}

                              {/* Confirmation buttons */}
                              {message.type === 'confirmation' && message.confirmationData && (
                                <div className="mt-4 flex space-x-3">
                                  <Button
                                    onClick={() => handleConfirmation(message.id, true)}
                                    disabled={isProcessing}
                                    className="hand-drawn-button bg-green-600 hover:bg-green-700 text-white font-ibm-plex flex items-center"
                                  >
                                    <ThumbsUp className="w-4 h-4 mr-2" />
                                    Yes, Proceed
                                  </Button>
                                  <Button
                                    onClick={() => handleConfirmation(message.id, false)}
                                    disabled={isProcessing}
                                    variant="outline"
                                    className="hand-drawn-border border-2 border-red-500 text-red-600 hover:bg-red-50 font-ibm-plex flex items-center"
                                  >
                                    <ThumbsDown className="w-4 h-4 mr-2" />
                                    No, Cancel
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
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your data or describe what you want to organize..."
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
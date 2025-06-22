'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  Send,
  Webhook,
  Copy,
  CheckCircle,
  AlertCircle,
  Code,
  Globe,
  Zap,
  Eye,
  RefreshCw,
  Brain,
  Mail,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';

interface WebhookLog {
  id: string;
  timestamp: string;
  method: string;
  status: number;
  body: any;
  response: any;
  isEmailData?: boolean;
  aiAnalysis?: any;
}

export default function WebhookTestPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testData, setTestData] = useState('{\n  "type": "email",\n  "event": "email_received",\n  "data": {\n    "from": "john.doe@company.com",\n    "sender": "John Doe",\n    "subject": "Partnership Opportunity - Datrix Integration",\n    "body": "Hi there, I\'m reaching out regarding a potential partnership opportunity. Our company is interested in integrating with Datrix for our data management needs. Could we schedule a call to discuss this further? This is time-sensitive as we need to make a decision by end of week.",\n    "timestamp": "' + new Date().toISOString() + '",\n    "attachments": ["proposal.pdf"],\n    "priority": "high"\n  }\n}');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('business');
  const router = useRouter();

  const emailTemplates = {
    business: {
      name: 'Business Inquiry',
      data: {
        type: "email",
        event: "email_received",
        data: {
          from: "john.doe@company.com",
          sender: "John Doe",
          subject: "Partnership Opportunity - Datrix Integration",
          body: "Hi there, I'm reaching out regarding a potential partnership opportunity. Our company is interested in integrating with Datrix for our data management needs. Could we schedule a call to discuss this further? This is time-sensitive as we need to make a decision by end of week.",
          timestamp: new Date().toISOString(),
          attachments: ["proposal.pdf"],
          priority: "high"
        }
      }
    },
    support: {
      name: 'Customer Support',
      data: {
        type: "email",
        event: "email_received",
        data: {
          from: "customer@example.com",
          sender: "Sarah Wilson",
          subject: "URGENT: Data Export Issue",
          body: "I'm having trouble exporting my data from the platform. The export keeps failing and I need this data for a presentation tomorrow morning. Please help ASAP!",
          timestamp: new Date().toISOString(),
          attachments: [],
          priority: "urgent"
        }
      }
    },
    sales: {
      name: 'Sales Lead',
      data: {
        type: "email",
        event: "email_received",
        data: {
          from: "cto@startup.io",
          sender: "Mike Chen",
          subject: "Interested in Datrix Enterprise Plan",
          body: "Hello, I'm the CTO at a growing startup and we're looking for a robust data management solution. We have about 50 employees and handle large volumes of customer data. Could you provide information about your enterprise pricing and features?",
          timestamp: new Date().toISOString(),
          attachments: [],
          priority: "medium"
        }
      }
    },
    spam: {
      name: 'Spam Email',
      data: {
        type: "email",
        event: "email_received",
        data: {
          from: "noreply@marketing-blast.com",
          sender: "Marketing Team",
          subject: "🎉 AMAZING DEAL! 90% OFF Everything! Limited Time!",
          body: "CONGRATULATIONS! You've been selected for our EXCLUSIVE offer! Get 90% off on all products! Click here now before this offer expires! Don't miss out on this INCREDIBLE opportunity!",
          timestamp: new Date().toISOString(),
          attachments: [],
          priority: "low"
        }
      }
    },
    newsletter: {
      name: 'Newsletter',
      data: {
        type: "email",
        event: "email_received",
        data: {
          from: "newsletter@techcrunch.com",
          sender: "TechCrunch",
          subject: "Daily Crunch: Latest tech news and startup updates",
          body: "Here's your daily dose of tech news. Today's highlights include new AI developments, startup funding rounds, and industry analysis.",
          timestamp: new Date().toISOString(),
          attachments: [],
          priority: "low"
        }
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    checkUser();
    // Set the webhook URL based on current domain
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/webhook`);
    }
  }, []);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadTemplate = (templateKey: string) => {
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    if (template) {
      setTestData(JSON.stringify(template.data, null, 2));
      setSelectedTemplate(templateKey);
    }
  };

  const testWebhook = async () => {
    setTestLoading(true);
    try {
      const parsedData = JSON.parse(testData);
      
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Header': 'webhook-test',
          'User-Agent': 'Datrix-Webhook-Tester'
        },
        body: JSON.stringify(parsedData)
      });

      const responseData = await response.json();

      // Check if this was email data
      const isEmailData = parsedData.type === 'email' || 
                         parsedData.event === 'email_received' ||
                         parsedData.subject || 
                         parsedData.from || 
                         parsedData.sender ||
                         parsedData.email_data ||
                         (parsedData.data && (parsedData.data.subject || parsedData.data.from || parsedData.data.sender));

      const newLog: WebhookLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        method: 'POST',
        status: response.status,
        body: parsedData,
        response: responseData,
        isEmailData: isEmailData,
        aiAnalysis: responseData.aiAnalysis
      };

      setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs

    } catch (error) {
      const newLog: WebhookLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        method: 'POST',
        status: 0,
        body: testData,
        response: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      setLogs(prev => [newLog, ...prev.slice(0, 9)]);
    }
    setTestLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
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
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
              AI-Powered Webhook Center
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Test webhooks with intelligent email processing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column - Webhook Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative">
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

                <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-6 flex items-center">
                  <Brain className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  AI Email Processing
                </h2>

                {/* Webhook URL */}
                <div className="space-y-4 mb-6">
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                    Webhook URL
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex flex-1"
                    />
                    <Button
                      onClick={() => copyToClipboard(webhookUrl)}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="space-y-4 mb-6">
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                    Email Templates
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(emailTemplates).map(([key, template]) => (
                      <Button
                        key={key}
                        onClick={() => loadTemplate(key)}
                        variant={selectedTemplate === key ? "default" : "outline"}
                        size="sm"
                        className={`text-xs font-ibm-plex ${
                          selectedTemplate === key
                            ? 'hand-drawn-button bg-[#6e1d27] text-white'
                            : 'hand-drawn-border border border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white'
                        }`}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Test Data */}
                <div className="space-y-4 mb-6">
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                    Test Data (JSON)
                  </Label>
                  <textarea
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    className="w-full h-40 p-3 hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex resize-none font-mono text-sm"
                    placeholder="Enter JSON data to test..."
                  />
                </div>

                {/* Test Button */}
                <Button
                  onClick={testWebhook}
                  disabled={testLoading}
                  className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Test AI Processing
                    </>
                  )}
                </Button>

                {/* AI Features */}
                <div className="mt-6 p-4 bg-[#6e1d27]/5 rounded-lg border border-[#6e1d27]/20">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex mb-2 flex items-center">
                    <Brain className="mr-2 h-4 w-4 text-[#6e1d27]" />
                    AI Features
                  </h3>
                  <ul className="text-sm text-[#6e1d27] font-ibm-plex space-y-1">
                    <li>• Intelligent email classification</li>
                    <li>• Spam and noise filtering</li>
                    <li>• Priority and sentiment analysis</li>
                    <li>• Automated processing decisions</li>
                    <li>• Data extraction and structuring</li>
                  </ul>
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

            {/* Right Column - Webhook Logs */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative">
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

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center">
                    <Eye className="mr-3 h-6 w-6 text-[#6e1d27]" />
                    AI Analysis Logs
                  </h2>
                  {logs.length > 0 && (
                    <Button
                      onClick={clearLogs}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Logs Display */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {logs.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-[#6e1d27]/30 mx-auto mb-4" />
                        <p className="text-[#6e1d27] font-ibm-plex">
                          No AI analysis yet. Test email processing with the templates above.
                        </p>
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="p-4 bg-white/50 rounded-lg border border-[#6e1d27]/20 hand-drawn-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                log.status >= 200 && log.status < 300
                                  ? 'bg-green-100 text-green-800'
                                  : log.status >= 400
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {log.status || 'ERROR'}
                              </span>
                              {log.isEmailData && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                                  <Brain className="w-3 h-3 mr-1" />
                                  AI Processed
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#6e1d27] font-ibm-plex">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {/* AI Analysis Results */}
                          {log.aiAnalysis && (
                            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                                <Brain className="w-4 h-4 mr-1" />
                                AI Analysis
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-blue-700">Decision:</span>
                                  <span className={`ml-1 px-1 py-0.5 rounded ${
                                    log.aiAnalysis.shouldProcess 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.aiAnalysis.shouldProcess ? 'Process' : 'Skip'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-blue-700">Confidence:</span>
                                  <span className="ml-1">{Math.round(log.aiAnalysis.confidence * 100)}%</span>
                                </div>
                                <div>
                                  <span className="font-medium text-blue-700">Category:</span>
                                  <span className="ml-1">{log.aiAnalysis.category}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-blue-700">Priority:</span>
                                  <span className="ml-1">{log.aiAnalysis.priority}</span>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="font-medium text-blue-700 text-xs">Reasoning:</span>
                                <p className="text-xs text-blue-600 mt-1">{log.aiAnalysis.reasoning}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-[#6e1d27] font-ibm-plex mb-1">Request Body:</p>
                              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto font-mono max-h-20 overflow-y-auto">
                                {JSON.stringify(log.body, null, 2)}
                              </pre>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-[#6e1d27] font-ibm-plex mb-1">Response:</p>
                              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto font-mono max-h-20 overflow-y-auto">
                                {JSON.stringify(log.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
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
          </div>

          {/* Console Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-8"
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative">
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

              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-4 flex items-center">
                <Zap className="mr-3 h-6 w-6 text-[#6e1d27]" />
                AI Email Processing
              </h2>
              
              <div className="bg-[#6e1d27]/5 p-4 rounded-lg border border-[#6e1d27]/20">
                <p className="text-[#6e1d27] font-ibm-plex mb-2">
                  <strong>🤖 AI Agent:</strong> Automatically analyzes email data and decides whether to process it further.
                </p>
                <p className="text-[#6e1d27] font-ibm-plex mb-2">
                  <strong>📊 Smart Classification:</strong> Categorizes emails by type, priority, and business value.
                </p>
                <p className="text-[#6e1d27] font-ibm-plex mb-2">
                  <strong>🎯 Processing Logic:</strong> Only processes valuable business emails, filters out spam and noise.
                </p>
                <p className="text-[#6e1d27] font-ibm-plex">
                  <strong>📝 Detailed Logs:</strong> Check server console for comprehensive AI analysis and decision reasoning.
                </p>
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
        </div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
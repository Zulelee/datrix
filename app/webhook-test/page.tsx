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
  RefreshCw
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
}

export default function WebhookTestPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testData, setTestData] = useState('{\n  "event": "test",\n  "data": {\n    "message": "Hello from webhook test!",\n    "timestamp": "' + new Date().toISOString() + '"\n  }\n}');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

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

      const newLog: WebhookLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        method: 'POST',
        status: response.status,
        body: parsedData,
        response: responseData
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
              Webhook Testing Center
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Test and monitor webhook integrations
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
                  <Webhook className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  Webhook Configuration
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
                  <p className="text-sm text-[#6e1d27] font-ibm-plex">
                    Use this URL in your external services to send webhook data
                  </p>
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
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Test Webhook
                    </>
                  )}
                </Button>

                {/* Usage Instructions */}
                <div className="mt-6 p-4 bg-[#6e1d27]/5 rounded-lg border border-[#6e1d27]/20">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex mb-2 flex items-center">
                    <Code className="mr-2 h-4 w-4 text-[#6e1d27]" />
                    Usage Instructions
                  </h3>
                  <ul className="text-sm text-[#6e1d27] font-ibm-plex space-y-1">
                    <li>• Copy the webhook URL above</li>
                    <li>• Configure it in your external service</li>
                    <li>• Send POST requests with JSON data</li>
                    <li>• Monitor responses in the console and logs</li>
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
                    Recent Logs
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
                        <Globe className="w-12 h-12 text-[#6e1d27]/30 mx-auto mb-4" />
                        <p className="text-[#6e1d27] font-ibm-plex">
                          No webhook requests yet. Test the webhook or send data from external services.
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
                              <span className="text-sm font-medium text-[#3d0e15] font-ibm-plex">
                                {log.method}
                              </span>
                            </div>
                            <span className="text-xs text-[#6e1d27] font-ibm-plex">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-[#6e1d27] font-ibm-plex mb-1">Request Body:</p>
                              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto font-mono">
                                {JSON.stringify(log.body, null, 2)}
                              </pre>
                            </div>
                            
                            <div>
                              <p className="text-xs font-medium text-[#6e1d27] font-ibm-plex mb-1">Response:</p>
                              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto font-mono">
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
                Console Monitoring
              </h2>
              
              <div className="bg-[#6e1d27]/5 p-4 rounded-lg border border-[#6e1d27]/20">
                <p className="text-[#6e1d27] font-ibm-plex mb-2">
                  <strong>📊 Server Console:</strong> All webhook data is logged to the server console with detailed formatting.
                </p>
                <p className="text-[#6e1d27] font-ibm-plex mb-2">
                  <strong>🔍 Browser Console:</strong> Open Developer Tools (F12) to see client-side logs.
                </p>
                <p className="text-[#6e1d27] font-ibm-plex">
                  <strong>📝 Production:</strong> In production, check your hosting platform's logs (Vercel, Netlify, etc.).
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
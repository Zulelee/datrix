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
  Bot,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import { Textarea } from '@/components/ui/textarea';

interface WebhookLog {
  id: string;
  timestamp: string;
  method: string;
  status: number;
  body: any;
  response: any;
  isEmailData?: boolean;
  aiAnalysis?: any;
  documentProcessing?: any;
  integration?: any;
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
  // Airtable test state
  const [airtableTab, setAirtableTab] = useState<'bases' | 'tables' | 'records'>('bases');
  const [airtableToken, setAirtableToken] = useState('');
  const [airtableBaseId, setAirtableBaseId] = useState('');
  const [airtableTableIdOrName, setAirtableTableIdOrName] = useState('');
  const [airtableRecords, setAirtableRecords] = useState('[{"fields": {"Name": "John Doe"}}]');
  const [airtableResponse, setAirtableResponse] = useState<any>(null);
  const [airtableLoading, setAirtableLoading] = useState(false);
  // PostgreSQL test state
  const [pgEndpoint, setPgEndpoint] = useState<'tables' | 'schema' | 'insert'>('tables');
  const [pgConn, setPgConn] = useState('');
  const [pgTable, setPgTable] = useState('');
  const [pgRows, setPgRows] = useState('[{"name": "John Doe"}]');
  const [pgResponse, setPgResponse] = useState<any>(null);
  const [pgLoading, setPgLoading] = useState(false);

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
    },
    googleAppsScript: {
      name: 'Google Apps Script Sales Activity',
      data: {
        "timestamp": "2025-06-28T20:54:22.176Z",
        "source": "google-apps-script",
        "data": {
          "action": "fetch_emails",
          "emailsProcessed": 1,
          "searchQuery": "is:unread",
          "data": [
            {
              "threadId": "197b851aa9d32887",
              "messageId": "197b851c4832c6f2",
              "subject": "Sales Activity Update – Acme Corp – Demo Follow-Up",
              "sender": "datrix <datrix.saledata@gmail.com>",
              "recipient": "datrix <datrix.saledata@gmail.com>",
              "date": "2025-06-28T20:54:15.000Z",
              "isRead": false,
              "bodyPlainText": "Hi Sarah,\r\n\r\nHere's the summary of my latest sales activity:\r\n------------------------------\r\n\r\n*Sales Representative:* Zulekha Imtiaz\r\n*Activity Date:* June 28, 2025\r\n*Activity Type:* Product Demo & Needs Assessment Call\r\n*Duration:* 45 minutes\r\n*Outcome:* Warm Lead – Interested in Next Steps\r\n*Notes:\r\n\r\n   -\r\n\r\n   Walked *Jason Reed through key features of Quantum Analytics.\r\n   -\r\n\r\n   Discussed challenges around manual data entry and siloed customer\r\n   reports.\r\n   -\r\n\r\n   Jason showed strong interest in our automated reporting and AI-driven\r\n   insights.\r\n   -\r\n\r\n   Had questions around integration with Salesforce and scalability for\r\n   their enterprise clients.\r\n\r\n*Related Lead:* Jason Reed – jason.reed@acmecorp.com\r\n*Related Customer:* Acme Corp – contact@acmecorp.com\r\n*Lead Status:* Engaged – Awaiting Proposal\r\n*Customer Status:* In Evaluation\r\n*Outcome Summary:\r\nAcme Corp is comparing Quantum Analytics to Tableau and Looker. They were\r\nimpressed by the simplicity of setup, the real-time dashboard capabilities,\r\nand our lower learning curve. Requested a proposal including enterprise\r\npricing and an implementation roadmap.\r\n\r\n*Next Best Action:\r\n\r\n   -\r\n\r\n   Send formal proposal and pricing by July 1st\r\n   -\r\n\r\n   Schedule technical Q&A session with our solutions engineer on July 3rd\r\n\r\n*Sales Pipeline Stage:* Proposal Sent – Mid Funnel\r\n*Sales Reports:* Logged in CRM under Q3 Strategic Accounts\r\n*Opportunity ID:* QA-ACME-0097\r\n------------------------------\r\n\r\nLet me know if you'd like me to loop in Alex (Solutions Engineer) for the\r\nfollow-up call.\r\n\r\nBest,\r\n*Zulekha Imtiaz*\r\nSales Representative\r\nQuantum Analytics\r\nzulekha@quantumanalytics.com | ‪+1 (234) 555-0199‬\r\nquantumanalytics.com <https://www.quantumanalytics.com/>\r\n",
              "bodyHtml": "<div dir=\"ltr\"><p>Hi Sarah,</p><p>Here's the summary of my latest sales activity:</p><hr><p><strong>Sales Representative:</strong> Zulekha Imtiaz<br><strong>Activity Date:</strong> June 28, 2025<br><strong>Activity Type:</strong> Product Demo &amp; Needs Assessment Call<br><strong>Duration:</strong> 45 minutes<br><strong>Outcome:</strong> Warm Lead – Interested in Next Steps<br><strong>Notes:</strong></p><ul><li style=\"margin-left:15px\"><p>Walked <strong>Jason Reed</strong> through key features of <strong>Quantum Analytics</strong>.</p></li><li style=\"margin-left:15px\"><p>Discussed challenges around manual data entry and siloed customer reports.</p></li><li style=\"margin-left:15px\"><p>Jason showed strong interest in our automated reporting and AI-driven insights.</p></li><li style=\"margin-left:15px\"><p>Had questions around integration with Salesforce and scalability for their enterprise clients.</p></li></ul><p><strong>Related Lead:</strong> Jason Reed – <a rel=\"noopener\">jason.reed@acmecorp.com</a><br><strong>Related Customer:</strong> Acme Corp – <a rel=\"noopener\">contact@acmecorp.com</a><br><strong>Lead Status:</strong> Engaged – Awaiting Proposal<br><strong>Customer Status:</strong> In Evaluation<br><strong>Outcome Summary:</strong><br>Acme Corp is comparing Quantum Analytics to Tableau and Looker. They were impressed by the simplicity of setup, the real-time dashboard capabilities, and our lower learning curve. Requested a proposal including enterprise pricing and an implementation roadmap.</p><p><strong>Next Best Action:</strong></p><ul><li style=\"margin-left:15px\"><p>Send formal proposal and pricing by <strong>July 1st</strong></p></li><li style=\"margin-left:15px\"><p>Schedule technical Q&amp;A session with our solutions engineer on <strong>July 3rd</strong></p></li></ul><p><strong>Sales Pipeline Stage:</strong> Proposal Sent – Mid Funnel<br><strong>Sales Reports:</strong> Logged in CRM under <em>Q3 Strategic Accounts</em><br><strong>Opportunity ID:</strong> QA-ACME-0097</p><hr><p>Let me know if you'd like me to loop in Alex (Solutions Engineer) for the follow-up call.</p><p>Best,<br><strong>Zulekha Imtiaz</strong><br>Sales Representative<br>Quantum Analytics<br><a rel=\"noopener\" href=\"https://www.quantumanalytics.com/\" target=\"_blank\">quantumanalytics.com</a></p></div>\r\n",
              "attachments": []
            }
          ]
        }
      }
    },
    googleAppsScriptWithAttachments: {
      name: 'Google Apps Script with Attachments',
      data: {
        "timestamp": "2025-06-28T21:39:24.454Z",
        "source": "google-apps-script",
        "data": {
          "action": "fetch_emails",
          "emailsProcessed": 1,
          "searchQuery": "is:unread",
          "data": [
            {
              "threadId": "197b87a2c56be8f0",
              "messageId": "197b87ae552b6cfa",
              "subject": "Sales Activity Update – Acme Corp – Demo Follow-Up",
              "sender": "datrix <datrix.saledata@gmail.com>",
              "recipient": "datrix <datrix.saledata@gmail.com>",
              "date": "2025-06-28T21:39:09.000Z",
              "isRead": false,
              "bodyPlainText": "Hi Sarah,\r\n\r\nHere's the summary of my latest sales activity:\r\n------------------------------\r\n\r\n*Sales Representative:* Zulekha Imtiaz\r\n*Activity Date:* June 28, 2025\r\n*Activity Type:* Product Demo & Needs Assessment Call\r\n*Duration:* 45 minutes\r\n*Outcome:* Warm Lead – Interested in Next Steps\r\n*Notes:\r\n\r\n   -\r\n\r\n   Walked *Jason Reed through key features of Quantum Analytics.\r\n   -\r\n\r\n   Discussed challenges around manual data entry and siloed customer\r\n   reports.\r\n   -\r\n\r\n   Jason showed strong interest in our automated reporting and AI-driven\r\n   insights.\r\n   -\r\n\r\n   Had questions around integration with Salesforce and scalability for\r\n   their enterprise clients.\r\n\r\n*Related Lead:* Jason Reed – jason.reed@acmecorp.com\r\n*Related Customer:* Acme Corp – contact@acmecorp.com\r\n*Lead Status:* Engaged – Awaiting Proposal\r\n*Customer Status:* In Evaluation\r\n*Outcome Summary:\r\nAcme Corp is comparing Quantum Analytics to Tableau and Looker. They were\r\nimpressed by the simplicity of setup, the real-time dashboard capabilities,\r\nand our lower learning curve. Requested a proposal including enterprise\r\npricing and an implementation roadmap.\r\n\r\n*Next Best Action:\r\n\r\n   -\r\n\r\n   Send formal proposal and pricing by July 1st\r\n   -\r\n\r\n   Schedule technical Q&A session with our solutions engineer on July 3rd\r\n\r\n*Sales Pipeline Stage:* Proposal Sent – Mid Funnel\r\n*Sales Reports:* Logged in CRM under Q3 Strategic Accounts\r\n*Opportunity ID:* QA-ACME-0097\r\n------------------------------\r\n\r\nLet me know if you'd like me to loop in Alex (Solutions Engineer) for the\r\nfollow-up call.\r\n\r\nBest,\r\n*Zulekha Imtiaz*\r\nSales Representative\r\nQuantum Analytics\r\nzulekha@quantumanalytics.com | ‪+1 (234) 555-0199‬\r\nquantumanalytics.com <https://www.quantumanalytics.com/>\r\n",
              "bodyHtml": "<div dir=\"ltr\"><p>Hi Sarah,</p><p>Here's the summary of my latest sales activity:</p><hr><p><strong>Sales Representative:</strong> Zulekha Imtiaz<br><strong>Activity Date:</strong> June 28, 2025<br><strong>Activity Type:</strong> Product Demo &amp; Needs Assessment Call<br><strong>Duration:</strong> 45 minutes<br><strong>Outcome:</strong> Warm Lead – Interested in Next Steps<br><strong>Notes:</strong></p><ul><li style=\"margin-left:15px\"><p>Walked <strong>Jason Reed</strong> through key features of <strong>Quantum Analytics</strong>.</p></li><li style=\"margin-left:15px\"><p>Discussed challenges around manual data entry and siloed customer reports.</p></li><li style=\"margin-left:15px\"><p>Jason showed strong interest in our automated reporting and AI-driven insights.</p></li><li style=\"margin-left:15px\"><p>Had questions around integration with Salesforce and scalability for their enterprise clients.</p></li></ul><p><strong>Related Lead:</strong> Jason Reed – <a rel=\"noopener\">jason.reed@acmecorp.com</a><br><strong>Related Customer:</strong> Acme Corp – <a rel=\"noopener\">contact@acmecorp.com</a><br><strong>Lead Status:</strong> Engaged – Awaiting Proposal<br><strong>Customer Status:</strong> In Evaluation<br><strong>Outcome Summary:</strong><br>Acme Corp is comparing Quantum Analytics to Tableau and Looker. They were impressed by the simplicity of setup, the real-time dashboard capabilities, and our lower learning curve. Requested a proposal including enterprise pricing and an implementation roadmap.</p><p><strong>Next Best Action:</strong></p><ul><li style=\"margin-left:15px\"><p>Send formal proposal and pricing by <strong>July 1st</strong></p></li><li style=\"margin-left:15px\"><p>Schedule technical Q&amp;A session with our solutions engineer on <strong>July 3rd</strong></p></li></ul><p><strong>Sales Pipeline Stage:</strong> Proposal Sent – Mid Funnel<br><strong>Sales Reports:</strong> Logged in CRM under <em>Q3 Strategic Accounts</em><br><strong>Opportunity ID:</strong> QA-ACME-0097</p><hr><p>Let me know if you'd like me to loop in Alex (Solutions Engineer) for the follow-up call.</p><p>Best,<br><strong>Zulekha Imtiaz</strong><br>Sales Representative<br>Quantum Analytics<br><a rel=\"noopener\">zulekha@quantumanalytics.com</a> | +1 (234) 555-0199<br><a rel=\"noopener\" href=\"https://www.quantumanalytics.com/\" target=\"_blank\">quantumanalytics.com</a></p></div>\r\n",
              "attachments": [
                {
                  "name": "QP #05.pdf",
                  "contentType": "application/pdf",
                  "driveFileId": "1CLHq-U9jMaJomjlSVVLqrVzeySZy6nzv",
                  "driveUrl": "https://drive.google.com/file/d/1CLHq-U9jMaJomjlSVVLqrVzeySZy6nzv/view?usp=drivesdk",
                  "extractedText": "PDF content extraction requires Google Cloud Document AI.",
                  "extractedData": null,
                  "note": null,
                  "error": null
                }
              ]
            }
          ]
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

      // Check if this was Google Apps Script email data
      const isGoogleAppsScriptData = parsedData.source === 'google-apps-script' && 
                                    parsedData.data && 
                                    parsedData.data.action === 'fetch_emails' &&
                                    parsedData.data.emailsProcessed > 0;

      const newLog: WebhookLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        method: 'POST',
        status: response.status,
        body: parsedData,
        response: responseData,
        isEmailData: isGoogleAppsScriptData,
        aiAnalysis: responseData.aiAnalysis,
        documentProcessing: responseData.documentProcessing,
        integration: responseData.integration
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

  const testAirtable = async () => {
    setAirtableLoading(true);
    setAirtableResponse(null);
    try {
      let url = '';
      let options: any = { method: 'GET' };
      if (airtableTab === 'bases') {
        url = `/api/airtable/bases?token=${encodeURIComponent(airtableToken)}`;
      } else if (airtableTab === 'tables') {
        url = `/api/airtable/tables?token=${encodeURIComponent(airtableToken)}&baseId=${encodeURIComponent(airtableBaseId)}`;
      } else if (airtableTab === 'records') {
        url = `/api/airtable/records`;
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: airtableToken,
            baseId: airtableBaseId,
            tableIdOrName: airtableTableIdOrName,
            records: JSON.parse(airtableRecords)
          })
        };
      }
      const res = await fetch(url, options);
      const data = await res.json();
      setAirtableResponse(data);
    } catch (e: any) {
      setAirtableResponse({ error: e.message });
    }
    setAirtableLoading(false);
  };

  const testPostgres = async () => {
    setPgLoading(true);
    setPgResponse(null);
    try {
      let url = '';
      let body: any = { connectionString: pgConn };
      if (pgEndpoint === 'tables') {
        url = '/api/postgresql/get-tables';
      } else if (pgEndpoint === 'schema') {
        url = '/api/postgresql/get-table-schema';
        body.tableName = pgTable;
      } else if (pgEndpoint === 'insert') {
        url = '/api/postgresql/insert-rows';
        body.tableName = pgTable;
        body.rows = JSON.parse(pgRows);
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setPgResponse(data);
    } catch (e: any) {
      setPgResponse({ error: e.message });
    }
    setPgLoading(false);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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

                          {/* Document Processing Results */}
                          {log.documentProcessing && (
                            <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                              <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                                <Code className="w-4 h-4 mr-1" />
                                Document Processing
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-green-700">Status:</span>
                                  <span className={`ml-1 px-1 py-0.5 rounded ${
                                    log.documentProcessing.status === 200
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.documentProcessing.status}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-700">File Type:</span>
                                  <span className="ml-1">{log.documentProcessing.data?.file_type || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-700">Pages:</span>
                                  <span className="ml-1">{log.documentProcessing.data?.metadata?.total_pages || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-green-700">Language:</span>
                                  <span className="ml-1">{log.documentProcessing.data?.metadata?.language || 'N/A'}</span>
                                </div>
                              </div>
                              {log.documentProcessing.data?.content?.pages && (
                                <div className="mt-2">
                                  <span className="font-medium text-green-700 text-xs">Extracted Content:</span>
                                  <p className="text-xs text-green-600 mt-1">
                                    {log.documentProcessing.data.content.pages.length} page(s) processed
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Integration Results */}
                          {log.integration && (
                            <div className="mb-3 p-3 bg-purple-50 rounded border border-purple-200">
                              <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
                                <Database className="w-4 h-4 mr-1" />
                                Integration Result
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-purple-700">Integration:</span>
                                  <span className="ml-1">{log.integration.selectedIntegration || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-700">Table:</span>
                                  <span className="ml-1">{log.integration.tableName || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-700">Status:</span>
                                  <span className={`ml-1 px-1 py-0.5 rounded ${
                                    log.integration.status === 'success'
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.integration.status || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-700">Confidence:</span>
                                  <span className="ml-1">{log.integration.confidence ? Math.round(log.integration.confidence * 100) + '%' : 'N/A'}</span>
                                </div>
                              </div>
                              {log.integration.explanation && (
                                <div className="mt-2">
                                  <span className="font-medium text-purple-700 text-xs">Explanation:</span>
                                  <p className="text-xs text-purple-600 mt-1">{log.integration.explanation}</p>
                                </div>
                              )}
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

          {/* Airtable API Tester Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative mb-12">
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
                <Globe className="mr-3 h-6 w-6 text-[#6e1d27]" />
                Airtable API Tester
              </h2>
              <div className="space-y-4 mb-6">
                <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Airtable Token</Label>
                <Input value={airtableToken} onChange={e => setAirtableToken(e.target.value)} placeholder="pat..." className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex" />
                <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Base ID</Label>
                <Input value={airtableBaseId} onChange={e => setAirtableBaseId(e.target.value)} placeholder="app..." className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex" />
                <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Endpoint</Label>
                <select className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex w-full" value={airtableTab} onChange={e => setAirtableTab(e.target.value as any)}>
                  <option value="bases">Get Bases</option>
                  <option value="tables">Get Tables</option>
                  <option value="records">Create Record</option>
                </select>
                {airtableTab === 'records' && (
                  <>
                    <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Table ID or Name</Label>
                    <Input value={airtableTableIdOrName} onChange={e => setAirtableTableIdOrName(e.target.value)} placeholder="tbl... or Table Name" className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex" />
                    <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Records (JSON Array)</Label>
                    <Textarea value={airtableRecords} onChange={e => setAirtableRecords(e.target.value)} rows={5} className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex font-mono text-sm" />
                  </>
                )}
              </div>
              <Button onClick={testAirtable} disabled={airtableLoading} className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex">
                {airtableLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Test Airtable Endpoint
                  </>
                )}
              </Button>
              {airtableResponse && (
                <div className="mt-4">
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Response</Label>
                  <pre className="bg-gray-50 p-3 rounded border text-xs max-h-60 overflow-auto font-mono">{JSON.stringify(airtableResponse, null, 2)}</pre>
                </div>
              )}
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

          {/* PostgreSQL Tester Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative mb-12">
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
                <Database className="mr-3 h-6 w-6 text-[#6e1d27]" />
                PostgreSQL API Tester
              </h2>
              <div className="space-y-4 mb-6">
                <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Connection String</Label>
                <Input value={pgConn} onChange={e => setPgConn(e.target.value)} placeholder="postgres://user:pass@host:port/db" className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex" />
                <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Endpoint</Label>
                <select className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex w-full" value={pgEndpoint} onChange={e => setPgEndpoint(e.target.value as any)}>
                  <option value="tables">Get Tables</option>
                  <option value="schema">Get Table Schema</option>
                  <option value="insert">Insert Rows</option>
                </select>
                {(pgEndpoint === 'schema' || pgEndpoint === 'insert') && (
                  <>
                    <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Table Name</Label>
                    <Input value={pgTable} onChange={e => setPgTable(e.target.value)} placeholder="table_name" className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex" />
                  </>
                )}
                {pgEndpoint === 'insert' && (
                  <>
                    <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Rows (JSON Array)</Label>
                    <Textarea value={pgRows} onChange={e => setPgRows(e.target.value)} rows={5} className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex font-mono text-sm" />
                  </>
                )}
              </div>
              <Button onClick={testPostgres} disabled={pgLoading} className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex">
                {pgLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Test PostgreSQL Endpoint
                  </>
                )}
              </Button>
              {pgResponse && (
                <div className="mt-4">
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">Response</Label>
                  <pre className="bg-gray-50 p-3 rounded border text-xs max-h-60 overflow-auto font-mono">{JSON.stringify(pgResponse, null, 2)}</pre>
                </div>
              )}
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
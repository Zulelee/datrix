'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  User, 
  Building2, 
  Target, 
  Database,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  MessageSquare,
  BarChart3,
  LogOut,
  Sparkles,
  Zap,
  Globe,
  Server,
  Cloud,
  FileText,
  Calendar,
  Slack,
  Mail,
  Copy,
  ExternalLink,
  Play,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import { saveUserDataSource, getUserDataSources, deleteUserDataSource } from '@/lib/saveDataSource';

interface DataSource {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  connected: boolean;
  color: string;
  credentials?: any;
  comingSoon?: boolean;
}

const GOOGLE_APPS_SCRIPT = `/**
 * Gmail Data Fetcher with Make.com Webhook Integration
 * Avoids duplicate processing using Gmail labels
 * Sends processed email data to Make.com
 * Makes attachments publicly accessible
 */

// Configuration – Replace with your actual webhook URLs
const MAKE_WEBHOOK_URL       = 'https://datrix.app/api/webhook';
const MAKE_RESPONSE_WEBHOOK  = 'https://datrix.app/api/webhook';
const DEFAULT_SEARCH_QUERY   = 'is:unread';
const DEFAULT_MAX_EMAILS     = 50;
const ATTACHMENT_FOLDER_NAME = 'EmailAttachments';
const PROCESSED_LABEL_NAME   = 'ProcessedByScript';

/* ========== WEBHOOK HANDLERS ========== */

function doPost(e) {
  try {
    console.log('Webhook received from Make.com');

    let requestData = {};
    let parameters = {};

    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
        console.log('Parsed request data:', JSON.stringify(requestData));
      } catch (err) {
        console.log('Failed to parse JSON, using raw data');
        requestData = { rawData: e.postData.contents };
      }
    }

    if (e && e.parameter) {
      parameters = e.parameter;
    }

    const result = processWebhookData(requestData, parameters);

    if (MAKE_RESPONSE_WEBHOOK &&
        MAKE_RESPONSE_WEBHOOK !==
          'https://datrix.app/api/webhook') {
      sendDataToMake(result);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status   : 'success',
        message  : 'Webhook processed successfully',
        data     : result,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error processing webhook:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status   : 'error',
        message  : error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const parameters = e.parameter || {};

  if (parameters.verify) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status   : 'verified',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status   : 'ready',
      message  : 'Webhook endpoint is active',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ========== CORE PROCESSING ========== */

function processWebhookData(data, parameters) {
  if (data.action === 'fetch_emails') {
    const searchQuery = data.searchQuery ||
                        parameters.searchQuery ||
                        DEFAULT_SEARCH_QUERY;
    const maxEmails   = parseInt(data.maxEmails ||
                                 parameters.maxEmails ||
                                 DEFAULT_MAX_EMAILS, 10);

    const emailData = fetchEmailData(searchQuery, maxEmails);

    return {
      action        : 'fetch_emails',
      emailsProcessed: emailData.length,
      searchQuery   : searchQuery,
      data          : emailData
    };
  }

  if (data.action === 'process_email' && data.messageId) {
    const emailData = processSpecificEmail(data.messageId);
    return {
      action   : 'process_email',
      messageId: data.messageId,
      data     : emailData
    };
  }

  if (data.action === 'search_emails') {
    const results = searchEmails(data.searchQuery || 'is:unread',
                                 data.maxResults  || 10);
    return { action: 'search_emails', results };
  }

  if (data.action === 'mark_as_read' && data.messageIds) {
    const result = markEmailsAsRead(data.messageIds);
    return { action: 'mark_as_read', result };
  }

  const emailData = fetchEmailData();
  return {
    action           : 'default',
    message          : 'Webhook received and processed',
    emailsProcessed  : emailData.length,
    receivedData     : data,
    receivedParameters: parameters,
    data             : emailData
  };
}

function sendDataToMake(data) {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      source   : 'google-apps-script',
      data
    };
    const options = {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload)
    };
    const response = UrlFetchApp.fetch(MAKE_RESPONSE_WEBHOOK, options);
    console.log('Response from Make.com:', response.getContentText());
    return true;
  } catch (error) {
    console.error('Error sending data to Make.com:', error);
    return false;
  }
}

/* ========== EMAIL PROCESSING ========== */

function fetchEmailData(searchQuery = DEFAULT_SEARCH_QUERY,
                        maxEmails = DEFAULT_MAX_EMAILS) {
  try {
    const threads = GmailApp.search(searchQuery, 0, maxEmails);
    const processedLabel = getOrCreateGmailLabel(PROCESSED_LABEL_NAME);
    const attachmentFolder = getOrCreateFolder(ATTACHMENT_FOLDER_NAME);
    const emailData = [];

    threads.forEach((thread) => {
      const hasBeenProcessed = thread.getLabels().some(
        label => label.getName() === PROCESSED_LABEL_NAME
      );
      if (hasBeenProcessed) return;

      const messages = thread.getMessages();
      messages.forEach((message) => {
        const emailInfo = {
          threadId      : thread.getId(),
          messageId     : message.getId(),
          subject       : message.getSubject(),
          sender        : message.getFrom(),
          recipient     : message.getTo(),
          date          : message.getDate(),
          isRead        : !message.isUnread(),
          bodyPlainText : message.getPlainBody(),
          bodyHtml      : message.getBody(),
          attachments   : []
        };

        const attachments = message.getAttachments();
        if (attachments.length) {
          attachments.forEach((att, i) => {
            try {
              const info = processAttachment(att, attachmentFolder, message, i);
              emailInfo.attachments.push(info);
            } catch (err) {
              emailInfo.attachments.push({ name: att.getName(), error: err.toString() });
            }
          });
        }

        emailData.push(emailInfo);
      });

      thread.addLabel(processedLabel);
    });

    saveToSheet(emailData);
    sendDataToMake({
      action: 'fetch_emails',
      emailsProcessed: emailData.length,
      searchQuery,
      data: emailData
    });

    return emailData;

  } catch (error) {
    console.error('Error in fetchEmailData:', error);
    throw error;
  }
}

/* ========== ATTACHMENT & LABEL HELPERS ========== */

function processAttachment(attachment, folder, message, index) {
  const fileName = attachment.getName();
  const contentType = attachment.getContentType();

  const info = {
    name         : fileName,
    contentType  : contentType,
    driveFileId  : null,
    driveUrl     : null,
    extractedText: null,
    extractedData: null,
    note         : null,
    error        : null
  };

  try {
    const blob = attachment.copyBlob();
    const driveFile = folder.createFile(blob.setName(\`\${message.getSubject()}_\${index}_\${fileName}\`));

    // ✅ Make file publicly accessible
    driveFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    info.driveFileId = driveFile.getId();
    info.driveUrl = driveFile.getUrl();

    if (contentType.includes('text/')) {
      info.extractedText = blob.getDataAsString();
    } else if (contentType.includes('application/pdf')) {
      info.extractedText = extractTextFromPDF(driveFile);
    } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
               contentType.includes('application/vnd.ms-excel')) {
      info.extractedData = extractDataFromExcel(blob);
    } else if (contentType.includes('text/csv')) {
      info.extractedData = parseCSV(blob.getDataAsString());
    } else if (contentType.includes('application/msword')) {
      info.note = 'Word document saved – manual extraction may be required';
    }

  } catch (error) {
    info.error = error.toString();
  }

  return info;
}

function getOrCreateGmailLabel(labelName) {
  const label = GmailApp.getUserLabelByName(labelName);
  return label ? label : GmailApp.createLabel(labelName);
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

/* ========== STUB HELPERS ========== */

function extractTextFromPDF(file) {
  return 'PDF content extraction requires Google Cloud Document AI.';
}
function extractDataFromExcel(blob) {}
function parseCSV(csv) {}
function saveToSheet(data) {}

/* ========== MANUAL TESTING ========== */

function main() {
  return fetchEmailData();
}
function webhookMain(action = 'fetch_emails',
                     searchQuery = DEFAULT_SEARCH_QUERY,
                     maxEmails = DEFAULT_MAX_EMAILS) {
  return processWebhookData({ action, searchQuery, maxEmails }, {});
}`;

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    goals: ''
  });
  const [dataSources] = useState<DataSource[]>([
    {
      id: 'airtable',
      name: 'Airtable',
      icon: Database,
      description: 'Connect your Airtable bases',
      connected: false,
      color: '#ffb700'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      icon: Server,
      description: 'Connect your PostgreSQL database',
      connected: false,
      color: '#336791',
      comingSoon: true
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Connect your Google Sheets',
      connected: false,
      color: '#34a853',
      comingSoon: true
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      description: 'Connect your Notion workspace',
      connected: false,
      color: '#000000',
      comingSoon: true
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      description: 'Connect your Slack workspace',
      connected: false,
      color: '#4a154b',
      comingSoon: true
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Connect your calendar events',
      connected: false,
      color: '#4285f4',
      comingSoon: true
    },
    {
      id: 'api',
      name: 'Custom API',
      icon: Globe,
      description: 'Connect via REST API',
      connected: false,
      color: '#6366f1',
      comingSoon: true
    }
  ]);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalInputs, setModalInputs] = useState<{[key: string]: string}>({});
  const [airtableConnected, setAirtableConnected] = useState(false);
  const [wantsEmailTrigger, setWantsEmailTrigger] = useState<boolean | null>(null);
  const [emailTriggerStep, setEmailTriggerStep] = useState(1);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [triggerTested, setTriggerTested] = useState(false);

  const router = useRouter();

  const totalSteps = 7; // Updated to include email trigger steps
  const roles = [
    'Founder/CEO',
    'CTO/Engineering',
    'Product Manager',
    'Data Analyst',
    'Operations',
    'Marketing',
    'Sales',
    'Other'
  ];

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
      // Check if onboarding is already complete
      await checkOnboardingStatus(data.user.id);
    } else {
      router.push('/auth');
    }
    setLoading(false);
  };

  const checkOnboardingStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_complete')
      .eq('id', userId)
      .single();

    if (data?.onboarding_complete) {
      router.push('/dashboard');
    }
  };

  if (!mounted || loading) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const connectAirtable = async () => {
    if (!modalInputs.apiKey) {
      alert('Please enter your Airtable API key');
      return;
    }

    const credentials = {
      apiKey: modalInputs.apiKey,
      baseId: modalInputs.baseId || '',
    };

    const { error } = await saveUserDataSource(user.id, 'airtable', credentials);
    if (error) {
      alert("Failed to save credentials: " + error.message);
      return;
    }

    setAirtableConnected(true);
    setSelectedModal(null);
    setModalInputs({});
    
    // Show brief success animation
    setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }, 500);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const testTrigger = async () => {
    try {
      const response = await fetch('https://datrix.app/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          userId: user.id,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setTriggerTested(true);
        alert('Trigger test successful! Your email integration is working.');
      } else {
        alert('Trigger test failed. Please check your setup.');
      }
    } catch (error) {
      alert('Trigger test failed. Please check your setup.');
    }
  };

  const finishOnboarding = async () => {
    // Save user profile data
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        name: user.user_metadata?.name || '',
        company: formData.companyName,
        role: formData.role,
        goal: formData.goals,
        onboarding_complete: true
      });

    if (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
      return;
    }

    setShowConfetti(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

      {/* Navbar for Signed-in Users */}
      <OnboardingNavbar onLogout={logout} />

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#6e1d27] rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  transition: {
                    duration: Math.random() * 2 + 2,
                    ease: "easeOut"
                  }
                }}
                exit={{ opacity: 0 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          {/* Hand-drawn container */}
          <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-8 relative">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#6e1d27] font-ibm-plex">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-[#6e1d27] font-ibm-plex">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#6e1d27]/20 rounded-full h-2 hand-drawn-border">
                <motion.div
                  className="bg-[#6e1d27] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="text-center space-y-6"
                >
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="w-20 h-20 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border"
                    >
                      <Sparkles className="w-10 h-10 text-[#6e1d27]" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      Welcome to Datrix, {user?.user_metadata?.name || 'there'}!
                    </h1>
                    <p className="text-lg text-[#6e1d27] font-ibm-plex leading-relaxed">
                      Let's get you set up in just a few quick steps. We'll help you connect your data sources and create your first insights dashboard.
                    </p>
                  </div>
                  <Button
                    onClick={nextStep}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white px-8 py-3 text-lg font-semibold font-ibm-plex"
                  >
                    Let's Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Company Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                      <Building2 className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      What's your company called?
                    </h2>
                    <p className="text-[#6e1d27] font-ibm-plex">
                      This helps us personalize your experience
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="companyName" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex text-lg h-12"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!formData.companyName.trim()}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Role */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                      <User className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      What's your role at {formData.companyName}?
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleInputChange('role', role)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 font-ibm-plex text-sm hand-drawn-border ${
                          formData.role === role
                            ? 'border-[#6e1d27] bg-[#6e1d27] text-white'
                            : 'border-[#6e1d27]/30 bg-white/50 text-[#6e1d27] hover:border-[#6e1d27] hover:bg-[#6e1d27]/10'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!formData.role}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Goals */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                      <Target className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      What do you want to achieve with Datrix?
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <Label htmlFor="goals" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                      Your Goals
                    </Label>
                    <textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      className="w-full h-32 p-4 hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex resize-none"
                      placeholder="Tell us about your data challenges and what insights you're looking for..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!formData.goals.trim()}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Connect Airtable */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                      <Database className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      Connect Airtable
                    </h2>
                    <p className="text-[#6e1d27] font-ibm-plex">
                      Connect your Airtable account to start organizing your data
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg border-2 border-[#6e1d27]/30 bg-white/50 hand-drawn-border">
                      <div className="flex items-center space-x-3 mb-2">
                        <Database className="w-6 h-6" style={{ color: '#ffb700' }} />
                        <span className="font-semibold text-[#3d0e15] font-ibm-plex">Airtable</span>
                        {airtableConnected && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className="text-sm text-[#6e1d27] font-ibm-plex mb-3">
                        Connect your Airtable bases
                      </p>
                      <Button
                        onClick={() => { setSelectedModal('airtable'); setModalInputs({}); }}
                        disabled={airtableConnected}
                        className={`w-full text-sm font-ibm-plex ${
                          airtableConnected
                            ? 'bg-green-500 text-white cursor-default'
                            : 'hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white'
                        }`}
                      >
                        {airtableConnected ? 'Connected!' : 'Connect'}
                      </Button>
                    </div>

                    {/* Coming Soon Platforms */}
                    <div className="grid grid-cols-2 gap-3">
                      {dataSources.filter(source => source.comingSoon).map((source) => (
                        <div
                          key={source.id}
                          className="relative p-3 rounded-lg border-2 border-[#6e1d27]/20 bg-white/30 hand-drawn-border opacity-60"
                          title="Coming Soon"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <source.icon className="w-5 h-5" style={{ color: source.color }} />
                            <span className="font-semibold text-[#3d0e15] font-ibm-plex text-sm">
                              {source.name}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-[#6e1d27] text-white text-xs px-2 py-1 rounded-full">
                            Soon
                          </div>
                          <p className="text-xs text-[#6e1d27] font-ibm-plex">
                            {source.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Email Trigger Question */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                      <Mail className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      Email Automation
                    </h2>
                    <p className="text-[#6e1d27] font-ibm-plex">
                      Would you like to set up automatic email processing? This will allow Datrix to automatically extract data from your emails.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => setWantsEmailTrigger(true)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 font-ibm-plex hand-drawn-border ${
                          wantsEmailTrigger === true
                            ? 'border-[#6e1d27] bg-[#6e1d27] text-white'
                            : 'border-[#6e1d27]/30 bg-white/50 text-[#6e1d27] hover:border-[#6e1d27] hover:bg-[#6e1d27]/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Mail className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">Yes, set up email automation</div>
                            <div className="text-sm opacity-75">Automatically process emails with attachments and data</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setWantsEmailTrigger(false)}
                        className={`p-4 rounded-lg border-2 transition-all duration-300 font-ibm-plex hand-drawn-border ${
                          wantsEmailTrigger === false
                            ? 'border-[#6e1d27] bg-[#6e1d27] text-white'
                            : 'border-[#6e1d27]/30 bg-white/50 text-[#6e1d27] hover:border-[#6e1d27] hover:bg-[#6e1d27]/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <X className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">Skip for now</div>
                            <div className="text-sm opacity-75">I'll set this up later</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={wantsEmailTrigger === null}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 7: Email Setup or Summary */}
              {currentStep === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {wantsEmailTrigger ? (
                    // Email Setup Guide
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border">
                          <Mail className="w-8 h-8 text-[#6e1d27]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                          Email Trigger Setup
                        </h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800 font-ibm-plex">
                              <strong>Note:</strong> We currently support Gmail triggers only. Make sure to use the same email you signed up with on Datrix.
                            </div>
                          </div>
                        </div>
                      </div>

                      {emailTriggerStep === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[#3d0e15] font-ibm-plex">
                            Step 1: Go to Google Apps Script
                          </h3>
                          <div className="bg-white/50 border border-[#6e1d27]/20 rounded-lg p-4">
                            <p className="text-[#6e1d27] font-ibm-plex mb-3">
                              1. Open Google Apps Script in a new tab
                            </p>
                            <Button
                              onClick={() => window.open('https://script.google.com/', '_blank')}
                              className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Google Apps Script
                            </Button>
                          </div>
                          <Button
                            onClick={() => setEmailTriggerStep(2)}
                            className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Next: Login & Create Script
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {emailTriggerStep === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[#3d0e15] font-ibm-plex">
                            Step 2: Login & Create New Script
                          </h3>
                          <div className="bg-white/50 border border-[#6e1d27]/20 rounded-lg p-4 space-y-3">
                            <p className="text-[#6e1d27] font-ibm-plex">
                              1. Login with your Gmail account ({user?.email})
                            </p>
                            <p className="text-[#6e1d27] font-ibm-plex">
                              2. Click "New Project" to create a new script
                            </p>
                            <p className="text-[#6e1d27] font-ibm-plex">
                              3. You'll see a code editor with a default function
                            </p>
                          </div>
                          <Button
                            onClick={() => setEmailTriggerStep(3)}
                            className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Next: Paste Script
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {emailTriggerStep === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[#3d0e15] font-ibm-plex">
                            Step 3: Paste the Script
                          </h3>
                          <div className="bg-white/50 border border-[#6e1d27]/20 rounded-lg p-4 space-y-3">
                            <p className="text-[#6e1d27] font-ibm-plex">
                              1. Select all the default code and delete it
                            </p>
                            <p className="text-[#6e1d27] font-ibm-plex">
                              2. Copy and paste this script:
                            </p>
                            <div className="relative">
                              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40 border">
                                <code>{GOOGLE_APPS_SCRIPT.substring(0, 200)}...</code>
                              </pre>
                              <Button
                                onClick={copyScript}
                                className="absolute top-2 right-2 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex text-xs px-2 py-1"
                              >
                                {scriptCopied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {scriptCopied ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                          </div>
                          <Button
                            onClick={() => setEmailTriggerStep(4)}
                            className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Next: Set Up Trigger
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {emailTriggerStep === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[#3d0e15] font-ibm-plex">
                            Step 4: Create Trigger
                          </h3>
                          <div className="bg-white/50 border border-[#6e1d27]/20 rounded-lg p-4 space-y-3">
                            <p className="text-[#6e1d27] font-ibm-plex">
                              1. Click on the "Triggers" tab (clock icon) in the left sidebar
                            </p>
                            <p className="text-[#6e1d27] font-ibm-plex">
                              2. Click "Add Trigger" and set these values:
                            </p>
                            <ul className="list-disc list-inside text-[#6e1d27] font-ibm-plex text-sm space-y-1 ml-4">
                              <li>Choose function to run: <strong>main</strong></li>
                              <li>Choose deployment: <strong>head</strong></li>
                              <li>Select event source: <strong>time-driven</strong></li>
                              <li>Select type: <strong>Minutes timer</strong></li>
                              <li>Select interval: <strong>Every 5 minutes</strong> (or your preference)</li>
                            </ul>
                            <p className="text-[#6e1d27] font-ibm-plex">
                              3. Click "Save" and authorize the script when prompted
                            </p>
                          </div>
                          <Button
                            onClick={() => setEmailTriggerStep(5)}
                            className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Next: Test Trigger
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {emailTriggerStep === 5 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[#3d0e15] font-ibm-plex">
                            Step 5: Test Your Trigger
                          </h3>
                          <div className="bg-white/50 border border-[#6e1d27]/20 rounded-lg p-4 space-y-3">
                            <p className="text-[#6e1d27] font-ibm-plex">
                              Test your email trigger to make sure everything is working correctly.
                            </p>
                            <Button
                              onClick={testTrigger}
                              disabled={triggerTested}
                              className={`w-full font-ibm-plex ${
                                triggerTested
                                  ? 'bg-green-500 text-white cursor-default'
                                  : 'hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white'
                              }`}
                            >
                              {triggerTested ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Trigger Tested Successfully!
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Test Trigger
                                </>
                              )}
                            </Button>
                          </div>
                          <Button
                            onClick={finishOnboarding}
                            className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Complete Setup
                            <CheckCircle className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button
                          onClick={() => {
                            if (emailTriggerStep > 1) {
                              setEmailTriggerStep(emailTriggerStep - 1);
                            } else {
                              prevStep();
                            }
                          }}
                          variant="outline"
                          className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        {emailTriggerStep < 5 && (
                          <Button
                            onClick={() => finishOnboarding()}
                            variant="outline"
                            className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                          >
                            Skip Email Setup
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Summary & Finish (No Email Setup)
                    <div className="space-y-6">
                      <div className="text-center space-y-4">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="w-20 h-20 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border"
                        >
                          <CheckCircle className="w-10 h-10 text-[#6e1d27]" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                          You're All Set!
                        </h2>
                        <p className="text-[#6e1d27] font-ibm-plex">
                          Here's what we've set up for you:
                        </p>
                      </div>
                      
                      <div className="space-y-4 bg-white/50 p-6 rounded-lg hand-drawn-border border-2 border-[#6e1d27]/30">
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-[#6e1d27]" />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">Company:</span>
                          <span className="text-[#6e1d27] font-ibm-plex">{formData.companyName}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-[#6e1d27]" />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">Role:</span>
                          <span className="text-[#6e1d27] font-ibm-plex">{formData.role}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-[#6e1d27]" />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">Airtable:</span>
                          <span className="text-[#6e1d27] font-ibm-plex">{airtableConnected ? 'Connected' : 'Not connected'}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-[#6e1d27]" />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">Email Automation:</span>
                          <span className="text-[#6e1d27] font-ibm-plex">Skipped</span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          onClick={prevStep}
                          variant="outline"
                          className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          onClick={finishOnboarding}
                          className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white px-8 py-3 text-lg font-semibold font-ibm-plex"
                        >
                          Go to Dashboard
                          <BarChart3 className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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
          </div>
        </motion.div>
      </div>

      {/* Airtable Connection Modal */}
      <AnimatePresence>
        {selectedModal === 'airtable' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full hand-drawn-container"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="w-8 h-8" style={{ color: '#ffb700' }} />
                  <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex">
                    Connect Airtable
                  </h3>
                </div>
                
                <p className="text-[#6e1d27] font-ibm-plex">
                  Enter your Airtable Access Token to connect your bases.
                </p>

                <div className="space-y-3">
                  <Input
                    value={modalInputs.apiKey || ''}
                    onChange={e => setModalInputs(inputs => ({ ...inputs, apiKey: e.target.value }))}
                    placeholder="Access Token"
                    className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                  />
                  <Input
                    value={modalInputs.baseId || ''}
                    onChange={e => setModalInputs(inputs => ({ ...inputs, baseId: e.target.value }))}
                    placeholder="Base ID (optional)"
                    className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => setSelectedModal(null)}
                    variant="outline"
                    className="flex-1 hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={connectAirtable}
                    className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
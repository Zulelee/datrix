'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Database,
  FileSpreadsheet,
  FileText,
  Calendar,
  Slack,
  Globe,
  Server,
  Mail,
  User,
  Building2,
  Target,
  Briefcase,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Clock,
  Play,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { saveUserDataSource } from '@/lib/saveDataSource';

interface UserProfile {
  name: string;
  company: string;
  role: string;
  goal: string;
}

interface Integration {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
  comingSoon?: boolean;
}

const roleOptions = [
  'CEO / Founder',
  'Sales Manager',
  'Sales Representative',
  'Marketing Manager',
  'Data Analyst',
  'Operations Manager',
  'Business Analyst',
  'Product Manager',
  'Customer Success Manager',
  'Administrative Assistant',
  'Finance Manager',
  'HR Manager',
  'IT Manager',
  'Consultant',
  'Other'
];

export default function OnboardingPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    company: '',
    role: '',
    goal: ''
  });
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [airtableToken, setAirtableToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [wantsEmailTrigger, setWantsEmailTrigger] = useState<boolean | null>(null);
  const [emailStep, setEmailStep] = useState(1);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [testingTrigger, setTestingTrigger] = useState(false);
  const [triggerTestResult, setTriggerTestResult] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const router = useRouter();

  const totalSteps = 7;

  const integrations: Integration[] = [
    {
      id: 'airtable',
      name: 'Airtable',
      icon: Database,
      color: '#ffb700',
      connected: false
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      icon: Server,
      color: '#336791',
      connected: false,
      comingSoon: true
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      color: '#34a853',
      connected: false,
      comingSoon: true
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      color: '#000000',
      connected: false,
      comingSoon: true
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      color: '#4a154b',
      connected: false,
      comingSoon: true
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      color: '#4285f4',
      connected: false,
      comingSoon: true
    },
    {
      id: 'api',
      name: 'Custom API',
      icon: Globe,
      color: '#6366f1',
      connected: false,
      comingSoon: true
    }
  ];

  const [integrationsState, setIntegrationsState] = useState(integrations);

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
    
    // Pre-fill name from user metadata
    if (user.user_metadata?.name) {
      setUserProfile(prev => ({
        ...prev,
        name: user.user_metadata.name
      }));
    }
    
    setLoading(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleSelect = (role: string) => {
    handleProfileChange('role', role);
    setShowRoleDropdown(false);
  };

  const handleConnectAirtable = async () => {
    if (!airtableToken.trim()) {
      alert('Please enter your Airtable access token');
      return;
    }

    try {
      const { error } = await saveUserDataSource(user.id, 'airtable', {
        apiKey: airtableToken.trim()
      });

      if (error) {
        alert('Failed to save Airtable connection: ' + error.message);
        return;
      }

      // Update the integrations state
      setIntegrationsState(prev =>
        prev.map(integration =>
          integration.id === 'airtable'
            ? { ...integration, connected: true }
            : integration
        )
      );

      setSelectedModal(null);
      setAirtableToken('');

      // Show success animation
      setTimeout(() => {
        // Trigger confetti or success animation here if you have one
      }, 100);

    } catch (error) {
      console.error('Error connecting Airtable:', error);
      alert('An error occurred while connecting to Airtable');
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      // Save user profile to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name: userProfile.name,
          company: userProfile.company,
          role: userProfile.role,
          goal: userProfile.goal,
          onboarding_complete: true
        });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const googleAppsScript = `/**
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

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(googleAppsScript);
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const testTrigger = async () => {
    setTestingTrigger(true);
    setTriggerTestResult(null);

    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          source: 'onboarding-test',
          timestamp: new Date().toISOString(),
          user_email: user?.email
        }),
      });

      if (response.ok) {
        setTriggerTestResult('✅ Webhook test successful! Your trigger is working.');
      } else {
        setTriggerTestResult('❌ Webhook test failed. Please check your setup.');
      }
    } catch (error) {
      setTriggerTestResult('❌ Connection error. Please try again.');
    } finally {
      setTestingTrigger(false);
    }
  };

  if (!mounted || loading) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                Welcome to Datrix! 👋
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                Let's get you set up in just a few steps
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#3d0e15] font-ibm-plex font-medium">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-[#3d0e15] font-ibm-plex font-medium">
                  Company (optional)
                </Label>
                <Input
                  id="company"
                  value={userProfile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                  placeholder="Your company name"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                Tell us about your role 💼
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                This helps us personalize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="role" className="text-[#3d0e15] font-ibm-plex font-medium">
                  What's your role?
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="w-full hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex text-left flex items-center justify-between px-3 py-2 h-10"
                  >
                    <span className={userProfile.role ? 'text-[#3d0e15]' : 'text-[#6e1d27]/60'}>
                      {userProfile.role || 'Select your role'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#6e1d27] transition-transform duration-200 ${showRoleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showRoleDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border-2 border-[#6e1d27] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {roleOptions.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className="w-full text-left px-4 py-3 hover:bg-[#6e1d27]/10 transition-colors duration-200 font-ibm-plex text-[#3d0e15] border-b border-[#6e1d27]/10 last:border-b-0"
                          >
                            {role}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div>
                <Label htmlFor="goal" className="text-[#3d0e15] font-ibm-plex font-medium">
                  What's your main goal with Datrix?
                </Label>
                <Input
                  id="goal"
                  value={userProfile.goal}
                  onChange={(e) => handleProfileChange('goal', e.target.value)}
                  className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                  placeholder="e.g., Automate data entry, Generate reports"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                Connect Your Data Sources 🔗
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                Choose where you want to store and organize your data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrationsState.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group h-32" // Fixed height for consistency
                >
                  <div className={`h-full p-4 rounded-lg border-2 transition-all duration-300 hand-drawn-border relative flex flex-col justify-between ${
                    integration.connected
                      ? 'border-green-500 bg-green-50'
                      : integration.comingSoon
                      ? 'border-[#6e1d27]/20 bg-gray-50 opacity-60'
                      : 'border-[#6e1d27]/30 bg-white/50 hover:border-[#6e1d27] hover:bg-white/80'
                  }`}>
                    
                    {/* Coming Soon Badge */}
                    {integration.comingSoon && (
                      <div className="absolute -top-2 -right-2 bg-[#6e1d27] text-white text-xs px-2 py-1 rounded-full font-ibm-plex">
                        Coming Soon
                      </div>
                    )}

                    {/* Top section with icon and name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <integration.icon 
                          className="w-6 h-6 flex-shrink-0" 
                          style={{ color: integration.color }}
                        />
                        <span className="font-semibold text-[#3d0e15] font-ibm-plex text-sm">
                          {integration.name}
                        </span>
                      </div>
                      {integration.connected && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Bottom section with status/button */}
                    <div className="mt-3">
                      {integration.connected ? (
                        <div className="text-sm text-green-600 font-ibm-plex flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Connected
                        </div>
                      ) : integration.comingSoon ? (
                        <div className="text-sm text-gray-500 font-ibm-plex">
                          Available soon
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSelectedModal(integration.id)}
                          size="sm"
                          className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex text-xs py-1"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tooltip for coming soon items */}
                  {integration.comingSoon && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#3d0e15] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                      Coming Soon
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#3d0e15]"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="text-center text-sm text-[#6e1d27] font-ibm-plex">
              You can always add more integrations later in your profile settings
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                🎉 Great! You're all set up
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                Your data sources are connected and ready to use
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 hand-drawn-border">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="font-semibold text-green-800 font-ibm-plex">
                  Setup Complete!
                </h3>
              </div>
              <div className="space-y-2 text-sm text-green-700 font-ibm-plex">
                <p>✅ Profile information saved</p>
                <p>✅ {integrationsState.filter(i => i.connected).length} integration(s) connected</p>
                <p>✅ Ready to start organizing your data</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[#6e1d27] font-ibm-plex mb-4">
                Ready to start using Datrix? You can always come back to add more integrations.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                Email Automation Setup 📧
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                Would you like to set up automatic email processing?
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 hand-drawn-border">
              <div className="flex items-start space-x-3 mb-4">
                <Mail className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 font-ibm-plex mb-2">
                    What is Email Automation?
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700 font-ibm-plex">
                    <p>• Automatically process incoming emails with attachments</p>
                    <p>• Extract data from invoices, orders, and business documents</p>
                    <p>• Send structured data directly to your connected systems</p>
                    <p>• Save time on manual data entry</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setWantsEmailTrigger(true);
                  setCurrentStep(6);
                }}
                className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex px-8 py-3"
              >
                <Zap className="mr-2 h-5 w-5" />
                Yes, Set Up Email Automation
              </Button>
              <Button
                onClick={() => {
                  setWantsEmailTrigger(false);
                  setCurrentStep(7);
                }}
                variant="outline"
                className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex px-8 py-3"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        );

      case 6:
        if (!wantsEmailTrigger) {
          setCurrentStep(7);
          return null;
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                Email Trigger Setup 🔧
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                Follow these steps to set up your Gmail automation
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 hand-drawn-border">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-ibm-plex text-sm">
                  <strong>Important:</strong> Use the same email address you signed up with: <strong>{user?.email}</strong>
                </p>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step <= emailStep
                        ? 'bg-[#6e1d27] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              {emailStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex">
                    Step 1: Go to Google Apps Script
                  </h3>
                  <p className="text-[#6e1d27] font-ibm-plex text-sm">
                    We currently support Gmail triggers. Click the button below to open Google Apps Script.
                  </p>
                  <Button
                    onClick={() => window.open('https://script.google.com/', '_blank')}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Google Apps Script
                  </Button>
                </div>
              )}

              {emailStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex">
                    Step 2: Login and Create New Script
                  </h3>
                  <div className="space-y-2 text-[#6e1d27] font-ibm-plex text-sm">
                    <p>1. Login with your email: <strong>{user?.email}</strong></p>
                    <p>2. Click "New Project" to create a new script</p>
                    <p>3. You'll see a code editor with a default function</p>
                  </div>
                </div>
              )}

              {emailStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex">
                    Step 3: Paste the Script
                  </h3>
                  <p className="text-[#6e1d27] font-ibm-plex text-sm">
                    Replace all the default code with this script:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64 border-2 border-[#6e1d27]/20">
                      <code>{googleAppsScript}</code>
                    </pre>
                    <Button
                      onClick={copyScript}
                      size="sm"
                      className="absolute top-2 right-2 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white"
                    >
                      {scriptCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {scriptCopied && (
                    <p className="text-green-600 text-sm font-ibm-plex">
                      ✅ Script copied to clipboard!
                    </p>
                  )}
                </div>
              )}

              {emailStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex">
                    Step 4: Create Trigger
                  </h3>
                  <div className="space-y-2 text-[#6e1d27] font-ibm-plex text-sm">
                    <p>1. Click on the "Triggers" icon (clock icon) in the left sidebar</p>
                    <p>2. Click "Add Trigger" button</p>
                    <p>3. Configure the trigger with these settings:</p>
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 ml-4">
                      <p><strong>Function to run:</strong> main</p>
                      <p><strong>Deployment:</strong> Head</p>
                      <p><strong>Event source:</strong> Time-driven</p>
                      <p><strong>Type:</strong> Minutes timer</p>
                      <p><strong>Interval:</strong> Every 5 minutes (or your preference)</p>
                    </div>
                    <p>4. Click "Save" to create the trigger</p>
                  </div>
                </div>
              )}

              {emailStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#3d0e15] font-ibm-plex">
                    Step 5: Test Your Trigger
                  </h3>
                  <p className="text-[#6e1d27] font-ibm-plex text-sm">
                    Click the button below to test if your webhook is working correctly:
                  </p>
                  <Button
                    onClick={testTrigger}
                    disabled={testingTrigger}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                  >
                    {testingTrigger ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Test Trigger
                      </>
                    )}
                  </Button>
                  {triggerTestResult && (
                    <div className={`p-3 rounded border-l-4 ${
                      triggerTestResult.includes('✅') 
                        ? 'bg-green-50 border-green-400 text-green-700' 
                        : 'bg-red-50 border-red-400 text-red-700'
                    }`}>
                      <p className="font-ibm-plex text-sm">{triggerTestResult}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => setEmailStep(Math.max(1, emailStep - 1))}
                disabled={emailStep === 1}
                variant="outline"
                className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={() => {
                  if (emailStep === 5) {
                    setCurrentStep(7);
                  } else {
                    setEmailStep(emailStep + 1);
                  }
                }}
                className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
              >
                {emailStep === 5 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text mb-2">
                🎉 Welcome to Datrix!
              </h2>
              <p className="text-[#6e1d27] font-ibm-plex">
                You're all set up and ready to start organizing your data
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 hand-drawn-border">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="font-semibold text-green-800 font-ibm-plex">
                    Setup Summary
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-green-700 font-ibm-plex">
                      <strong>Profile:</strong> {userProfile.name}
                    </p>
                    {userProfile.company && (
                      <p className="text-green-700 font-ibm-plex">
                        <strong>Company:</strong> {userProfile.company}
                      </p>
                    )}
                    <p className="text-green-700 font-ibm-plex">
                      <strong>Role:</strong> {userProfile.role}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-700 font-ibm-plex">
                      <strong>Integrations:</strong> {integrationsState.filter(i => i.connected).length} connected
                    </p>
                    <p className="text-green-700 font-ibm-plex">
                      <strong>Email Automation:</strong> {wantsEmailTrigger ? 'Enabled' : 'Skipped'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleFinishOnboarding}
                className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex px-8 py-3 text-lg"
              >
                Start Using Datrix
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto">
          
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
            <div className="w-full bg-[#6e1d27]/20 rounded-full h-2">
              <motion.div
                className="bg-[#6e1d27] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hand-drawn-container bg-white/60 backdrop-blur-sm p-8 relative"
          >
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

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            {currentStep !== 6 && currentStep !== 7 && (
              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !userProfile.name.trim()) ||
                    (currentStep === 2 && !userProfile.role.trim()) ||
                    currentStep === totalSteps
                  }
                  className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                >
                  {currentStep === 4 ? 'Continue' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

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
          </motion.div>
        </div>
      </div>

      {/* Airtable Connection Modal */}
      <AnimatePresence>
        {selectedModal === 'airtable' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="hand-drawn-container bg-white p-6 rounded-lg max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="w-8 h-8 text-[#ffb700]" />
                  <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex">
                    Connect Airtable
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-700 font-ibm-plex">
                        <p className="font-semibold mb-1">Important:</p>
                        <p>Make sure your Airtable access token has <strong>read and write permissions</strong> for the bases you want to use with Datrix.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="airtable-token" className="text-[#3d0e15] font-ibm-plex font-medium">
                      Airtable Access Token
                    </Label>
                    <div className="relative">
                      <Input
                        id="airtable-token"
                        type={showToken ? "text" : "password"}
                        value={airtableToken}
                        onChange={(e) => setAirtableToken(e.target.value)}
                        placeholder="Enter your Airtable access token"
                        className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] hover:text-[#3d0e15]"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-[#6e1d27] font-ibm-plex">
                    <p className="mb-2">To get your access token:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://airtable.com/account" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">airtable.com/account</a></li>
                      <li>Navigate to the "API" section</li>
                      <li>Generate a new personal access token</li>
                      <li>Ensure it has read and write permissions</li>
                    </ol>
                  </div>
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
                    onClick={handleConnectAirtable}
                    disabled={!airtableToken.trim()}
                    className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
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
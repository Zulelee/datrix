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
  Mail, 
  FileSpreadsheet,
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
  Slack
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
}

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
  const [dataSources, setDataSources] = useState<DataSource[]>([
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
      color: '#336791'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      description: 'Connect your email accounts',
      connected: false,
      color: '#ea4335'
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Connect your Google Sheets',
      connected: false,
      color: '#34a853'
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      description: 'Connect your Notion workspace',
      connected: false,
      color: '#000000'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      description: 'Connect your Slack workspace',
      connected: false,
      color: '#4a154b'
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      description: 'Connect your calendar events',
      connected: false,
      color: '#4285f4'
    },
    {
      id: 'api',
      name: 'Custom API',
      icon: Globe,
      description: 'Connect via REST API',
      connected: false,
      color: '#6366f1'
    }
  ]);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalInputs, setModalInputs] = useState<{[key: string]: string}>({});

  const router = useRouter();

  const totalSteps = 6;
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

  useEffect(() => {
    if (user) {
      getUserDataSources(user.id).then(({ data }) => {
        setDataSources(prev =>
          prev.map(ds => {
            const found = data?.find((row: any) => row.source_type === ds.id);
            return found
              ? { ...ds, connected: true, credentials: found.credentials }
              : { ...ds, connected: false, credentials: undefined };
          })
        );
      });
    }
  }, [user]);

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      setUser(data.user);
    } else {
      router.push('/auth');
    }
    setLoading(false);
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

  const connectDataSource = async (sourceId: string) => {
    let credentials: any = {};
    if (sourceId === 'airtable') {
      credentials = {
        apiKey: modalInputs.apiKey,
        baseId: modalInputs.baseId,
      };
    } else if (sourceId === 'postgres') {
      credentials = {
        connectionString: modalInputs.connectionString,
      };
    }
    const { error } = await saveUserDataSource(user.id, sourceId as "airtable" | "postgres", credentials);
    if (error) {
      alert("Failed to save credentials: " + error.message);
      return;
    }
    setDataSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, connected: true }
          : source
      )
    );
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

  const finishOnboarding = () => {
    setShowConfetti(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const connectedCount = dataSources.filter(source => source.connected).length;

  const handleDeleteIntegration = async (sourceId: 'airtable' | 'postgres') => {
    await deleteUserDataSource(user.id, sourceId);
    setDataSources(prev => prev.map(source => source.id === sourceId ? { ...source, connected: false } : source));
  };

  const openEditModal = (sourceId: string, credentials: any) => {
    setSelectedModal(sourceId);
    setModalInputs(credentials);
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

              {/* Step 5: Connect Data Sources */}
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
                      <Zap className="w-8 h-8 text-[#6e1d27]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                      Connect Your Data Sources
                    </h2>
                    <p className="text-[#6e1d27] font-ibm-plex">
                      Choose the platforms you want to connect to Datrix
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {dataSources.map((source) => (
                      <div
                        key={source.id}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 hand-drawn-border ${
                          source.connected
                            ? 'border-green-500 bg-green-50'
                            : 'border-[#6e1d27]/30 bg-white/50 hover:border-[#6e1d27] hover:bg-[#6e1d27]/5'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <source.icon 
                            className={`w-6 h-6`} 
                            style={{ color: source.color }}
                          />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">
                            {source.name}
                          </span>
                          {/* {source.connected && (
                            // <>
                            //   <Button onClick={() => openEditModal(source.id, source.credentials)}>Edit</Button>
                            //   <Button onClick={() => handleDeleteIntegration(source.id as 'airtable' | 'postgres')}>Delete</Button>
                            // </>
                          )} */}
                        </div>
                        <p className="text-sm text-[#6e1d27] font-ibm-plex mb-3">
                          {source.description}
                        </p>
                        <Button
                          onClick={() => { setSelectedModal(source.id); setModalInputs({}); }}
                          disabled={source.connected}
                          className={`w-full text-sm font-ibm-plex ${
                            source.connected
                              ? 'bg-green-500 text-white cursor-default'
                              : 'hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white'
                          }`}
                        >
                          {source.connected ? 'Connected!' : 'Connect'}
                        </Button>
                      </div>
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
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Summary & Finish */}
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
                      <Zap className="w-5 h-5 text-[#6e1d27]" />
                      <span className="font-semibold text-[#3d0e15] font-ibm-plex">Connected Sources:</span>
                      <span className="text-[#6e1d27] font-ibm-plex">{connectedCount} platforms</span>
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

      {/* Connection Modal */}
      <AnimatePresence>
        {selectedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setSelectedModal(null); setModalInputs({}); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full hand-drawn-container"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const integration = dataSources.find(s => s.id === selectedModal);
                if (!integration) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <integration.icon className="w-8 h-8" style={{ color: integration.color }} />
                      <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex">
                        {integration.connected ? 'Edit' : 'Connect'} {integration.name}
                      </h3>
                    </div>
                    
                    <p className="text-[#6e1d27] font-ibm-plex">
                      {integration.id === 'airtable' && "Enter your Airtable API key and base ID to connect your tables."}
                      {integration.id === 'postgres' && "Provide your PostgreSQL connection string to access your database."}
                      {integration.id === 'email' && "Connect your email account to analyze your communications."}
                      {integration.id === 'sheets' && "Authorize access to your Google Sheets for data import."}
                      {integration.id === 'notion' && "Connect your Notion workspace to import your pages and databases."}
                      {integration.id === 'slack' && "Connect your Slack workspace to analyze team communications."}
                      {integration.id === 'calendar' && "Connect your Google Calendar to analyze your schedule data."}
                      {integration.id === 'api' && "Configure your custom API endpoint and authentication."}
                    </p>

                    <div className="space-y-3">
                      {/* For Airtable */}
                      {integration.id === 'airtable' && (
                        <>
                          <Input
                            value={modalInputs.apiKey || ''}
                            onChange={e => setModalInputs(inputs => ({ ...inputs, apiKey: e.target.value }))}
                            placeholder="API Key"
                            className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                          />
                          <Input
                            value={modalInputs.baseId || ''}
                            onChange={e => setModalInputs(inputs => ({ ...inputs, baseId: e.target.value }))}
                            placeholder="Base ID"
                            className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                          />
                        </>
                      )}

                      {/* For PostgreSQL */}
                      {integration.id === 'postgres' && (
                        <Input
                          value={modalInputs.connectionString || ''}
                          onChange={e => setModalInputs(inputs => ({ ...inputs, connectionString: e.target.value }))}
                          placeholder="Connection String"
                          className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                        />
                      )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        onClick={() => { setSelectedModal(null); setModalInputs({}); }}
                        variant="outline"
                        className="flex-1 hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => connectDataSource(integration.id)}
                        className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase,
  Edit3,
  Lock,
  Database,
  FileSpreadsheet,
  FileText,
  Calendar,
  Slack,
  Globe,
  Server,
  CheckCircle,
  Plus,
  Trash2,
  MessageSquare,
  Send,
  Shield,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import { saveUserDataSource, deleteUserDataSource, getUserDataSources } from '@/lib/saveDataSource';

interface Integration {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  connected: boolean;
  connectedDate?: string;
  credentials?: any;
}

function SecretInput({ value, onChange, placeholder, className = "" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className + " pr-10"}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27]"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    company: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [modalInputs, setModalInputs] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  // Mock integrations data
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'airtable',
      name: 'Airtable',
      icon: Database,
      color: '#ffb700',
      connected: true,
      connectedDate: '2024-01-10'
    },
    {
      id: 'postgres',
      name: 'PostgreSQL',
      icon: Server,
      color: '#336791',
      connected: true,
      connectedDate: '2024-01-12'
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      color: '#34a853',
      connected: false
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: FileText,
      color: '#000000',
      connected: true,
      connectedDate: '2024-01-15'
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: Slack,
      color: '#4a154b',
      connected: false
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: Calendar,
      color: '#4285f4',
      connected: false
    },
    {
      id: 'api',
      name: 'Custom API',
      icon: Globe,
      color: '#6366f1',
      connected: false
    }
  ]);

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
    setProfileData({
      name: user.user_metadata?.name || '',
      email: user.email || '',
      role: user.user_metadata?.role || 'Not specified',
      company: user.user_metadata?.company || 'Not specified'
    });
    setLoading(false);
    if (user) {
      getUserDataSources(user.id).then(({ data }) => {
        setIntegrations(prev =>
          prev.map(ds => {
            const found = data?.find((row: any) => row.source_type === ds.id);
            return found
              ? { ...ds, connected: true, credentials: found.credentials }
              : { ...ds, connected: false, credentials: undefined };
          })
        );
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleProfileUpdate = async () => {
    // Here you would update the user profile in Supabase
    console.log('Updating profile:', profileData);
    setEditingProfile(false);
    // Show success message
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Here you would update the password in Supabase
    console.log('Changing password');
    setChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    // Show success message
  };

  const handleDisconnectIntegration = async (integrationId: 'airtable' | 'postgres') => {
    await deleteUserDataSource(user.id, integrationId);
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, connected: false, credentials: undefined }
          : integration
      )
    );
  };

  const handleConnectIntegration = async (sourceId: "airtable" | "postgres", credentials: any) => {
    setLoading(true);
    const { error } = await saveUserDataSource(user.id, sourceId, credentials);
    setLoading(false);
    if (!error) {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === sourceId 
            ? { ...integration, connected: true, credentials: credentials }
            : integration
        )
      );
    } else {
      // Show error to user
    }
  };

  const handleSendFeedback = () => {
    console.log('Sending feedback:', feedbackText);
    setFeedbackText('');
    setShowFeedbackModal(false);
    // Show success message
  };

  const handleSendSupport = () => {
    console.log('Sending support message:', supportMessage);
    setSupportMessage('');
    setShowSupportModal(false);
    // Show success message
  };

  const handleDeleteIntegration = async (sourceId: 'airtable' | 'postgres') => {
    await deleteUserDataSource(user.id, sourceId);
    // Update UI: set connected to false
  };

  const openEditModal = (sourceId, credentials) => {
    setSelectedModal(sourceId);
    setModalInputs(credentials);
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
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
              Profile Settings
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Manage your account and preferences
            </p>
          </motion.div>

          <div className="space-y-8">

            {/* User Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-6 relative">
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

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center">
                    <User className="mr-3 h-6 w-6 text-[#6e1d27]" />
                    User Information
                  </h2>
                  <Button
                    onClick={() => setEditingProfile(!editingProfile)}
                    variant="outline"
                    className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {editingProfile ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {editingProfile ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Role/Title
                          </Label>
                          <Input
                            id="role"
                            value={profileData.role}
                            onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                            className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Company Name
                          </Label>
                          <Input
                            id="company"
                            value={profileData.company}
                            onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                            className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          onClick={() => setEditingProfile(false)}
                          variant="outline"
                          className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="viewing"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Full Name</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Email Address</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Role/Title</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Company</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.company}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

            {/* Account Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
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

                <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center mb-6">
                  <Settings className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  Account Actions
                </h2>

                <div className="space-y-4">
                  <Button
                    onClick={() => setChangingPassword(!changingPassword)}
                    variant="outline"
                    className="w-full justify-start hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    <Lock className="mr-3 h-5 w-5" />
                    Change Password
                  </Button>

                  <AnimatePresence>
                    {changingPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 p-4 bg-white/50 rounded-lg border border-[#6e1d27]/20"
                      >
                        <div>
                          <Label htmlFor="currentPassword" className="text-[#3d0e15] font-ibm-plex font-medium">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27]"
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newPassword" className="text-[#3d0e15] font-ibm-plex font-medium">
                            New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27]"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword" className="text-[#3d0e15] font-ibm-plex font-medium">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27]"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            onClick={() => setChangingPassword(false)}
                            variant="outline"
                            className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handlePasswordChange}
                            className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                          >
                            Update Password
                          </Button>
                        </div>
                      </motion.div>
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

            {/* Connected Integrations Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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
                    <Database className="mr-3 h-6 w-6 text-[#6e1d27]" />
                    Connected Integrations
                  </h2>
                  <Button
                    onClick={() => router.push('/onboarding')}
                    variant="outline"
                    className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Integration
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration, index) => (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 hand-drawn-border ${
                        integration.connected
                          ? 'border-green-500 bg-green-50'
                          : 'border-[#6e1d27]/30 bg-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <integration.icon 
                            className="w-6 h-6" 
                            style={{ color: integration.color }}
                          />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex">
                            {integration.name}
                          </span>
                        </div>
                        {integration.connected && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      {integration.connected ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { setSelectedModal(integration.id); setModalInputs(integration.credentials || {}); }}
                            className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDisconnectIntegration(integration.id as 'airtable' | 'postgres')}
                            variant="outline"
                            className="hand-drawn-border border-2 border-red-500 text-red-600 hover:bg-red-50 font-ibm-plex"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => { setSelectedModal(integration.id); setModalInputs({}); }}
                          size="sm"
                          className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                        >
                          Connect
                        </Button>
                      )}
                    </motion.div>
                  ))}
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

            {/* Support & Feedback Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
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

                <h2 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text flex items-center mb-6">
                  <MessageSquare className="mr-3 h-6 w-6 text-[#6e1d27]" />
                  Support & Feedback
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowSupportModal(true)}
                    variant="outline"
                    className="w-full justify-start hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex p-6 h-auto"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <Shield className="mr-2 h-5 w-5" />
                        <span className="font-semibold">Contact Support</span>
                      </div>
                      <p className="text-sm opacity-75">Get help with technical issues</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setShowFeedbackModal(true)}
                    variant="outline"
                    className="w-full justify-start hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex p-6 h-auto"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-2">
                        <Send className="mr-2 h-5 w-5" />
                        <span className="font-semibold">Send Feedback</span>
                      </div>
                      <p className="text-sm opacity-75">Share your thoughts and suggestions</p>
                    </div>
                  </Button>
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
      </div>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSupportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full hand-drawn-container"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex mb-4">
                Contact Support
              </h3>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                className="w-full h-32 p-3 hand-drawn-input bg-white border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex resize-none"
              />
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowSupportModal(false)}
                  variant="outline"
                  className="flex-1 hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendSupport}
                  className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                >
                  Send Message
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full hand-drawn-container"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex mb-4">
                Send Feedback
              </h3>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts, suggestions, or feature requests..."
                className="w-full h-32 p-3 hand-drawn-input bg-white border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex resize-none"
              />
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowFeedbackModal(false)}
                  variant="outline"
                  className="flex-1 hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendFeedback}
                  className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                >
                  Send Feedback
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
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
                const integration = integrations.find(i => i.id === selectedModal);
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
                    </p>
                    <div className="space-y-3">
                      {/* For Airtable */}
                      {integration.id === 'airtable' && (
                        <>
                          <SecretInput
                            value={modalInputs.apiKey || ''}
                            onChange={e => setModalInputs(inputs => ({ ...inputs, apiKey: e.target.value }))}
                            placeholder="API Key"
                            className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                          />
                          <SecretInput
                            value={modalInputs.baseId || ''}
                            onChange={e => setModalInputs(inputs => ({ ...inputs, baseId: e.target.value }))}
                            placeholder="Base ID"
                            className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                          />
                        </>
                      )}
                      {/* For PostgreSQL */}
                      {integration.id === 'postgres' && (
                        <SecretInput
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
                        onClick={async () => {
                          let credentials: any = {};
                          if (integration.id === 'airtable') {
                            credentials = {
                              apiKey: modalInputs.apiKey,
                              baseId: modalInputs.baseId,
                            };
                          } else if (integration.id === 'postgres') {
                            credentials = {
                              connectionString: modalInputs.connectionString,
                            };
                          }
                          const { error } = await saveUserDataSource(user.id, integration.id as "airtable" | "postgres", credentials);
                          if (!error) {
                            setIntegrations(prev =>
                              prev.map(i =>
                                i.id === integration.id
                                  ? { ...i, connected: true, credentials }
                                  : i
                              )
                            );
                            setSelectedModal(null);
                            setModalInputs({});
                          } else {
                            alert("Failed to save credentials: " + error.message);
                          }
                        }}
                        className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                      >
                        Save
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
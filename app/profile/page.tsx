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
  EyeOff,
  ChevronDown,
  Check
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    goal: ''
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

  // Integration data - only Airtable is enabled
  const [integrations, setIntegrations] = useState<Integration[]>([
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
      connected: false
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
      connected: false
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
    
    // Load user profile from database
    await loadUserProfile(user.id);
    
    // Load user data sources
    await loadUserDataSources(user.id);
    
    setLoading(false);
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
        setProfileData({
          name: data.name || '',
          email: user?.email || '',
          role: data.role || '',
          company: data.company || '',
          goal: data.goal || ''
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserDataSources = async (userId: string) => {
    try {
      const { data, error } = await getUserDataSources(userId);
      
      if (error) {
        console.error('Error loading data sources:', error);
        return;
      }

      if (data) {
        setIntegrations(prev =>
          prev.map(integration => {
            const found = data.find((source: any) => source.source_type === integration.id);
            return found
              ? { ...integration, connected: true, credentials: found.credentials, connectedDate: found.created_at }
              : integration;
          })
        );
      }
    } catch (error) {
      console.error('Error loading data sources:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profileData.name,
          role: profileData.role,
          company: profileData.company,
          goal: profileData.goal
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
        return;
      }

      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          role: profileData.role,
          company: profileData.company
        }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }

      setEditingProfile(false);
      await loadUserProfile(user.id); // Reload profile data
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        alert('Error updating password. Please try again.');
        return;
      }

      setChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password. Please try again.');
    }
  };

  const handleDisconnectIntegration = async (integrationId: 'airtable' | 'postgres') => {
    try {
      await deleteUserDataSource(user.id, integrationId);
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === integrationId
            ? { ...integration, connected: false, credentials: undefined }
            : integration
        )
      );
      alert('Integration disconnected successfully!');
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      alert('Error disconnecting integration. Please try again.');
    }
  };

  const handleConnectIntegration = async (sourceId: "airtable" | "postgres", credentials: any) => {
    setLoading(true);
    try {
      const { error } = await saveUserDataSource(user.id, sourceId, credentials);
      
      if (error) {
        console.error('Error connecting integration:', error);
        alert('Error connecting integration. Please try again.');
        return;
      }

      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === sourceId 
            ? { ...integration, connected: true, credentials: credentials }
            : integration
        )
      );
      
      setSelectedModal(null);
      setModalInputs({});
      alert('Integration connected successfully!');
    } catch (error) {
      console.error('Error connecting integration:', error);
      alert('Error connecting integration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    // Here you would implement feedback sending logic
    console.log('Sending feedback:', feedbackText);
    setFeedbackText('');
    setShowFeedbackModal(false);
    alert('Thank you for your feedback!');
  };

  const handleSendSupport = async () => {
    // Here you would implement support message sending logic
    console.log('Sending support message:', supportMessage);
    setSupportMessage('');
    setShowSupportModal(false);
    alert('Support message sent! We\'ll get back to you soon.');
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
                        {/* <div>
                          <Label htmlFor="email" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            disabled
                            className="hand-drawn-input bg-gray-100 border-2 border-[#6e1d27]/30 text-[#3d0e15] font-ibm-plex opacity-60"
                          />
                          <p className="text-xs text-[#6e1d27]/60 mt-1">Email cannot be changed</p>
                        </div> */}
                        <div>
                          <Label htmlFor="role" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Role/Title
                          </Label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                              className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex w-full text-left flex items-center justify-between px-3 py-2 h-10"
                            >
                              <span>{profileData.role || 'Select your role'}</span>
                              <motion.div
                                animate={{ rotate: showRoleDropdown ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="h-4 w-4 text-[#6e1d27]" />
                              </motion.div>
                            </button>
                            
                            <AnimatePresence>
                              {showRoleDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border-2 border-[#6e1d27] rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                >
                                  {roleOptions.map((role) => (
                                    <button
                                      key={role}
                                      type="button"
                                      onClick={() => {
                                        setProfileData({...profileData, role});
                                        setShowRoleDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-[#6e1d27]/10 transition-colors duration-200 font-ibm-plex text-[#3d0e15] flex items-center justify-between"
                                    >
                                      <span>{role}</span>
                                      {profileData.role === role && (
                                        <Check className="h-4 w-4 text-[#6e1d27]" />
                                      )}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
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
                        <div>
                          <Label htmlFor="goal" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                            Main Goal with Datrix
                          </Label>
                          <Input
                            id="goal"
                            value={profileData.goal}
                            onChange={(e) => setProfileData({...profileData, goal: e.target.value})}
                            className="hand-drawn-input bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] font-ibm-plex"
                            placeholder="What do you want to achieve with Datrix?"
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
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.name || 'Not specified'}</p>
                        </div>
                      </div>
                      {/* <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Email Address</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.email}</p>
                        </div>
                      </div> */}
                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Role/Title</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.role || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-[#6e1d27]" />
                        <div>
                          <p className="text-sm text-[#6e1d27] font-ibm-plex">Company</p>
                          <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.company || 'Not specified'}</p>
                        </div>
                      </div>
                      {profileData.goal && (
                        <div className="flex items-start space-x-3">
                          <Settings className="w-5 h-5 text-[#6e1d27] mt-1" />
                          <div>
                            <p className="text-sm text-[#6e1d27] font-ibm-plex">Main Goal</p>
                            <p className="font-semibold text-[#3d0e15] font-ibm-plex">{profileData.goal}</p>
                          </div>
                        </div>
                      )}
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
                      className={`h-32 p-4 rounded-lg border-2 transition-all duration-300 hand-drawn-border flex flex-col justify-between ${
                        integration.connected
                          ? 'border-green-500 bg-green-50'
                          : integration.id === 'airtable'
                          ? 'border-[#6e1d27]/30 bg-white/50 hover:border-[#6e1d27] hover:bg-white/70'
                          : 'border-[#6e1d27]/20 bg-gray-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <integration.icon 
                            className="w-6 h-6" 
                            style={{ color: integration.color }}
                          />
                          <span className="font-semibold text-[#3d0e15] font-ibm-plex text-sm">
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
                            className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex text-xs px-2 py-1 h-7"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDisconnectIntegration(integration.id as 'airtable' | 'postgres')}
                            variant="outline"
                            className="hand-drawn-border border-2 border-red-500 text-red-600 hover:bg-red-50 font-ibm-plex text-xs px-2 py-1 h-7"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      ) : integration.id === 'airtable' ? (
                        <Button
                          onClick={() => { setSelectedModal(integration.id); setModalInputs({}); }}
                          size="sm"
                          className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex text-xs h-7"
                        >
                          Connect
                        </Button>
                      ) : (
                        <div className="text-center">
                          <span className="text-xs text-gray-500 font-ibm-plex">Coming Soon</span>
                        </div>
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

      {/* Airtable Connection Modal */}
      <AnimatePresence>
        {selectedModal === 'airtable' && (
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
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="w-8 h-8" style={{ color: '#ffb700' }} />
                  <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex">
                    {integrations.find(i => i.id === 'airtable')?.connected ? 'Edit' : 'Connect'} Airtable
                  </h3>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-ibm-plex">
                    <strong>Important:</strong> Make sure your Airtable access token has <strong>read and write permissions</strong> for the bases you want to use with Datrix.
                  </p>
                </div>
                <p className="text-[#6e1d27] font-ibm-plex text-sm">
                  Enter your Airtable Access Token to connect your tables and bases.
                </p>
                <div className="space-y-3">
                  <SecretInput
                    value={modalInputs.apiKey || ''}
                    onChange={e => setModalInputs(inputs => ({ ...inputs, apiKey: e.target.value }))}
                    placeholder="Airtable Access Token"
                    className="hand-drawn-input bg-white border-2 border-[#6e1d27] font-ibm-plex"
                  />
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
                      const credentials = {
                        apiKey: modalInputs.apiKey,
                      };
                      await handleConnectIntegration('airtable', credentials);
                    }}
                    disabled={!modalInputs.apiKey}
                    className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                  >
                    {integrations.find(i => i.id === 'airtable')?.connected ? 'Update' : 'Connect'}
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
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Mail,
  FileSpreadsheet,
  FileText,
  Calendar,
  Slack,
  Globe,
  Server,
  Upload,
  BarChart3,
  Sparkles,
  TrendingUp,
  Bot,
  ChevronDown,
  ChevronUp,
  Coffee,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';

interface DataRun {
  id: string;
  user_id: string;
  run_time: string;
  data_type: string;
  source: string;
  destination: string;
  status: string;
}

const getDestinationIcon = (destination: string) => {
  const dest = destination.toLowerCase();
  if (dest.includes('airtable')) return Database;
  if (dest.includes('postgres') || dest.includes('postgresql')) return Server;
  if (dest.includes('sheets') || dest.includes('google sheets')) return FileSpreadsheet;
  if (dest.includes('notion')) return FileText;
  if (dest.includes('slack')) return Slack;
  if (dest.includes('calendar')) return Calendar;
  if (dest.includes('api')) return Globe;
  return Database; // Default
};

const getDestinationColor = (destination: string) => {
  const dest = destination.toLowerCase();
  if (dest.includes('airtable')) return '#ffb700';
  if (dest.includes('postgres') || dest.includes('postgresql')) return '#336791';
  if (dest.includes('sheets') || dest.includes('google sheets')) return '#34a853';
  if (dest.includes('notion')) return '#000000';
  if (dest.includes('slack')) return '#4a154b';
  if (dest.includes('calendar')) return '#4285f4';
  if (dest.includes('api')) return '#6366f1';
  return '#6e1d27'; // Default
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataRuns, setDataRuns] = useState<DataRun[]>([]);
  const [showAllRuns, setShowAllRuns] = useState(false);
  const router = useRouter();

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
    await loadUserRuns(user.id);
    setLoading(false);
  };

  const loadUserRuns = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('user_id', userId)
        .order('run_time', { ascending: false })
        .limit(50); // Limit to last 50 runs

      if (error) {
        console.error('Error loading runs:', error);
        return;
      }

      if (data) {
        setDataRuns(data);
      }
    } catch (error) {
      console.error('Error loading runs:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'In Progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'Email' ? Mail : Bot;
  };

  const getSourceColor = (source: string) => {
    return source === 'Email' ? '#ea4335' : '#6e1d27';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show only first 5 runs unless "Show More" is clicked
  const displayedRuns = showAllRuns ? dataRuns : dataRuns.slice(0, 5);

  // Punny empty state messages
  const emptyStateMessages = [
    "No runs found... looks like your data is taking a coffee break! ☕",
    "Zero runs detected... your data must be running fashionably late! 🏃‍♂️",
    "No runs in sight... even your data needs a day off sometimes! 😴",
    "Run count: 0... your data is probably stuck in traffic! 🚗",
    "No runs found... your data is playing hide and seek! 🙈",
    "Empty runs table... your data is on a lunch break! 🥪",
    "No runs detected... your data is probably binge-watching Netflix! 📺",
    "Zero runs... your data is taking the scenic route! 🌄"
  ];

  const randomEmptyMessage = emptyStateMessages[Math.floor(Math.random() * emptyStateMessages.length)];

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
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
              Hello {user?.user_metadata?.name || 'there'}!
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Here's what's happening with your data
            </p>
          </motion.div>

          {/* Top Half - Recent Data Runs Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-8"
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

              <h2 className="text-2xl font-bold text-[#3d0e15] mb-6 font-ibm-plex hand-drawn-text">
                Recent Data Runs
              </h2>

              {/* Table or Empty State */}
              {dataRuns.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16"
                >
                  <div className="mb-6">
                    <Coffee className="w-16 h-16 text-[#6e1d27]/30 mx-auto mb-4" />
                    <Zap className="w-8 h-8 text-[#6e1d27]/20 mx-auto animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex mb-2 hand-drawn-text">
                    {randomEmptyMessage}
                  </h3>
                  <p className="text-[#6e1d27] font-ibm-plex mb-6">
                    Start by uploading some data or connecting your integrations to see your runs here.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => router.push('/datrixai')}
                      className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Try DatrixAI
                    </Button>
                    <Button
                      onClick={() => router.push('/profile')}
                      variant="outline"
                      className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Connect Integrations
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#6e1d27]/20">
                          <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Date & Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Data Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Source</th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Destination</th>
                          <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedRuns.map((run, index) => {
                          const SourceIcon = getSourceIcon(run.source);
                          const DestinationIcon = getDestinationIcon(run.destination);
                          return (
                            <motion.tr
                              key={run.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                              className="border-b border-[#6e1d27]/10 hover:bg-[#6e1d27]/5 transition-colors duration-200"
                            >
                              <td className="py-3 px-4 text-[#6e1d27] font-ibm-plex">
                                <div>
                                  <div className="font-medium">{formatDate(run.run_time)}</div>
                                  <div className="text-sm opacity-75">{formatTime(run.run_time)}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[#6e1d27] font-ibm-plex font-medium">
                                {run.data_type}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <SourceIcon 
                                    className="w-5 h-5" 
                                    style={{ color: getSourceColor(run.source) }}
                                  />
                                  <span className="text-[#6e1d27] font-ibm-plex font-medium">
                                    {run.source}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <DestinationIcon 
                                    className="w-5 h-5" 
                                    style={{ color: getDestinationColor(run.destination) }}
                                  />
                                  <span className="text-[#6e1d27] font-ibm-plex font-medium">
                                    {run.destination}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(run.status)}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(run.status)} font-ibm-plex`}>
                                    {run.status}
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Show More/Less Button */}
                  {dataRuns.length > 5 && (
                    <div className="flex justify-center mt-6">
                      <Button
                        onClick={() => setShowAllRuns(!showAllRuns)}
                        variant="outline"
                        className="hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex transition-all duration-300"
                      >
                        {showAllRuns ? (
                          <>
                            Show Less
                            <ChevronUp className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Show More ({dataRuns.length - 5} more)
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
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
            </div>
          </motion.div>

          {/* Bottom Half - Two Feature CTAs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left CTA - Datrix AI */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="group"
            >
              <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-8 relative h-full hover:scale-105 transition-transform duration-300">
                {/* Decorative elements */}
                <div className="absolute top-3 left-3 w-6 h-6 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <svg viewBox="0 0 32 32" className="w-full h-full text-[#6e1d27]">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="hand-drawn-path" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 w-4 h-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                    <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>

                <div className="text-center space-y-6">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-[#6e1d27]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                    Drop Files to Add to CRM/Database
                  </h3>

                  {/* Description */}
                  <p className="text-[#6e1d27] font-ibm-plex leading-relaxed">
                    Drag and drop your files here to quickly add new contacts, deals, or records to your connected CRM or database. Effortless data import, no manual entry required.
                  </p>

                  {/* Upload Icon Illustration */}
                  <div className="flex justify-center py-4">
                    <div className="relative">
                      <div className="w-20 h-20 border-2 border-dashed border-[#6e1d27]/40 rounded-lg flex items-center justify-center group-hover:border-[#6e1d27]/60 transition-colors duration-300">
                        <Upload className="w-8 h-8 text-[#6e1d27]/60 group-hover:text-[#6e1d27] transition-colors duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6e1d27] rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => router.push('/datrixai')}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white px-8 py-3 text-lg font-semibold font-ibm-plex group-hover:scale-105 transition-all duration-300"
                  >
                    Datrix AI
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Bottom decorative doodles */}
                <div className="absolute bottom-2 left-2 w-6 h-3 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                  <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                    <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                    <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Right CTA - Sales Analysis */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="group"
            >
              <div className="hand-drawn-container bg-white/60 backdrop-blur-sm p-8 relative h-full hover:scale-105 transition-transform duration-300">
                {/* Decorative elements */}
                <div className="absolute top-3 left-3 w-6 h-6 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <svg viewBox="0 0 32 32" className="w-full h-full text-[#6e1d27]">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="hand-drawn-path" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 w-4 h-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                    <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>

                <div className="text-center space-y-6">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto bg-[#6e1d27]/10 rounded-full flex items-center justify-center hand-drawn-border group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-8 h-8 text-[#6e1d27]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#3d0e15] font-ibm-plex hand-drawn-text">
                    Sales Analysis Dashboard
                  </h3>

                  {/* Description */}
                  <p className="text-[#6e1d27] font-ibm-plex leading-relaxed">
                    Unlock actionable insights from your sales data. View trends, performance metrics, and key analytics to drive smarter decisions.
                  </p>

                  {/* Chart Icon Illustration */}
                  <div className="flex justify-center py-4">
                    <div className="relative">
                      <div className="w-20 h-20 border-2 border-[#6e1d27]/40 rounded-lg flex items-center justify-center group-hover:border-[#6e1d27]/60 transition-colors duration-300 bg-[#6e1d27]/5">
                        <BarChart3 className="w-8 h-8 text-[#6e1d27]/60 group-hover:text-[#6e1d27] transition-colors duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6e1d27] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={() => router.push('/stickyanalysis')}
                    className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white px-8 py-3 text-lg font-semibold font-ibm-plex group-hover:scale-105 transition-all duration-300"
                  >
                    Go to Sales Analysis
                    <BarChart3 className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Bottom decorative doodles */}
                <div className="absolute bottom-2 left-2 w-6 h-3 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                  <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                    <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2 w-4 h-4 opacity-15 group-hover:opacity-25 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                    <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
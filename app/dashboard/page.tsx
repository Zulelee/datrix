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
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';

interface DataRun {
  id: string;
  date: string;
  time: string;
  dataType: string;
  source: string;
  status: 'Success' | 'Failed' | 'In Progress';
  icon: React.ComponentType<any>;
  sourceColor: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Mock data for the past 10 runs
  const [dataRuns] = useState<DataRun[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '14:32',
      dataType: 'Contacts',
      source: 'Airtable',
      status: 'Success',
      icon: Database,
      sourceColor: '#ffb700'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '13:45',
      dataType: 'Deals',
      source: 'Email',
      status: 'Success',
      icon: Mail,
      sourceColor: '#ea4335'
    },
    {
      id: '3',
      date: '2024-01-15',
      time: '12:18',
      dataType: 'Leads',
      source: 'Google Sheets',
      status: 'In Progress',
      icon: FileSpreadsheet,
      sourceColor: '#34a853'
    },
    {
      id: '4',
      date: '2024-01-15',
      time: '11:22',
      dataType: 'Tasks',
      source: 'Notion',
      status: 'Success',
      icon: FileText,
      sourceColor: '#000000'
    },
    {
      id: '5',
      date: '2024-01-15',
      time: '10:55',
      dataType: 'Messages',
      source: 'Slack',
      status: 'Failed',
      icon: Slack,
      sourceColor: '#4a154b'
    },
    {
      id: '6',
      date: '2024-01-15',
      time: '09:30',
      dataType: 'Events',
      source: 'Google Calendar',
      status: 'Success',
      icon: Calendar,
      sourceColor: '#4285f4'
    },
    {
      id: '7',
      date: '2024-01-14',
      time: '16:45',
      dataType: 'Customers',
      source: 'PostgreSQL',
      status: 'Success',
      icon: Server,
      sourceColor: '#336791'
    },
    {
      id: '8',
      date: '2024-01-14',
      time: '15:12',
      dataType: 'Orders',
      source: 'Custom API',
      status: 'Success',
      icon: Globe,
      sourceColor: '#6366f1'
    },
    {
      id: '9',
      date: '2024-01-14',
      time: '14:08',
      dataType: 'Contacts',
      source: 'Airtable',
      status: 'Success',
      icon: Database,
      sourceColor: '#ffb700'
    },
    {
      id: '10',
      date: '2024-01-14',
      time: '13:25',
      dataType: 'Invoices',
      source: 'Email',
      status: 'Success',
      icon: Mail,
      sourceColor: '#ea4335'
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
    setLoading(false);
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
              Welcome back, {user?.user_metadata?.name || 'there'}!
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Here's what's happening with your data
            </p>
          </motion.div>

          {/* Top Half - Past 10 Runs Table */}
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#6e1d27]/20">
                      <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Data Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Source</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#3d0e15] font-ibm-plex">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataRuns.map((run, index) => (
                      <motion.tr
                        key={run.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                        className="border-b border-[#6e1d27]/10 hover:bg-[#6e1d27]/5 transition-colors duration-200"
                      >
                        <td className="py-3 px-4 text-[#6e1d27] font-ibm-plex">
                          <div>
                            <div className="font-medium">{run.date}</div>
                            <div className="text-sm opacity-75">{run.time}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#6e1d27] font-ibm-plex font-medium">
                          {run.dataType}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <run.icon 
                              className="w-5 h-5" 
                              style={{ color: run.sourceColor }}
                            />
                            <span className="text-[#6e1d27] font-ibm-plex font-medium">
                              {run.source}
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
                    ))}
                  </tbody>
                </table>
              </div>

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
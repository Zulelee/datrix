'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  Plus,
  X,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Target,
  Calendar,
  Maximize2,
  Minimize2,
  Move,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';

interface StickyChart {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'area' | 'donut';
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  data?: any;
  rotation: number;
}

const analysisTypes = [
  { id: 'sales-reporting', name: 'Sales Reporting', icon: DollarSign, color: '#10b981' },
  { id: 'financial-summaries', name: 'Financial Summaries', icon: BarChart3, color: '#3b82f6' },
  { id: 'sales-forecasting', name: 'Sales Forecasting', icon: TrendingUp, color: '#8b5cf6' },
  { id: 'cluster-analysis', name: 'Customer Segments', icon: Users, color: '#f59e0b' },
  { id: 'product-performance', name: 'Product Performance', icon: Target, color: '#ef4444' },
  { id: 'time-analysis', name: 'Time Analysis', icon: Calendar, color: '#06b6d4' }
];

export default function StickyAnalysisPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [charts, setCharts] = useState<StickyChart[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const [draggedChart, setDraggedChart] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkUser();
    initializeBoard();
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

  const initializeBoard = () => {
    // Add some sample charts to start with
    const sampleCharts: StickyChart[] = [
      {
        id: '1',
        title: 'Q1 Sales Performance',
        type: 'bar',
        description: 'Monthly sales data for Q1 2024',
        position: { x: 50, y: 100 },
        size: { width: 300, height: 200 },
        color: '#10b981',
        rotation: -1
      },
      {
        id: '2',
        title: 'Customer Segments',
        type: 'pie',
        description: 'Customer distribution by segment',
        position: { x: 400, y: 150 },
        size: { width: 280, height: 180 },
        color: '#f59e0b',
        rotation: 2
      },
      {
        id: '3',
        title: 'Revenue Trend',
        type: 'line',
        description: 'Revenue growth over time',
        position: { x: 750, y: 80 },
        size: { width: 320, height: 220 },
        color: '#3b82f6',
        rotation: -0.5
      }
    ];
    setCharts(sampleCharts);
  };

  const handleAddChart = () => {
    if (!selectedAnalysisType || !analysisDescription.trim()) return;

    const analysisType = analysisTypes.find(type => type.id === selectedAnalysisType);
    if (!analysisType) return;

    const newChart: StickyChart = {
      id: Date.now().toString(),
      title: analysisDescription,
      type: 'bar', // Default type, could be dynamic based on analysis
      description: `Generated from: ${analysisDescription}`,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 150 
      },
      size: { width: 300, height: 200 },
      color: analysisType.color,
      rotation: (Math.random() - 0.5) * 4 // Random rotation between -2 and 2 degrees
    };

    setCharts(prev => [...prev, newChart]);
    setShowAddModal(false);
    setSelectedAnalysisType('');
    setAnalysisDescription('');
  };

  const handleDeleteChart = (chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const handleMouseDown = (e: React.MouseEvent, chartId: string) => {
    e.preventDefault();
    const chart = charts.find(c => c.id === chartId);
    if (!chart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedChart(chartId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedChart || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - boardRect.left - dragOffset.x;
    const newY = e.clientY - boardRect.top - dragOffset.y;

    setCharts(prev => prev.map(chart => 
      chart.id === draggedChart 
        ? { ...chart, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : chart
    ));
  };

  const handleMouseUp = () => {
    setDraggedChart(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const renderChart = (chart: StickyChart) => {
    const chartContent = () => {
      switch (chart.type) {
        case 'bar':
          return (
            <svg viewBox="0 0 200 120" className="w-full h-full">
              {[40, 60, 80, 55, 70].map((height, index) => (
                <rect
                  key={index}
                  x={20 + index * 30}
                  y={120 - height}
                  width={20}
                  height={height}
                  fill={chart.color}
                  opacity={0.8}
                />
              ))}
            </svg>
          );
        case 'pie':
          return (
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <circle cx="60" cy="60" r="40" fill="none" stroke={chart.color} strokeWidth="2" />
              <path d="M 60 20 A 40 40 0 0 1 100 60 L 60 60 Z" fill={chart.color} opacity="0.8" />
              <path d="M 100 60 A 40 40 0 0 1 60 100 L 60 60 Z" fill={chart.color} opacity="0.6" />
              <path d="M 60 100 A 40 40 0 0 1 20 60 L 60 60 Z" fill={chart.color} opacity="0.4" />
            </svg>
          );
        case 'line':
          return (
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <polyline
                points="20,100 50,70 80,80 110,50 140,60 170,30"
                fill="none"
                stroke={chart.color}
                strokeWidth="3"
              />
              {[20, 50, 80, 110, 140, 170].map((x, index) => {
                const y = [100, 70, 80, 50, 60, 30][index];
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={chart.color}
                  />
                );
              })}
            </svg>
          );
        default:
          return (
            <div className="w-full h-full flex items-center justify-center">
              <BarChart3 className="w-12 h-12" style={{ color: chart.color }} />
            </div>
          );
      }
    };

    return chartContent();
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
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-8 h-screen overflow-hidden">
        <div className="max-w-full mx-auto h-full">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
              Sticky Analysis Board
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Drag, drop, and organize your insights like sticky notes
            </p>
          </motion.div>

          {/* Analysis Board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-full"
          >
            <div className="hand-drawn-container bg-white/40 backdrop-blur-sm relative h-full overflow-hidden">
              {/* Decorative corner doodles */}
              <div className="absolute top-2 left-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute top-2 right-2 w-4 h-4 opacity-30 z-10">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-drawn-path" />
                </svg>
              </div>

              {/* Board Area */}
              <div 
                ref={boardRef}
                className="relative w-full h-full p-6 cursor-default"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
                </div>

                {/* Sticky Charts */}
                <AnimatePresence>
                  {charts.map((chart, index) => (
                    <motion.div
                      key={chart.id}
                      initial={{ opacity: 0, scale: 0.8, rotate: chart.rotation }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotate: chart.rotation,
                        x: chart.position.x,
                        y: chart.position.y
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="absolute group cursor-move"
                      style={{
                        width: chart.size.width,
                        height: chart.size.height,
                        zIndex: draggedChart === chart.id ? 50 : 10
                      }}
                      onMouseDown={(e) => handleMouseDown(e, chart.id)}
                    >
                      {/* Sticky Note Container */}
                      <div 
                        className="relative w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 group-hover:scale-105"
                        style={{ 
                          borderLeftColor: chart.color,
                          transform: `rotate(${chart.rotation}deg)`,
                          boxShadow: `4px 4px 12px rgba(110, 29, 39, 0.15), 0 0 0 1px ${chart.color}20`
                        }}
                      >
                        {/* Sticky Note Header */}
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-[#3d0e15] font-ibm-plex text-sm mb-1 hand-drawn-text">
                                {chart.title}
                              </h3>
                              <p className="text-xs text-[#6e1d27] font-ibm-plex opacity-75">
                                {chart.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChart(chart.id);
                                }}
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Chart Content */}
                        <div className="p-4 h-full">
                          <div className="w-full h-full flex items-center justify-center">
                            {renderChart(chart)}
                          </div>
                        </div>

                        {/* Sticky Note Corner Fold */}
                        <div 
                          className="absolute top-0 right-0 w-6 h-6 bg-gray-200 opacity-30"
                          style={{
                            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
                            borderTopRightRadius: '8px'
                          }}
                        />

                        {/* Move Handle */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Move className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty State */}
                {charts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Sparkles className="w-16 h-16 text-[#6e1d27]/30 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#3d0e15] font-ibm-plex mb-2">
                        Your analysis board is empty
                      </h3>
                      <p className="text-[#6e1d27] font-ibm-plex mb-4">
                        Add your first chart to get started with insights
                      </p>
                      <Button
                        onClick={() => setShowAddModal(true)}
                        className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Chart
                      </Button>
                    </div>
                  </div>
                )}
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
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-16 h-16 rounded-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Add Chart Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full hand-drawn-container"
              onClick={(e) => e.stopPropagation()}
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

              <h3 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex mb-6 hand-drawn-text">
                Add New Chart
              </h3>

              <div className="space-y-6">
                {/* Analysis Type Selection */}
                <div>
                  <Label className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text mb-3 block">
                    Analysis Type
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {analysisTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedAnalysisType(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 font-ibm-plex text-sm hand-drawn-border ${
                          selectedAnalysisType === type.id
                            ? 'border-[#6e1d27] bg-[#6e1d27] text-white'
                            : 'border-[#6e1d27]/30 bg-white/50 text-[#6e1d27] hover:border-[#6e1d27] hover:bg-[#6e1d27]/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <type.icon 
                            className="w-4 h-4" 
                            style={{ color: selectedAnalysisType === type.id ? 'white' : type.color }}
                          />
                          <span className="text-xs">{type.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Input */}
                <div>
                  <Label htmlFor="description" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                    Describe the data you want to analyze
                  </Label>
                  <textarea
                    id="description"
                    value={analysisDescription}
                    onChange={(e) => setAnalysisDescription(e.target.value)}
                    placeholder="e.g., Show me sales by region for Q1, Customer segments by purchase behavior..."
                    className="w-full h-24 mt-2 p-3 hand-drawn-input bg-white border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-6">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1 hand-drawn-border border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddChart}
                  disabled={!selectedAnalysisType || !analysisDescription.trim()}
                  className="flex-1 hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white font-ibm-plex disabled:opacity-50"
                >
                  Add Chart
                </Button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { 
  Plus,
  DollarSign,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { OnboardingNavbar } from '@/components/Navbar';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import ChartNode from '@/components/ChartNode';

import 'reactflow/dist/style.css';

const nodeTypes = {
  chartNode: ChartNode,
};

const analysisTypes = [
  { id: 'sales-reporting', name: 'Sales Reporting', icon: DollarSign, color: '#10b981' },
  { id: 'financial-summaries', name: 'Financial Summaries', icon: BarChart3, color: '#3b82f6' },
  { id: 'sales-forecasting', name: 'Sales Forecasting', icon: TrendingUp, color: '#8b5cf6' },
  { id: 'cluster-analysis', name: 'Customer Segments', icon: Users, color: '#f59e0b' },
  { id: 'product-performance', name: 'Product Performance', icon: Target, color: '#ef4444' },
  { id: 'time-analysis', name: 'Time Analysis', icon: Calendar, color: '#06b6d4' }
];

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'chartNode',
    position: { x: 100, y: 100 },
    data: {
      title: 'Q1 Sales Performance',
      type: 'bar',
      description: 'Monthly sales data for Q1 2024',
      color: '#10b981',
      onDelete: () => {}
    }
  },
  {
    id: '2',
    type: 'chartNode',
    position: { x: 500, y: 150 },
    data: {
      title: 'Customer Segments',
      type: 'pie',
      description: 'Customer distribution by segment',
      color: '#f59e0b',
      onDelete: () => {}
    }
  },
  {
    id: '3',
    type: 'chartNode',
    position: { x: 900, y: 80 },
    data: {
      title: 'Revenue Trend',
      type: 'line',
      description: 'Revenue growth over time',
      color: '#3b82f6',
      onDelete: () => {}
    }
  }
];

const initialEdges: Edge[] = [];

function StickyAnalysisFlow() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    checkUser();
  }, []);

  // Update delete handlers when nodes change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteChart
        }
      }))
    );
  }, [setNodes]);

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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddChart = () => {
    if (!selectedAnalysisType || !analysisDescription.trim()) return;

    const analysisType = analysisTypes.find(type => type.id === selectedAnalysisType);
    if (!analysisType) return;

    const chartTypes = ['bar', 'pie', 'line', 'area', 'donut'] as const;
    const randomType = chartTypes[Math.floor(Math.random() * chartTypes.length)];

    const newNode: Node = {
      id: Date.now().toString(),
      type: 'chartNode',
      position: { 
        x: Math.random() * 800 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: {
        title: analysisDescription,
        type: randomType,
        description: `Generated from: ${analysisDescription}`,
        color: analysisType.color,
        onDelete: handleDeleteChart
      }
    };

    setNodes((nds) => nds.concat(newNode));
    setShowAddModal(false);
    setSelectedAnalysisType('');
    setAnalysisDescription('');
  };

  const handleDeleteChart = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleFitView = () => {
    fitView({ duration: 800 });
  };

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
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

          {/* React Flow Board */}
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

              {/* React Flow Container */}
              <div className="w-full h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-left"
                  className="bg-transparent"
                  nodesDraggable={true}
                  nodesConnectable={false}
                  elementsSelectable={true}
                  selectNodesOnDrag={false}
                  panOnDrag={true}
                  zoomOnScroll={true}
                  zoomOnPinch={true}
                  zoomOnDoubleClick={false}
                  minZoom={0.2}
                  maxZoom={2}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                >
                  <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={40} 
                    size={1} 
                    color="#6e1d27" 
                    style={{ opacity: 0.1 }}
                  />
                  
                  {/* Custom Controls */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                    <Button
                      onClick={handleZoomIn}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border bg-white/80 backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex p-2"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleZoomOut}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border bg-white/80 backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex p-2"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleFitView}
                      variant="outline"
                      size="sm"
                      className="hand-drawn-border bg-white/80 backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white font-ibm-plex p-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mini Map */}
                  <MiniMap 
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      border: '2px solid #6e1d27',
                      borderRadius: '8px'
                    }}
                    maskColor="rgba(110, 29, 39, 0.1)"
                    nodeColor="#6e1d27"
                    position="bottom-right"
                  />
                </ReactFlow>
              </div>

              {/* Empty State Overlay */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center p-8 pointer-events-auto">
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

              {/* Bottom decorative doodles */}
              <div className="absolute bottom-2 left-2 w-6 h-3 opacity-20 z-10">
                <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                  <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 opacity-20 z-10">
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

export default function StickyAnalysisPage() {
  return (
    <ReactFlowProvider>
      <StickyAnalysisFlow />
    </ReactFlowProvider>
  );
}
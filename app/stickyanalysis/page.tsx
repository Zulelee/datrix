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
  // Start with empty nodes - we'll load from DB or add as user creates
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const router = useRouter();
  const [analysisId, setAnalysisId] = useState<string | null>(null);

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

    // After we have the user, try loading their existing analysis
    const { data: existingAnalysis, error: fetchError } = await supabase
      .from('analysis')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!fetchError && existingAnalysis && existingAnalysis.analysis_json) {
      // Load nodes & edges from DB
      const { nodes: savedNodes = [], edges: savedEdges = [] } = existingAnalysis.analysis_json as any;

      // Re-attach delete handlers to loaded nodes
      const nodesWithHandlers = (savedNodes as Node[]).map((n) => ({
        ...n,
        data: {
          ...n.data,
          onDelete: handleDeleteChart,
        },
      }));

      setNodes(nodesWithHandlers);
      setEdges(savedEdges);
      setAnalysisId(existingAnalysis.id);
    }
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

  const handleRunAIAnalysis = async () => {
    if (!selectedAnalysisType || !analysisDescription.trim()) return;
    
    try {
      setIsAnalyzing(true);
      setAnalysisResult('');
      
      // Step 1: Get streaming analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          analysisType: selectedAnalysisType,
          messages: [
            {
              role: 'user',
              content: analysisDescription
            }
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis request failed: ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        fullText += chunk;

        // Don't update UI with streaming text anymore
      }

      // Step 2: Format the analysis into proper JSON
      const formatResponse = await fetch('/api/analyze/format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisText: fullText
        }),
      });

      if (!formatResponse.ok) {
        throw new Error(`Formatting request failed: ${formatResponse.status}`);
      }

      const formattedData = await formatResponse.json();
      console.log('Formatted analysis:', formattedData);

      // Set the final explanation text
      setAnalysisResult(formattedData.explanation || 'Analysis completed');

      // Add chart components to the board
      if (formattedData.components && Array.isArray(formattedData.components)) {
        const analysisType = analysisTypes.find(type => type.id === selectedAnalysisType);
        
        const newNodes = formattedData.components.map((component) => {
          return {
            id: component.id || `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'chartNode',
            position: component.position || { 
              x: Math.random() * 800 + 100, 
              y: Math.random() * 400 + 100 
            },
            data: {
              title: component.data.title,
              type: component.data.chartType || 'bar',
              description: analysisDescription,
              chartData: component.data.dataset,
              color: analysisType?.color || '#10b981',
              onDelete: handleDeleteChart
            }
          };
        });
        
        setNodes((nds) => [...nds, ...newNodes]);
      }
      
    } catch (error) {
      console.error('Error running AI analysis:', error);
      setAnalysisResult('Error running analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setShowAddModal(false);
      setSelectedAnalysisType('');
      setAnalysisDescription('');
    }
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

  // Persist analysis whenever nodes or edges change (debounced)
  useEffect(() => {
    if (!user) return;

    // Use a longer debounce for brand-new boards to avoid saving every second during creation
    const debounceDelay = analysisId ? 2000 : 5000;

    const timeout = setTimeout(async () => {
      const payload: Record<string, any> = {
        user_id: user.id,
        analysis_json: { nodes, edges },
      };

      if (analysisId) {
        payload.id = analysisId;
      }

      const { data: saved, error: saveError } = await supabase
        .from('analysis')
        .upsert(payload)
        .select();

      if (saveError) {
        console.error('Failed to save analysis:', saveError);
      }

      // If this was a new analysis, store its id for future updates
      if (!analysisId && saved && saved.length > 0) {
        setAnalysisId(saved[0].id);
      }
    }, debounceDelay);

    return () => clearTimeout(timeout);
  }, [nodes, edges, user, analysisId]);

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

      {/* Main Content - Fixed height layout */}
      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-4" style={{ height: '100vh' }}>
        <div className="max-w-full mx-auto h-full flex flex-col">
          
          {/* Header - Fixed height */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-6 flex-shrink-0"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
              Sticky Analysis Board
            </h1>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex">
              Drag, drop, and organize your insights like sticky notes
            </p>
          </motion.div>

          {/* React Flow Board - Takes remaining height */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex-1 min-h-0"
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

      {/* Add Analysis Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="hand-drawn-container bg-white p-6 rounded-lg max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[#3d0e15] mb-4 font-ibm-plex hand-drawn-text">
                Run AI Analysis
              </h2>
              
              <div className="mb-6">
                <Label className="font-ibm-plex mb-2 block">Select Analysis Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {analysisTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedAnalysisType === type.id ? "default" : "outline"}
                      className={`flex items-center justify-start gap-2 h-auto py-3 px-4 border-2`}
                      style={{
                        backgroundColor: selectedAnalysisType === type.id ? '#6e1d27' : 'white',
                        color: selectedAnalysisType === type.id ? '#f0dcc4' : '#3d0e15',
                        borderColor: selectedAnalysisType === type.id ? '#6e1d27' : '#6e1d27',
                        borderWidth: '2px'
                      }}
                      onClick={() => setSelectedAnalysisType(type.id)}
                    >
                      <type.icon 
                        className="w-5 h-5" 
                        style={{ 
                          color: selectedAnalysisType === type.id ? '#f0dcc4' : type.color 
                        }}
                      />
                      <span>{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="analysis-description" className="font-ibm-plex mb-2 block">
                  What would you like to analyze?
                </Label>
                <textarea
                  id="analysis-description"
                  className="hand-drawn-input w-full h-24 p-3 bg-white border-2 border-[#6e1d27]/30 font-ibm-plex"
                  placeholder="Describe what you'd like to analyze..."
                  value={analysisDescription}
                  onChange={(e) => setAnalysisDescription(e.target.value)}
                />
              </div>
              
              {isAnalyzing && (
                <div className="mb-4 p-6 bg-[#f9efe8] rounded-md flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-3">
                    {/* Animated circles */}
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-[#6e1d27]/10"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 rounded-full bg-[#6e1d27]/20"
                      animate={{
                        scale: [1.1, 1.3, 1.1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                      }}
                    />
                    <motion.div
                      className="absolute inset-4 rounded-full flex items-center justify-center bg-[#6e1d27]"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Sparkles className="w-8 h-8 text-[#f0dcc4]" />
                    </motion.div>
                  </div>
                  <p className="font-ibm-plex text-sm text-[#6e1d27] font-medium">
                    Generating insights...
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="font-ibm-plex border-2 border-[#6e1d27]/30"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="font-ibm-plex bg-[#6e1d27] hover:bg-[#3d0e15]"
                  onClick={handleRunAIAnalysis}
                  disabled={!selectedAnalysisType || !analysisDescription.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
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
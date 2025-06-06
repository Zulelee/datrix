'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';
import { Mail, FileText, FileSpreadsheet, File, Database, BarChart3, PieChart, TrendingUp, Users, Calendar, DollarSign, Zap, Target, Layers } from 'lucide-react';

export default function ScrollJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Global scroll-based background transformation
  const backgroundGradient = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [
      'linear-gradient(135deg, #f9efe8 0%, #f5e6d3 50%, #f0dcc4 100%)',
      'linear-gradient(135deg, #f5e6d3 0%, #f0dcc4 50%, #ebe1d1 100%)',
      'linear-gradient(135deg, #f0dcc4 0%, #ebe1d1 50%, #e6d6c7 100%)',
      'linear-gradient(135deg, #ebe1d1 0%, #e6d6c7 50%, #e1d1c2 100%)'
    ]
  );

  return (
    <motion.div 
      ref={containerRef} 
      className="relative"
      style={{ background: backgroundGradient }}
    >
      <DataCollectionSection />
      <StructuredDataSection />
      <DecisionDashboardSection />
    </motion.div>
  );
}

// Section 1: Icon Fusion - Data Collection with Enhanced Animations
function DataCollectionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [animationPhase, setAnimationPhase] = useState(0);
  const controls = useAnimation();

  const icons = [
    { Icon: Mail, delay: 0, color: '#6e1d27' },
    { Icon: FileText, delay: 0.2, color: '#912d3c' },
    { Icon: FileSpreadsheet, delay: 0.4, color: '#b6454e' },
    { Icon: File, delay: 0.6, color: '#6e1d27' },
    { Icon: Database, delay: 0.8, color: '#3d0e15' }
  ];

  useEffect(() => {
    if (isInView) {
      const sequence = async () => {
        // Phase 1: Icons appear and orbit
        setAnimationPhase(1);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Phase 2: Icons converge to center
        setAnimationPhase(2);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Phase 3: Fusion complete, show AI cube
        setAnimationPhase(3);
      };
      sequence();
    } else {
      setAnimationPhase(0);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Enhanced Background Pattern with Parallax */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:60px_60px]" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Enhanced Floating Icons with Complex Animations */}
        <div className="relative h-96 mb-12">
          {icons.map((item, index) => {
            const angle = (index * 72) - 90;
            const radius = 180;
            const orbitX = Math.cos((angle * Math.PI) / 180) * radius;
            const orbitY = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2"
                initial={{ 
                  x: orbitX + (Math.random() - 0.5) * 100, 
                  y: orbitY + (Math.random() - 0.5) * 100, 
                  opacity: 0,
                  scale: 0.5,
                  rotate: 0
                }}
                animate={
                  animationPhase === 0 
                    ? { 
                        x: orbitX + (Math.random() - 0.5) * 100, 
                        y: orbitY + (Math.random() - 0.5) * 100, 
                        opacity: 0,
                        scale: 0.5
                      }
                    : animationPhase === 1
                    ? { 
                        x: orbitX, 
                        y: orbitY, 
                        opacity: 1,
                        scale: 1,
                        rotate: [0, 360, 720]
                      }
                    : animationPhase === 2
                    ? { 
                        x: [orbitX, orbitX * 0.3, 0], 
                        y: [orbitY, orbitY * 0.3, 0], 
                        opacity: [1, 1, 0.8],
                        scale: [1, 1.2, 0.8],
                        rotate: [720, 1080, 1440]
                      }
                    : { 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0.3
                      }
                }
                transition={{ 
                  duration: animationPhase === 1 ? 1.2 : animationPhase === 2 ? 1.8 : 0.8,
                  delay: item.delay,
                  ease: "easeInOut",
                  rotate: { duration: animationPhase === 1 ? 2 : 1.5, ease: "linear" }
                }}
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <motion.div 
                  className="p-4 rounded-full backdrop-blur-sm border shadow-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}15, ${item.color}25)`,
                    borderColor: `${item.color}30`
                  }}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${item.color}30`,
                      `0 0 40px ${item.color}50`,
                      `0 0 20px ${item.color}30`
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {/* Animated background particles */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    animate={{
                      background: [
                        `radial-gradient(circle at 20% 20%, ${item.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 80% 80%, ${item.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 20% 80%, ${item.color}40 0%, transparent 50%)`,
                        `radial-gradient(circle at 80% 20%, ${item.color}40 0%, transparent 50%)`
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  />
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <item.Icon size={32} className="text-[#6e1d27] relative z-10" />
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Enhanced Central AI Fusion Cube */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0, rotateY: 0 }}
            animate={
              animationPhase >= 2
                ? { 
                    scale: [0, 1.3, 1], 
                    opacity: [0, 1, 1],
                    rotateY: [0, 180, 360],
                    rotateX: [0, 15, 0]
                  }
                : { scale: 0, opacity: 0 }
            }
            transition={{ 
              duration: 2,
              delay: 1.5,
              ease: "easeOut"
            }}
          >
            <motion.div
              className="relative"
              animate={{
                rotateY: 360,
                boxShadow: [
                  "0 0 30px rgba(110, 29, 39, 0.4)",
                  "0 0 60px rgba(145, 45, 60, 0.6)",
                  "0 0 90px rgba(182, 69, 78, 0.4)",
                  "0 0 30px rgba(110, 29, 39, 0.4)"
                ]
              }}
              transition={{
                rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-[#912d3c] via-[#6e1d27] to-[#3d0e15] rounded-2xl shadow-2xl border border-[#f9efe8]/20 flex items-center justify-center relative overflow-hidden">
                {/* Animated energy lines */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'linear-gradient(45deg, transparent 30%, rgba(249, 239, 232, 0.3) 50%, transparent 70%)',
                      'linear-gradient(135deg, transparent 30%, rgba(249, 239, 232, 0.3) 50%, transparent 70%)',
                      'linear-gradient(225deg, transparent 30%, rgba(249, 239, 232, 0.3) 50%, transparent 70%)',
                      'linear-gradient(315deg, transparent 30%, rgba(249, 239, 232, 0.3) 50%, transparent 70%)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative z-10"
                >
                  <Zap size={48} className="text-[#f9efe8]" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Data Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#6e1d27]/40 rounded-full"
                style={{
                  left: `${20 + (i * 5)}%`,
                  top: `${30 + (i * 3)}%`,
                }}
                animate={{
                  y: [-30, -60, -30],
                  x: [0, Math.sin(i) * 20, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Text Content with Stagger Animation */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex"
            animate={isInView ? {
              backgroundImage: [
                'linear-gradient(45deg, #3d0e15, #6e1d27)',
                'linear-gradient(45deg, #6e1d27, #912d3c)',
                'linear-gradient(45deg, #912d3c, #3d0e15)'
              ],
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            COLLECT FROM ANYWHERE
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-[#6e1d27] max-w-3xl mx-auto leading-relaxed font-ibm-plex"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 2: Enhanced Structured Data Transformation
function StructuredDataSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showTable, setShowTable] = useState(false);
  const [tablePhase, setTablePhase] = useState(0);

  const tableData = [
    { name: "John Smith", email: "john@company.com", orderId: "ORD-001", status: "Completed", value: "$2,450" },
    { name: "Sarah Johnson", email: "sarah@startup.io", orderId: "ORD-002", status: "Processing", value: "$1,890" },
    { name: "Mike Chen", email: "mike@tech.com", orderId: "ORD-003", status: "Pending", value: "$3,200" },
    { name: "Emma Wilson", email: "emma@design.co", orderId: "ORD-004", status: "Completed", value: "$1,650" },
    { name: "Alex Rodriguez", email: "alex@marketing.net", orderId: "ORD-005", status: "Processing", value: "$2,100" }
  ];

  useEffect(() => {
    if (isInView) {
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTablePhase(1); // Show morphing box
        await new Promise(resolve => setTimeout(resolve, 800));
        setShowTable(true); // Show table
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTablePhase(2); // Table enhancement phase
      };
      sequence();
    } else {
      setShowTable(false);
      setTablePhase(0);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Enhanced Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-8"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_#6e1d27_1px,_transparent_1px),_linear-gradient(-45deg,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Enhanced Table Animation */}
          <div className="flex-1 relative">
            {/* Morphing Box to Table */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Initial Box State */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={tablePhase >= 1 ? { 
                  scale: [1, 1.2, 0],
                  rotate: [0, 180, 360],
                  opacity: [1, 0.8, 0]
                } : { scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#912d3c] to-[#6e1d27] rounded-xl shadow-2xl flex items-center justify-center">
                  <Layers size={32} className="text-[#f9efe8]" />
                </div>
              </motion.div>

              {/* Table Container */}
              <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#6e1d27]/10 overflow-hidden"
                initial={{ scale: 0, opacity: 0 }}
                animate={showTable ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {/* Enhanced Table Header */}
                <motion.div 
                  className="bg-gradient-to-r from-[#6e1d27] via-[#912d3c] to-[#b6454e] p-6"
                  initial={{ y: -100, opacity: 0 }}
                  animate={showTable ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="grid grid-cols-5 gap-4 text-[#f9efe8] font-semibold font-ibm-plex">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      Name
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Order ID
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={16} />
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Value
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Table Rows */}
                <div className="p-6 space-y-4 max-h-80 overflow-hidden">
                  {tableData.map((row, index) => (
                    <motion.div
                      key={index}
                      className="grid grid-cols-5 gap-4 p-4 rounded-xl bg-gradient-to-r from-[#f9efe8]/50 to-[#f5e6d3]/50 hover:from-[#f9efe8] hover:to-[#f5e6d3] transition-all duration-300 border border-[#6e1d27]/5 hover:border-[#6e1d27]/20 hover:shadow-lg group"
                      initial={{ x: -200, opacity: 0, rotateY: -15 }}
                      animate={showTable ? { x: 0, opacity: 1, rotateY: 0 } : { x: -200, opacity: 0, rotateY: -15 }}
                      transition={{ duration: 0.8, delay: 0.9 + (index * 0.1) }}
                      whileHover={{ scale: 1.02, x: 10 }}
                    >
                      <div className="font-medium text-[#3d0e15] font-ibm-plex group-hover:text-[#6e1d27] transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[#6e1d27] font-ibm-plex text-sm">
                        {row.email}
                      </div>
                      <div className="text-[#6e1d27] font-mono text-sm bg-[#6e1d27]/10 px-2 py-1 rounded-md w-fit">
                        {row.orderId}
                      </div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                        row.status === 'Processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {row.status}
                      </div>
                      <div className="font-bold text-[#3d0e15] font-ibm-plex">
                        {row.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Table Enhancement Indicators */}
                <motion.div
                  className="p-4 bg-gradient-to-r from-[#f9efe8] to-[#f5e6d3] border-t border-[#6e1d27]/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={tablePhase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 2 }}
                >
                  <div className="flex items-center justify-between text-sm text-[#6e1d27] font-ibm-plex">
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      Auto-structured from raw data
                    </span>
                    <span className="flex items-center gap-2">
                      <BarChart3 size={16} />
                      Ready for analysis
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced Text Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-8 font-ibm-plex"
                animate={isInView ? {
                  backgroundImage: [
                    'linear-gradient(45deg, #3d0e15, #6e1d27)',
                    'linear-gradient(45deg, #6e1d27, #912d3c)',
                    'linear-gradient(45deg, #912d3c, #3d0e15)'
                  ],
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                INSTANT STRUCTURE
              </motion.h2>
              <motion.p
                className="text-lg sm:text-xl text-[#6e1d27] leading-relaxed font-ibm-plex mb-8"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
              </motion.p>
              
              {/* Feature Highlights */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                {[
                  { icon: Zap, text: "AI-powered data recognition" },
                  { icon: Target, text: "Smart field mapping" },
                  { icon: Database, text: "Export-ready formats" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-[#6e1d27] font-ibm-plex"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 1.4 + (index * 0.2) }}
                  >
                    <motion.div
                      className="p-2 rounded-full bg-[#6e1d27]/10"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                    >
                      <feature.icon size={20} className="text-[#6e1d27]" />
                    </motion.div>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 3: Enhanced Decision Dashboard
function DecisionDashboardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showCharts, setShowCharts] = useState(false);
  const [dashboardPhase, setDashboardPhase] = useState(0);

  const dashboardItems = [
    { 
      Icon: BarChart3, 
      title: "Revenue Growth", 
      value: "+24%", 
      color: "from-[#6e1d27] to-[#912d3c]",
      delay: 0,
      trend: "up"
    },
    { 
      Icon: Users, 
      title: "Active Users", 
      value: "12.4K", 
      color: "from-[#912d3c] to-[#b6454e]",
      delay: 0.2,
      trend: "up"
    },
    { 
      Icon: TrendingUp, 
      title: "Conversion Rate", 
      value: "8.2%", 
      color: "from-[#b6454e] to-[#6e1d27]",
      delay: 0.4,
      trend: "up"
    },
    { 
      Icon: DollarSign, 
      title: "Total Sales", 
      value: "$89.2K", 
      color: "from-[#6e1d27] to-[#3d0e15]",
      delay: 0.6,
      trend: "up"
    }
  ];

  useEffect(() => {
    if (isInView) {
      const sequence = async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        setShowCharts(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDashboardPhase(1); // Enhanced interactions
      };
      sequence();
    } else {
      setShowCharts(false);
      setDashboardPhase(0);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Enhanced Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-8"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_#6e1d27_2px,_transparent_2px),_radial-gradient(circle_at_75%_75%,_#6e1d27_2px,_transparent_2px)] bg-[length:80px_80px]" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-8 font-ibm-plex"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            <motion.span
              animate={isInView ? {
                backgroundImage: [
                  'linear-gradient(45deg, #3d0e15, #6e1d27)',
                  'linear-gradient(45deg, #6e1d27, #912d3c)',
                  'linear-gradient(45deg, #912d3c, #3d0e15)'
                ],
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              } : {}}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              FROM DATA TO DECISIONS
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-[#6e1d27] max-w-4xl mx-auto leading-relaxed font-ibm-plex"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.
          </motion.p>
        </div>

        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ y: 150, opacity: 0, rotateY: -20, scale: 0.8 }}
              animate={showCharts ? { y: 0, opacity: 1, rotateY: 0, scale: 1 } : { y: 150, opacity: 0, rotateY: -20, scale: 0.8 }}
              transition={{ duration: 1, delay: item.delay, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.08, 
                rotateY: 8,
                z: 50,
                transition: { duration: 0.3 }
              }}
            >
              <div className={`bg-gradient-to-br ${item.color} p-8 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden`}>
                {/* Animated background effects */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: item.delay
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="p-3 bg-white/20 rounded-2xl"
                    >
                      <item.Icon size={32} className="text-white/90" />
                    </motion.div>
                    <motion.div
                      className="flex space-x-1"
                      animate={dashboardPhase >= 1 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 2 + item.delay }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-white/40 rounded-full"
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: item.delay + (i * 0.2)
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                  
                  <h3 className="text-white/90 font-semibold mb-3 font-ibm-plex text-lg">
                    {item.title}
                  </h3>
                  
                  <motion.div
                    className="text-3xl font-bold text-white font-ibm-plex mb-4"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={showCharts ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ duration: 0.8, delay: item.delay + 0.5 }}
                  >
                    {item.value}
                  </motion.div>
                  
                  {/* Enhanced Progress Visualization */}
                  <div className="space-y-2">
                    <motion.div
                      className="h-2 bg-white/20 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={showCharts ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1.5, delay: item.delay + 0.8 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full"
                        initial={{ x: "-100%" }}
                        animate={showCharts ? { x: "0%" } : { x: "-100%" }}
                        transition={{ duration: 2, delay: item.delay + 1 }}
                      />
                    </motion.div>
                    
                    <motion.div
                      className="flex items-center justify-between text-xs text-white/70 font-ibm-plex"
                      initial={{ opacity: 0 }}
                      animate={dashboardPhase >= 1 ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 2.5 + item.delay }}
                    >
                      <span>This month</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        {item.trend === 'up' ? '+' : ''}12%
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Central Visualization Hub */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={showCharts ? { scale: 1, opacity: 1, y: 0 } : { scale: 0, opacity: 0, y: 100 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-[#6e1d27]/10 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundImage: [
                  'radial-gradient(circle at 30% 30%, #6e1d27 2px, transparent 2px)',
                  'radial-gradient(circle at 70% 70%, #912d3c 2px, transparent 2px)',
                  'radial-gradient(circle at 30% 70%, #b6454e 2px, transparent 2px)',
                  'radial-gradient(circle at 70% 30%, #6e1d27 2px, transparent 2px)'
                ],
                backgroundSize: ['20px 20px', '25px 25px', '20px 20px', '25px 25px']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="flex items-center justify-center space-x-8 relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="p-4 bg-gradient-to-br from-[#6e1d27] to-[#912d3c] rounded-2xl"
              >
                <PieChart size={48} className="text-white" />
              </motion.div>
              
              <div className="text-center">
                <motion.h4 
                  className="text-2xl font-bold text-[#3d0e15] font-ibm-plex mb-2"
                  animate={dashboardPhase >= 1 ? {
                    backgroundImage: [
                      'linear-gradient(45deg, #3d0e15, #6e1d27)',
                      'linear-gradient(45deg, #6e1d27, #912d3c)',
                      'linear-gradient(45deg, #912d3c, #3d0e15)'
                    ],
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  } : {}}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  Interactive Dashboard
                </motion.h4>
                <motion.p 
                  className="text-[#6e1d27] font-ibm-plex text-lg"
                  initial={{ opacity: 0 }}
                  animate={dashboardPhase >= 1 ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 3 }}
                >
                  Drag, drop, and customize your insights
                </motion.p>
              </div>
              
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
                }}
                className="p-4 bg-gradient-to-br from-[#912d3c] to-[#b6454e] rounded-2xl"
              >
                <BarChart3 size={48} className="text-white" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
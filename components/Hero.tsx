'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Mail, FileText, FileSpreadsheet, File, Database, BarChart3, PieChart, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import Navbar from './Navbar';
import TypewriterText from './TypewriterText';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Transform scroll progress into different phases
  const phase1Progress = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const phase2Progress = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const phase3Progress = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

  // Background gradient that evolves with scroll
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

  const icons = [Mail, FileText, FileSpreadsheet, File, Database];

  // Text content for each phase
  const getTextContent = () => {
    const progress = scrollYProgress.get();
    if (progress < 0.33) {
      return {
        title: "TURN RAW DATA INTO",
        subtitle: "Let Datrix handle the chaos and surface the insights.",
        showTypewriter: true,
        showButtons: true
      };
    } else if (progress < 0.66) {
      return {
        title: "INSTANT STRUCTURE",
        subtitle: "Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.",
        showTypewriter: false,
        showButtons: false
      };
    } else {
      return {
        title: "FROM DATA TO DECISIONS",
        subtitle: "Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.",
        showTypewriter: false,
        showButtons: false
      };
    }
  };

  return (
    <>
      <Navbar />
      <div ref={containerRef} className="relative h-[400vh]">
        {/* Fixed viewport for the animation */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.section 
            className="relative min-h-screen overflow-hidden"
            style={{ background: backgroundGradient }}
          >
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

            {/* Foreground Content - Morphing Layout */}
            <div className="relative z-10 flex items-center justify-between min-h-screen px-4 sm:px-6 lg:px-8">
              
              {/* Left side - Dynamic Text Content */}
              <motion.div 
                className="text-left max-w-2xl"
                style={{
                  width: useTransform(scrollYProgress, [0, 0.33], ['100%', '50%']),
                  x: useTransform(scrollYProgress, [0, 0.33], [0, -50]),
                }}
              >
                {/* Main Headline with Dynamic Content */}
                <motion.h1 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-8 font-ibm-plex leading-tight tracking-tight"
                  layout
                >
                  <motion.span className="block mb-2">
                    {scrollYProgress.get() < 0.33 ? "TURN RAW DATA INTO" :
                     scrollYProgress.get() < 0.66 ? "INSTANT STRUCTURE" :
                     "FROM DATA TO DECISIONS"}
                  </motion.span>
                  
                  {/* Typewriter only shows in initial phase */}
                  <motion.div
                    style={{
                      opacity: useTransform(scrollYProgress, [0, 0.25], [1, 0]),
                      height: useTransform(scrollYProgress, [0, 0.25], ['auto', '0px']),
                    }}
                  >
                    <TypewriterText />
                  </motion.div>
                </motion.h1>

                {/* Dynamic Subheadline */}
                <motion.h2 
                  className="text-base sm:text-lg md:text-xl lg:text-xl font-medium text-[#6e1d27] mb-12 leading-relaxed font-ibm-plex" 
                  style={{ textShadow: '0 1px 2px rgba(61, 14, 21, 0.1)' }}
                  layout
                >
                  {scrollYProgress.get() < 0.33 ? "Let Datrix handle the chaos and surface the insights." :
                   scrollYProgress.get() < 0.66 ? "Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database." :
                   "Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes."}
                </motion.h2>

                {/* CTA Buttons - Only show in initial phase */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-start items-start"
                  style={{
                    opacity: useTransform(scrollYProgress, [0, 0.25], [1, 0]),
                    y: useTransform(scrollYProgress, [0, 0.25], [0, 50]),
                  }}
                >
                  <Button 
                    size="lg" 
                    className="bg-[#6e1d27] hover:bg-[#912d3c] text-[#f9efe8] px-8 py-4 text-lg font-semibold rounded-full shadow-lg shadow-[#b6454e]/30 hover:shadow-xl hover:shadow-[#b6454e]/40 transform hover:scale-105 transition-all duration-300 font-ibm-plex tracking-wide"
                  >
                    Try Datrix Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-[#f9efe8] px-8 py-4 text-lg font-semibold rounded-full bg-transparent backdrop-blur-sm hover:backdrop-blur-none transform hover:scale-105 transition-all duration-300 font-ibm-plex tracking-wide"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right side - Cinematic Animation */}
              <motion.div 
                className="relative flex items-center justify-center"
                style={{
                  width: useTransform(scrollYProgress, [0, 0.33], ['0%', '50%']),
                  opacity: useTransform(scrollYProgress, [0, 0.2, 0.33], [0, 0.5, 1]),
                  x: useTransform(scrollYProgress, [0, 0.33], [100, 0]),
                }}
              >
                <div className="relative w-full h-[500px] flex items-center justify-center">
                  
                  {/* PHASE 1: Icons orbiting and converging (from original hero) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {icons.map((Icon, i) => {
                      const angle = (i * 72) - 90;
                      const radius = 120;
                      const orbitX = Math.cos((angle * Math.PI) / 180) * radius;
                      const orbitY = Math.sin((angle * Math.PI) / 180) * radius;
                      
                      // Icons move from orbit to center during phase 1
                      const iconX = useTransform(phase1Progress, [0, 0.7, 1], [orbitX, orbitX * 0.3, 0]);
                      const iconY = useTransform(phase1Progress, [0, 0.7, 1], [orbitY, orbitY * 0.3, 0]);
                      const iconOpacity = useTransform(phase1Progress, [0, 0.5, 0.9, 1], [1, 1, 1, 0]);
                      const iconScale = useTransform(phase1Progress, [0, 0.8, 1], [1, 0.8, 0]);

                      return (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            x: iconX,
                            y: iconY,
                            opacity: iconOpacity,
                            scale: iconScale,
                          }}
                        >
                          <motion.div 
                            className="p-3 bg-[#6e1d27]/10 rounded-full backdrop-blur border border-[#6e1d27]/20 shadow-lg"
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                              delay: i * 0.5
                            }}
                          >
                            <Icon size={30} className="text-[#6e1d27]" />
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* PHASE 1: Central fusion box */}
                  <motion.div
                    className="absolute"
                    style={{
                      scale: useTransform(phase1Progress, [0.5, 1], [0, 1]),
                      opacity: useTransform(phase1Progress, [0.5, 0.8, 1], [0, 1, 1]),
                      rotateY: useTransform(phase1Progress, [0.5, 1], [0, 360]),
                    }}
                  >
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-[#912d3c] to-[#6e1d27] rounded-lg shadow-xl border border-[#3d0e15]/20 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(110,29,39,0.3)',
                          '0 0 40px rgba(110,29,39,0.6)',
                          '0 0 60px rgba(110,29,39,0.4)',
                          '0 0 20px rgba(110,29,39,0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Database size={36} className="text-[#f9efe8]" />
                    </motion.div>
                  </motion.div>

                  {/* PHASE 2: Box transforms into table */}
                  <motion.div
                    className="absolute"
                    style={{
                      scale: useTransform(phase2Progress, [0, 0.3, 1], [1, 1.2, 1]),
                      opacity: useTransform(scrollYProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]),
                      rotateX: useTransform(phase2Progress, [0, 0.5], [0, -10]),
                    }}
                  >
                    <motion.div
                      className="bg-white rounded-2xl shadow-2xl border border-[#6e1d27]/10 w-[500px] overflow-hidden backdrop-blur-sm"
                      style={{
                        y: useTransform(phase2Progress, [0, 1], [50, 0]),
                      }}
                    >
                      {/* Table Header */}
                      <motion.div
                        className="bg-gradient-to-r from-[#6e1d27] to-[#912d3c] p-4"
                        style={{
                          y: useTransform(phase2Progress, [0, 0.3], [-50, 0]),
                          opacity: useTransform(phase2Progress, [0, 0.3], [0, 1]),
                        }}
                      >
                        <div className="grid grid-cols-4 gap-3 text-[#f9efe8] font-semibold font-ibm-plex text-sm">
                          <div>Name</div>
                          <div>Email</div>
                          <div>Order ID</div>
                          <div>Status</div>
                        </div>
                      </motion.div>

                      {/* Table Rows */}
                      <div className="max-h-[280px] overflow-hidden">
                        {[
                          { name: "John Smith", email: "john@company.com", orderId: "ORD-001", status: "Completed" },
                          { name: "Sarah Johnson", email: "sarah@startup.io", orderId: "ORD-002", status: "Processing" },
                          { name: "Mike Chen", email: "mike@tech.com", orderId: "ORD-003", status: "Pending" },
                          { name: "Emma Wilson", email: "emma@design.co", orderId: "ORD-004", status: "Completed" },
                          { name: "Lisa Park", email: "lisa@consulting.biz", orderId: "ORD-005", status: "Processing" }
                        ].map((row, i) => (
                          <motion.div
                            key={i}
                            className="grid grid-cols-4 gap-3 p-3 border-b border-[#6e1d27]/5 hover:bg-[#f9efe8]/50 transition-colors duration-200"
                            style={{
                              x: useTransform(phase2Progress, [0.2 + (i * 0.1), 0.4 + (i * 0.1)], [-100, 0]),
                              opacity: useTransform(phase2Progress, [0.2 + (i * 0.1), 0.4 + (i * 0.1)], [0, 1]),
                            }}
                          >
                            <div className="text-[#3d0e15] font-medium font-ibm-plex text-sm truncate">{row.name}</div>
                            <div className="text-[#6e1d27] font-ibm-plex text-sm truncate">{row.email}</div>
                            <div className="text-[#6e1d27] font-mono text-xs">{row.orderId}</div>
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                              row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              row.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* PHASE 3: Table explodes into dashboard cards */}
                  <motion.div
                    className="absolute"
                    style={{
                      opacity: useTransform(scrollYProgress, [0.6, 0.7, 1], [0, 1, 1]),
                      scale: useTransform(phase3Progress, [0, 0.5, 1], [0.8, 1.1, 1]),
                    }}
                  >
                    <div className="grid grid-cols-3 gap-4 w-[450px]">
                      {[
                        { icon: BarChart3, label: 'Revenue', value: '$89.2K', color: 'from-[#6e1d27] to-[#912d3c]' },
                        { icon: PieChart, label: 'Distribution', value: '24%', color: 'from-[#912d3c] to-[#b6454e]' },
                        { icon: TrendingUp, label: 'Growth', value: '+18%', color: 'from-[#b6454e] to-[#6e1d27]' },
                        { icon: Users, label: 'Users', value: '12.4K', color: 'from-[#6e1d27] to-[#3d0e15]' },
                        { icon: Calendar, label: 'Timeline', value: '30d', color: 'from-[#912d3c] to-[#6e1d27]' },
                        { icon: DollarSign, label: 'Profit', value: '+32%', color: 'from-[#b6454e] to-[#912d3c]' },
                      ].map((card, i) => (
                        <motion.div
                          key={i}
                          className="relative group"
                          style={{
                            y: useTransform(phase3Progress, [0, 0.3 + (i * 0.05), 0.8], [100, 50, 0]),
                            opacity: useTransform(phase3Progress, [0, 0.2 + (i * 0.05), 0.6], [0, 0, 1]),
                            rotateY: useTransform(phase3Progress, [0, 0.5, 1], [-30, -10, 0]),
                            scale: useTransform(phase3Progress, [0.5 + (i * 0.05), 1], [0.8, 1]),
                          }}
                          whileHover={{ 
                            scale: 1.05, 
                            rotateY: 5,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className={`bg-gradient-to-br ${card.color} p-4 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm h-[100px] relative overflow-hidden`}>
                            {/* Animated background particles */}
                            <motion.div
                              className="absolute inset-0 opacity-20"
                              animate={{
                                background: [
                                  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                  'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                  'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                  'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                                ]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.5
                              }}
                            />
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <motion.div
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                  <card.icon size={24} className="text-white/90" />
                                </motion.div>
                                <motion.div
                                  className="w-2 h-2 bg-white/30 rounded-full"
                                  animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: i * 0.3 
                                  }}
                                />
                              </div>
                              <h3 className="text-white/90 font-semibold text-sm mb-1 font-ibm-plex">{card.label}</h3>
                              <motion.div
                                className="text-lg font-bold text-white font-ibm-plex"
                                style={{
                                  scale: useTransform(phase3Progress, [0.7 + (i * 0.05), 1], [0, 1]),
                                }}
                              >
                                {card.value}
                              </motion.div>
                              
                              {/* Animated Progress Bar */}
                              <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-white/60 rounded-full"
                                  style={{
                                    scaleX: useTransform(phase3Progress, [0.8 + (i * 0.05), 1], [0, 1]),
                                  }}
                                  transformOrigin="left"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Floating Connection Lines */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        opacity: useTransform(phase3Progress, [0.8, 1], [0, 1]),
                      }}
                    >
                      <svg className="w-full h-full">
                        <motion.path
                          d="M150 100 Q225 150 300 100"
                          stroke="rgba(110, 29, 39, 0.4)"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="5,5"
                          style={{
                            pathLength: useTransform(phase3Progress, [0.9, 1], [0, 1]),
                          }}
                        />
                        <motion.path
                          d="M150 200 Q225 250 300 200"
                          stroke="rgba(145, 45, 60, 0.4)"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="5,5"
                          style={{
                            pathLength: useTransform(phase3Progress, [0.95, 1], [0, 1]),
                          }}
                        />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Floating data particles throughout the journey */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#6e1d27]/30 rounded-full"
                        style={{
                          left: `${20 + (i * 6)}%`,
                          top: `${30 + (i * 4)}%`,
                        }}
                        animate={{
                          y: [-20, -40, -20],
                          opacity: [0.3, 0.8, 0.3],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
          </motion.section>
        </div>
      </div>
    </>
  );
}
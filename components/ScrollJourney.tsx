'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Mail,
  FileText,
  FileSpreadsheet,
  File,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function ScrollJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Transform scroll progress into different phases
  const phase1Progress = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const phase2Progress = useTransform(scrollYProgress, [0.33, 0.66], [0, 1]);
  const phase3Progress = useTransform(scrollYProgress, [0.66, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Fixed viewport for the animation */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <CinematicJourney 
          phase1Progress={phase1Progress}
          phase2Progress={phase2Progress}
          phase3Progress={phase3Progress}
          scrollProgress={scrollYProgress}
        />
      </div>
    </div>
  );
}

function CinematicJourney({ 
  phase1Progress, 
  phase2Progress, 
  phase3Progress, 
  scrollProgress 
}: {
  phase1Progress: any;
  phase2Progress: any;
  phase3Progress: any;
  scrollProgress: any;
}) {
  const icons = [Mail, FileText, FileSpreadsheet, File, Database];
  
  // Background gradient that evolves with scroll
  const backgroundGradient = useTransform(
    scrollProgress,
    [0, 0.33, 0.66, 1],
    [
      'linear-gradient(135deg, #f9efe8 0%, #f5e6d3 50%, #f0dcc4 100%)',
      'linear-gradient(135deg, #f5e6d3 0%, #f0dcc4 50%, #ebe1d1 100%)',
      'linear-gradient(135deg, #f0dcc4 0%, #ebe1d1 50%, #e6d6c7 100%)',
      'linear-gradient(135deg, #ebe1d1 0%, #e6d6c7 50%, #e1d1c2 100%)'
    ]
  );

  // Text content for each phase
  const textContent = [
    {
      title: "COLLECT FROM ANYWHERE",
      subtitle: "Datrix fetches data from emails, files, chat inputs, and more — no manual steps required."
    },
    {
      title: "INSTANT STRUCTURE",
      subtitle: "Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database."
    },
    {
      title: "FROM DATA TO DECISIONS",
      subtitle: "Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes."
    }
  ];

  const currentPhase = useTransform(scrollProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2]);

  return (
    <motion.div 
      className="relative w-full h-full flex items-center justify-between px-10"
      style={{ background: backgroundGradient }}
    >
      {/* Left side - Text content */}
      <div className="w-1/2 text-left z-10">
        <motion.h2
          className="text-4xl font-bold text-[#3d0e15] font-ibm-plex mb-6"
          key={Math.floor(useTransform(scrollProgress, [0, 0.33, 0.66], [0, 1, 2]).get())}
        >
          {scrollProgress.get() < 0.33 ? textContent[0].title :
           scrollProgress.get() < 0.66 ? textContent[1].title :
           textContent[2].title}
        </motion.h2>
        <motion.p
          className="text-xl text-[#6e1d27] max-w-md font-ibm-plex leading-relaxed"
        >
          {scrollProgress.get() < 0.33 ? textContent[0].subtitle :
           scrollProgress.get() < 0.66 ? textContent[1].subtitle :
           textContent[2].subtitle}
        </motion.p>
      </div>

      {/* Right side - Cinematic animation */}
      <div className="relative w-1/2 h-full flex items-center justify-center">
        
        {/* PHASE 1: Icons orbiting and converging */}
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
            opacity: useTransform(scrollProgress, [0.25, 0.35, 0.6, 0.7], [0, 1, 1, 0]),
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
            opacity: useTransform(scrollProgress, [0.6, 0.7, 1], [0, 1, 1]),
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
  );
}
'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, FileText, FileSpreadsheet, File, Database, BarChart3, PieChart, TrendingUp, Donut as Doughnut, AreaChart } from 'lucide-react';
import Image from 'next/image';

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Section 1: Collect from anywhere (0% - 20%)
  const section1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 1, 1, 0]);
  const section1Y = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [50, 0, 0, -50]);

  // Section 2: Instant structure (20% - 40%)
  const section2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0]);
  const section2Y = useTransform(scrollYProgress, [0.15, 0.25, 0.4, 0.5], [50, 0, 0, -50]);

  // Section 3: From data to decisions (40% - 60%)
  const section3Opacity = useTransform(scrollYProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0]);
  const section3Y = useTransform(scrollYProgress, [0.35, 0.45, 0.6, 0.7], [50, 0, 0, -50]);

  // Section 4: Meet the Team (60% - 80%)
  const section4Opacity = useTransform(scrollYProgress, [0.55, 0.65, 0.8, 0.9], [0, 1, 1, 0]);
  const section4Y = useTransform(scrollYProgress, [0.55, 0.65, 0.8, 0.9], [50, 0, 0, -50]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Section 1: Collect from anywhere */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section1Opacity, y: section1Y }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content - Left Side */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
              Collect from anywhere.
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] mb-8 leading-relaxed font-ibm-plex">
              Emails, spreadsheets, documents, databases. Datrix connects to your existing tools and pulls everything into one unified workspace.
            </p>
          </div>

          {/* Visual Content - Right Side */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* Central Hub */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#6e1d27] rounded-2xl flex items-center justify-center shadow-2xl">
                <Database className="w-16 h-16 sm:w-20 sm:h-20 text-[#f9efe8]" />
              </div>

              {/* Floating Data Sources */}
              <motion.div
                className="absolute -top-8 -left-8 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-[#6e1d27]/20"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Mail className="w-8 h-8 text-[#6e1d27]" />
              </motion.div>

              <motion.div
                className="absolute -top-8 -right-8 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-[#6e1d27]/20"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <FileSpreadsheet className="w-8 h-8 text-[#6e1d27]" />
              </motion.div>

              <motion.div
                className="absolute -bottom-8 -left-8 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-[#6e1d27]/20"
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ 
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <FileText className="w-8 h-8 text-[#6e1d27]" />
              </motion.div>

              <motion.div
                className="absolute -bottom-8 -right-8 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-[#6e1d27]/20"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ 
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
              >
                <File className="w-8 h-8 text-[#6e1d27]" />
              </motion.div>

              {/* Connection Lines */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <motion.path
                    d="M50 50 L100 100"
                    stroke="#6e1d27"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.path
                    d="M150 50 L100 100"
                    stroke="#6e1d27"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                  />
                  <motion.path
                    d="M50 150 L100 100"
                    stroke="#6e1d27"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                  />
                  <motion.path
                    d="M150 150 L100 100"
                    stroke="#6e1d27"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    fill="none"
                    strokeDasharray="5,5"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Instant structure */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section2Opacity, y: section2Y }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual Content - Left Side */}
          <div className="order-1 flex justify-center">
            <div className="relative">
              {/* Before: Messy Files */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#6e1d27] mb-4 text-center font-ibm-plex">Before</h3>
                <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center transform"
                      style={{ rotate: Math.random() * 20 - 10 }}
                      animate={{ 
                        rotate: [Math.random() * 20 - 10, Math.random() * 20 - 10],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                      }}
                    >
                      <File className="w-6 h-6 text-gray-600" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-8">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-[#6e1d27]"
                >
                  <svg width="24" height="40" viewBox="0 0 24 40" fill="currentColor">
                    <path d="M12 0 L12 35 M5 28 L12 35 L19 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>

              {/* After: Organized Structure */}
              <div>
                <h3 className="text-lg font-semibold text-[#6e1d27] mb-4 text-center font-ibm-plex">After</h3>
                <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-[#6e1d27]/10">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Mail, label: "Emails", color: "bg-blue-100 text-blue-600" },
                      { icon: FileSpreadsheet, label: "Data", color: "bg-green-100 text-green-600" },
                      { icon: FileText, label: "Docs", color: "bg-purple-100 text-purple-600" },
                      { icon: BarChart3, label: "Reports", color: "bg-orange-100 text-orange-600" },
                      { icon: Database, label: "DB", color: "bg-red-100 text-red-600" },
                      { icon: File, label: "Files", color: "bg-gray-100 text-gray-600" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className={`w-16 h-16 rounded-xl ${item.color} flex flex-col items-center justify-center text-xs font-medium`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                      >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span>{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Right Side */}
          <div className="text-center lg:text-left order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
              Instant structure.
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] mb-8 leading-relaxed font-ibm-plex">
              Our AI automatically categorizes and organizes your data. No manual sorting, no complex setup. Just instant clarity from chaos.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 3: From data to decisions */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section3Opacity, y: section3Y }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content - Left Side */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
              From data to decisions.
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] mb-8 leading-relaxed font-ibm-plex">
              Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.
            </p>
          </div>

          {/* Visual Content - Right Side */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Dashboard Board */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#6e1d27]/10 min-h-[400px]">
                {/* Sticky Note Charts */}
                <motion.div
                  className="absolute top-8 left-8 w-32 h-24 bg-yellow-200 rounded-lg shadow-lg transform rotate-[-5deg] p-3"
                  animate={{ 
                    rotate: [-5, -3, -5],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <BarChart3 className="w-8 h-8 text-[#6e1d27]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                </motion.div>

                <motion.div
                  className="absolute top-8 right-8 w-28 h-28 bg-blue-200 rounded-lg shadow-lg transform rotate-[8deg] p-3"
                  animate={{ 
                    rotate: [8, 10, 8],
                    y: [0, -3, 0]
                  }}
                  transition={{ 
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <PieChart className="w-8 h-8 text-[#6e1d27]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                </motion.div>

                <motion.div
                  className="absolute bottom-20 left-6 w-36 h-20 bg-green-200 rounded-lg shadow-lg transform rotate-[2deg] p-3"
                  animate={{ 
                    rotate: [2, 4, 2],
                    y: [0, -1, 0]
                  }}
                  transition={{ 
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <TrendingUp className="w-8 h-8 text-[#6e1d27]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                </motion.div>

                <motion.div
                  className="absolute bottom-8 right-6 w-24 h-32 bg-purple-200 rounded-lg shadow-lg transform rotate-[-8deg] p-3"
                  animate={{ 
                    rotate: [-8, -6, -8],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 3.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <AreaChart className="w-8 h-8 text-[#6e1d27]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                </motion.div>

                <motion.div
                  className="absolute top-32 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-orange-200 rounded-lg shadow-lg rotate-[12deg] p-3"
                  animate={{ 
                    rotate: [12, 14, 12],
                    y: [0, -2, 0]
                  }}
                  transition={{ 
                    duration: 4.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                >
                  <div className="flex items-center justify-center h-full">
                    <Doughnut className="w-6 h-6 text-[#6e1d27]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
                </motion.div>

                {/* Board Title */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <h3 className="text-sm font-semibold text-[#6e1d27] font-ibm-plex">Insight Board</h3>
                </div>
              </div>

              {/* Floating "Generate Chart" Prompt */}
              <motion.div
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#6e1d27] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                "Show me sales trends" ✨
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: Meet the Team */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section4Opacity, y: section4Y }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Section Title */}
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
              Meet the Team
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] leading-relaxed font-ibm-plex max-w-2xl mx-auto">
              The brilliant minds behind Datrix, working together to transform how you interact with data.
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Zulele - AI Engineer */}
            <motion.div
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Rounded Frame with Gradient Border */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6e1d27] via-[#912d3c] to-[#b6454e] rounded-3xl p-1 shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
                      <Image
                        src="/WhatsApp Image 2025-06-11 at 03.02.55.jpeg"
                        alt="Zulele - AI Engineer"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  {/* Floating AI Icon */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-12 h-12 bg-[#6e1d27] rounded-full flex items-center justify-center shadow-lg"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex">Zulele</h3>
                  <p className="text-[#6e1d27] font-medium font-ibm-plex">AI Engineer</p>
                  <p className="text-sm text-[#6e1d27]/80 font-ibm-plex max-w-xs mx-auto">
                    Crafting intelligent algorithms that transform raw data into meaningful insights.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Humza - Full Stack Engineer */}
            <motion.div
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Rounded Frame with Gradient Border */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6e1d27] via-[#912d3c] to-[#b6454e] rounded-3xl p-1 shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
                      <Image
                        src="/WhatsApp Image 2025-06-11 at 03.02.57.jpeg"
                        alt="Humza - Full Stack Engineer"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  {/* Floating Code Icon */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-12 h-12 bg-[#6e1d27] rounded-full flex items-center justify-center shadow-lg"
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex">Humza</h3>
                  <p className="text-[#6e1d27] font-medium font-ibm-plex">Full Stack Engineer</p>
                  <p className="text-sm text-[#6e1d27]/80 font-ibm-plex max-w-xs mx-auto">
                    Building robust systems that seamlessly connect frontend experiences with powerful backends.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Nemo - Project Manager */}
            <motion.div
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                {/* Rounded Frame with Gradient Border */}
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6e1d27] via-[#912d3c] to-[#b6454e] rounded-3xl p-1 shadow-2xl group-hover:shadow-3xl transition-all duration-300">
                    <div className="w-full h-full bg-white rounded-3xl overflow-hidden">
                      <Image
                        src="/WhatsApp Image 2025-06-11 at 03.02.57 (1).jpeg"
                        alt="Nemo - Project Manager"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  {/* Floating Management Icon */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-12 h-12 bg-[#6e1d27] rounded-full flex items-center justify-center shadow-lg"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#3d0e15] font-ibm-plex">Nemo</h3>
                  <p className="text-[#6e1d27] font-medium font-ibm-plex">Project Manager</p>
                  <p className="text-sm text-[#6e1d27]/80 font-ibm-plex max-w-xs mx-auto">
                    Orchestrating seamless collaboration and ensuring every detail aligns with our vision.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
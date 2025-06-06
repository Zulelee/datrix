'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Mail, FileText, FileSpreadsheet, File, Database, BarChart3, PieChart, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function ScrollJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative">
      <DataCollectionSection />
      <StructuredDataSection />
      <DecisionDashboardSection />
    </div>
  );
}

// Section 1: Icon Fusion - Data Collection
function DataCollectionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [animationPhase, setAnimationPhase] = useState(0);

  const icons = [
    { Icon: Mail, delay: 0 },
    { Icon: FileText, delay: 0.2 },
    { Icon: FileSpreadsheet, delay: 0.4 },
    { Icon: File, delay: 0.6 },
    { Icon: Database, delay: 0.8 }
  ];

  useEffect(() => {
    if (isInView) {
      const timer1 = setTimeout(() => setAnimationPhase(1), 1000);
      const timer2 = setTimeout(() => setAnimationPhase(2), 2500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setAnimationPhase(0);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:60px_60px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating Icons Animation */}
        <div className="relative h-96 mb-12">
          {icons.map((item, index) => {
            const angle = (index * 72) - 90; // Distribute evenly in circle
            const radius = 150;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={index}
                className="absolute top-1/2 left-1/2"
                initial={{ 
                  x: x, 
                  y: y, 
                  opacity: 0,
                  scale: 0.8
                }}
                animate={
                  animationPhase === 0 
                    ? { 
                        x: x, 
                        y: y, 
                        opacity: isInView ? 1 : 0,
                        scale: isInView ? 1 : 0.8,
                        rotate: isInView ? 360 : 0
                      }
                    : animationPhase === 1
                    ? { 
                        x: 0, 
                        y: 0, 
                        opacity: 1,
                        scale: 1.2,
                        rotate: 720
                      }
                    : { 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0.5
                      }
                }
                transition={{ 
                  duration: animationPhase === 0 ? 0.8 : 1.2,
                  delay: item.delay,
                  ease: "easeInOut"
                }}
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <div className="p-4 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg">
                  <item.Icon size={32} className="text-[#6e1d27]" />
                </div>
              </motion.div>
            );
          })}

          {/* Central Glowing Cube */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={
              animationPhase >= 1
                ? { 
                    scale: 1, 
                    opacity: 1,
                    rotateY: [0, 360],
                    boxShadow: [
                      "0 0 20px rgba(110, 29, 39, 0.3)",
                      "0 0 40px rgba(110, 29, 39, 0.6)",
                      "0 0 20px rgba(110, 29, 39, 0.3)"
                    ]
                  }
                : { scale: 0, opacity: 0 }
            }
            transition={{ 
              duration: 1,
              delay: 1,
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#912d3c] to-[#6e1d27] rounded-lg shadow-2xl border border-[#3d0e15]/20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Database size={40} className="text-[#f9efe8]" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex">
            COLLECT FROM ANYWHERE
          </h2>
          <p className="text-lg sm:text-xl text-[#6e1d27] max-w-3xl mx-auto leading-relaxed font-ibm-plex">
            Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Section 2: Structured Data Transformation
function StructuredDataSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showTable, setShowTable] = useState(false);

  const tableData = [
    { name: "John Smith", email: "john@company.com", orderId: "ORD-001", status: "Completed" },
    { name: "Sarah Johnson", email: "sarah@startup.io", orderId: "ORD-002", status: "Processing" },
    { name: "Mike Chen", email: "mike@tech.com", orderId: "ORD-003", status: "Pending" },
    { name: "Emma Wilson", email: "emma@design.co", orderId: "ORD-004", status: "Completed" }
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowTable(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowTable(false);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f5e6d3] via-[#f0dcc4] to-[#ebe1d1] flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,_#6e1d27_1px,_transparent_1px),_linear-gradient(-45deg,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Morphing Box to Table */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Table Animation */}
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#6e1d27]/10 overflow-hidden"
            >
              {/* Table Header */}
              <motion.div 
                className="bg-gradient-to-r from-[#6e1d27] to-[#912d3c] p-4"
                initial={{ y: -50, opacity: 0 }}
                animate={showTable ? { y: 0, opacity: 1 } : { y: -50, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="grid grid-cols-4 gap-4 text-[#f9efe8] font-semibold font-ibm-plex">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Order ID</div>
                  <div>Status</div>
                </div>
              </motion.div>

              {/* Table Rows */}
              <div className="p-4 space-y-3">
                {tableData.map((row, index) => (
                  <motion.div
                    key={index}
                    className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-[#f9efe8]/50 hover:bg-[#f9efe8] transition-colors duration-200 border border-[#6e1d27]/5"
                    initial={{ x: -100, opacity: 0 }}
                    animate={showTable ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  >
                    <div className="font-medium text-[#3d0e15] font-ibm-plex">{row.name}</div>
                    <div className="text-[#6e1d27] font-ibm-plex">{row.email}</div>
                    <div className="text-[#6e1d27] font-mono text-sm">{row.orderId}</div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
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
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex">
                INSTANT STRUCTURE
              </h2>
              <p className="text-lg sm:text-xl text-[#6e1d27] leading-relaxed font-ibm-plex">
                Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Section 3: Decision Dashboard
function DecisionDashboardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showCharts, setShowCharts] = useState(false);

  const dashboardItems = [
    { 
      Icon: BarChart3, 
      title: "Revenue Growth", 
      value: "+24%", 
      color: "from-[#6e1d27] to-[#912d3c]",
      delay: 0 
    },
    { 
      Icon: Users, 
      title: "Active Users", 
      value: "12.4K", 
      color: "from-[#912d3c] to-[#b6454e]",
      delay: 0.2 
    },
    { 
      Icon: TrendingUp, 
      title: "Conversion Rate", 
      value: "8.2%", 
      color: "from-[#b6454e] to-[#6e1d27]",
      delay: 0.4 
    },
    { 
      Icon: DollarSign, 
      title: "Total Sales", 
      value: "$89.2K", 
      color: "from-[#6e1d27] to-[#3d0e15]",
      delay: 0.6 
    }
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowCharts(true), 600);
      return () => clearTimeout(timer);
    } else {
      setShowCharts(false);
    }
  }, [isInView]);

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f0dcc4] via-[#ebe1d1] to-[#e6d6c7] flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_#6e1d27_2px,_transparent_2px),_radial-gradient(circle_at_75%_75%,_#6e1d27_2px,_transparent_2px)] bg-[length:80px_80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            FROM DATA TO DECISIONS
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-[#6e1d27] max-w-3xl mx-auto leading-relaxed font-ibm-plex"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.
          </motion.p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ y: 100, opacity: 0, rotateY: -15 }}
              animate={showCharts ? { y: 0, opacity: 1, rotateY: 0 } : { y: 100, opacity: 0, rotateY: -15 }}
              transition={{ duration: 0.8, delay: item.delay }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`bg-gradient-to-br ${item.color} p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <item.Icon size={32} className="text-white/90" />
                  <motion.div
                    className="w-3 h-3 bg-white/30 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: item.delay 
                    }}
                  />
                </div>
                <h3 className="text-white/90 font-semibold mb-2 font-ibm-plex">{item.title}</h3>
                <motion.div
                  className="text-2xl font-bold text-white font-ibm-plex"
                  initial={{ scale: 0 }}
                  animate={showCharts ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: item.delay + 0.3 }}
                >
                  {item.value}
                </motion.div>
                
                {/* Animated Chart Line */}
                <motion.div
                  className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  animate={showCharts ? { width: "100%" } : { width: 0 }}
                  transition={{ duration: 1, delay: item.delay + 0.5 }}
                >
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    initial={{ x: "-100%" }}
                    animate={showCharts ? { x: "0%" } : { x: "-100%" }}
                    transition={{ duration: 1.5, delay: item.delay + 0.7 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central Chart Visualization */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={showCharts ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-[#6e1d27]/10">
            <div className="flex items-center justify-center space-x-4">
              <PieChart size={48} className="text-[#6e1d27]" />
              <div className="text-center">
                <h4 className="text-xl font-bold text-[#3d0e15] font-ibm-plex">Interactive Dashboard</h4>
                <p className="text-[#6e1d27] font-ibm-plex">Drag, drop, and customize your insights</p>
              </div>
              <BarChart3 size={48} className="text-[#912d3c]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
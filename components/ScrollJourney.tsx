'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll } from 'framer-motion';
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
  useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div ref={containerRef} className="relative">
      <HeroFusionBox />
      <StructuredDataSection />
      <DecisionDashboardSection />
    </div>
  );
}

function HeroFusionBox() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [phase, setPhase] = useState(0);

  const icons = [Mail, FileText, FileSpreadsheet, File, Database];

  useEffect(() => {
    if (isInView) {
      const timers = [
        setTimeout(() => setPhase(1), 1000),
        setTimeout(() => setPhase(2), 2500),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setPhase(0);
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] flex items-center justify-between relative overflow-hidden px-10"
    >
      <div className="w-1/2 text-left z-10">
        <motion.h2
          className="text-4xl font-bold text-[#3d0e15] font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          COLLECT FROM ANYWHERE
        </motion.h2>
        <motion.p
          className="text-xl text-[#6e1d27] mt-4 max-w-md font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
        </motion.p>
      </div>

      <div className="relative w-1/2 h-[400px]">
        {icons.map((Icon, i) => {
          const angle = (i * 72) - 90;
          const radius = 120;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2"
              initial={{ x, y, opacity: 0 }}
              animate={
                phase === 0
                  ? { x, y, opacity: 1 }
                  : phase === 1
                  ? { x: 120, y: 0, opacity: 1 }
                  : { x: 120, y: 0, opacity: 0 }
              }
              transition={{ duration: 1, delay: i * 0.2 }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="p-3 bg-[#6e1d27]/10 rounded-full backdrop-blur border border-[#6e1d27]/20">
                <Icon size={30} className="text-[#6e1d27]" />
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="absolute top-1/2 left-[calc(50%+120px)] transform -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            phase >= 1
              ? {
                  scale: 1,
                  opacity: 1,
                  rotateY: [0, 360],
                  boxShadow: [
                    '0 0 20px rgba(110,29,39,0.3)',
                    '0 0 40px rgba(110,29,39,0.6)',
                    '0 0 20px rgba(110,29,39,0.3)',
                  ],
                }
              : { scale: 0, opacity: 0 }
          }
          transition={{ duration: 1 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#912d3c] to-[#6e1d27] rounded-lg shadow-xl border border-[#3d0e15]/20 flex items-center justify-center">
            <Database size={36} className="text-[#f9efe8]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StructuredDataSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showTable, setShowTable] = useState(false);

  const tableData = [
    { name: "John Smith", email: "john@company.com", orderId: "ORD-001", status: "Completed" },
    { name: "Sarah Johnson", email: "sarah@startup.io", orderId: "ORD-002", status: "Processing" },
    { name: "Mike Chen", email: "mike@tech.com", orderId: "ORD-003", status: "Pending" },
    { name: "Emma Wilson", email: "emma@design.co", orderId: "ORD-004", status: "Completed" },
    { name: "Alex Rodriguez", email: "alex@agency.com", orderId: "ORD-005", status: "Processing" },
    { name: "Lisa Park", email: "lisa@consulting.biz", orderId: "ORD-006", status: "Completed" }
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowTable(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowTable(false);
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f5e6d3] via-[#f0dcc4] to-[#ebe1d1] flex items-center justify-between relative overflow-hidden px-10"
    >
      <div className="w-1/2 text-left z-10">
        <motion.h2
          className="text-4xl font-bold text-[#3d0e15] font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          INSTANT STRUCTURE
        </motion.h2>
        <motion.p
          className="text-xl text-[#6e1d27] mt-4 max-w-md font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
        </motion.p>
      </div>

      <div className="relative w-1/2 h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateX: -15 }}
          animate={isInView ? { scale: 1, opacity: 1, rotateX: 0 } : { scale: 0.5, opacity: 0, rotateX: -15 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl border border-[#6e1d27]/10 w-[500px] overflow-hidden backdrop-blur-sm"
        >
          {/* Table Header */}
          <motion.div
            className="bg-gradient-to-r from-[#6e1d27] to-[#912d3c] p-4"
            initial={{ y: -50, opacity: 0 }}
            animate={showTable ? { y: 0, opacity: 1 } : { y: -50, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="grid grid-cols-4 gap-3 text-[#f9efe8] font-semibold font-ibm-plex text-sm">
              <div>Name</div>
              <div>Email</div>
              <div>Order ID</div>
              <div>Status</div>
            </div>
          </motion.div>

          {/* Table Body */}
          <div className="max-h-[280px] overflow-hidden">
            {tableData.map((row, i) => (
              <motion.div
                key={i}
                className="grid grid-cols-4 gap-3 p-3 border-b border-[#6e1d27]/5 hover:bg-[#f9efe8]/50 transition-colors duration-200"
                initial={{ x: -100, opacity: 0 }}
                animate={showTable ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + (i * 0.1) }}
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

          {/* Animated Data Flow Indicator */}
          <motion.div
            className="absolute -right-4 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, x: -20 }}
            animate={showTable ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-[#6e1d27] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="w-2 h-2 bg-[#912d3c] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="w-2 h-2 bg-[#b6454e] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function DecisionDashboardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  const [showDashboard, setShowDashboard] = useState(false);

  const cards = [
    { icon: BarChart3, label: 'Revenue', value: '$89.2K', color: 'from-[#6e1d27] to-[#912d3c]' },
    { icon: PieChart, label: 'Distribution', value: '24%', color: 'from-[#912d3c] to-[#b6454e]' },
    { icon: TrendingUp, label: 'Growth', value: '+18%', color: 'from-[#b6454e] to-[#6e1d27]' },
    { icon: Users, label: 'Users', value: '12.4K', color: 'from-[#6e1d27] to-[#3d0e15]' },
    { icon: Calendar, label: 'Timeline', value: '30d', color: 'from-[#912d3c] to-[#6e1d27]' },
    { icon: DollarSign, label: 'Profit', value: '+32%', color: 'from-[#b6454e] to-[#912d3c]' },
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowDashboard(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowDashboard(false);
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen bg-gradient-to-br from-[#f0dcc4] via-[#ebe1d1] to-[#e6d6c7] flex items-center justify-between relative overflow-hidden px-10"
    >
      <div className="w-1/2 text-left z-10">
        <motion.h2
          className="text-4xl font-bold text-[#3d0e15] font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          FROM DATA TO DECISIONS
        </motion.h2>
        <motion.p
          className="text-xl text-[#6e1d27] mt-4 max-w-md font-ibm-plex"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.
        </motion.p>
      </div>

      <div className="relative w-1/2 h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 w-[450px]"
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="relative group"
              initial={{ y: 50, opacity: 0, rotateY: -15 }}
              animate={showDashboard ? { y: 0, opacity: 1, rotateY: 0 } : { y: 50, opacity: 0, rotateY: -15 }}
              transition={{ duration: 0.8, delay: 0.5 + (i * 0.1) }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`bg-gradient-to-br ${card.color} p-4 rounded-xl shadow-xl border border-white/20 backdrop-blur-sm h-[100px]`}>
                <div className="flex items-center justify-between mb-2">
                  <card.icon size={24} className="text-white/90" />
                  <motion.div
                    className="w-2 h-2 bg-white/30 rounded-full"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.8, 0.3]
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
                  initial={{ scale: 0 }}
                  animate={showDashboard ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + (i * 0.1) }}
                >
                  {card.value}
                </motion.div>
                
                {/* Animated Progress Bar */}
                <motion.div
                  className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  animate={showDashboard ? { width: "100%" } : { width: 0 }}
                  transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                >
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    initial={{ x: "-100%" }}
                    animate={showDashboard ? { x: "0%" } : { x: "-100%" }}
                    transition={{ duration: 1.2, delay: 1 + (i * 0.1) }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Connection Lines */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={showDashboard ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          {/* Animated connecting lines between cards */}
          <svg className="w-full h-full">
            <motion.path
              d="M150 100 Q225 150 300 100"
              stroke="rgba(110, 29, 39, 0.3)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={showDashboard ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 2.5 }}
            />
            <motion.path
              d="M150 200 Q225 250 300 200"
              stroke="rgba(145, 45, 60, 0.3)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={showDashboard ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 2, delay: 3 }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
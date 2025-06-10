'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, FileText, FileSpreadsheet, File, Database } from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const crmSectionRef = useRef<HTMLDivElement>(null);
  
  // First section scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // CRM section scroll progress
  const { scrollYProgress: crmScrollProgress } = useScroll({
    target: crmSectionRef,
    offset: ["start end", "end start"]
  });

  // Transform values for first section
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const boxProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [50, 0]);

  // Transform values for CRM section
  const crmOpacity = useTransform(crmScrollProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const crmTableProgress = useTransform(crmScrollProgress, [0.2, 0.8], [0, 1]);
  const crmTextOpacity = useTransform(crmScrollProgress, [0.3, 0.6], [0, 1]);
  const crmTextY = useTransform(crmScrollProgress, [0.3, 0.6], [50, 0]);

  // Icons data
  const icons = [
    { Icon: Mail, id: 'mail' },
    { Icon: FileText, id: 'file-text' },
    { Icon: FileSpreadsheet, id: 'spreadsheet' },
    { Icon: File, id: 'file' },
    { Icon: Database, id: 'database' }
  ];

  // Animation states for icons
  const [iconAnimations, setIconAnimations] = useState(
    icons.map((_, index) => ({
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      delay: index * 0.1
    }))
  );

  // Update icon positions based on scroll progress
  useEffect(() => {
    const unsubscribe = boxProgress.onChange((progress) => {
      setIconAnimations(icons.map((_, index) => {
        // Start positions (scattered around the box)
        const startPositions = [
          { x: -120, y: -100 },  // Mail - far top left
          { x: 140, y: -80 },    // FileText - far top right
          { x: -100, y: 80 },    // Spreadsheet - far bottom left
          { x: 120, y: 100 },    // File - far bottom right
          { x: 0, y: -140 }      // Database - far top center
        ];

        // End positions (inside the box)
        const endPositions = [
          { x: -30, y: -15 },    // Mail
          { x: 30, y: -15 },     // FileText
          { x: -30, y: 15 },     // Spreadsheet
          { x: 30, y: 15 },      // File
          { x: 0, y: 0 }         // Database - center
        ];

        const start = startPositions[index];
        const end = endPositions[index];

        // Smooth interpolation with easing
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const x = start.x + (end.x - start.x) * easeProgress;
        const y = start.y + (end.y - start.y) * easeProgress;
        const scale = 1 - (easeProgress * 0.2); // Even less shrinking for bigger final icons

        return {
          x,
          y,
          scale,
          opacity: 1,
          delay: index * 0.1
        };
      }));
    });

    return unsubscribe;
  }, [boxProgress]);

  return (
    <>
      {/* First Section - Collect from anywhere */}
      <section 
        ref={containerRef}
        className="relative min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] overflow-hidden"
      >
        {/* Background Animation Layer - Same as Hero */}
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

        <motion.div 
          className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
          style={{ opacity }}
        >
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Mobile Layout - Stacked */}
            <div className="block lg:hidden">
              <div className="text-center space-y-8">
                {/* Text Content - Mobile */}
                <motion.div 
                  className="space-y-6"
                  style={{ 
                    opacity: textOpacity,
                    y: textY
                  }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#3d0e15] font-ibm-plex leading-tight">
                    Collect from anywhere.
                  </h2>
                  <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-2xl mx-auto">
                    Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
                  </p>
                </motion.div>

                {/* Box Animation - Mobile */}
                <div className="flex items-center justify-center">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                    {/* Ultra-Thin Box SVG */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 24 24"
                      style={{ 
                        filter: 'drop-shadow(3px 3px 8px rgba(110, 29, 39, 0.15))'
                      }}
                    >
                      <motion.path
                        d="M20.73 16.52C20.73 16.52 20.73 16.45 20.73 16.41V7.58999C20.7297 7.47524 20.7022 7.36218 20.65 7.25999C20.5764 7.10119 20.4488 6.97364 20.29 6.89999L12.29 3.31999C12.1926 3.2758 12.0869 3.25293 11.98 3.25293C11.8731 3.25293 11.7674 3.2758 11.67 3.31999L3.67001 6.89999C3.54135 6.96474 3.43255 7.06303 3.35511 7.18448C3.27766 7.30592 3.23444 7.44603 3.23001 7.58999V16.41C3.23749 16.5532 3.28195 16.6921 3.35906 16.813C3.43617 16.9339 3.54331 17.0328 3.67001 17.1L11.67 20.68C11.7668 20.7262 11.8727 20.7501 11.98 20.7501C12.0873 20.7501 12.1932 20.7262 12.29 20.68L20.29 17.1C20.4055 17.0471 20.5061 16.9665 20.5829 16.8653C20.6597 16.7641 20.7102 16.6455 20.73 16.52ZM4.73001 8.73999L11.23 11.66V18.84L4.73001 15.93V8.73999ZM12.73 11.66L19.23 8.73999V15.93L12.73 18.84V11.66ZM12 4.81999L18.17 7.58999L12 10.35L5.83001 7.58999L12 4.81999Z"
                        fill="none"
                        stroke="#6e1d27"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: boxProgress }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.svg>

                    {/* Floating Icons - Bigger */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {icons.map((icon, index) => {
                        const animation = iconAnimations[index];
                        return (
                          <motion.div
                            key={icon.id}
                            className="absolute"
                            style={{
                              x: animation.x,
                              y: animation.y,
                              scale: animation.scale,
                              opacity: animation.opacity,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 80,
                              damping: 25,
                              delay: animation.delay
                            }}
                          >
                            <div className="p-3 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg">
                              <icon.Icon 
                                size={30} 
                                className="text-[#6e1d27] drop-shadow-lg" 
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              
              {/* Left Side - Text Content */}
              <motion.div 
                className="text-left space-y-8"
                style={{ 
                  opacity: textOpacity,
                  y: textY
                }}
              >
                <h2 className="text-4xl xl:text-5xl font-bold text-[#3d0e15] font-ibm-plex leading-tight">
                  Collect from anywhere.
                </h2>
                <p className="text-xl xl:text-2xl text-[#6e1d27] font-ibm-plex leading-relaxed">
                  Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
                </p>
              </motion.div>

              {/* Right Side - Box Animation */}
              <div className="flex items-center justify-center">
                <div className="relative w-80 h-80 xl:w-96 xl:h-96">
                  {/* Ultra-Thin Box SVG */}
                  <motion.svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 24 24"
                    style={{ 
                      filter: 'drop-shadow(4px 4px 12px rgba(110, 29, 39, 0.2))'
                    }}
                  >
                    <motion.path
                      d="M20.73 16.52C20.73 16.52 20.73 16.45 20.73 16.41V7.58999C20.7297 7.47524 20.7022 7.36218 20.65 7.25999C20.5764 7.10119 20.4488 6.97364 20.29 6.89999L12.29 3.31999C12.1926 3.2758 12.0869 3.25293 11.98 3.25293C11.8731 3.25293 11.7674 3.2758 11.67 3.31999L3.67001 6.89999C3.54135 6.96474 3.43255 7.06303 3.35511 7.18448C3.27766 7.30592 3.23444 7.44603 3.23001 7.58999V16.41C3.23749 16.5532 3.28195 16.6921 3.35906 16.813C3.43617 16.9339 3.54331 17.0328 3.67001 17.1L11.67 20.68C11.7668 20.7262 11.8727 20.7501 11.98 20.7501C12.0873 20.7501 12.1932 20.7262 12.29 20.68L20.29 17.1C20.4055 17.0471 20.5061 16.9665 20.5829 16.8653C20.6597 16.7641 20.7102 16.6455 20.73 16.52ZM4.73001 8.73999L11.23 11.66V18.84L4.73001 15.93V8.73999ZM12.73 11.66L19.23 8.73999V15.93L12.73 18.84V11.66ZM12 4.81999L18.17 7.58999L12 10.35L5.83001 7.58999L12 4.81999Z"
                      fill="none"
                      stroke="#6e1d27"
                      strokeWidth="0.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: boxProgress }}
                      transition={{
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.svg>

                  {/* Floating Icons - Bigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {icons.map((icon, index) => {
                      const animation = iconAnimations[index];
                      return (
                        <motion.div
                          key={icon.id}
                          className="absolute"
                          style={{
                            x: animation.x,
                            y: animation.y,
                            scale: animation.scale,
                            opacity: animation.opacity,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 25,
                            delay: animation.delay
                          }}
                        >
                          <div className="p-3 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg">
                            <icon.Icon 
                              size={36} 
                              className="text-[#6e1d27] drop-shadow-lg" 
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gradient Overlay for Depth - Same as Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
      </section>

      {/* Second Section - CRM/Database Table */}
      <section 
        ref={crmSectionRef}
        className="relative min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] overflow-hidden"
      >
        {/* Background Animation Layer - Same as Hero */}
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

        <motion.div 
          className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
          style={{ opacity: crmOpacity }}
        >
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Mobile Layout - Stacked */}
            <div className="block lg:hidden">
              <div className="text-center space-y-8">
                {/* Text Content - Mobile */}
                <motion.div 
                  className="space-y-6"
                  style={{ 
                    opacity: crmTextOpacity,
                    y: crmTextY
                  }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#3d0e15] font-ibm-plex leading-tight">
                    Instant structure.
                  </h2>
                  <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-2xl mx-auto">
                    Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
                  </p>
                </motion.div>

                {/* CRM Table Animation - Mobile */}
                <div className="flex items-center justify-center">
                  <div className="relative w-80 h-64 sm:w-96 sm:h-72">
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 400 300"
                      style={{ 
                        filter: 'drop-shadow(3px 3px 8px rgba(110, 29, 39, 0.15))'
                      }}
                    >
                      {/* Table Container */}
                      <motion.rect
                        x="20"
                        y="40"
                        width="360"
                        height="220"
                        fill="none"
                        stroke="#6e1d27"
                        strokeWidth="1"
                        rx="8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: crmTableProgress }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />

                      {/* Header Row */}
                      <motion.line
                        x1="20"
                        y1="70"
                        x2="380"
                        y2="70"
                        stroke="#6e1d27"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: crmTableProgress }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                      />

                      {/* Vertical Dividers */}
                      {[120, 220, 320].map((x, index) => (
                        <motion.line
                          key={`vertical-${index}`}
                          x1={x}
                          y1="40"
                          x2={x}
                          y2="260"
                          stroke="#6e1d27"
                          strokeWidth="0.8"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: crmTableProgress }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeInOut" }}
                        />
                      ))}

                      {/* Horizontal Rows */}
                      {[100, 130, 160, 190, 220].map((y, index) => (
                        <motion.line
                          key={`horizontal-${index}`}
                          x1="20"
                          y1={y}
                          x2="380"
                          y2={y}
                          stroke="#6e1d27"
                          strokeWidth="0.6"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: crmTableProgress }}
                          transition={{ duration: 0.6, delay: 0.6 + index * 0.1, ease: "easeInOut" }}
                        />
                      ))}

                      {/* Header Text */}
                      <motion.text
                        x="70"
                        y="60"
                        fill="#6e1d27"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: crmTableProgress }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        Name
                      </motion.text>
                      <motion.text
                        x="170"
                        y="60"
                        fill="#6e1d27"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: crmTableProgress }}
                        transition={{ duration: 0.5, delay: 1.3 }}
                      >
                        Email
                      </motion.text>
                      <motion.text
                        x="270"
                        y="60"
                        fill="#6e1d27"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: crmTableProgress }}
                        transition={{ duration: 0.5, delay: 1.4 }}
                      >
                        Status
                      </motion.text>
                      <motion.text
                        x="350"
                        y="60"
                        fill="#6e1d27"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: crmTableProgress }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                      >
                        Date
                      </motion.text>

                      {/* Sample Data Rows */}
                      {[
                        { name: "John Doe", email: "john@...", status: "Active", date: "2024", y: 90 },
                        { name: "Jane Smith", email: "jane@...", status: "Pending", date: "2024", y: 120 },
                        { name: "Mike Johnson", email: "mike@...", status: "Active", date: "2024", y: 150 },
                        { name: "Sarah Wilson", email: "sarah@...", status: "Inactive", date: "2024", y: 180 },
                        { name: "Tom Brown", email: "tom@...", status: "Active", date: "2024", y: 210 }
                      ].map((row, index) => (
                        <g key={`row-${index}`}>
                          <motion.text
                            x="70"
                            y={row.y}
                            fill="#6e1d27"
                            fontSize="10"
                            textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: crmTableProgress }}
                            transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                          >
                            {row.name}
                          </motion.text>
                          <motion.text
                            x="170"
                            y={row.y}
                            fill="#6e1d27"
                            fontSize="10"
                            textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: crmTableProgress }}
                            transition={{ duration: 0.3, delay: 1.7 + index * 0.1 }}
                          >
                            {row.email}
                          </motion.text>
                          <motion.text
                            x="270"
                            y={row.y}
                            fill="#6e1d27"
                            fontSize="10"
                            textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: crmTableProgress }}
                            transition={{ duration: 0.3, delay: 1.8 + index * 0.1 }}
                          >
                            {row.status}
                          </motion.text>
                          <motion.text
                            x="350"
                            y={row.y}
                            fill="#6e1d27"
                            fontSize="10"
                            textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: crmTableProgress }}
                            transition={{ duration: 0.3, delay: 1.9 + index * 0.1 }}
                          >
                            {row.date}
                          </motion.text>
                        </g>
                      ))}
                    </motion.svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              
              {/* Left Side - CRM Table Animation */}
              <div className="flex items-center justify-center">
                <div className="relative w-96 h-80 xl:w-[450px] xl:h-96">
                  <motion.svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 450 350"
                    style={{ 
                      filter: 'drop-shadow(4px 4px 12px rgba(110, 29, 39, 0.2))'
                    }}
                  >
                    {/* Table Container */}
                    <motion.rect
                      x="25"
                      y="50"
                      width="400"
                      height="250"
                      fill="none"
                      stroke="#6e1d27"
                      strokeWidth="1.2"
                      rx="10"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: crmTableProgress }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />

                    {/* Header Row */}
                    <motion.line
                      x1="25"
                      y1="85"
                      x2="425"
                      y2="85"
                      stroke="#6e1d27"
                      strokeWidth="1.2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: crmTableProgress }}
                      transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                    />

                    {/* Vertical Dividers */}
                    {[135, 245, 355].map((x, index) => (
                      <motion.line
                        key={`vertical-${index}`}
                        x1={x}
                        y1="50"
                        x2={x}
                        y2="300"
                        stroke="#6e1d27"
                        strokeWidth="1"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: crmTableProgress }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeInOut" }}
                      />
                    ))}

                    {/* Horizontal Rows */}
                    {[120, 155, 190, 225, 260].map((y, index) => (
                      <motion.line
                        key={`horizontal-${index}`}
                        x1="25"
                        y1={y}
                        x2="425"
                        y2={y}
                        stroke="#6e1d27"
                        strokeWidth="0.8"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: crmTableProgress }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1, ease: "easeInOut" }}
                      />
                    ))}

                    {/* Header Text */}
                    <motion.text
                      x="80"
                      y="72"
                      fill="#6e1d27"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: crmTableProgress }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      Name
                    </motion.text>
                    <motion.text
                      x="190"
                      y="72"
                      fill="#6e1d27"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: crmTableProgress }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      Email
                    </motion.text>
                    <motion.text
                      x="300"
                      y="72"
                      fill="#6e1d27"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: crmTableProgress }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                    >
                      Status
                    </motion.text>
                    <motion.text
                      x="390"
                      y="72"
                      fill="#6e1d27"
                      fontSize="14"
                      fontWeight="600"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: crmTableProgress }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                    >
                      Date
                    </motion.text>

                    {/* Sample Data Rows */}
                    {[
                      { name: "John Doe", email: "john@company.com", status: "Active", date: "2024-01", y: 107 },
                      { name: "Jane Smith", email: "jane@startup.io", status: "Pending", date: "2024-01", y: 142 },
                      { name: "Mike Johnson", email: "mike@tech.com", status: "Active", date: "2024-01", y: 177 },
                      { name: "Sarah Wilson", email: "sarah@design.co", status: "Inactive", date: "2024-01", y: 212 },
                      { name: "Tom Brown", email: "tom@agency.net", status: "Active", date: "2024-01", y: 247 }
                    ].map((row, index) => (
                      <g key={`row-${index}`}>
                        <motion.text
                          x="80"
                          y={row.y}
                          fill="#6e1d27"
                          fontSize="12"
                          textAnchor="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: crmTableProgress }}
                          transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                        >
                          {row.name}
                        </motion.text>
                        <motion.text
                          x="190"
                          y={row.y}
                          fill="#6e1d27"
                          fontSize="12"
                          textAnchor="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: crmTableProgress }}
                          transition={{ duration: 0.3, delay: 1.7 + index * 0.1 }}
                        >
                          {row.email}
                        </motion.text>
                        <motion.text
                          x="300"
                          y={row.y}
                          fill="#6e1d27"
                          fontSize="12"
                          textAnchor="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: crmTableProgress }}
                          transition={{ duration: 0.3, delay: 1.8 + index * 0.1 }}
                        >
                          {row.status}
                        </motion.text>
                        <motion.text
                          x="390"
                          y={row.y}
                          fill="#6e1d27"
                          fontSize="12"
                          textAnchor="middle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: crmTableProgress }}
                          transition={{ duration: 0.3, delay: 1.9 + index * 0.1 }}
                        >
                          {row.date}
                        </motion.text>
                      </g>
                    ))}
                  </motion.svg>
                </div>
              </div>

              {/* Right Side - Text Content */}
              <motion.div 
                className="text-left space-y-8"
                style={{ 
                  opacity: crmTextOpacity,
                  y: crmTextY
                }}
              >
                <h2 className="text-4xl xl:text-5xl font-bold text-[#3d0e15] font-ibm-plex leading-tight">
                  Instant structure.
                </h2>
                <p className="text-xl xl:text-2xl text-[#6e1d27] font-ibm-plex leading-relaxed">
                  Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Gradient Overlay for Depth - Same as Hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
      </section>
    </>
  );
}
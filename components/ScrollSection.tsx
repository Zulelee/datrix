'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, FileText, FileSpreadsheet, File, Database } from 'lucide-react';

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform values for smooth animations
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const boxProgress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [50, 0]);

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
        // Start positions (scattered)
        const startPositions = [
          { x: -100, y: -80 },  // Mail - top left
          { x: 120, y: -60 },   // FileText - top right
          { x: -80, y: 60 },    // Spreadsheet - bottom left
          { x: 100, y: 80 },    // File - bottom right
          { x: 0, y: -100 }     // Database - top center
        ];

        // End positions (inside box)
        const endPositions = [
          { x: -40, y: -20 },   // Mail
          { x: 40, y: -20 },    // FileText
          { x: -40, y: 20 },    // Spreadsheet
          { x: 40, y: 20 },     // File
          { x: 0, y: 0 }        // Database - center
        ];

        const start = startPositions[index];
        const end = endPositions[index];

        // Smooth interpolation
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;
        const scale = 1 - (progress * 0.3); // Slightly shrink as they move in

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
    <section 
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] overflow-hidden"
    >
      <motion.div 
        className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Text Content */}
          <motion.div 
            className="text-left space-y-6"
            style={{ 
              opacity: textOpacity,
              y: textY
            }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] font-ibm-plex leading-tight">
              Collect from anywhere.
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-lg">
              Datrix fetches data from emails, files, chat inputs, and more — no manual steps required.
            </p>
          </motion.div>

          {/* Right Side - Animated Box with Icons */}
          <div className="flex items-center justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              
              {/* Animated Box Drawing */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                initial={{ pathLength: 0 }}
                style={{ pathLength: boxProgress }}
              >
                {/* Box outline with hand-drawn style */}
                <motion.path
                  d="M50 100 L50 350 L350 350 L350 100 L300 100 L300 50 L100 50 L100 100 Z"
                  fill="none"
                  stroke="#6e1d27"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    pathLength: boxProgress,
                    filter: 'drop-shadow(2px 2px 4px rgba(110, 29, 39, 0.2))'
                  }}
                />
                
                {/* Box lid/flaps */}
                <motion.path
                  d="M100 100 L150 50 M300 50 L250 100 M50 100 L100 50 M350 100 L300 50"
                  fill="none"
                  stroke="#6e1d27"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    pathLength: boxProgress,
                    opacity: boxProgress
                  }}
                />
              </motion.svg>

              {/* Floating Icons */}
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
                        stiffness: 100,
                        damping: 20,
                        delay: animation.delay
                      }}
                    >
                      <div className="p-3 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg">
                        <icon.Icon 
                          size={24} 
                          className="text-[#6e1d27] drop-shadow-lg" 
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Box closing animation */}
              <motion.svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                style={{ opacity: useTransform(boxProgress, [0.7, 1], [0, 1]) }}
              >
                {/* Closing flaps */}
                <motion.path
                  d="M100 100 L200 100 L300 100"
                  fill="none"
                  stroke="#6e1d27"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    pathLength: useTransform(boxProgress, [0.7, 1], [0, 1])
                  }}
                />
              </motion.svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
      </div>
    </section>
  );
}
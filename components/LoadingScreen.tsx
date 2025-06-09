'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './Hero';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    // Show the spiral for 3 seconds then transition to hero
    const timer = setTimeout(() => {
      setShowHero(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!showHero && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Spiral Loading Animation */}
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 96 96"
                  fill="none"
                  className="w-full h-full"
                >
                  {/* Spiral with tail effect */}
                  <motion.path
                    d="M48 8 C 70 8, 88 26, 88 48 C 88 70, 70 88, 48 88 C 26 88, 8 70, 8 48 C 8 26, 26 8, 48 8 C 65 8, 80 23, 80 40 C 80 57, 65 72, 48 72 C 31 72, 16 57, 16 40 C 16 23, 31 8, 48 8 C 60 8, 72 20, 72 32 C 72 44, 60 56, 48 56 C 36 56, 24 44, 24 32 C 24 20, 36 8, 48 8"
                    stroke="url(#spiralGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(110, 29, 39, 0.3))'
                    }}
                  />
                  
                  {/* Gradient definition for the tail effect */}
                  <defs>
                    <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6e1d27" stopOpacity="1" />
                      <stop offset="50%" stopColor="#912d3c" stopOpacity="0.8" />
                      <stop offset="80%" stopColor="#b6454e" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#b6454e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Center dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#6e1d27] rounded-full transform -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <AnimatePresence>
        {showHero && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Hero />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
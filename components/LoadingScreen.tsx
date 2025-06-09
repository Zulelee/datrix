'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';
import Hero from './Hero';

interface LoadingScreenProps {
  onComplete: () => void;
  showWelcome?: boolean; // New prop to control welcome animation
}

export default function LoadingScreen({ onComplete, showWelcome = false }: LoadingScreenProps) {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showHero, setShowHero] = useState(false);

  const welcomeText = 'Welcome to Datrix';

  // Handle Apple Hello animation completion
  const handleHelloComplete = () => {
    setTimeout(() => {
      setShowTypewriter(true);
    }, 500); // Small delay after hello completes
  };

  // Typewriter effect
  useEffect(() => {
    if (!showTypewriter) return;

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= welcomeText.length) {
        setTypewriterText(welcomeText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Show hero after typewriter completes + 1 second pause
        setTimeout(() => {
          setShowHero(true);
        }, 1000);
      }
    }, 80); // Typing speed

    return () => clearInterval(typeInterval);
  }, [showTypewriter]);

  // For non-welcome pages, show simple loading for 2 seconds
  useEffect(() => {
    if (!showWelcome) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, onComplete]);

  // Simple circular loading animation for other pages
  if (!showWelcome) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Circular Loading Animation */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-[#6e1d27]/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#6e1d27] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Optional loading text */}
        <motion.p
          className="absolute mt-24 text-[#6e1d27] font-ibm-plex font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading...
        </motion.p>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>
      </motion.div>
    );
  }

  // Welcome animation for landing page
  return (
    <>
      <AnimatePresence>
        {!showHero && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Apple Hello Effect */}
            <div className="mb-8">
              <AppleHelloEnglishEffect
                className="h-16 sm:h-20 md:h-24 text-[#6e1d27]"
                speed={1.2}
                onAnimationComplete={handleHelloComplete}
              />
            </div>

            {/* Typewriter Text */}
            <AnimatePresence>
              {showTypewriter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-[#3d0e15] font-ibm-plex tracking-wide">
                    {typewriterText}
                    <motion.span
                      className="inline-block w-0.5 h-6 sm:h-8 md:h-10 bg-[#6e1d27] ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

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
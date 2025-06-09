'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';
import { usePathname } from 'next/navigation';

export default function LoadingScreen() {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const welcomeText = 'Welcome to Datrix';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Apple Hello animation completion
  const handleHelloComplete = () => {
    setTimeout(() => {
      setShowTypewriter(true);
    }, 500); // Small delay after hello completes
  };

  // Typewriter effect for landing page
  useEffect(() => {
    if (!showTypewriter || !isLandingPage) return;

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= welcomeText.length) {
        setTypewriterText(welcomeText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Show content after typewriter completes + 1 second pause
        setTimeout(() => {
          setShowContent(true);
        }, 1000);
      }
    }, 80); // Typing speed

    return () => clearInterval(typeInterval);
  }, [showTypewriter, isLandingPage]);

  // For non-landing pages, show simple loading for 2 seconds
  useEffect(() => {
    if (!isLandingPage && mounted) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLandingPage, mounted]);

  if (!mounted) {
    return null;
  }

  // Animated dots for loading text
  const AnimatedDots = () => {
    return (
      <span className="inline-flex">
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >
          .
        </motion.span>
      </span>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!showContent && (
          <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Container for perfect centering */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {isLandingPage ? (
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center">
                  {/* Apple Hello Effect for Landing Page */}
                  <div className="mb-6 sm:mb-8">
                    <AppleHelloEnglishEffect
                      className="h-12 sm:h-16 md:h-20 lg:h-24 text-[#6e1d27]"
                      speed={1.2}
                      onAnimationComplete={handleHelloComplete}
                    />
                  </div>

                  {/* Typewriter Text for Landing Page */}
                  <AnimatePresence>
                    {showTypewriter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full"
                      >
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-[#3d0e15] font-ibm-plex tracking-wide">
                          {typewriterText}
                          <motion.span
                            className="inline-block w-0.5 h-5 sm:h-6 md:h-8 lg:h-10 bg-[#6e1d27] ml-1"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </h2>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {/* Simple Loading Text for Other Pages */}
                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#3d0e15] font-ibm-plex tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    LOADING<AnimatedDots />
                  </motion.h2>
                </div>
              )}
            </div>

            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:40px_40px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showFadeOut, setShowFadeOut] = useState(false);

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
        // Start fade out after typewriter completes + 1 second pause
        setTimeout(() => {
          setShowFadeOut(true);
          // Complete loading after fade animation
          setTimeout(() => {
            onComplete();
          }, 800); // Match fade duration
        }, 1000);
      }
    }, 80); // Typing speed

    return () => clearInterval(typeInterval);
  }, [showTypewriter, onComplete]);

  return (
    <AnimatePresence>
      {!showFadeOut && (
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
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function LoadingScreen() {
  const [showContent, setShowContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isLandingPage = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skip animation for landing page - show content immediately
  useEffect(() => {
    if (isLandingPage && mounted) {
      setShowContent(true);
    }
  }, [isLandingPage, mounted]);

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
              <div className="flex flex-col items-center justify-center">
                {/* Simple Loading Text for Other Pages */}
                <motion.h2
                  className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#3d0e15] font-ibm-plex tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  LOADING
                  <AnimatedDots />
                </motion.h2>
              </div>
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

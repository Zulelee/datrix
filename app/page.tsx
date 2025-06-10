'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hero from '@/components/Hero';
import ScrollSection from '@/components/ScrollSection';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform for hero fade out
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section with Fade Out Animation */}
      <motion.div
        style={{ 
          opacity: heroOpacity,
          scale: heroScale
        }}
        className="relative z-10"
      >
        <Hero />
      </motion.div>
      
      {/* Scroll Section with Collection Animation */}
      <ScrollSection />
    </main>
  );
}
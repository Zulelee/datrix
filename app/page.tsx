'use client';

import { useState, useEffect } from 'react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ScrollSection from '@/components/ScrollSection';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="relative min-h-screen">
      {/* Permanent Background Layer */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4]">
        {/* Background Animation Layer - ALWAYS VISIBLE */}
        <FlickeringGrid
          className="absolute inset-0 size-full"
          squareSize={3}
          gridGap={8}
          color="#6e1d27"
          maxOpacity={0.15}
          flickerChance={0.08}
        />
        
        {/* Gradient Overlay for Depth - ALWAYS VISIBLE */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Permanent Bolt Logo in Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <Link 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 backdrop-blur-sm border-2 border-[#6e1d27]/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 p-2 cursor-pointer">
              <Image
                src="/white_circle_360x360.png"
                alt="Bolt Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </Link>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-[#6e1d27]/5 blur-xl scale-150 -z-10" />
        </motion.div>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10">
        <Hero />
        <ScrollSection />
      </div>
    </main>
  );
}
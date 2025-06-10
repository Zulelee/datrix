'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import FloatingIcons from './FloatingIcons';
import Navbar from './Navbar';
import TypewriterText from './TypewriterText';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] overflow-hidden">
        {/* Background Animation Layer */}
        <div className="absolute inset-0 z-0">
          <FlickeringGrid
            className="absolute inset-0 size-full"
            squareSize={3}
            gridGap={8}
            color="#6e1d27"
            maxOpacity={0.15}
            flickerChance={0.08}
          />
          <FloatingIcons />
        </div>

        {/* Foreground Content - Perfectly Centered */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Headline with Typewriter Effect - IBM Plex Sans Bold - ALL CAPS */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-8 animate-fade-in-up font-ibm-plex leading-tight tracking-tight">
              <span className="block mb-2">
                TURN RAW DATA INTO
              </span>
              <TypewriterText />
            </h1>

            {/* Subheadline - IBM Plex Sans Medium */}
            <h2 className="text-base sm:text-lg md:text-xl lg:text-xl font-medium text-[#6e1d27] mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 font-ibm-plex" 
                style={{ textShadow: '0 1px 2px rgba(61, 14, 21, 0.1)' }}>
              Let Datrix handle the chaos and surface the insights.
            </h2>

            {/* CTA Buttons - IBM Plex Sans */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
              <Button 
              onClick={() => {
                router.push('/auth'); // Redirect to home
              }}
                size="lg" 
                className="bg-[#6e1d27] hover:bg-[#912d3c] text-[#f9efe8] px-8 py-4 text-lg font-semibold rounded-full shadow-lg shadow-[#b6454e]/30 hover:shadow-xl hover:shadow-[#b6454e]/40 transform hover:scale-105 transition-all duration-300 font-ibm-plex tracking-wide"
              >
                Try Datrix Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-[#f9efe8] px-8 py-4 text-lg font-semibold rounded-full bg-transparent backdrop-blur-sm hover:backdrop-blur-none transform hover:scale-105 transition-all duration-300 font-ibm-plex tracking-wide"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
      </section>
    </>
  );
}
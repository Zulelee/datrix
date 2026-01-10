"use client";

import { useState, useEffect } from "react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import ScrollSection from "@/components/ScrollSection";
import MeetTheTeam from "@/components/MeetTheTeam";

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

      {/* Scrollable Content Container */}
      <div className="relative z-10">
        <Hero />
        <ScrollSection />
        <MeetTheTeam />
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
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
    <main className="min-h-screen">
      <Hero />
      <ScrollSection />
    </main>
  );
}
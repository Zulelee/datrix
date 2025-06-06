'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import LoadingScreen from '@/components/LoadingScreen';
import ScrollJourney from '@/components/ScrollJourney';

export default function Home() {
  const [showLoading, setShowLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {showLoading ? (
        <LoadingScreen onComplete={handleLoadingComplete} />
      ) : (
        <>
          <Hero />
          <ScrollJourney />
        </>
      )}
    </main>
  );
}
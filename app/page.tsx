'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import LoadingScreen from '@/components/LoadingScreen';

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
      <LoadingScreen onComplete={() => {}} />
    </main>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BarChart3, Home, MessageSquare, LogOut, User, Webhook } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#b6454e] to-[#6e1d27] p-1 shadow-lg">
              <Image
                src="/WhatsApp Image 2025-06-05 at 16.44.33.jpeg"
                alt="Datrix Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <span className="text-[#3d0e15] text-xl font-bold tracking-wide font-ibm-plex">
              Datrix
            </span>
          </div>

          {/* Try Now Button */}
          <Button 
            onClick={() => {
              router.push('/auth');
            }}
            className="bg-[#6e1d27] hover:bg-[#912d3c] text-[#f9efe8] px-6 py-2 font-semibold rounded-full shadow-lg shadow-[#b6454e]/20 hover:shadow-xl hover:shadow-[#b6454e]/30 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-[#6e1d27]/10 font-ibm-plex tracking-wide"
          >
            Try Now
          </Button>
        </div>
      </div>
    </nav>
  );
}

export function OnboardingNavbar({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#b6454e] to-[#6e1d27] p-1 shadow-lg">
              <Image
                src="/WhatsApp Image 2025-06-05 at 16.44.33.jpeg"
                alt="Datrix Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <span className="text-[#3d0e15] text-xl font-bold tracking-wide font-ibm-plex">
              Datrix
            </span>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/stickyanalysis')}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/datrixai')}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/webhook-test')}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <Webhook className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] relative overflow-hidden">
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
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button
            variant="outline"
            className="hand-drawn-border bg-white/80 backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Hand-drawn container */}
          <div className="hand-drawn-container bg-white/90 backdrop-blur-sm p-8 relative">
            {/* Decorative corner doodles */}
            <div className="absolute top-2 left-2 w-6 h-6 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <path
                  d="M3 3 L21 3 L21 21 L3 21 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="hand-drawn-path"
                />
              </svg>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="hand-drawn-path"
                />
              </svg>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                className="text-3xl font-bold text-[#3d0e15] mb-2 font-ibm-plex hand-drawn-text"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {isLogin ? 'Welcome Back!' : 'Join Datrix'}
              </motion.h1>
              <motion.p
                className="text-[#6e1d27] font-ibm-plex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-5 w-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="hand-drawn-input pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="hand-drawn-input pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="hand-drawn-input pl-10 pr-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] hover:text-[#3d0e15] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-5 w-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="hand-drawn-input pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white py-3 text-lg font-semibold font-ibm-plex transition-all duration-300 transform hover:scale-105"
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </motion.div>

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-[#6e1d27] hover:text-[#3d0e15] font-ibm-plex text-sm underline transition-colors hand-drawn-text"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-8 text-center">
              <p className="text-[#6e1d27] font-ibm-plex">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-[#3d0e15] font-semibold hover:text-[#6e1d27] transition-colors hand-drawn-text underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Decorative bottom doodles */}
            <div className="absolute bottom-2 left-2 w-8 h-4 opacity-20">
              <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                <path
                  d="M2 8 Q8 2 16 8 T30 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="hand-drawn-path"
                />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 opacity-20">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <path
                  d="M12 2 L22 12 L12 22 L2 12 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="hand-drawn-path"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f9efe8]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
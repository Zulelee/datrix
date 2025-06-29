'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        // Check if onboarding is complete
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single();

        if (profile?.onboarding_complete) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
      setLoading(false);
    };
    checkUser();
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
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (isLogin) {
      // Login
      const { email, password } = formData;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Check if onboarding is complete
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single();

        if (profile?.onboarding_complete) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      }
    } else {
      // Signup
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      const { email, password, name } = formData;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } , emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`}
      });
      if (error) {
        setError(error.message);
      } else {
        setShowConfirmDialog(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    }
    setLoading(false);
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

      {/* Back to Home Button - Fixed positioning for mobile */}
      <div className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="hand-drawn-border bg-transparent backdrop-blur-sm border-2 border-[#6e1d27] text-[#6e1d27] hover:bg-[#6e1d27] hover:text-white transition-all duration-300 font-ibm-plex text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
          >
            <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Back to Home</span>
            <span className="xs:hidden">Back</span>
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16 sm:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Hand-drawn container with transparent background */}
          <div className="hand-drawn-container bg-transparent backdrop-blur-sm p-6 sm:p-8 relative">
            {/* Decorative corner doodles */}
            <div className="absolute top-2 left-2 w-4 h-4 sm:w-6 sm:h-6 opacity-30">
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
            <div className="absolute top-2 right-2 w-4 h-4 sm:w-6 sm:h-6 opacity-30">
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
            <div className="text-center mb-6 sm:mb-8">
              <motion.h1
                className="text-2xl sm:text-3xl font-bold text-[#3d0e15] mb-2 font-ibm-plex hand-drawn-text"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {isLogin ? 'Welcome Back!' : 'Join Datrix'}
              </motion.h1>
              <motion.p
                className="text-[#6e1d27] font-ibm-plex text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text text-sm sm:text-base">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-4 w-4 sm:h-5 sm:w-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="hand-drawn-input pl-9 sm:pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text text-sm sm:text-base">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-4 w-4 sm:h-5 sm:w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="hand-drawn-input pl-9 sm:pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex text-sm sm:text-base h-10 sm:h-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text text-sm sm:text-base">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-4 w-4 sm:h-5 sm:w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="hand-drawn-input pl-9 sm:pl-10 pr-9 sm:pr-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex text-sm sm:text-base h-10 sm:h-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] hover:text-[#3d0e15] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                    <Label htmlFor="confirmPassword" className="text-[#3d0e15] font-ibm-plex font-medium hand-drawn-text text-sm sm:text-base">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6e1d27] h-4 w-4 sm:h-5 sm:w-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="hand-drawn-input pl-9 sm:pl-10 bg-white/80 border-2 border-[#6e1d27] text-[#3d0e15] placeholder-[#6e1d27]/60 font-ibm-plex text-sm sm:text-base h-10 sm:h-12"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-[#6e1d27]/30"></div>
                <span className="mx-2 text-[#6e1d27] font-ibm-plex text-xs">or</span>
                <div className="flex-grow border-t border-[#6e1d27]/30"></div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white py-2 sm:py-3 text-base sm:text-lg font-semibold font-ibm-plex transition-all duration-300 transform hover:scale-105 h-10 sm:h-12"
                >
                  {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </motion.div>

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-[#6e1d27] hover:text-[#3d0e15] font-ibm-plex text-xs sm:text-sm underline transition-colors hand-drawn-text"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <Button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`
                    }
                  });
                  if (error) setError(error.message);
                  setLoading(false);
                }}
                className="w-full hand-drawn-button bg-[#4285F4] hover:bg-[#357ae8] text-white py-2 sm:py-3 text-base sm:text-lg font-semibold font-ibm-plex transition-all duration-300 transform hover:scale-105 h-10 sm:h-12 mt-2 flex items-center justify-center"
              >
                <svg className="inline-block mr-2" width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.23 3.23l6.9-6.9C36.13 2.36 30.4 0 24 0 14.82 0 6.73 5.08 2.69 12.44l8.1 6.29C12.6 13.13 17.88 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.01h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.1 5.53C43.98 37.13 46.1 31.3 46.1 24.5z"/><path fill="#FBBC05" d="M10.79 28.73A14.5 14.5 0 0 1 9.5 24c0-1.64.28-3.23.79-4.73l-8.1-6.29A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.56l8.1-6.29z"/><path fill="#EA4335" d="M24 48c6.4 0 12.13-2.12 16.53-5.77l-7.1-5.53c-2.01 1.35-4.6 2.15-7.43 2.15-6.12 0-11.3-4.13-13.16-9.72l-8.1 6.29C6.73 42.92 14.82 48 24 48z"/></g></svg>
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              </Button>
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-[#6e1d27] font-ibm-plex text-sm sm:text-base">
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
            <div className="absolute bottom-2 left-2 w-6 h-3 sm:w-8 sm:h-4 opacity-20">
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
            <div className="absolute bottom-2 right-2 w-4 h-4 sm:w-6 sm:h-6 opacity-20">
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

      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#f9efe8]/80 z-50">
          <div className="relative bg-gradient-to-br from-[#f9efe8] via-[#f5e6d3] to-[#f0dcc4] rounded-2xl border-2 border-[#6e1d27] shadow-xl p-8 max-w-sm w-full text-center hand-drawn-container">
            {/* Decorative corner doodles */}
            <div className="absolute top-2 left-2 w-4 h-4 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
              </svg>
            </div>
            <div className="absolute top-2 right-2 w-4 h-4 opacity-30">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-drawn-path" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#3d0e15] font-ibm-plex hand-drawn-text">Confirm Your Email</h2>
            <p className="mb-4 text-[#6e1d27] font-ibm-plex text-base hand-drawn-text">
              We've sent a confirmation link to your email. Please check your inbox and follow the instructions to activate your account.
            </p>
            <Button
              onClick={() => {
                setShowConfirmDialog(false);
                setIsLogin(true);
              }}
              className="hand-drawn-button bg-[#6e1d27] hover:bg-[#912d3c] text-white py-2 px-6 text-base font-semibold font-ibm-plex transition-all duration-300 mt-2 border-2 border-[#6e1d27]"
            >
              Close
            </Button>
            {/* Decorative bottom doodles */}
            <div className="absolute bottom-2 left-2 w-6 h-3 opacity-20">
              <svg viewBox="0 0 32 16" className="w-full h-full text-[#6e1d27]">
                <path d="M2 8 Q8 2 16 8 T30 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 w-4 h-4 opacity-20">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hand-drawn-path" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
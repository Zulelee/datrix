'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Brain, Code, Users } from 'lucide-react';

const teamMembers = [
  {
    name: 'Zulele',
    role: 'AI Engineer',
    twitter: '@Zuleleee',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57 (1).jpeg',
    icon: Brain,
    description: 'Crafting intelligent algorithms that transform raw data into meaningful insights.',
  },
  {
    name: 'Humza',
    role: 'Full Stack Engineer',
    twitter: '@Mrhumza_',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57.jpeg',
    icon: Code,
    description: 'Building seamless experiences from frontend interfaces to backend architecture.',
  },
  {
    name: 'Nemo',
    role: 'Project Manager',
    twitter: '@Xfoundnemo',
    image: '/WhatsApp Image 2025-06-11 at 03.02.55.jpeg',
    icon: Users,
    description: 'Orchestrating team synergy and ensuring every project milestone is achieved.',
  }
];

export default function MeetTheTeam() {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-4 font-ibm-plex tracking-tight">
            MEET THE TEAM
          </h2>
          <p className="text-base sm:text-lg text-[#6e1d27] max-w-2xl mx-auto font-ibm-plex leading-relaxed">
            The brilliant minds behind Datrix
          </p>
        </motion.div>
      </div>

      {/* Team Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: "easeOut" 
              }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Hand-drawn Card Container - Smaller Size */}
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#6e1d27] shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 hover:border-[#912d3c] hand-drawn-container">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:20px_20px]" />
                </div>
                
                {/* Profile Picture with Hand-drawn Frame - Smaller Size */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    {/* Outer decorative ring with hand-drawn style */}
                    <div className="absolute -inset-3 border-2 border-[#6e1d27]/20 rounded-full group-hover:border-[#6e1d27]/40 transition-all duration-500 transform rotate-1 group-hover:rotate-0" />
                    
                    {/* Main profile picture container - Smaller Size */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                      {/* Hand-drawn border ring */}
                      <div className="absolute inset-0 border-3 border-[#6e1d27] rounded-full p-1 group-hover:scale-110 transition-transform duration-500 transform -rotate-1 group-hover:rotate-0 shadow-lg">
                        <div className="w-full h-full bg-white rounded-full p-1 border border-[#6e1d27]/30">
                          <Image
                            src={member.image}
                            alt={`${member.name} - ${member.role}`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      
                      {/* Role Icon Badge with hand-drawn style - Smaller Size */}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#6e1d27] border-2 border-[#3d0e15] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 transform rotate-3 group-hover:rotate-0">
                        <member.icon className="w-4 h-4 text-[#f9efe8]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Info with hand-drawn styling - Compact Layout */}
                <div className="text-center relative z-10">
                  {/* Name */}
                  <h3 className="text-xl sm:text-2xl font-bold text-[#3d0e15] font-ibm-plex group-hover:text-[#6e1d27] transition-colors duration-300 hand-drawn-text">
                    {member.name}
                  </h3>
                  <br />
                  {/* Role - On separate line */}
                  <p className="text-base font-semibold text-[#6e1d27]  font-ibm-plex hand-drawn-text">
                    {member.role}
                  </p>
                  
                  {/* Twitter Handle - No Icon */}
                  <div className="mb-3">
                    <span className="text-sm text-[#6e1d27] font-ibm-plex font-medium">
                      {member.twitter}
                    </span>
                  </div>
                  
                  {/* Description - Smaller text */}
                  <p className="text-[#6e1d27] leading-relaxed font-ibm-plex text-xs sm:text-sm">
                    {member.description}
                  </p>
                </div>

                {/* Hand-drawn Decorative Elements - Smaller */}
                <div className="absolute top-3 right-3 w-6 h-6 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  <svg viewBox="0 0 32 32" className="w-full h-full text-[#6e1d27]">
                    <circle
                      cx="16"
                      cy="16"
                      r="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="hand-drawn-path"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-3 left-3 w-4 h-4 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-[#6e1d27]">
                    <path
                      d="M12 2 L22 12 L12 22 L2 12 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="hand-drawn-path"
                    />
                  </svg>
                </div>

                {/* Corner doodles - Smaller */}
                <div className="absolute top-2 left-2 w-3 h-3 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                  <svg viewBox="0 0 16 16" className="w-full h-full text-[#6e1d27]">
                    <path
                      d="M2 2 L14 2 L14 14 L2 14 Z"
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
          ))}
        </div>
      </div>

      {/* Bottom Decorative Element with hand-drawn style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        viewport={{ once: true }}
        className="flex justify-center mt-12"
      >
        <svg viewBox="0 0 200 20" className="w-48 h-5 text-[#6e1d27] opacity-30">
          <path
            d="M10 10 Q50 5 100 10 T190 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="hand-drawn-path"
          />
        </svg>
      </motion.div>
    </section>
  );
}
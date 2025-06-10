'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Brain, Code, Users } from 'lucide-react';

const teamMembers = [
  {
    name: 'Zulele',
    role: 'AI Engineer',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57 (1).jpeg', // Corrected image
    icon: Brain,
    description: 'Crafting intelligent algorithms that transform raw data into meaningful insights.',
  },
  {
    name: 'Humza',
    role: 'Full Stack Engineer',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57.jpeg',
    icon: Code,
    description: 'Building seamless experiences from frontend interfaces to backend architecture.',
  },
  {
    name: 'Nemo',
    role: 'Project Manager',
    image: '/WhatsApp Image 2025-06-11 at 03.02.55.jpeg', // Corrected image
    icon: Users,
    description: 'Orchestrating team synergy and ensuring every project milestone is achieved.',
  }
];

export default function MeetTheTeam() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3d0e15] mb-6 font-ibm-plex tracking-tight">
            MEET THE TEAM
          </h2>
          <p className="text-lg sm:text-xl text-[#6e1d27] max-w-3xl mx-auto font-ibm-plex leading-relaxed">
            The brilliant minds behind Datrix, working together to revolutionize how you interact with data.
          </p>
        </motion.div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
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
              {/* Hand-drawn Card Container */}
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#6e1d27] shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-[#912d3c] hand-drawn-container">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#6e1d27_1px,_transparent_1px)] bg-[length:20px_20px]" />
                </div>
                
                {/* Profile Picture with Hand-drawn Frame */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative">
                    {/* Outer decorative ring with hand-drawn style */}
                    <div className="absolute -inset-4 border-2 border-[#6e1d27]/20 rounded-full group-hover:border-[#6e1d27]/40 transition-all duration-500 transform rotate-1 group-hover:rotate-0" />
                    
                    {/* Main profile picture container */}
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
                      {/* Hand-drawn border ring */}
                      <div className="absolute inset-0 border-3 border-[#6e1d27] rounded-full p-1 group-hover:scale-110 transition-transform duration-500 transform -rotate-1 group-hover:rotate-0 shadow-lg">
                        <div className="w-full h-full bg-white rounded-full p-2 border border-[#6e1d27]/30">
                          <Image
                            src={member.image}
                            alt={`${member.name} - ${member.role}`}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      
                      {/* Role Icon Badge with hand-drawn style */}
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#6e1d27] border-2 border-[#3d0e15] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 transform rotate-3 group-hover:rotate-0">
                        <member.icon className="w-6 h-6 text-[#f9efe8]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Info with hand-drawn styling */}
                <div className="text-center relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#3d0e15] mb-2 font-ibm-plex group-hover:text-[#6e1d27] transition-colors duration-300 hand-drawn-text">
                    {member.name}
                  </h3>
                  <p className="text-lg font-semibold text-[#6e1d27] mb-4 font-ibm-plex hand-drawn-text">
                    {member.role}
                  </p>
                  <p className="text-[#6e1d27] leading-relaxed font-ibm-plex text-sm sm:text-base">
                    {member.description}
                  </p>
                </div>

                {/* Hand-drawn Decorative Elements */}
                <div className="absolute top-4 right-4 w-8 h-8 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
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
                <div className="absolute bottom-4 left-4 w-6 h-6 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
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

                {/* Corner doodles */}
                <div className="absolute top-2 left-2 w-4 h-4 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
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
        className="flex justify-center mt-16"
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
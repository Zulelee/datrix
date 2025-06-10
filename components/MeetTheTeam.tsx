'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Brain, Code, Users } from 'lucide-react';

const teamMembers = [
  {
    name: 'Zulele',
    role: 'AI Engineer',
    image: '/WhatsApp Image 2025-06-11 at 03.02.55.jpeg',
    icon: Brain,
    description: 'Crafting intelligent algorithms that transform raw data into meaningful insights.',
    gradient: 'from-purple-400 to-pink-400'
  },
  {
    name: 'Humza',
    role: 'Full Stack Engineer',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57.jpeg',
    icon: Code,
    description: 'Building seamless experiences from frontend interfaces to backend architecture.',
    gradient: 'from-blue-400 to-cyan-400'
  },
  {
    name: 'Nemo',
    role: 'Project Manager',
    image: '/WhatsApp Image 2025-06-11 at 03.02.57 (1).jpeg',
    icon: Users,
    description: 'Orchestrating team synergy and ensuring every project milestone is achieved.',
    gradient: 'from-green-400 to-emerald-400'
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
              {/* Card Container */}
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border-2 border-[#6e1d27]/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-[#6e1d27]/40">
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-5 rounded-3xl group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Profile Picture with Rounded Frame */}
                <div className="relative mb-6 flex justify-center">
                  <div className="relative">
                    {/* Outer decorative ring */}
                    <div className={`absolute -inset-4 bg-gradient-to-br ${member.gradient} rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm`} />
                    
                    {/* Main profile picture container */}
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
                      {/* Border ring */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-full p-1 group-hover:scale-110 transition-transform duration-500`}>
                        <div className="w-full h-full bg-white rounded-full p-2">
                          <Image
                            src={member.image}
                            alt={`${member.name} - ${member.role}`}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      
                      {/* Role Icon Badge */}
                      <div className={`absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br ${member.gradient} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <member.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center relative z-10">
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#3d0e15] mb-2 font-ibm-plex group-hover:text-[#6e1d27] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className={`text-lg font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-4 font-ibm-plex`}>
                    {member.role}
                  </p>
                  <p className="text-[#6e1d27] leading-relaxed font-ibm-plex text-sm sm:text-base">
                    {member.description}
                  </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-8 h-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className={`w-full h-full bg-gradient-to-br ${member.gradient} rounded-full`} />
                </div>
                <div className="absolute bottom-4 left-4 w-6 h-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className={`w-full h-full bg-gradient-to-br ${member.gradient} rounded-full`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Decorative Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        viewport={{ once: true }}
        className="flex justify-center mt-16"
      >
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#6e1d27]/30 to-transparent rounded-full" />
      </motion.div>
    </section>
  );
}
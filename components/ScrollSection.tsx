'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Database, FileText, BarChart3, Users, Mail, FileSpreadsheet, File, PieChart, TrendingUp, Activity } from 'lucide-react';
import Image from 'next/image';

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Section 1: Collect from anywhere
  const section1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.25, 0.4], [0, 1, 1, 0]);
  const section1Y = useTransform(scrollYProgress, [0, 0.15, 0.25, 0.4], [50, 0, 0, -50]);

  // Section 2: Instant structure
  const section2Opacity = useTransform(scrollYProgress, [0.3, 0.45, 0.55, 0.7], [0, 1, 1, 0]);
  const section2Y = useTransform(scrollYProgress, [0.3, 0.45, 0.55, 0.7], [50, 0, 0, -50]);

  // Section 3: From data to decisions
  const section3Opacity = useTransform(scrollYProgress, [0.6, 0.75, 0.85, 1], [0, 1, 1, 0]);
  const section3Y = useTransform(scrollYProgress, [0.6, 0.75, 0.85, 1], [50, 0, 0, -50]);

  // Section 4: Meet the Team
  const section4Opacity = useTransform(scrollYProgress, [0.85, 0.95, 1], [0, 1, 1]);
  const section4Y = useTransform(scrollYProgress, [0.85, 0.95, 1], [50, 0, 0]);

  return (
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Section 1: Collect from anywhere */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section1Opacity, y: section1Y }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content - Left Side */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
                Collect from anywhere.
              </h2>
              <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-2xl">
                Emails, files, documents — Datrix gathers scattered information from any source into one organized flow.
              </p>
            </div>

            {/* Animation - Right Side */}
            <div className="relative h-64 sm:h-80 lg:h-96 order-1 lg:order-2">
              <FloatingIconsToBox />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Instant structure */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section2Opacity, y: section2Y }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Animation - Left Side */}
            <div className="relative h-64 sm:h-80 lg:h-96">
              <CRMTableDrawing />
            </div>

            {/* Text Content - Right Side */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
                Instant structure.
              </h2>
              <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-2xl">
                Datrix organizes raw inputs into smart, editable tables — ready for your CRM or database.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 3: From data to decisions */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section3Opacity, y: section3Y }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text Content - Left Side */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
                From data to decisions.
              </h2>
              <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-2xl">
                Turn tables into insight boards. Generate charts with a prompt. Move, resize, and organize like sticky notes.
              </p>
            </div>

            {/* Animation - Right Side */}
            <div className="relative h-64 sm:h-80 lg:h-96 order-1 lg:order-2">
              <InsightBoard />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: Meet the Team */}
      <motion.section
        className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{ opacity: section4Opacity, y: section4Y }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d0e15] mb-6 font-ibm-plex leading-tight">
              Meet the Team
            </h2>
            <p className="text-lg sm:text-xl text-[#6e1d27] font-ibm-plex leading-relaxed max-w-3xl mx-auto">
              The creative minds behind Datrix, bringing together AI engineering, full-stack development, and project management expertise.
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Zulele - AI Engineer */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6 mx-auto w-48 h-48 sm:w-56 sm:h-56">
                {/* Frame SVG */}
                <div className="absolute inset-0 text-[#6e1d27] transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    viewBox="0 0 32 32"
                    className="w-full h-full drop-shadow-lg"
                    fill="currentColor"
                  >
                    <path d="M24,5H8C7.448,5,7,5.448,7,6v20c0,0.552,0.448,1,1,1h16c0.552,0,1-0.448,1-1V6C25,5.448,24.552,5,24,5z M24,26H8V6h16V26z M27.422,20.423c-0.252-0.252-0.315-0.637-0.155-0.956l0.392-0.783c0.844-1.689,0.844-3.677,0-5.366l-0.391-0.783 c-0.159-0.319-0.097-0.704,0.155-0.956l0.164-0.164c0.781-0.781,0.781-2.047,0-2.828l-0.343-0.343C27.087,8.087,27,7.876,27,7.657V6 c0-1.657-1.343-3-3-3h-1.657c-0.22,0-0.43-0.087-0.586-0.243l-0.343-0.343C21.024,2.024,20.512,1.828,20,1.828 s-1.024,0.195-1.414,0.586h0C18.424,2.576,18.212,2.657,18,2.657s-0.424-0.081-0.586-0.243C17.024,2.024,16.512,1.828,16,1.828 s-1.024,0.195-1.414,0.586h0C14.424,2.576,14.212,2.657,14,2.657s-0.424-0.081-0.586-0.243C13.024,2.024,12.512,1.828,12,1.828 s-1.024,0.195-1.414,0.586l-0.343,0.343C10.087,2.913,9.877,3,9.657,3H8C6.343,3,5,4.343,5,6v1.657c0,0.22-0.087,0.43-0.243,0.586 L4.415,8.586c-0.781,0.781-0.781,2.048,0,2.829l0.163,0.163c0.252,0.252,0.315,0.637,0.155,0.956l-0.391,0.783 c-0.845,1.689-0.845,3.677,0,5.366l0.391,0.783c0.159,0.319,0.097,0.704-0.155,0.956l-0.164,0.164c-0.781,0.781-0.781,2.047,0,2.828 l0.343,0.343C4.913,23.913,5,24.124,5,24.343V26c0,1.657,1.343,3,3,3h1.657c0.22,0,0.43,0.087,0.586,0.243l0.343,0.343 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586l0.343-0.343C21.913,29.087,22.123,29,22.343,29H24 c1.657,0,3-1.343,3-3v-1.657c0-0.22,0.087-0.43,0.243-0.586l0.343-0.343c0.781-0.781,0.781-2.048,0-2.829L27.422,20.423z M26.879,22.707l-0.343,0.343C26.19,23.396,26,23.855,26,24.343V26c0,1.103-0.897,2-2,2h-1.657c-0.488,0-0.948,0.19-1.293,0.536 l-0.343,0.343c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293l-0.343-0.343 C10.604,28.19,10.145,28,9.657,28H8c-1.103,0-2-0.897-2-2v-1.657c0-0.488-0.19-0.948-0.535-1.293l-0.343-0.343 c-0.39-0.39-0.39-1.024,0-1.414l0.164-0.164c0.557-0.557,0.695-1.406,0.343-2.111l-0.391-0.783c-0.7-1.4-0.7-3.072,0-4.472 l0.391-0.783c0.353-0.705,0.215-1.553-0.343-2.111l-0.163-0.163C4.933,10.518,4.829,10.267,4.829,10 c0-0.267,0.104-0.518,0.293-0.707L5.464,8.95C5.81,8.605,6,8.146,6,7.657V6c0-1.103,0.897-2,2-2h1.657 c0.488,0,0.948-0.19,1.293-0.536l0.343-0.343c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C13.052,3.467,13.512,3.657,14,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C17.052,3.467,17.512,3.657,18,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 l0.343,0.343C21.396,3.81,21.855,4,22.343,4H24c1.103,0,2,0.897,2,2v1.657c0,0.488,0.19,0.948,0.535,1.293l0.343,0.343 c0.39,0.39,0.39,1.024,0,1.414l-0.164,0.164c-0.557,0.557-0.695,1.406-0.343,2.111l0.391,0.783c0.7,1.4,0.7,3.072,0,4.472 l-0.392,0.783c-0.353,0.705-0.215,1.553,0.343,2.111l0.163,0.163c0.189,0.189,0.293,0.44,0.293,0.707 C27.171,22.267,27.067,22.518,26.879,22.707z"/>
                  </svg>
                </div>
                {/* Image inside frame */}
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  <Image
                    src="/WhatsApp Image 2025-06-11 at 03.02.57 (1).jpeg"
                    alt="Zulele - AI Engineer"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#3d0e15] mb-2 font-ibm-plex">
                Zulele
              </h3>
              <p className="text-[#6e1d27] font-ibm-plex mb-3 text-lg">
                AI Engineer
              </p>
              <a
                href="https://x.com/Zuleleee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#6e1d27] hover:text-[#3d0e15] font-ibm-plex font-medium transition-colors duration-300 hover:underline"
              >
                @Zuleleee
              </a>
            </motion.div>

            {/* Humza - Full Stack Engineer */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6 mx-auto w-48 h-48 sm:w-56 sm:h-56">
                {/* Frame SVG */}
                <div className="absolute inset-0 text-[#6e1d27] transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    viewBox="0 0 32 32"
                    className="w-full h-full drop-shadow-lg"
                    fill="currentColor"
                  >
                    <path d="M24,5H8C7.448,5,7,5.448,7,6v20c0,0.552,0.448,1,1,1h16c0.552,0,1-0.448,1-1V6C25,5.448,24.552,5,24,5z M24,26H8V6h16V26z M27.422,20.423c-0.252-0.252-0.315-0.637-0.155-0.956l0.392-0.783c0.844-1.689,0.844-3.677,0-5.366l-0.391-0.783 c-0.159-0.319-0.097-0.704,0.155-0.956l0.164-0.164c0.781-0.781,0.781-2.047,0-2.828l-0.343-0.343C27.087,8.087,27,7.876,27,7.657V6 c0-1.657-1.343-3-3-3h-1.657c-0.22,0-0.43-0.087-0.586-0.243l-0.343-0.343C21.024,2.024,20.512,1.828,20,1.828 s-1.024,0.195-1.414,0.586h0C18.424,2.576,18.212,2.657,18,2.657s-0.424-0.081-0.586-0.243C17.024,2.024,16.512,1.828,16,1.828 s-1.024,0.195-1.414,0.586h0C14.424,2.576,14.212,2.657,14,2.657s-0.424-0.081-0.586-0.243C13.024,2.024,12.512,1.828,12,1.828 s-1.024,0.195-1.414,0.586l-0.343,0.343C10.087,2.913,9.877,3,9.657,3H8C6.343,3,5,4.343,5,6v1.657c0,0.22-0.087,0.43-0.243,0.586 L4.415,8.586c-0.781,0.781-0.781,2.048,0,2.829l0.163,0.163c0.252,0.252,0.315,0.637,0.155,0.956l-0.391,0.783 c-0.845,1.689-0.845,3.677,0,5.366l0.391,0.783c0.159,0.319,0.097,0.704-0.155,0.956l-0.164,0.164c-0.781,0.781-0.781,2.047,0,2.828 l0.343,0.343C4.913,23.913,5,24.124,5,24.343V26c0,1.657,1.343,3,3,3h1.657c0.22,0,0.43,0.087,0.586,0.243l0.343,0.343 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586l0.343-0.343C21.913,29.087,22.123,29,22.343,29H24 c1.657,0,3-1.343,3-3v-1.657c0-0.22,0.087-0.43,0.243-0.586l0.343-0.343c0.781-0.781,0.781-2.048,0-2.829L27.422,20.423z M26.879,22.707l-0.343,0.343C26.19,23.396,26,23.855,26,24.343V26c0,1.103-0.897,2-2,2h-1.657c-0.488,0-0.948,0.19-1.293,0.536 l-0.343,0.343c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293l-0.343-0.343 C10.604,28.19,10.145,28,9.657,28H8c-1.103,0-2-0.897-2-2v-1.657c0-0.488-0.19-0.948-0.535-1.293l-0.343-0.343 c-0.39-0.39-0.39-1.024,0-1.414l0.164-0.164c0.557-0.557,0.695-1.406,0.343-2.111l-0.391-0.783c-0.7-1.4-0.7-3.072,0-4.472 l0.391-0.783c0.353-0.705,0.215-1.553-0.343-2.111l-0.163-0.163C4.933,10.518,4.829,10.267,4.829,10 c0-0.267,0.104-0.518,0.293-0.707L5.464,8.95C5.81,8.605,6,8.146,6,7.657V6c0-1.103,0.897-2,2-2h1.657 c0.488,0,0.948-0.19,1.293-0.536l0.343-0.343c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C13.052,3.467,13.512,3.657,14,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C17.052,3.467,17.512,3.657,18,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 l0.343,0.343C21.396,3.81,21.855,4,22.343,4H24c1.103,0,2,0.897,2,2v1.657c0,0.488,0.19,0.948,0.535,1.293l0.343,0.343 c0.39,0.39,0.39,1.024,0,1.414l-0.164,0.164c-0.557,0.557-0.695,1.406-0.343,2.111l0.391,0.783c0.7,1.4,0.7,3.072,0,4.472 l-0.392,0.783c-0.353,0.705-0.215,1.553,0.343,2.111l0.163,0.163c0.189,0.189,0.293,0.44,0.293,0.707 C27.171,22.267,27.067,22.518,26.879,22.707z"/>
                  </svg>
                </div>
                {/* Image inside frame */}
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  <Image
                    src="/WhatsApp Image 2025-06-11 at 03.02.57.jpeg"
                    alt="Humza - Full Stack Engineer"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#3d0e15] mb-2 font-ibm-plex">
                Humza
              </h3>
              <p className="text-[#6e1d27] font-ibm-plex mb-3 text-lg">
                Full Stack Engineer
              </p>
              <a
                href="https://x.com/Mrhumza_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#6e1d27] hover:text-[#3d0e15] font-ibm-plex font-medium transition-colors duration-300 hover:underline"
              >
                @Mrhumza_
              </a>
            </motion.div>

            {/* Nemo - Project Manager */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6 mx-auto w-48 h-48 sm:w-56 sm:h-56">
                {/* Frame SVG */}
                <div className="absolute inset-0 text-[#6e1d27] transform group-hover:scale-105 transition-transform duration-300">
                  <svg
                    viewBox="0 0 32 32"
                    className="w-full h-full drop-shadow-lg"
                    fill="currentColor"
                  >
                    <path d="M24,5H8C7.448,5,7,5.448,7,6v20c0,0.552,0.448,1,1,1h16c0.552,0,1-0.448,1-1V6C25,5.448,24.552,5,24,5z M24,26H8V6h16V26z M27.422,20.423c-0.252-0.252-0.315-0.637-0.155-0.956l0.392-0.783c0.844-1.689,0.844-3.677,0-5.366l-0.391-0.783 c-0.159-0.319-0.097-0.704,0.155-0.956l0.164-0.164c0.781-0.781,0.781-2.047,0-2.828l-0.343-0.343C27.087,8.087,27,7.876,27,7.657V6 c0-1.657-1.343-3-3-3h-1.657c-0.22,0-0.43-0.087-0.586-0.243l-0.343-0.343C21.024,2.024,20.512,1.828,20,1.828 s-1.024,0.195-1.414,0.586h0C18.424,2.576,18.212,2.657,18,2.657s-0.424-0.081-0.586-0.243C17.024,2.024,16.512,1.828,16,1.828 s-1.024,0.195-1.414,0.586h0C14.424,2.576,14.212,2.657,14,2.657s-0.424-0.081-0.586-0.243C13.024,2.024,12.512,1.828,12,1.828 s-1.024,0.195-1.414,0.586l-0.343,0.343C10.087,2.913,9.877,3,9.657,3H8C6.343,3,5,4.343,5,6v1.657c0,0.22-0.087,0.43-0.243,0.586 L4.415,8.586c-0.781,0.781-0.781,2.048,0,2.829l0.163,0.163c0.252,0.252,0.315,0.637,0.155,0.956l-0.391,0.783 c-0.845,1.689-0.845,3.677,0,5.366l0.391,0.783c0.159,0.319,0.097,0.704-0.155,0.956l-0.164,0.164c-0.781,0.781-0.781,2.047,0,2.828 l0.343,0.343C4.913,23.913,5,24.124,5,24.343V26c0,1.657,1.343,3,3,3h1.657c0.22,0,0.43,0.087,0.586,0.243l0.343,0.343 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586c0.162-0.162,0.374-0.243,0.586-0.243s0.424,0.081,0.586,0.243h0 c0.391,0.391,0.902,0.586,1.414,0.586s1.024-0.195,1.414-0.586l0.343-0.343C21.913,29.087,22.123,29,22.343,29H24 c1.657,0,3-1.343,3-3v-1.657c0-0.22,0.087-0.43,0.243-0.586l0.343-0.343c0.781-0.781,0.781-2.048,0-2.829L27.422,20.423z M26.879,22.707l-0.343,0.343C26.19,23.396,26,23.855,26,24.343V26c0,1.103-0.897,2-2,2h-1.657c-0.488,0-0.948,0.19-1.293,0.536 l-0.343,0.343c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293c-0.345-0.345-0.805-0.536-1.293-0.536 s-0.948,0.19-1.293,0.536c-0.189,0.189-0.44,0.293-0.707,0.293s-0.518-0.104-0.707-0.293l-0.343-0.343 C10.604,28.19,10.145,28,9.657,28H8c-1.103,0-2-0.897-2-2v-1.657c0-0.488-0.19-0.948-0.535-1.293l-0.343-0.343 c-0.39-0.39-0.39-1.024,0-1.414l0.164-0.164c0.557-0.557,0.695-1.406,0.343-2.111l-0.391-0.783c-0.7-1.4-0.7-3.072,0-4.472 l0.391-0.783c0.353-0.705,0.215-1.553-0.343-2.111l-0.163-0.163C4.933,10.518,4.829,10.267,4.829,10 c0-0.267,0.104-0.518,0.293-0.707L5.464,8.95C5.81,8.605,6,8.146,6,7.657V6c0-1.103,0.897-2,2-2h1.657 c0.488,0,0.948-0.19,1.293-0.536l0.343-0.343c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C13.052,3.467,13.512,3.657,14,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 C17.052,3.467,17.512,3.657,18,3.657s0.948-0.19,1.293-0.536c0.189-0.189,0.44-0.293,0.707-0.293s0.518,0.104,0.707,0.293 l0.343,0.343C21.396,3.81,21.855,4,22.343,4H24c1.103,0,2,0.897,2,2v1.657c0,0.488,0.19,0.948,0.535,1.293l0.343,0.343 c0.39,0.39,0.39,1.024,0,1.414l-0.164,0.164c-0.557,0.557-0.695,1.406-0.343,2.111l0.391,0.783c0.7,1.4,0.7,3.072,0,4.472 l-0.392,0.783c-0.353,0.705-0.215,1.553,0.343,2.111l0.163,0.163c0.189,0.189,0.293,0.44,0.293,0.707 C27.171,22.267,27.067,22.518,26.879,22.707z"/>
                  </svg>
                </div>
                {/* Image inside frame */}
                <div className="absolute inset-4 rounded-lg overflow-hidden">
                  <Image
                    src="/nemo-placeholder.jpg"
                    alt="Nemo - Project Manager"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#3d0e15] mb-2 font-ibm-plex">
                Nemo
              </h3>
              <p className="text-[#6e1d27] font-ibm-plex mb-3 text-lg">
                Project Manager
              </p>
              <a
                href="https://x.com/Xfoundnemo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#6e1d27] hover:text-[#3d0e15] font-ibm-plex font-medium transition-colors duration-300 hover:underline"
              >
                @Xfoundnemo
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

// Floating Icons to Box Animation Component
function FloatingIconsToBox() {
  const icons = [Mail, FileText, FileSpreadsheet, File, Database];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Floating Icons */}
      {icons.map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute"
          initial={{ 
            x: (index - 2) * 80,
            y: -20,
            opacity: 0.7
          }}
          animate={{ 
            x: 0,
            y: 0,
            opacity: 1
          }}
          transition={{
            duration: 2,
            delay: index * 0.3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="p-3 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg">
            <Icon size={24} className="text-[#6e1d27]" />
          </div>
        </motion.div>
      ))}
      
      {/* Target Box */}
      <motion.div
        className="absolute bottom-0 right-0"
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="w-20 h-20 border-2 border-[#6e1d27] border-dashed rounded-lg flex items-center justify-center bg-[#6e1d27]/5">
          <div className="w-12 h-12 bg-[#6e1d27]/20 rounded-md" />
        </div>
      </motion.div>
    </div>
  );
}

// CRM Table Drawing Animation Component
function CRMTableDrawing() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.svg
        width="300"
        height="200"
        viewBox="0 0 300 200"
        className="text-[#6e1d27]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Table Border */}
        <motion.rect
          x="20"
          y="40"
          width="260"
          height="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Header Row */}
        <motion.line
          x1="20"
          y1="70"
          x2="280"
          y2="70"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Columns */}
        <motion.line
          x1="100"
          y1="40"
          x2="100"
          y2="160"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.line
          x1="180"
          y1="40"
          x2="180"
          y2="160"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />
        
        {/* Data Rows */}
        {[90, 110, 130].map((y, index) => (
          <motion.line
            key={index}
            x1="20"
            y1={y}
            x2="280"
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.5 + index * 0.2 }}
          />
        ))}
        
        {/* Header Text */}
        <motion.text
          x="60"
          y="58"
          className="text-xs font-ibm-plex font-medium"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          Name
        </motion.text>
        <motion.text
          x="140"
          y="58"
          className="text-xs font-ibm-plex font-medium"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.7 }}
        >
          Email
        </motion.text>
        <motion.text
          x="230"
          y="58"
          className="text-xs font-ibm-plex font-medium"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.9 }}
        >
          Status
        </motion.text>
      </motion.svg>
    </div>
  );
}

// Insight Board Component
function InsightBoard() {
  const charts = [
    { type: 'bar', x: 20, y: 20, rotation: -2 },
    { type: 'pie', x: 120, y: 40, rotation: 3 },
    { type: 'line', x: 200, y: 10, rotation: -1 },
    { type: 'donut', x: 60, y: 100, rotation: 2 },
    { type: 'area', x: 160, y: 120, rotation: -3 }
  ];

  return (
    <div className="relative w-full h-full">
      {charts.map((chart, index) => (
        <motion.div
          key={index}
          className="absolute w-16 h-16 sm:w-20 sm:h-20"
          style={{
            left: `${chart.x}px`,
            top: `${chart.y}px`,
            transform: `rotate(${chart.rotation}deg)`
          }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.2,
            ease: "easeOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg shadow-lg border-l-4 border-yellow-400 p-2 hover:shadow-xl transition-shadow duration-300">
            <ChartIcon type={chart.type} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Chart Icon Component
function ChartIcon({ type }: { type: string }) {
  const iconProps = {
    size: 24,
    className: "text-[#6e1d27] w-full h-full"
  };

  switch (type) {
    case 'bar':
      return <BarChart3 {...iconProps} />;
    case 'pie':
      return <PieChart {...iconProps} />;
    case 'line':
      return <TrendingUp {...iconProps} />;
    case 'donut':
      return <PieChart {...iconProps} />;
    case 'area':
      return <Activity {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
}
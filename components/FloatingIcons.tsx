'use client';

import { useEffect, useState, useRef } from 'react';
import { Mail, FileText, FileSpreadsheet, File, Database } from 'lucide-react';

interface FloatingIcon {
  id: number;
  Icon: React.ComponentType<any>;
  baseAngle: number;
  radius: number;
  speed: number;
  size: number;
}

export default function FloatingIcons() {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);
  const timeRef = useRef(0);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    const iconComponents = [Mail, FileText, FileSpreadsheet, File, Database];
    const iconCount = window.innerWidth < 768 ? 3 : 5;
    
    const initialIcons: FloatingIcon[] = iconComponents.slice(0, iconCount).map((Icon, i) => ({
      id: i,
      Icon,
      baseAngle: (i * 360) / iconCount, // Evenly distributed
      radius: window.innerWidth < 768 ? 120 : 250,
      speed: 0.3, // Slightly faster for smoother perception
      size: window.innerWidth < 768 ? 20 : 28,
    }));

    setIcons(initialIcons);
  }, []);

  useEffect(() => {
    if (icons.length === 0) return;

    const animate = (currentTime: number) => {
      // Calculate delta time for consistent movement regardless of frame rate
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      
      // Update time with consistent increment (60fps target)
      timeRef.current += deltaTime * 0.06; // Normalized for 60fps
      
      // Force re-render by updating a state value
      setIcons(prevIcons => [...prevIcons]);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [icons.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {icons.map(icon => {
        // Perfect circular motion with consistent spacing
        const currentAngle = icon.baseAngle + timeRef.current * icon.speed;
        const x = Math.cos((currentAngle * Math.PI) / 180) * icon.radius;
        const y = Math.sin((currentAngle * Math.PI) / 180) * icon.radius;

        return (
          <div
            key={icon.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 hover:scale-110"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              willChange: 'transform', // Optimize for animations
            }}
          >
            <div className="p-3 rounded-full bg-[#6e1d27]/10 backdrop-blur-sm border border-[#6e1d27]/20 shadow-lg hover:shadow-xl hover:bg-[#6e1d27]/20 transition-all duration-300">
              <icon.Icon 
                size={icon.size} 
                className="text-[#6e1d27] drop-shadow-lg" 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

const words = ['STRUCTURE.', 'INSIGHT.', 'CLARITY.'];

export default function TypewriterText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    if (isTyping) {
      // Typing phase
      if (charIndex < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 100); // Typing speed: 100ms per character
        
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait before erasing
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500); // Pause for 1.5 seconds after typing
        
        return () => clearTimeout(timeout);
      }
    } else {
      // Erasing phase
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50); // Erasing speed: 50ms per character (faster than typing)
        
        return () => clearTimeout(timeout);
      } else {
        // Finished erasing, move to next word
        const timeout = setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setIsTyping(true);
        }, 300); // Brief pause before starting next word
        
        return () => clearTimeout(timeout);
      }
    }
  }, [currentWordIndex, charIndex, isTyping]);

  return (
    <span className="text-[#912d3c] inline-block min-w-[200px] text-left">
      {currentText}
      <span className="animate-pulse text-[#912d3c]">|</span>
    </span>
  );
}
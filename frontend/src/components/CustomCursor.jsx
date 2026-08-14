import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState('');
  const [cursorVariant, setCursorVariant] = useState('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target.closest('[data-cursor]');
      if (target) {
        const type = target.getAttribute('data-cursor');
        if (type === 'view') {
          setCursorVariant('hover');
          setCursorText('');
        } else if (type === 'drag') {
          setCursorVariant('hover');
          setCursorText('');
        } else if (type === 'hotspot') {
          setCursorVariant('hover');
          setCursorText('');
        } else {
          setCursorVariant('hover');
          setCursorText('');
        }
      } else {
        const isClickable = e.target.closest('button, a, select, [role="button"]');
        if (isClickable) {
          setCursorVariant('hover');
          setCursorText('');
        } else {
          setCursorVariant('default');
          setCursorText('');
        }
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const variants = {
    default: {
      x: mousePos.x - 8,
      y: mousePos.y - 8,
      height: 16,
      width: 16,
      backgroundColor: '#6366f1',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 0 10px #6366f1, 0 0 20px #6366f1'
    },
    hover: {
      x: mousePos.x - 20,
      y: mousePos.y - 20,
      height: 40,
      width: 40,
      backgroundColor: 'rgba(99, 102, 241, 0.25)',
      border: '1.5px solid #10b981',
      boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
    },
    view: {
      x: mousePos.x - 36,
      y: mousePos.y - 36,
      height: 72,
      width: 72,
      backgroundColor: 'rgba(99, 102, 241, 0.9)',
      border: '2px solid #ffffff',
      boxShadow: '0 0 25px rgba(99, 102, 241, 0.8)'
    },
    drag: {
      x: mousePos.x - 36,
      y: mousePos.y - 36,
      height: 72,
      width: 72,
      backgroundColor: 'rgba(16, 185, 129, 0.9)',
      border: '2px solid #ffffff',
      boxShadow: '0 0 25px rgba(16, 185, 129, 0.8)'
    },
    hotspot: {
      x: mousePos.x - 32,
      y: mousePos.y - 32,
      height: 64,
      width: 64,
      backgroundColor: 'rgba(236, 72, 153, 0.9)',
      border: '2px solid #ffffff',
      boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)'
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] flex items-center justify-center text-[10px] font-black tracking-widest text-white uppercase text-center backdrop-blur-xs select-none hidden md:flex"
      animate={cursorVariant}
      variants={variants}
      transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.2 }}
    >
      {cursorText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-1 text-center font-bold pointer-events-none"
        >
          {cursorText}
        </motion.span>
      )}
    </motion.div>
  );
}

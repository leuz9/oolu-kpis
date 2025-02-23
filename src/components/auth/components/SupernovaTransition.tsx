import React, { useEffect, useState } from 'react';

interface SupernovaTransitionProps {
  onComplete: () => void;
}

export default function SupernovaTransition({ onComplete }: SupernovaTransitionProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Wait for fade out before completing
    }, 2000); // Total animation duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-500 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 animate-gradient-xy" />

      {/* Supernova effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Central burst */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]" />
          
          {/* Expanding rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"
                style={{
                  width: `${(i + 1) * 100}px`,
                  height: `${(i + 1) * 100}px`,
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
          </div>

          {/* Particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-50px)`,
                animation: `particle 1.5s ease-out infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
        <img 
          src="https://igniteaccess.com/wp-content/uploads/2025/01/logo-new.png" 
          alt="Ignite Power" 
          className="h-16 w-16 object-contain bg-white rounded-xl p-2 mb-4 mx-auto animate-bounce"
        />
        <h1 className="text-2xl font-bold animate-pulse">Welcome to OKRFlow</h1>
      </div>
    </div>
  );
}
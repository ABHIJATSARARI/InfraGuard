import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Complete splash after animation
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-xy">
      <div className="text-center px-4">
        {/* Logo with animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white/20 rounded-full animate-ping"></div>
          </div>
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 animate-bounce-slow">
            <ShieldCheck className="w-20 h-20 text-blue-600 mx-auto animate-pulse" />
          </div>
        </div>

        {/* App name with gradient */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight animate-fade-in">
          InfraGuard
        </h1>
        
        {/* Tagline with AI badge */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-delay">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
          <p className="text-xl text-white/90 font-medium">
            AI-Powered Infrastructure Management
          </p>
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-white via-yellow-300 to-white rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Loading text */}
        <p className="text-white/80 text-sm mt-4 animate-pulse">
          Initializing Gemini AI...
        </p>
      </div>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(20px); }
          30% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera, Brain, Map as MapIcon, LayoutDashboard, Sparkles, Target, ShieldCheck } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: "Welcome to InfraGuard! 👋",
    description: "Your AI-powered assistant for smart city infrastructure management. Let's take a quick 30-second tour!",
    icon: ShieldCheck,
    iconColor: "text-blue-600",
    bgGradient: "from-blue-50 to-indigo-50",
    image: "🏙️"
  },
  {
    title: "📸 Snap & Report",
    description: "Citizens can upload photos of infrastructure issues like potholes or broken lights. It's that simple!",
    icon: Camera,
    iconColor: "text-purple-600",
    bgGradient: "from-purple-50 to-pink-50",
    features: ["Upload from camera or gallery", "URL support for web images", "Instant upload"]
  },
  {
    title: "🤖 Gemini AI Analysis",
    description: "Google Gemini AI automatically analyzes your photo in 3 seconds, extracting issue type, severity, cost, and safety risks.",
    icon: Brain,
    iconColor: "text-indigo-600",
    bgGradient: "from-indigo-50 to-purple-50",
    features: ["Auto issue detection", "Severity scoring (1-5)", "Cost estimation", "Hazard assessment"]
  },
  {
    title: "🗺️ Live Map View",
    description: "See all reported issues on an interactive map. Click markers to view details and track repairs in your neighborhood.",
    icon: MapIcon,
    iconColor: "text-green-600",
    bgGradient: "from-green-50 to-emerald-50",
    features: ["Color-coded by severity", "Cluster view for dense areas", "Click for details"]
  },
  {
    title: "📊 AI Dashboard",
    description: "Admins get intelligent insights: priority scores, SLA tracking, trend analysis, and AI recommendations.",
    icon: LayoutDashboard,
    iconColor: "text-orange-600",
    bgGradient: "from-orange-50 to-red-50",
    features: ["AI priority ranking", "Overdue alerts", "Community impact", "Smart recommendations"]
  },
  {
    title: "🎯 Ready to Start!",
    description: "You're all set! Report issues as a citizen or toggle to Admin mode for the full AI dashboard experience.",
    icon: Target,
    iconColor: "text-pink-600",
    bgGradient: "from-pink-50 to-rose-50",
    features: ["Toggle Citizen ↔ Admin modes", "Dark mode support", "Export AI reports"]
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${step.bgGradient} dark:from-slate-700 dark:to-slate-600 p-6 relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-lg ${step.iconColor}`}>
              <StepIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {step.title}
                </h2>
                {currentStep === 2 && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {step.image && (
            <div className="text-6xl text-center mb-4 animate-bounce-slow">
              {step.image}
            </div>
          )}
          
          <p className="text-slate-700 dark:text-slate-200 text-lg mb-6 leading-relaxed">
            {step.description}
          </p>

          {step.features && (
            <div className="space-y-3">
              {step.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-1 rounded-full ${step.iconColor} bg-white dark:bg-slate-600 mt-0.5`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentStep === 0
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
              >
                Skip Tour
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                isLastStep
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Target className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

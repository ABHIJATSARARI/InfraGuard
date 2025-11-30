
import React, { useState, useEffect } from 'react';
import { Tab, Report } from './types';
import { ReportFlow } from './components/ReportFlow';
import { MapView } from './components/MapView';
import { Dashboard } from './components/Dashboard';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingTour } from './components/OnboardingTour';
import { MOCK_REPORTS } from './constants';
import { LayoutDashboard, Map as MapIcon, PlusCircle, ShieldCheck, Sun, Moon, User, Lock, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false); // Default to Citizen view
  
  // Splash Screen & Onboarding State
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('splashCompleted');
  });
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('tourCompleted');
  });
  
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-switch tabs based on role for better demo flow
  useEffect(() => {
    if (isAdminMode) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('report');
    }
  }, [isAdminMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('splashCompleted', 'true');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('tourCompleted', 'true');
  };

  const handleReportSubmit = (report: Report) => {
    // 🤖 AUTO-CALCULATE AI FIELDS for new reports
    const enrichedReport: Report = {
      ...report,
      priorityScore: Math.min(Math.round(report.analysis.severity * 15 + 20), 100), // New reports get base priority
      daysOverdue: 0, // Brand new
      aiPredictedResolutionTime: report.analysis.severity >= 4 ? '1-2 days' : report.analysis.severity === 3 ? '3-5 days' : '5-7 days',
      communityImpact: Math.round(50 + Math.random() * 400), // Simulate population density
    };
    
    setReports(prev => [enrichedReport, ...prev]);
    setHighlightedReportId(enrichedReport.id);
    // If submitting as citizen, show them the dashboard to confirm submission
    setActiveTab('dashboard');
  };

  const handleStatusChange = (id: string, newStatus: Report['status']) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, status: newStatus } : report
    ));
  };

  const handleAssignTeam = (id: string, team: string) => {
    setReports(prev => prev.map(report =>
      report.id === id ? { ...report, assignedTo: team } : report
    ));
  };

  const handleReportSelect = (id: string) => {
    setHighlightedReportId(id);
    setActiveTab('dashboard');
  };

  // Dynamic styles based on mode
  const accentColor = isAdminMode ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400';
  const logoGradient = isAdminMode 
    ? 'from-purple-700 to-purple-500 dark:from-purple-400 dark:to-purple-300' 
    : 'from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300';
  const tabActiveBg = isAdminMode 
    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <>
      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
      
      {/* Main App */}
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className={`flex-none h-16 bg-white dark:bg-slate-800 border-b flex items-center justify-between px-4 lg:px-8 z-50 transition-colors duration-200 ${isAdminMode ? 'border-purple-100 dark:border-purple-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
        <div className="flex items-center gap-2">
          <div className={`${isAdminMode ? 'bg-purple-600' : 'bg-blue-600'} p-1.5 rounded-lg transition-colors duration-300`}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent hidden sm:inline ${logoGradient}`}>
            InfraGuard
          </span>
          <span className={`text-xl font-bold sm:hidden ${accentColor}`}>IG</span>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex gap-1">
            <button 
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'report' ? tabActiveBg : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              New Report
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'map' ? tabActiveBg : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              Live Map
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? tabActiveBg : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              {isAdminMode ? 'Command Center' : 'Dashboard'}
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

          {/* Role Toggle */}
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
              isAdminMode 
                ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            }`}
          >
            {isAdminMode ? <Lock className="w-3 h-3" /> : <User className="w-3 h-3" />}
            <span className="hidden sm:inline">{isAdminMode ? 'Admin View' : 'Citizen View'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>

          {/* Tour Button */}
          <button 
            onClick={() => setShowTour(true)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
            aria-label="Start tour"
            title="Take a tour"
          >
            <HelpCircle className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'report' && <ReportFlow onReportSubmit={handleReportSubmit} />}
        {activeTab === 'map' && <MapView reports={reports} onReportSelect={handleReportSelect} />}
        {activeTab === 'dashboard' && (
          <Dashboard 
            reports={reports} 
            onStatusChange={isAdminMode ? handleStatusChange : undefined} 
            onAssignTeam={isAdminMode ? handleAssignTeam : undefined}
            highlightedReportId={highlightedReportId} 
            isAdminMode={isAdminMode}
          />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex-none h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-2 pb-safe z-50 transition-colors duration-200">
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'report' ? accentColor : 'text-slate-400 dark:text-slate-500'}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Report</span>
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'map' ? accentColor : 'text-slate-400 dark:text-slate-500'}`}
        >
          <MapIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium">Map</span>
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'dashboard' ? accentColor : 'text-slate-400 dark:text-slate-500'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Dash</span>
        </button>
      </nav>
      </div>
    </>
  );
};

export default App;

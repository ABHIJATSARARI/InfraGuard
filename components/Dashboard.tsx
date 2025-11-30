import React, { useEffect, useState, useMemo } from 'react';
import { Report } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ReportCard } from './ReportCard';
import { Activity, AlertTriangle, CheckCircle, Clock, ShieldAlert, Users, Download, Filter as FilterIcon, DollarSign, Brain, TrendingUp, Zap, Search, Sparkles, Target } from 'lucide-react';
import { Button } from './Button';

interface DashboardProps {
  reports: Report[];
  onStatusChange?: (id: string, newStatus: Report['status']) => void;
  onAssignTeam?: (id: string, team: string) => void;
  highlightedReportId?: string | null;
  isAdminMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  reports, 
  onStatusChange, 
  onAssignTeam,
  highlightedReportId, 
  isAdminMode = false 
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'pending' | 'unassigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 🤖 AI-POWERED CALCULATIONS
  const calculateAIPriorityScore = (report: Report): number => {
    if (report.priorityScore) return report.priorityScore;
    
    const daysOld = Math.floor((Date.now() - report.timestamp) / (1000 * 60 * 60 * 24));
    const severityWeight = report.analysis.severity * 15;
    const ageWeight = Math.min(daysOld * 5, 30);
    const statusWeight = report.status === 'pending' ? 20 : report.status === 'reviewed' ? 10 : 0;
    
    return Math.min(Math.round(severityWeight + ageWeight + statusWeight), 100);
  };

  const calculateDaysOverdue = (report: Report): number => {
    if (report.daysOverdue !== undefined) return report.daysOverdue;
    
    const daysOld = Math.floor((Date.now() - report.timestamp) / (1000 * 60 * 60 * 24));
    const slaThreshold = report.analysis.severity >= 4 ? 2 : report.analysis.severity === 3 ? 5 : 10;
    return Math.max(daysOld - slaThreshold, 0);
  };

  // Compute stats
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.analysis.severity >= 4).length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const overdueCount = reports.filter(r => calculateDaysOverdue(r) > 0 && r.status !== 'resolved').length;
  const avgPriorityScore = Math.round(reports.filter(r => r.status !== 'resolved').reduce((sum, r) => sum + calculateAIPriorityScore(r), 0) / (totalReports - resolvedCount || 1));

  // 🧠 AI INSIGHTS - Trend Analysis
  const aiInsights = useMemo(() => {
    const last7Days = reports.filter(r => r.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);
    const prev7Days = reports.filter(r => r.timestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 && r.timestamp <= Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trend = last7Days.length > prev7Days.length ? 'increasing' : last7Days.length < prev7Days.length ? 'decreasing' : 'stable';
    const hotspot = reports.reduce((acc: any, r) => {
      const key = r.analysis.type;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topIssue = Object.entries(hotspot).sort((a: any, b: any) => b[1] - a[1])[0];
    
    const communityImpact = reports.filter(r => r.status !== 'resolved').reduce((sum, r) => sum + (r.communityImpact || 0), 0);
    
    return {
      trend,
      trendPercent: prev7Days.length ? Math.round(((last7Days.length - prev7Days.length) / prev7Days.length) * 100) : 0,
      topIssueType: topIssue ? topIssue[0] : 'N/A',
      topIssueCount: topIssue ? topIssue[1] : 0,
      avgResolutionDays: Math.round(reports.filter(r => r.status === 'resolved').reduce((sum, r) => {
        const resolutionTime = Math.floor((Date.now() - r.timestamp) / (1000 * 60 * 60 * 24));
        return sum + resolutionTime;
      }, 0) / (resolvedCount || 1)),
      communityImpact
    };
  }, [reports, resolvedCount]);

  // Financial Estimates
  const calculateTotalBudget = () => {
    return reports
      .filter(r => r.status !== 'resolved')
      .reduce((sum, r) => {
        const matches = r.analysis.estimated_cost.match(/(\d+)/g);
        if (matches && matches.length > 0) {
          const vals = matches.map(Number);
          const avg = vals.length > 1 ? (vals[0] + vals[1]) / 2 : vals[0];
          return sum + avg;
        }
        return sum;
      }, 0);
  };
  
  const estimatedBudget = calculateTotalBudget();

  const severityData = [
    { name: 'Low', value: reports.filter(r => r.analysis.severity <= 2).length },
    { name: 'Medium', value: reports.filter(r => r.analysis.severity === 3).length },
    { name: 'High', value: reports.filter(r => r.analysis.severity >= 4).length },
  ];

  const typeData = reports.reduce((acc: any[], curr) => {
    const existing = acc.find((i: any) => i.name === curr.analysis.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.analysis.type, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = isAdminMode 
    ? ['#8b5cf6', '#d946ef', '#ef4444']
    : ['#3b82f6', '#eab308', '#ef4444'];

  // Filtered Reports with AI Priority Sorting
  const filteredReports = useMemo(() => {
    let result = [...reports];
    
    if (filter === 'critical') result = result.filter(r => r.analysis.severity >= 4);
    if (filter === 'pending') result = result.filter(r => r.status === 'pending');
    if (filter === 'unassigned') result = result.filter(r => !r.assignedTo && r.status !== 'resolved');
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.analysis.type.toLowerCase().includes(query) ||
        r.analysis.description.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.status.toLowerCase().includes(query)
      );
    }
    
    // 🎯 AI-POWERED SORTING: Priority Score (High to Low)
    return result.sort((a, b) => {
      const scoreA = calculateAIPriorityScore(a);
      const scoreB = calculateAIPriorityScore(b);
      return scoreB - scoreA;
    });
  }, [reports, filter, searchQuery]);

  useEffect(() => {
    if (highlightedReportId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`report-${highlightedReportId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightedReportId]);

  const downloadCSV = () => {
    const headers = ['ID', 'Type', 'Severity', 'Priority Score', 'Status', 'Days Overdue', 'Predicted Resolution', 'Community Impact', 'Cost', 'Location'];
    const csvContent = [
      headers.join(','),
      ...reports.map(r => [
        r.id,
        `"${r.analysis.type}"`,
        r.analysis.severity,
        calculateAIPriorityScore(r),
        r.status,
        calculateDaysOverdue(r),
        `"${r.aiPredictedResolutionTime || 'N/A'}"`,
        r.communityImpact || 0,
        `"${r.analysis.estimated_cost}"`,
        `"${r.location.lat},${r.location.lng}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `infraguard_ai_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 h-full overflow-y-auto pb-24 transition-colors duration-200 scroll-smooth">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isAdminMode ? (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                 <ShieldAlert className="w-3 h-3 mr-1" /> Admin Access
               </span>
            ) : (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                 <Users className="w-3 h-3 mr-1" /> Citizen View
               </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300">
              <Sparkles className="w-3 h-3 mr-1" /> AI-Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAdminMode ? '🤖 AI Command Center' : 'Community Feed'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isAdminMode 
              ? 'Intelligent priority ranking & predictive maintenance' 
              : 'AI-analyzed infrastructure reports from your neighborhood'}
          </p>
        </div>

        {isAdminMode && (
          <Button variant="secondary" onClick={downloadCSV} className="text-xs h-9">
            <Download className="w-4 h-4 mr-2" /> Export AI Report
          </Button>
        )}
      </div>

      {/* 🧠 AI INSIGHTS PANEL */}
      {isAdminMode && (
        <div className="mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl animate-gradient">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gemini AI Insights
              </h3>
              <span className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3" /> LIVE
              </span>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className={`w-4 h-4 ${aiInsights.trend === 'increasing' ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Report Trend</span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{aiInsights.trend}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {aiInsights.trendPercent > 0 ? '+' : ''}{aiInsights.trendPercent}% vs last week
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">SLA Overdue</span>
                </div>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{overdueCount}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">⚠️ Requires immediate action</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Priority Hotspot</span>
                </div>
                <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100 truncate">{aiInsights.topIssueType}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{aiInsights.topIssueCount} reports active</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">People Affected</span>
                </div>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{aiInsights.communityImpact.toLocaleString()}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Community impact score</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800/50">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <span className="font-bold flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4" />
                  Gemini AI Recommendation:
                </span>
                <span className="text-purple-800 dark:text-purple-200">
                  Prioritize <strong>{aiInsights.topIssueType}</strong> repairs. {overdueCount} critical items past SLA. 
                  AI predicts avg resolution: <strong>{aiInsights.avgResolutionDays} days</strong>. 
                  Sort by priority score below for optimal workflow.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 ${isAdminMode ? 'md:grid-cols-6' : 'md:grid-cols-4'} gap-4 mb-6`}>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isAdminMode ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase">Total</span>
          </div>
          <p className="text-2xl font-bold">{totalReports}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase">Critical</span>
          </div>
          <p className="text-2xl font-bold">{criticalCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase">Pending</span>
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-slate-500 text-xs font-bold uppercase">Done</span>
          </div>
          <p className="text-2xl font-bold">{resolvedCount}</p>
        </div>

        {isAdminMode && (
          <>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl shadow-sm border-2 border-purple-200 dark:border-purple-800/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Brain className="w-16 h-16 text-purple-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-slate-500 text-xs font-bold uppercase">AI Priority</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-purple-900">{avgPriorityScore}</p>
                <span className="text-xs text-purple-600 font-medium">/ 100</span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-[10px] text-purple-600 font-medium">Avg Score</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <DollarSign className="w-16 h-16 text-green-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-slate-500 text-xs font-bold uppercase truncate">Budget</span>
              </div>
              <p className="text-2xl font-bold truncate">
                ${estimatedBudget.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold uppercase text-slate-500 mb-4">Issue Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
         <h3 className="text-lg font-semibold">
           {isAdminMode ? '🎯 AI Priority Queue' : 'Recent Reports'}
         </h3>
         
         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
           {/* Search */}
           <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search reports..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none"
             />
           </div>

           {/* Filters */}
           <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
             <button 
               onClick={() => setFilter('all')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               All
             </button>
             <button 
               onClick={() => setFilter('critical')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'critical' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Critical
             </button>
             <button 
               onClick={() => setFilter('pending')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'pending' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Pending
             </button>
             {isAdminMode && (
               <button 
                 onClick={() => setFilter('unassigned')}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'unassigned' ? 'bg-white dark:bg-slate-700 text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Unassigned
               </button>
             )}
           </div>
         </div>
      </div>
      
      {/* Report List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report, index) => {
            const priorityScore = calculateAIPriorityScore(report);
            const daysOverdue = calculateDaysOverdue(report);
            
            return (
              <div 
                key={report.id} 
                id={`report-${report.id}`}
                className={`rounded-xl transition-all duration-500 relative ${
                  highlightedReportId === report.id 
                    ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-slate-900 shadow-xl scale-[1.01]' 
                    : ''
                }`}
              >
                {/* AI Priority Badge */}
                {isAdminMode && index < 3 && (
                  <div className="absolute -top-2 -right-2 z-10 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                    <Sparkles className="w-3 h-3" />
                    #{index + 1} Priority
                  </div>
                )}
                <ReportCard 
                  report={{
                    ...report,
                    priorityScore,
                    daysOverdue,
                    aiPredictedResolutionTime: report.aiPredictedResolutionTime || `${aiInsights.avgResolutionDays} days`
                  }} 
                  onStatusChange={onStatusChange} 
                  onAssignTeam={onAssignTeam}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            <FilterIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No reports match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

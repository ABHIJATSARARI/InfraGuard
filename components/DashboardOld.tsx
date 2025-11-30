
import React, { useEffect, useState, useMemo } from 'react';
import { Report } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend } from 'recharts';
import { ReportCard } from './ReportCard';
import { Activity, AlertTriangle, CheckCircle, Clock, ShieldAlert, Users, Download, Filter, DollarSign, HardHat, Brain, TrendingUp, Zap, Search, Sparkles } from 'lucide-react';
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

  // AI-POWERED CALCULATIONS
  const calculateAIPriorityScore = (report: Report): number => {
    if (report.priorityScore) return report.priorityScore;
    
    const daysOld = Math.floor((Date.now() - report.timestamp) / (1000 * 60 * 60 * 24));
    const severityWeight = report.analysis.severity * 15;
    const ageWeight = Math.min(daysOld * 5, 30);
    const statusWeight = report.status === 'pending' ? 20 : report.status === 'reviewed' ? 10 : 0;
    
    return Math.min(Math.round(severityWeight + ageWeight + statusWeight), 100);
  };

  // Calculate days overdue based on SLA
  const calculateDaysOverdue = (report: Report): number => {
    if (report.daysOverdue !== undefined) return report.daysOverdue;
    
    const daysOld = Math.floor((Date.now() - report.timestamp) / (1000 * 60 * 60 * 24));
    const slaThreshold = report.analysis.severity >= 4 ? 2 : report.analysis.severity === 3 ? 5 : 10;
    return Math.max(daysOld - slaThreshold, 0);
  };

  // AI Prediction for resolution time
  const predictResolutionTime = (report: Report): string => {
    if (report.aiPredictedResolutionTime) return report.aiPredictedResolutionTime;
    
    if (report.analysis.severity >= 4) return '1-2 days';
    if (report.analysis.severity === 3) return '3-5 days';
    return '5-7 days';
  };

  // Compute stats
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.analysis.severity >= 4).length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const overdueCount = reports.filter(r => calculateDaysOverdue(r) > 0 && r.status !== 'resolved').length;
  const avgPriorityScore = Math.round(reports.filter(r => r.status !== 'resolved').reduce((sum, r) => sum + calculateAIPriorityScore(r), 0) / (totalReports - resolvedCount || 1));

  // AI INSIGHTS - Trend Analysis
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
    
    return {
      trend,
      trendPercent: prev7Days.length ? Math.round(((last7Days.length - prev7Days.length) / prev7Days.length) * 100) : 0,
      topIssueType: topIssue ? topIssue[0] : 'N/A',
      topIssueCount: topIssue ? topIssue[1] : 0,
      avgResolutionDays: Math.round(reports.filter(r => r.status === 'resolved').reduce((sum, r) => {
        const resolutionTime = Math.floor((Date.now() - r.timestamp) / (1000 * 60 * 60 * 24));
        return sum + resolutionTime;
      }, 0) / (resolvedCount || 1))
    };
  }, [reports]);

  // Financial Estimates (Admin Feature)
  const calculateTotalBudget = () => {
    return reports
      .filter(r => r.status !== 'resolved')
      .reduce((sum, r) => {
        // Extract numbers from "$100-$200" or similar strings
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
    ? ['#8b5cf6', '#d946ef', '#ef4444'] // Purple/Pink tones for Admin
    : ['#3b82f6', '#eab308', '#ef4444']; // Blue/Yellow/Red for Citizen

  // Filtered Reports with AI Priority Sorting
  const filteredReports = useMemo(() => {
    let result = [...reports];
    
    // Apply filter
    if (filter === 'critical') result = result.filter(r => r.analysis.severity >= 4);
    if (filter === 'pending') result = result.filter(r => r.status === 'pending');
    if (filter === 'unassigned') result = result.filter(r => !r.assignedTo && r.status !== 'resolved');
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.analysis.type.toLowerCase().includes(query) ||
        r.analysis.description.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.status.toLowerCase().includes(query)
      );
    }
    
    // AI-POWERED SORTING: Priority Score (High to Low)
    return result.sort((a, b) => {
      const scoreA = calculateAIPriorityScore(a);
      const scoreB = calculateAIPriorityScore(b);
      return scoreB - scoreA; // Highest priority first
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
    const headers = ['ID', 'Type', 'Severity', 'Status', 'Urgency', 'Cost Estimate', 'Assigned To', 'Location', 'Date'];
    const csvContent = [
      headers.join(','),
      ...reports.map(r => [
        r.id,
        `"${r.analysis.type}"`,
        r.analysis.severity,
        r.status,
        r.analysis.urgency,
        `"${r.analysis.estimated_cost}"`,
        `"${r.assignedTo || 'Unassigned'}"`,
        `"${r.location.lat},${r.location.lng}"`,
        new Date(r.timestamp).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'infraguard_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 h-full overflow-y-auto pb-24 transition-colors duration-200 scroll-smooth">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdminMode ? (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                 <ShieldAlert className="w-3 h-3 mr-1" /> Admin Access
               </span>
            ) : (
               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                 <Users className="w-3 h-3 mr-1" /> Public View
               </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAdminMode ? 'Maintenance Command Center' : 'Community Activity Feed'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isAdminMode 
              ? 'Manage infrastructure repair tickets and team assignments.' 
              : 'See what is happening in your neighborhood.'}
          </p>
        </div>

        {isAdminMode && (
          <Button variant="secondary" onClick={downloadCSV} className="text-xs h-9">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 ${isAdminMode ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4 mb-6`}>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isAdminMode ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalReports}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Critical</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{criticalCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Done</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{resolvedCount}</p>
        </div>

        {/* Admin Only Stat: Budget */}
        {isAdminMode && (
          <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-10">
              <DollarSign className="w-16 h-16 text-green-600" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase truncate">Est. Budget</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white truncate">
              ${estimatedBudget.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4">Severity Distribution</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', backgroundColor: 'var(--tw-prose-invert-bg)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4">Issue Types</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
         <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
           {isAdminMode ? 'Priority Repair Queue' : 'Recent Submissions'}
         </h3>
         
         <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
           <button 
             onClick={() => setFilter('all')}
             className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             All
           </button>
           <button 
             onClick={() => setFilter('critical')}
             className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'critical' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             Critical
           </button>
           <button 
             onClick={() => setFilter('pending')}
             className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'pending' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             Pending
           </button>
           {isAdminMode && (
             <button 
               onClick={() => setFilter('unassigned')}
               className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${filter === 'unassigned' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               Unassigned
             </button>
           )}
         </div>
      </div>
      
      {/* Report List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div 
              key={report.id} 
              id={`report-${report.id}`}
              className={`rounded-xl transition-all duration-500 ${
                highlightedReportId === report.id 
                  ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-slate-900 shadow-xl scale-[1.01]' 
                  : ''
              }`}
            >
              <ReportCard 
                report={report} 
                onStatusChange={onStatusChange} 
                onAssignTeam={onAssignTeam}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-600">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No reports match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

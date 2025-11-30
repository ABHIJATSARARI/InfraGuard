
import React, { useState } from 'react';
import { Report } from '../types';
import { AlertTriangle, MapPin, Wrench, DollarSign, Activity, ChevronDown, ChevronUp, Siren, AlertCircle, HardHat, UserPlus, Brain, Sparkles, Clock, Users } from 'lucide-react';
import { timeAgo } from '../utils';

interface ReportCardProps {
  report: Report;
  compact?: boolean;
  onStatusChange?: (id: string, newStatus: Report['status']) => void;
  onAssignTeam?: (id: string, team: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  compact = false, 
  onStatusChange, 
  onAssignTeam 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColor = (s: number) => {
    if (s >= 5) return 'bg-red-500 text-white';
    if (s >= 4) return 'bg-orange-500 text-white';
    if (s >= 3) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const urgencyColor = (u: string) => {
    switch(u) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const statusColor = (s: string) => {
    switch(s) {
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getHazardConfig = (s: number) => {
    if (s >= 4) return {
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-900/10',
      borderClass: 'border-red-100 dark:border-red-800/30',
      textClass: 'text-red-800 dark:text-red-200',
      Icon: Siren
    };
    if (s === 3) return {
      colorClass: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-50 dark:bg-orange-900/10',
      borderClass: 'border-orange-100 dark:border-orange-800/30',
      textClass: 'text-orange-800 dark:text-orange-200',
      Icon: AlertTriangle
    };
    return {
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/10',
      borderClass: 'border-blue-100 dark:border-blue-800/30',
      textClass: 'text-blue-800 dark:text-blue-200',
      Icon: AlertCircle
    };
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(report.id, e.target.value as Report['status']);
    }
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onAssignTeam) {
      onAssignTeam(report.id, e.target.value);
    }
  };

  const hazardStyle = getHazardConfig(report.analysis.severity);
  const HazardIcon = hazardStyle.Icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col h-full">
      <div 
        className="relative h-48 bg-slate-100 dark:bg-slate-700 cursor-pointer flex-shrink-0"
        onClick={() => !compact && setIsExpanded(!isExpanded)}
      >
        <img 
          src={report.image} 
          alt={report.analysis.type} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {onStatusChange ? (
          <div className="absolute top-3 right-3 relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={report.status}
              onChange={handleStatusChange}
              className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 border-0 shadow-sm ${statusColor(report.status)}`}
            >
              <option value="pending" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-200">Pending</option>
              <option value="reviewed" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-200">Reviewed</option>
              <option value="in-progress" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-200">In Progress</option>
              <option value="resolved" className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-200">Resolved</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
               <ChevronDown className="w-3 h-3 text-current opacity-75" />
            </div>
          </div>
        ) : (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor(report.status)}`}>
            {report.status}
          </div>
        )}

        <div className={`absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${severityColor(report.analysis.severity)}`}>
          {report.analysis.severity}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">{report.analysis.type}</h3>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${urgencyColor(report.analysis.urgency)} whitespace-nowrap ml-2`}>
            {report.analysis.urgency}
          </span>
        </div>
        
        {/* AI-POWERED BADGES */}
        {(report.priorityScore || report.daysOverdue || report.aiPredictedResolutionTime) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {report.priorityScore && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/30 rounded-md">
                <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-100">
                  Priority: {report.priorityScore}
                </span>
              </div>
            )}
            {report.daysOverdue !== undefined && report.daysOverdue > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md">
                <Clock className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-bold text-red-900 dark:text-red-100">
                  {report.daysOverdue}d overdue
                </span>
              </div>
            )}
            {report.communityImpact && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-md">
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-100">
                  {report.communityImpact} affected
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Stats Row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
             <div className="flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{report.analysis.estimated_cost}</span>
             </div>
             <div className="flex items-center">
                 <Activity className="w-3.5 h-3.5 mr-1 text-slate-400" />
                 <span>{timeAgo(report.timestamp)}</span>
             </div>
             {report.aiPredictedResolutionTime && (
               <div className="flex items-center">
                 <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />
                 <span className="text-purple-600 dark:text-purple-400 font-medium">~{report.aiPredictedResolutionTime}</span>
               </div>
             )}
        </div>

        {/* Short Description */}
        {!isExpanded && (
           <p 
             className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             onClick={() => !compact && setIsExpanded(true)}
           >
             {report.analysis.description}
           </p>
        )}
        
        {/* Expanded Content */}
        {!compact && isExpanded && (
          <div className="animate-fade-in space-y-4 mt-2">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Full Description</h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {report.analysis.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1 text-xs font-bold uppercase">
                  <Wrench className="w-3.5 h-3.5 mr-1.5" /> Recommended Fix
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {report.analysis.recommended_fix}
                </p>
              </div>

              <div className={`${hazardStyle.bgClass} p-3 rounded-lg border ${hazardStyle.borderClass}`}>
                <div className={`flex items-center ${hazardStyle.colorClass} mb-1 text-xs font-bold uppercase`}>
                  <HazardIcon className="w-3.5 h-3.5 mr-1.5" /> Hazard Risk Assessment
                </div>
                <p className={`text-sm font-medium ${hazardStyle.textClass}`}>
                  {report.analysis.hazard_risk}
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
              <MapPin className="w-3 h-3 mr-1" />
              Location: {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 space-y-3">
          {/* Assignment UI - Only visible in Admin Mode (when onAssignTeam is passed) */}
          {onAssignTeam ? (
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <HardHat className="w-3 h-3 text-slate-400" />
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Team Assignment</label>
              </div>
              <div className="relative">
                <select
                  value={report.assignedTo || ''}
                  onChange={handleAssignmentChange}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  <option value="Road Crew A">Road Crew A (Paving)</option>
                  <option value="Electrical Unit">Electrical Unit</option>
                  <option value="Rapid Response">Rapid Response Team</option>
                  <option value="Sanitation Dept">Sanitation Dept</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ) : (
            // Citizen view of assignment
            report.assignedTo && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                <HardHat className="w-3.5 h-3.5 text-blue-500" />
                <span>Assigned to: <span className="font-medium text-slate-700 dark:text-slate-200">{report.assignedTo}</span></span>
              </div>
            )
          )}

          {/* Expand/Collapse Button */}
          {!compact && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center py-2 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors border-t border-slate-100 dark:border-slate-700 group-hover:border-slate-200 dark:group-hover:border-slate-600"
            >
              {isExpanded ? (
                <>Hide Analysis <ChevronUp className="w-3 h-3 ml-1" /></>
              ) : (
                <>View Full Analysis <ChevronDown className="w-3 h-3 ml-1" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { timeAgo } from '../utils';
import { Report } from '../types';
import { DEFAULT_CENTER } from '../constants';

// Fix for default Leaflet icons in Webpack/React env
const createIcon = (severity: number) => {
  const color = severity >= 4 ? '#ef4444' : severity === 3 ? '#eab308' : '#3b82f6';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

interface MapViewProps {
  reports: Report[];
  onReportSelect: (id: string) => void;
}

// Component to recenter map when reports change or on load
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ reports, onReportSelect }) => {
  // Center on the most recent report or default
  const centerPosition: [number, number] = reports.length > 0 
    ? [reports[0].location.lat, reports[0].location.lng] 
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={centerPosition} />
        
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location.lat, report.location.lng]}
            icon={createIcon(report.analysis.severity)}
            eventHandlers={{
              click: () => onReportSelect(report.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -24]} opacity={1}>
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-700">{report.analysis.type}</span>
                <span className="text-xs text-slate-500 font-normal">{timeAgo(report.timestamp)}</span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[400] bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg opacity-90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Severity Legend</h4>
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow"></div>
            <span>Critical / High (4-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white shadow"></div>
            <span>Medium (3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow"></div>
            <span>Low (1-2)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

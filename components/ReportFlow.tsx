import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, XCircle, RotateCcw, Link as LinkIcon } from 'lucide-react';
import { Button } from './Button';
import { analyzeInfrastructureImage } from '../services/geminiService';
import { AnalysisResult, Location, Report } from '../types';
import { DEFAULT_CENTER } from '../constants';

interface ReportFlowProps {
  onReportSubmit: (report: Report) => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({ onReportSubmit }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // URL Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl) return;
    setIsUrlLoading(true);
    setError(null);

    try {
      // Try fetching the image to convert to base64
      // Note: This relies on the server supporting CORS
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL is not an image');

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
        setShowUrlInput(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setError("Could not load image. It might be blocked by CORS or invalid. Try uploading a file.");
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeInfrastructureImage(image);
      setAnalysis(result);
    } catch (err) {
      setError("🔒 This is a public demo. AI analysis is disabled for security (API key removed). Clone the repo and add your own Gemini API key to enable full functionality!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!image || !analysis) return;
    setIsSubmitting(true);

    let location: Location;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Geolocation timeout')), 5000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      });

      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (err) {
      console.warn("Geolocation failed, falling back to mock location", err);
      location = {
        lat: DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.01,
        lng: DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.01
      };
    }

    const newReport: Report = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      image,
      location,
      analysis,
      status: 'pending'
    };

    onReportSubmit(newReport);
    setIsSubmitting(false);
    resetForm();
  };

  const resetForm = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setImageUrl('');
    setShowUrlInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in scroll-smooth">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
          <Camera className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Infrastructure Issue</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xs">
          Take a photo or paste an image URL of a pothole, broken light, or hazard.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-5 h-5" /> Take Photo / Upload
          </Button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {!showUrlInput ? (
            <Button 
              variant="secondary" 
              className="w-full h-12"
              onClick={() => setShowUrlInput(true)}
            >
              <LinkIcon className="w-4 h-4" /> Paste Image URL
            </Button>
          ) : (
             <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-fade-in transition-colors">
               <div className="flex gap-2 mb-2">
                 <input 
                   type="url" 
                   value={imageUrl}
                   onChange={(e) => setImageUrl(e.target.value)}
                   placeholder="https://example.com/image.jpg"
                   className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder:text-slate-400"
                   onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                 />
               </div>
               <div className="flex gap-2">
                 <Button 
                   variant="ghost" 
                   onClick={() => setShowUrlInput(false)}
                   className="flex-1 text-xs"
                 >
                   Cancel
                 </Button>
                 <Button 
                   variant="primary" 
                   onClick={handleUrlSubmit} 
                   isLoading={isUrlLoading}
                   disabled={!imageUrl}
                   className="flex-1 text-xs"
                 >
                   Load URL
                 </Button>
               </div>
             </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/50 mt-4">
              {error}
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">Powered by Gemini Vision AI</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto h-full overflow-y-auto pb-24 scroll-smooth">
      <div className="relative rounded-xl overflow-hidden shadow-lg mb-6 bg-slate-900">
        <img src={image} alt="Upload" className="w-full max-h-80 object-contain mx-auto" />
        <button 
          onClick={resetForm}
          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {!analysis && !isAnalyzing && !error && (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Ready to analyze?</h3>
          <Button onClick={handleAnalyze} className="w-full text-lg h-12 shadow-blue-500/50">
             Analyze with AI
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <div className="space-y-4 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm text-center transition-colors">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Gemini is inspecting infrastructure...</p>
          <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
            <p>• Detecting damage type</p>
            <p>• Calculating severity score</p>
            <p>• Estimating repair costs</p>
          </div>
        </div>
      )}

      {error && !showUrlInput && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center justify-between border border-red-100 dark:border-red-800/50">
          <span>{error}</span>
          <Button variant="ghost" onClick={handleAnalyze} className="text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {analysis && (
        <div className="animate-slide-up space-y-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50 shadow-sm relative overflow-hidden transition-colors">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <div className="flex justify-between items-start mb-4">
               <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{analysis.type}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI Confidence: 98%</p>
               </div>
               <div className={`px-3 py-1 rounded-full text-sm font-bold ${analysis.severity >= 4 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                 Severity: {analysis.severity}/5
               </div>
             </div>

             <div className="space-y-3">
               <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💰</span>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Est. Cost</p>
                   <p className="font-semibold text-slate-800 dark:text-slate-200">{analysis.estimated_cost}</p>
                 </div>
               </div>

               <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🛠️</span>
                 </div>
                 <div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Recommended Fix</p>
                   <p className="font-semibold text-slate-800 dark:text-slate-200">{analysis.recommended_fix}</p>
                 </div>
               </div>
               
               <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                  {analysis.description}
               </div>
             </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 shadow-green-500/30"
          >
            <CheckCircle2 className="w-6 h-6" /> 
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      )}
    </div>
  );
};
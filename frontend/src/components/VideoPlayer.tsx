import React from 'react';
import { PlayIcon } from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onWatchDemo: () => void;
  className?: string;
}

export default function VideoPlayer({ 
  src, 
  poster, 
  title, 
  onWatchDemo, 
  className = '' 
}: VideoPlayerProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Static placeholder image/video frame */}
      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
        {poster ? (
          <img 
            src={poster} 
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600">Demo Video</p>
          </div>
        )}
        
        {/* Overlay with play button */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
          <button
            onClick={onWatchDemo}
            className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg transform transition-transform group-hover:scale-110 flex items-center space-x-2"
          >
            <PlayIcon className="w-8 h-8 text-blue-600" />
            <span className="text-blue-600 font-semibold">Watch Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { XMarkIcon, PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface VideoShadowboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title: string;
  description?: string;
}

export default function VideoShadowbox({ 
  isOpen, 
  onClose, 
  src, 
  title, 
  description 
}: VideoShadowboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false); // Start unmuted since user clicked to watch
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [showControls, setShowControls] = React.useState(true); // Always show controls initially
  const [autoMuted, setAutoMuted] = React.useState(false); // Track if auto-muted due to browser restrictions

  useEffect(() => {
    if (isOpen && videoRef.current) {
      // Set video properties for auto-play
      const video = videoRef.current;
      video.muted = false; // Start unmuted since user clicked to watch
      video.preload = 'auto';
      setIsMuted(false); // Update state to reflect unmuted
      
      // Auto-play when shadowbox opens
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          console.log('Video started playing automatically with sound');
        }).catch((error) => {
          console.log('Auto-play failed:', error);
          // If auto-play fails, try muted
          video.muted = true;
          setIsMuted(true);
          setAutoMuted(true); // Mark as auto-muted due to browser restrictions
          video.play().then(() => {
            setIsPlaying(true);
            console.log('Video started playing muted after unmuted failed');
          }).catch((mutedError) => {
            console.log('Muted auto-play also failed:', mutedError);
            setIsPlaying(false);
          });
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Hide controls after 3 seconds of inactivity
      const hideControlsTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
        clearTimeout(hideControlsTimer);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    
    // Clear auto-muted state when user manually toggles mute
    if (!isMuted) {
      setAutoMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log('Video metadata loaded, duration:', videoRef.current.duration);
    }
  };

  const handleCanPlay = () => {
    console.log('Video can start playing');
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    const video = e.currentTarget;
    console.error('Video error details:', {
      error: video.error,
      networkState: video.networkState,
      readyState: video.readyState
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Video Container */}
      <div 
        className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4 bg-black rounded-lg overflow-hidden shadow-2xl"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-red-600/90 backdrop-blur-sm text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg border-2 border-white/20"
          title="Close video (ESC)"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Video */}
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onError={handleError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          preload="auto"
          muted={isMuted}
          playsInline
          controls={false}
        />

        {/* Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Video Info */}
          <div className="mb-4">
            <h3 className="text-white text-xl font-semibold mb-1">{title}</h3>
            {description && (
              <p className="text-gray-300 text-sm">{description}</p>
            )}
            {autoMuted && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-xs">
                  🔊 Video started muted due to browser settings. Click the sound button to unmute.
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="w-6 h-6" />
                ) : (
                  <SpeakerWaveIcon className="w-6 h-6" />
                )}
              </button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            {/* Close Button in Controls */}
            <button
              onClick={onClose}
              className="bg-red-600/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-700 transition-colors"
              title="Close video"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

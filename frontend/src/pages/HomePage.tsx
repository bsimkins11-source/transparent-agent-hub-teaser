import React, { useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

// Add carousel styles
const carouselStyles = `
  .video-slide {
    transition: all 0.5s ease-in-out;
  }
  .carousel-dot.active {
    background-color: white;
  }
  .carousel-dot:not(.active) {
    background-color: rgba(255, 255, 255, 0.3);
  }
  .carousel-dot:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }
`;

export default function HomePage() {
  // Force fresh deployment - latest version with video carousel
  const [searchParams] = useSearchParams();
  const isAuthRedirect = searchParams.get('auth_required') === 'true';
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ensureVideoSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      console.log('🔊 Ensuring video sound is enabled, volume:', videoRef.current.volume, 'muted:', videoRef.current.muted);
    }
  };

  const showVideoSlide = (index: number) => {
    // Stop video if it's currently playing
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      console.log('⏸️ Video paused due to carousel navigation');
    }
    
    setCurrentVideoIndex(index);
    // Ensure sound is enabled when switching to video slide
    if (index === 0) {
      setTimeout(ensureVideoSound, 100); // Small delay to ensure video is rendered
    }
  };

  const nextVideo = () => {
    // Stop video if it's currently playing
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      console.log('⏸️ Video paused due to next navigation');
    }
    
    const nextIndex = (currentVideoIndex + 1) % 5;
    setCurrentVideoIndex(nextIndex);
  };

  const previousVideo = () => {
    // Stop video if it's currently playing
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      console.log('⏸️ Video paused due to previous navigation');
    }
    
    const prevIndex = (currentVideoIndex - 1 + 5) % 5;
    setCurrentVideoIndex(prevIndex);
  };

  // Carousel only moves when user manually navigates - no auto-advance
  
  return (
    <>
      <style>{carouselStyles}</style>
      <div className="min-h-screen bg-gray-50">
      {/* Authentication Required Banner */}
      {isAuthRedirect && (
        <div className="bg-blue-50 border-b border-blue-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center gap-3 text-blue-800">
                <span className="text-xl">🔐</span>
                <p className="text-sm font-medium">
                  Authentication required. Please sign in to access the requested page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Empower Your Team with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Drive meaningful productivity gains with our curated collection of AI agents. 
              Built for transparency, designed for results, optimized for your business success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Sign In to Access
              </Link>
              <Link
                to="/login"
                className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                Sign In to View Library
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Watch Agents in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience live demonstrations of our AI agents solving real business challenges
            </p>
          </div>

          {/* Video Carousel */}
          <div className="max-w-5xl mx-auto">
            {/* Top Demo Selection Buttons */}
            <div className="mb-6 flex justify-center space-x-3">
              {[
                { index: 0, title: "Marketing Data Query", icon: "📊" },
                { index: 1, title: "Marketing Automation", icon: "📈" },
                { index: 2, title: "Data Analysis", icon: "🔍" },
                { index: 3, title: "Customer Support", icon: "💬" },
                { index: 4, title: "Process Optimization", icon: "⚙️" }
              ].map((demo) => (
                <button
                  key={demo.index}
                  onClick={() => showVideoSlide(demo.index)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentVideoIndex === demo.index
                      ? 'bg-teal-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  <span className="text-xl">{demo.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {demo.title}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Carousel Container */}
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentVideoIndex * 100}%)` }}
                >
                  {/* Demo 1: TMDQE Agent */}
                  <div className="carousel-slide flex-shrink-0 w-full">
                    <div className="grid lg:grid-cols-3 gap-0">
                      {/* Video Area - Takes up 2/3 of the space for 16:9 aspect ratio */}
                      <div 
                        className="relative bg-gray-900 lg:col-span-2 min-h-[400px] overflow-hidden"
                        onClick={ensureVideoSound}
                      >
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          poster=""
                          onLoadedData={(e) => {
                            const video = e.target as HTMLVideoElement;
                            // Set video to show a frame from 3 seconds in for the poster
                            video.currentTime = 3;
                            setTimeout(() => {
                              video.currentTime = 0; // Reset to beginning for playback
                            }, 100);
                          }}
                          muted={false}
                          autoPlay={false}
                          playsInline
                          onLoadedMetadata={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.volume = 1;
                            video.muted = false;
                            console.log('🎬 Video loaded, volume:', video.volume, 'muted:', video.muted);
                          }}
                          onPlay={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.muted = false;
                            video.volume = 1;
                            console.log('🎵 Video playing, muted:', video.muted, 'volume:', video.volume);
                          }}
                          onClick={(e) => {
                            const video = e.target as HTMLVideoElement;
                            video.muted = false;
                            video.volume = 1;
                            console.log('🖱️ Video clicked, unmuted, volume:', video.volume);
                          }}
                          onVolumeChange={(e) => {
                            const video = e.target as HTMLVideoElement;
                            console.log('🔊 Volume changed:', video.volume, 'muted:', video.muted);
                          }}
                        >
                          <source src="/TMDQA.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">Marketing Data Query App</span>
                        </div>
                      </div>

                      {/* Explanation Area - Condensed to 1/3 of the space */}
                      <div className="p-6 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          Marketing Data Query App
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                          Watch our Marketing Data Query App in action! This demonstration showcases how AI-powered 
                          data querying can transform your marketing analytics and decision-making processes.
                        </p>
                        
                        {/* Key Features - Condensed */}
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                            Features
                          </h4>
                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                              HD Quality & Interactive Controls
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                              Full Screen Support
                            </div>
                          </div>
                        </div>

                        {/* Demo Actions - Condensed */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              const video = document.querySelector('video');
                              if (video) {
                                video.play();
                                if (video.requestFullscreen) {
                                  video.requestFullscreen();
                                } else if ((video as any).webkitRequestFullscreen) {
                                  (video as any).webkitRequestFullscreen();
                                }
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                          >
                            <span>🎬</span>
                            Full Screen
                          </button>
                          <Link
                            to="/agents"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>🚀</span>
                            Explore Agents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demo 2: Marketing Automation Agent */}
                  <div className="carousel-slide flex-shrink-0 w-full">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Video Area */}
                      <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">📊</span>
                          </div>
                          <p className="text-lg font-medium">Marketing Automation Agent</p>
                          <p className="text-sm text-gray-300 mt-2">Demo video coming soon</p>
                          <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs">
                              Demo Coming Soon
                            </span>
                          </div>
                        </div>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">Marketing Agent</span>
                        </div>
                      </div>

                      {/* Explanation Area */}
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Marketing Automation Agent
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Automates social media posting, email campaigns, and content scheduling with AI-driven optimization. 
                          See how it analyzes performance data and adjusts strategies in real-time.
                        </p>
                        
                        {/* Key Features */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Key Features
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Social Media Management
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Email Campaigns
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Content Scheduling
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Performance Analytics
                            </div>
                          </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="flex gap-3">
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                          >
                            <span>⏳</span>
                            Demo Coming Soon
                          </button>
                          <Link
                            to="/agents"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>🚀</span>
                            Explore Agents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demo 3: Data Analysis Agent */}
                  <div className="carousel-slide flex-shrink-0 w-full">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Video Area */}
                      <div className="relative bg-gradient-to-br from-green-900 to-teal-900 min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">📈</span>
                          </div>
                          <p className="text-lg font-medium">Data Analysis Agent</p>
                          <p className="text-sm text-gray-300 mt-2">Demo video coming soon</p>
                          <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs">
                              Demo Coming Soon
                            </span>
                          </div>
                        </div>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">Data Analysis Agent</span>
                        </div>
                      </div>

                      {/* Explanation Area */}
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Data Analysis Agent
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Advanced business intelligence and predictive analytics powered by AI. Processes complex datasets, 
                          identifies trends, and provides actionable insights for strategic decision-making.
                        </p>
                        
                        {/* Key Features */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Key Features
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Predictive Analytics
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Trend Analysis
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Data Visualization
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Real-time Insights
                            </div>
                          </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="flex gap-3">
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                          >
                            <span>⏳</span>
                            Demo Coming Soon
                          </button>
                          <Link
                            to="/agents"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>🚀</span>
                            Explore Agents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demo 4: Customer Support Agent */}
                  <div className="carousel-slide flex-shrink-0 w-full">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Video Area */}
                      <div className="relative bg-gradient-to-br from-orange-900 to-red-900 min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">💬</span>
                          </div>
                          <p className="text-lg font-medium">Customer Support Agent</p>
                          <p className="text-sm text-gray-300 mt-2">Demo video coming soon</p>
                          <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs">
                              Demo Coming Soon
                            </span>
                          </div>
                        </div>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">Customer Support Agent</span>
                        </div>
                      </div>

                      {/* Explanation Area */}
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Customer Support Agent
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Provides 24/7 intelligent customer assistance with natural language processing. Handles inquiries, 
                          resolves issues, and escalates complex cases to human agents when needed.
                        </p>
                        
                        {/* Key Features */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Key Features
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              24/7 Availability
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              Natural Language
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              Issue Resolution
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              Human Escalation
                            </div>
                          </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="flex gap-3">
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                          >
                            <span>⏳</span>
                            Demo Coming Soon
                          </button>
                          <Link
                            to="/agents"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>🚀</span>
                            Explore Agents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Demo 5: Process Optimization Agent */}
                  <div className="carousel-slide flex-shrink-0 w-full">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Video Area */}
                      <div className="relative bg-gradient-to-br from-indigo-900 to-blue-900 min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">⚙️</span>
                          </div>
                          <p className="text-lg font-medium">Process Optimization Agent</p>
                          <p className="text-sm text-gray-300 mt-2">Demo video coming soon</p>
                          <div className="mt-4">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs">
                              Demo Coming Soon
                            </span>
                          </div>
                        </div>
                        
                        {/* Video Title Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium">Process Optimization Agent</span>
                        </div>
                      </div>

                      {/* Explanation Area */}
                      <div className="p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Process Optimization Agent
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Analyzes workflows, identifies bottlenecks, and suggests improvements for efficiency. 
                          Monitors processes in real-time and provides optimization recommendations.
                        </p>
                        
                        {/* Key Features */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                            Key Features
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                              Workflow Analysis
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                              Bottleneck Detection
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                              Efficiency Metrics
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                              Optimization Tips
                            </div>
                          </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="flex gap-3">
                          <button
                            disabled
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                          >
                            <span>⏳</span>
                            Demo Coming Soon
                          </button>
                          <Link
                            to="/agents"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>🚀</span>
                            Explore Agents
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel Navigation Dots */}
                <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <button
                      key={index}
                      onClick={() => showVideoSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors carousel-dot ${
                        currentVideoIndex === index ? 'bg-white' : 'bg-white/30 hover:bg-white/70'
                      }`}
                      aria-label={`Go to demo ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Carousel Navigation Arrows */}
                <button
                  onClick={previousVideo}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                  aria-label="Previous demo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextVideo}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                  aria-label="Next demo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>







      



      {/* Library Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What is the Transparent Agent Library?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive collection of AI agents where you can explore capabilities, 
              watch live demonstrations, and understand exactly how each agent works before integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Explore Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Explore Agents
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our extensive collection of AI agents, each with detailed descriptions, 
                use cases, and performance metrics.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Start Exploring
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Demo Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">▶️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Watch Live Demos
              </h3>
              <p className="text-gray-600 mb-6">
                See agents in action with interactive demonstrations that show real-world 
                applications and performance capabilities.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
              >
                View Demos
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Transparency Card */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Full Transparency
              </h3>
              <p className="text-gray-600 mb-6">
                Understand exactly how each agent works with detailed explanations, 
                decision-making processes, and performance analytics.
              </p>
              <Link
                to="/agents"
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors"
              >
                Learn More
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get a taste of what's available in our library
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Marketing Automation Agent',
                description: 'Automates social media posting, email campaigns, and content scheduling with AI-driven optimization.',
                category: 'Marketing',
                demoAvailable: true
              },
              {
                title: 'Data Analysis Agent',
                description: 'Processes complex datasets, generates insights, and creates visual reports automatically.',
                category: 'Analytics',
                demoAvailable: true
              },
              {
                title: 'Customer Support Agent',
                description: 'Handles customer inquiries, provides instant responses, and escalates complex issues.',
                category: 'Support',
                demoAvailable: true
              },
              {
                title: 'Content Creation Agent',
                description: 'Generates blog posts, social media content, and marketing copy tailored to your brand.',
                category: 'Content',
                demoAvailable: false
              },
              {
                title: 'Process Optimization Agent',
                description: 'Analyzes workflows, identifies bottlenecks, and suggests improvements for efficiency.',
                category: 'Operations',
                demoAvailable: true
              },
              {
                title: 'Financial Planning Agent',
                description: 'Creates budgets, forecasts cash flow, and provides financial insights for decision-making.',
                category: 'Finance',
                demoAvailable: false
              }
            ].map((agent, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {agent.category}
                  </span>
                  {agent.demoAvailable && (
                    <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <span>▶️</span>
                      Demo
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {agent.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {agent.description}
                </p>
                <div className="flex gap-2">
                  <Link
                    to="/agents"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Learn More
                  </Link>
                  {agent.demoAvailable && (
                    <Link
                      to="/agents"
                      className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <span>▶️</span>
                      Watch Demo
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/agents"
              className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
            >
              <span>🏛️</span>
              View Complete Library
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Explore the Transparent Agent Library?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Start browsing our AI agents, watch live demos, and discover how transparent AI can transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              <span>👁️</span>
              Sign In to View Library
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-teal-600 transition-colors"
            >
              <span>▶️</span>
              Sign In to Watch Demos
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

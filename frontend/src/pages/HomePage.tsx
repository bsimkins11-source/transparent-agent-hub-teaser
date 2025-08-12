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
  // FORCE FRESH DEPLOYMENT - VERCEL CACHE BUST - UPDATED 2024-08-12 12:45
  console.log('🚀 HomePage component rendering - Vercel deployment test');
  const [searchParams] = useSearchParams();
  const isAuthRedirect = searchParams.get('auth_required') === 'true';
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);




  const showSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const nextSlide = () => {
    const nextIndex = (currentSlideIndex + 1) % 5;
    setCurrentSlideIndex(nextIndex);
  };

  const previousSlide = () => {

    
    const prevIndex = (currentSlideIndex - 1 + 5) % 5;
    setCurrentSlideIndex(prevIndex);
  };
  
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
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Demo Card Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Experience Our AI Agents
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Try out our AI agents and see how they can transform your workflow.
              </p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative max-w-4xl mx-auto">
              {/* Demo Slides */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {currentSlideIndex === 0 && (
                  <div className="video-slide bg-gradient-to-br from-teal-50 to-blue-100 p-12 text-center">
                    <div className="text-6xl mb-6">🎯</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Agent Hub</h3>
                    <p className="text-gray-600">Your central platform for discovering and managing intelligent AI agents.</p>
                  </div>
                )}
                
                {currentSlideIndex === 1 && (
                  <div className="video-slide bg-gradient-to-br from-blue-50 to-indigo-100 p-12 text-center">
                    <div className="text-6xl mb-6">🚀</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Agent Marketplace</h3>
                    <p className="text-gray-600">Browse and discover specialized AI agents for every business need.</p>
                  </div>
                )}
                
                {currentSlideIndex === 2 && (
                  <div className="video-slide bg-gradient-to-br from-green-50 to-emerald-100 p-12 text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
                    <p className="text-gray-600">Built-in security and compliance features for enterprise use.</p>
                  </div>
                )}
                
                {currentSlideIndex === 3 && (
                  <div className="video-slide bg-gradient-to-br from-purple-50 to-violet-100 p-12 text-center">
                    <div className="text-6xl mb-6">📊</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
                    <p className="text-gray-600">Comprehensive reporting and performance metrics.</p>
                  </div>
                )}
                
                {currentSlideIndex === 4 && (
                  <div className="video-slide bg-gradient-to-br from-orange-50 to-amber-100 p-12 text-center">
                    <div className="text-6xl mb-6">🤝</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
                    <p className="text-gray-600">Seamless integration with your existing workflows.</p>
                  </div>
                )}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={previousSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Carousel Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {[0, 1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => showSlide(index)}
                    className={`carousel-dot w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlideIndex ? 'active' : ''
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built with enterprise needs in mind, our platform delivers the tools and security you need to succeed.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                <p className="text-gray-600">Bank-level security with SOC 2 compliance and end-to-end encryption.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapid Deployment</h3>
                <p className="text-gray-600">Get up and running in minutes, not months.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                <p className="text-gray-600">Built-in collaboration tools for seamless teamwork.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600">Comprehensive insights into performance and usage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Join thousands of organizations already using our platform to drive innovation and growth.
            </p>
            <Link
              to="/login"
              className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg inline-block"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

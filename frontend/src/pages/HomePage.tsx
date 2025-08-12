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
                  <div className="video-slide bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Card Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-blue-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎯</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Demo Card</h3>
                          <p className="text-gray-600">Interactive demonstration content will go here</p>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-blue-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">🤖</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">AI Agent Hub</h4>
                              <p className="text-sm text-blue-600">Core Platform</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Your central platform for discovering and managing intelligent AI agents. 
                            Built for transparency, designed for results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 1 && (
                  <div className="video-slide bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Card Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-blue-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🚀</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Agent Marketplace</h3>
                          <p className="text-gray-600">Browse and discover specialized AI agents for every business need</p>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-blue-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">🚀</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">AI Agent Marketplace</h4>
                              <p className="text-sm text-blue-600">Discovery Platform</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Explore our curated collection of AI agents designed for enterprise use. 
                            Find the perfect solution for your business needs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 2 && (
                  <div className="video-slide bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Card Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-green-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🔒</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
                          <p className="text-gray-600">Bank-level security with SOC 2 compliance and end-to-end encryption</p>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-green-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">🔒</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Enterprise Security</h4>
                              <p className="text-sm text-green-600">Security & Compliance</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Built-in security features with SOC 2 compliance, end-to-end encryption, 
                            and enterprise-grade access controls.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 3 && (
                  <div className="video-slide bg-gradient-to-br from-purple-50 to-violet-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Card Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-purple-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">📊</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
                          <p className="text-gray-600">Comprehensive reporting and performance metrics</p>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-purple-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">📊</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Analytics & Insights</h4>
                              <p className="text-sm text-purple-600">Performance Monitoring</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Track agent performance, usage analytics, and business impact with 
                            comprehensive reporting and real-time insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 4 && (
                  <div className="video-slide bg-gradient-to-br from-orange-50 to-amber-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Card Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-orange-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🤝</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
                          <p className="text-gray-600">Seamless integration with your existing workflows</p>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-orange-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">🤝</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Team Collaboration</h4>
                              <p className="text-sm text-orange-600">Workflow Integration</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Built-in collaboration tools that integrate seamlessly with your existing 
                            workflows and team processes.
                          </p>
                        </div>
                      </div>
                    </div>
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

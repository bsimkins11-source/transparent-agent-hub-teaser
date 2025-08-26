import React, { useState } from 'react'
import { 
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  LightBulbIcon,
  CpuChipIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon
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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Connect to Firebase Firestore
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <style>{carouselStyles}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  Transparent Marketing
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Discover the Transparent AI Agent Hub - where intelligent AI agents drive meaningful productivity gains. 
                Built for transparency, designed for results, optimized for your business success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#how-it-works"
                  className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Learn More
                </a>
                <a
                  href="#early-access"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Get Early Access
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* What Is the Transparent AI Agent Hub Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Is the Transparent AI Agent Hub?
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                A revolutionary platform that brings together the power of AI agents with complete transparency and enterprise-grade security.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <EyeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Transparency</h3>
                      <p className="text-gray-600">Every AI decision, data source, and process is visible and auditable. No black boxes, no hidden algorithms.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Agent Marketplace</h3>
                      <p className="text-gray-600">Curated collection of specialized AI agents designed for marketing, analytics, customer service, and more.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                      <p className="text-gray-600">Bank-level security with SOC 2 compliance, end-to-end encryption, and enterprise-grade access controls.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready for the Future</h3>
                  <p className="text-gray-600 mb-6">
                    Our platform is designed to scale with your business needs, from startup to enterprise.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/80 rounded-lg p-3">
                      <div className="font-semibold text-blue-600">500+</div>
                      <div className="text-gray-600">AI Agents</div>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3">
                      <div className="font-semibold text-blue-600">99.9%</div>
                      <div className="text-gray-600">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with AI agents in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Discover</h3>
                <p className="text-gray-600">Browse our curated collection of AI agents designed for specific business needs and use cases.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Configure</h3>
                <p className="text-gray-600">Customize agents with your business rules, data sources, and specific requirements.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deploy</h3>
                <p className="text-gray-600">Launch agents into your workflows and start seeing immediate productivity gains.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Agent Categories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our comprehensive collection of AI agents organized by business function
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Marketing & Sales */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <PresentationChartLineIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Marketing & Sales</h3>
                <p className="text-gray-600 text-center mb-4">
                  AI agents for lead generation, content creation, campaign optimization, and sales automation.
                </p>
                <div className="text-sm text-blue-600 font-medium text-center">
                  Coming Q1 2025
                </div>
              </div>

              {/* Customer Service */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Customer Service</h3>
                <p className="text-gray-600 text-center mb-4">
                  Intelligent support agents for 24/7 customer assistance, ticket routing, and issue resolution.
                </p>
                <div className="text-sm text-green-600 font-medium text-center">
                  Coming Q1 2025
                </div>
              </div>

              {/* Data Analytics */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 border border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Data Analytics</h3>
                <p className="text-gray-600 text-center mb-4">
                  AI-powered insights, predictive analytics, and automated reporting for data-driven decisions.
                </p>
                <div className="text-sm text-purple-600 font-medium text-center">
                  Coming Q2 2025
                </div>
              </div>

              {/* Content Creation */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 border border-orange-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Content Creation</h3>
                <p className="text-gray-600 text-center mb-4">
                  AI agents for writing, design, video production, and creative content generation.
                </p>
                <div className="text-sm text-orange-600 font-medium text-center">
                  Coming Q2 2025
                </div>
              </div>

              {/* Operations & Automation */}
              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8 border border-red-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CogIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Operations & Automation</h3>
                <p className="text-gray-600 text-center mb-4">
                  Workflow automation, process optimization, and operational efficiency agents.
                </p>
                <div className="text-sm text-red-600 font-medium text-center">
                  Coming Q3 2025
                </div>
              </div>

              {/* Research & Development */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Research & Development</h3>
                <p className="text-gray-600 text-center mb-4">
                  AI agents for market research, competitive analysis, and innovation discovery.
                </p>
                <div className="text-sm text-indigo-600 font-medium text-center">
                  Coming Q3 2025
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Demo Card Section */}
        <section className="py-16 bg-gray-50">
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
                      {/* Left 2/3 - Video Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-blue-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Marketing Agent Demo</h3>
                          <p className="text-gray-600">Video demonstration of AI-powered marketing automation</p>
                          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Watch Demo
                          </button>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-blue-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">📈</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Marketing Agent</h4>
                              <p className="text-sm text-blue-600">Lead Generation</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            AI-powered marketing agent that identifies leads, creates personalized content, 
                            and optimizes campaigns for maximum ROI.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 1 && (
                  <div className="video-slide bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Video Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-green-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer Service Agent</h3>
                          <p className="text-gray-600">AI-powered customer support and ticket resolution</p>
                          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Watch Demo
                          </button>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-green-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">💬</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Customer Service Agent</h4>
                              <p className="text-sm text-green-600">Support & Resolution</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            24/7 AI customer service agent that handles inquiries, resolves issues, 
                            and escalates complex cases to human agents.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 2 && (
                  <div className="video-slide bg-gradient-to-br from-purple-50 to-violet-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Video Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-purple-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics Agent</h3>
                          <p className="text-gray-600">Data insights and predictive analytics demonstration</p>
                          <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            Watch Demo
                          </button>
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
                              <h4 className="font-bold text-gray-900">Analytics Agent</h4>
                              <p className="text-sm text-purple-600">Insights & Predictions</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Advanced analytics agent that processes data, identifies trends, 
                            and provides actionable business insights and predictions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 3 && (
                  <div className="video-slide bg-gradient-to-br from-orange-50 to-amber-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Video Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-orange-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Creation Agent</h3>
                          <p className="text-gray-600">AI-powered content generation and optimization</p>
                          <button className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            Watch Demo
                          </button>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-orange-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">✍️</span>
                            </div>
                            <div>
                              <h4 className="text-gray-900">Content Creation Agent</h4>
                              <p className="text-sm text-orange-600">Creative & Writing</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Creative AI agent that generates engaging content, optimizes copy, 
                            and maintains brand voice across all channels.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentSlideIndex === 4 && (
                  <div className="video-slide bg-gradient-to-br from-red-50 to-pink-100 p-6">
                    <div className="grid grid-cols-3 gap-6 h-full">
                      {/* Left 2/3 - Video Placeholder */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-red-200 text-center w-full h-full flex flex-col justify-center">
                          <div className="text-6xl mb-4">🎥</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Operations Agent</h3>
                          <p className="text-gray-600">Workflow automation and process optimization</p>
                          <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Watch Demo
                          </button>
                        </div>
                      </div>
                      {/* Right 1/3 - Agent Info */}
                      <div className="col-span-1 flex flex-col justify-center">
                        <div className="bg-white/90 rounded-xl p-5 shadow-lg border border-red-200 h-full flex flex-col justify-center">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-xl">⚙️</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">Operations Agent</h4>
                              <p className="text-sm text-red-600">Automation & Efficiency</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Operations AI agent that automates workflows, optimizes processes, 
                            and identifies efficiency improvements across your organization.
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

        {/* Coming Soon Section with Roadmap */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Coming Soon - Roadmap to 2026
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our development roadmap shows the exciting features and capabilities we're building for you
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-500 to-teal-500"></div>
              
              {/* Timeline items */}
              <div className="space-y-12">
                {/* Q1 2025 */}
                <div className="relative flex items-center">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-5/12 pr-8 text-right">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Q1 2025</h3>
                    <p className="text-gray-600">Marketing & Sales Agents Launch</p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1">
                      <li>• Lead Generation Agents</li>
                      <li>• Content Creation Tools</li>
                      <li>• Campaign Optimization</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q2 2025 */}
                <div className="relative flex items-center">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-5/12 pl-8 ml-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Q2 2025</h3>
                    <p className="text-gray-600">Customer Service & Analytics</p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1">
                      <li>• 24/7 Support Agents</li>
                      <li>• Predictive Analytics</li>
                      <li>• Advanced Reporting</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q3 2025 */}
                <div className="relative flex items-center">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-5/12 pr-8 text-right">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Q3 2025</h3>
                    <p className="text-gray-600">Operations & Content Creation</p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1">
                      <li>• Workflow Automation</li>
                      <li>• AI Content Generation</li>
                      <li>• Process Optimization</li>
                    </ul>
                  </div>
                </div>
                
                {/* Q4 2025 */}
                <div className="relative flex items-center">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-5/12 pl-8 ml-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Q4 2025</h3>
                    <p className="text-gray-600">Advanced Features & Integration</p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1">
                      <li>• Enterprise IAM</li>
                      <li>• Advanced Analytics</li>
                      <li>• Third-party Integrations</li>
                    </ul>
                  </div>
                </div>
                
                {/* 2026 */}
                <div className="relative flex items-center">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-5/12 pr-8 text-right">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">2026</h3>
                    <p className="text-gray-600">Full Marketplace Launch</p>
                    <ul className="text-sm text-gray-500 mt-2 space-y-1">
                      <li>• Agent Marketplace</li>
                      <li>• Usage Analytics</li>
                      <li>• Enterprise Solutions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Email Capture Form Section */}
        <section id="early-access" className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Get Early Access
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Be among the first to experience the future of transparent AI agents. 
              Sign up for early access and exclusive updates.
            </p>
            
            {submitSuccess ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-3">Thank You!</h3>
                <p className="text-teal-100 mb-4">
                  You've been added to our early access list. We'll notify you as soon as new features are available.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up Another Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Signing Up...' : 'Get Early Access'}
                  </button>
                </div>
                <p className="text-sm text-teal-200 mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            )}
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

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Join thousands of organizations already using our platform to drive innovation and growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#early-access"
                className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg inline-block"
              >
                Get Early Access
              </a>
              <a
                href="#how-it-works"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

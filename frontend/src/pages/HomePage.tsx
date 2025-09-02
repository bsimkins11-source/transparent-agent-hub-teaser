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
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import VideoPlayer from '../components/VideoPlayer'
import VideoShadowbox from '../components/VideoShadowbox'
import { demoVideos, DemoVideo } from '../data/demoVideos'

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
  const [shadowboxVideo, setShadowboxVideo] = useState<DemoVideo | null>(null);

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
      // TODO: Connect to backend service when implemented
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

  const openShadowbox = (video: DemoVideo) => {
    setShadowboxVideo(video);
  };

  const closeShadowbox = () => {
    setShadowboxVideo(null);
  };
  
  return (
    <>
      <style>{carouselStyles}</style>
      
      {/* Header with Transparent Logo */}
      <header className="header-nav">
        <div className="header-container">
          <img src="/transparent-logo.png" alt="Transparent Partners" className="logo" />
          <nav className="nav-links">
            <a href="#what-is" className="nav-link">What Is</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#early-access" className="nav-link">Early Access</a>
          </nav>
        </div>
      </header>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Large Transparent Partners Logo - Strong Branding */}
              <div className="mb-16 flex justify-center">
                <img 
                  src="/transparent-logo-large.png" 
                  alt="Transparent Partners" 
                  className="w-1/2 md:w-2/5 lg:w-1/3 h-auto max-w-2xl"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Introducing the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  Transparent
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                  AI Agent Hub
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                The Future of Transparent Marketing
              </p>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                A new era of marketing efficiency and intelligence is coming. The Transparent AI Agent Hub is your central portal to discover, launch, and scale AI-powered agents built specifically for marketing teams.
              </p>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Today, get a sneak peek at the future. Watch demos, explore use cases, and see how agents will transform the way your brand works.
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
        <section id="what-is" className="py-20 bg-white">
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

        {/* Demo Agents Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Watch the First Demo Agents in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how AI agents are transforming marketing workflows
              </p>
            </div>
            
            {/* Compact Carousel Container */}
            <div className="relative max-w-3xl mx-auto">
              {/* Demo Slides */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
                {demoVideos.map((video, index) => (
                  currentSlideIndex === index && (
                    <div key={video.id} className={`video-slide bg-gradient-to-br ${video.gradientFrom} ${video.gradientTo} p-8`}>
                      <div className="text-center">
                        {/* Agent Info Header */}
                        <div className="mb-6">
                          <div className="flex items-center justify-center mb-4">
                            <div className={`w-16 h-16 bg-gradient-to-br from-${video.color}-500 to-${video.color}-600 rounded-xl flex items-center justify-center mr-4`}>
                              <span className="text-white text-2xl">{video.icon}</span>
                            </div>
                            <div className="text-left">
                              <h3 className="text-2xl font-bold text-gray-900">{video.title}</h3>
                              <p className={`text-lg text-${video.color}-600`}>{video.category}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                            {video.description}
                          </p>
                        </div>
                        
                        {/* Video Player */}
                        <div className="bg-white/90 rounded-2xl p-6 shadow-xl border border-gray-200">
                          <VideoPlayer
                            src={video.videoSrc}
                            poster={video.posterSrc}
                            title={video.title}
                            onWatchDemo={() => openShadowbox(video)}
                            className="w-full h-48 rounded-lg mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={previousSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
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

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
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
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Media Ops */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 rounded-lg p-2 mr-4">
                    <CogIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">1. Media Ops</h3>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Intelligent workflows that optimize campaign builds, QA, activation, and spend allocation.
                </p>
                <p className="text-gray-600 text-sm">
                  Media Ops agents remove friction from campaign execution. They streamline builds, catch QA issues before they go live, automate activation steps, and continuously optimize spend allocation — ensuring media investments deliver with precision.
                </p>
              </div>

              {/* Creative & Content Ops */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 rounded-lg p-2 mr-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">2. Creative & Content Ops</h3>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Solutions for personalization, content QA, and versioning at scale.
                </p>
                <p className="text-gray-600 text-sm">
                  Scale creativity without sacrificing quality. Creative & Content Ops agents support copy and visual QA, adapt creative versions across markets, and drive personalization at scale — keeping every campaign fresh, consistent, and on brand.
                </p>
              </div>

              {/* Campaign Governance */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 border border-emerald-100">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-600 rounded-lg p-2 mr-4">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">3. Campaign Governance</h3>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Agents that enforce transparency and accountability across brand–agency partnerships.
                </p>
                <p className="text-gray-600 text-sm">
                  Agency Ops agents act as trusted middle layers. They standardize reporting, flag discrepancies in delivery or spend, and enforce agreed-upon taxonomies — ensuring both brands and agencies operate with clarity and accountability.
                </p>
              </div>

              {/* Analytics & Measurement */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-8 border border-orange-100">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-600 rounded-lg p-2 mr-4">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">4. Analytics & Measurement</h3>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Automated testing, dashboards, and ROI agents that tie spend to outcomes.
                </p>
                <p className="text-gray-600 text-sm">
                  Analytics & Measurement agents transform raw data into actionable clarity. They automate A/B testing, deliver real-time dashboards, and connect investment decisions directly to ROI — closing the loop between spend and impact.
                </p>
              </div>

              {/* Data Governance */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-8 border border-slate-100 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="bg-slate-600 rounded-lg p-2 mr-4">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">5. Data Governance</h3>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  Agents that ensure compliance, privacy-by-design, and metadata integrity.
                </p>
                <p className="text-gray-600 text-sm">
                  Data Governance agents keep your marketing house in order. They enforce taxonomy standards, safeguard privacy, and ensure metadata integrity — providing a reliable foundation for compliant, scalable, data-driven growth.
                </p>
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

      {/* Video Shadowbox Modal */}
      {shadowboxVideo && (
        <VideoShadowbox
          isOpen={!!shadowboxVideo}
          onClose={closeShadowbox}
          src={shadowboxVideo.videoSrc}
          title={shadowboxVideo.title}
          description={shadowboxVideo.description}
        />
      )}
    </>
  )
}

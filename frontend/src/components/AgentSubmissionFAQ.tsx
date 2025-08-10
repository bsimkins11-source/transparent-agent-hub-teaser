import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: 'business' | 'technical' | 'review' | 'general';
}

export default function AgentSubmissionFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'business' | 'technical' | 'review' | 'general'>('all');

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqItems: FAQItem[] = [
    // Business Requirements
    {
      id: 'business-model',
      question: 'What business models are supported for monetizing AI agents?',
      answer: (
        <div className="space-y-3">
          <p>We support multiple business models to help creators monetize their AI agents:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li><strong>Subscription-based:</strong> Monthly/yearly recurring revenue with tiered pricing</li>
            <li><strong>Pay-per-use:</strong> Per-request or per-token pricing model</li>
            <li><strong>Freemium:</strong> Free basic tier with premium features</li>
            <li><strong>Enterprise licensing:</strong> Custom pricing for business customers</li>
            <li><strong>Revenue sharing:</strong> Split revenue with the platform on successful agents</li>
          </ul>
          <p className="text-sm text-blue-600">Our platform handles billing, payment processing, and revenue distribution automatically.</p>
        </div>
      ),
      category: 'business'
    },
    {
      id: 'revenue-sharing',
      question: 'How does revenue sharing work?',
      answer: (
        <div className="space-y-3">
          <p>Our revenue sharing model is designed to reward successful creators:</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Revenue Split Structure</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li><strong>Platform Fee:</strong> 15% of gross revenue</li>
              <li><strong>Creator Revenue:</strong> 85% of gross revenue</li>
              <li><strong>Infrastructure Costs:</strong> Billed separately based on actual usage</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">Revenue is calculated monthly and paid out within 30 days. We provide detailed analytics and revenue tracking.</p>
        </div>
      ),
      category: 'business'
    },
    {
      id: 'pricing-guidelines',
      question: 'What are the pricing guidelines for AI agents?',
      answer: (
        <div className="space-y-3">
          <p>We recommend the following pricing guidelines based on agent complexity and value:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Basic Agents</h4>
              <p className="text-sm text-blue-700">Simple task automation, basic Q&A</p>
              <p className="text-lg font-bold text-blue-900">$5-20/month</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-medium text-purple-800 mb-2">Advanced Agents</h4>
              <p className="text-sm text-purple-700">Complex workflows, specialized knowledge</p>
              <p className="text-lg font-bold text-purple-900">$20-100/month</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Enterprise Agents</h4>
              <p className="text-sm text-green-700">Custom solutions, high-volume usage</p>
              <p className="text-lg font-bold text-green-900">$100+/month</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2">Pay-per-use</h4>
              <p className="text-sm text-orange-700">Variable pricing based on usage</p>
              <p className="text-lg font-bold text-orange-900">$0.01-0.10/request</p>
            </div>
          </div>
        </div>
      ),
      category: 'business'
    },
    {
      id: 'market-research',
      question: 'How can I research the market for my AI agent?',
      answer: (
        <div className="space-y-3">
          <p>We provide several tools to help you understand market demand:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li><strong>Market Analytics Dashboard:</strong> View trending topics, popular agents, and market gaps</li>
            <li><strong>Competitor Analysis:</strong> Analyze similar agents, pricing, and user feedback</li>
            <li><strong>User Behavior Insights:</strong> Understand how users interact with different agent types</li>
            <li><strong>Demand Forecasting:</strong> Predict market trends and opportunities</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <InformationCircleIcon className="w-4 h-4 inline mr-1" />
              <strong>Tip:</strong> Start with a niche market and expand based on user feedback and usage data.
            </p>
          </div>
        </div>
      ),
      category: 'business'
    },

    // Technical Requirements
    {
      id: 'technical-specs',
      question: 'What are the technical requirements for AI agents?',
      answer: (
        <div className="space-y-3">
          <p>All AI agents must meet our technical standards for quality and reliability:</p>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">Performance Requirements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Response time: &lt; 5 seconds for 95% of requests</li>
                <li>• Uptime: 99.9% availability</li>
                <li>• Error rate: &lt; 1% of total requests</li>
                <li>• Concurrent users: Support for 100+ simultaneous users</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Security Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Data encryption in transit and at rest</li>
                <li>• Secure API authentication and authorization</li>
                <li>• Input validation and sanitization</li>
                <li>• Rate limiting and abuse prevention</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Integration Requirements</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• RESTful API or GraphQL endpoint</li>
                <li>• Standardized request/response formats</li>
                <li>• Comprehensive error handling</li>
                <li>• API documentation and examples</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'technical'
    },
    {
      id: 'ai-model-requirements',
      question: 'What AI models and technologies are supported?',
      answer: (
        <div className="space-y-3">
          <p>We support a wide range of AI technologies and models:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Supported AI Models</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• OpenAI GPT models (GPT-3.5, GPT-4)</li>
                <li>• Anthropic Claude models</li>
                <li>• Google PaLM and Gemini</li>
                <li>• Custom fine-tuned models</li>
                <li>• Open-source models (Llama, Mistral)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Supported Technologies</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Python, JavaScript, TypeScript</li>
                <li>• LangChain, LlamaIndex frameworks</li>
                <li>• Vector databases (Pinecone, Weaviate)</li>
                <li>• Cloud platforms (AWS, GCP, Azure)</li>
                <li>• Container deployment (Docker, Kubernetes)</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <InformationCircleIcon className="w-4 h-4 inline mr-1" />
              <strong>Note:</strong> We provide pre-configured infrastructure for popular AI models to accelerate development.
            </p>
          </div>
        </div>
      ),
      category: 'technical'
    },
    {
      id: 'data-handling',
      question: 'What are the data handling and privacy requirements?',
      answer: (
        <div className="space-y-3">
          <p>All agents must comply with strict data privacy and security standards:</p>
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-800 mb-2">Data Privacy Requirements</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• GDPR and CCPA compliance</li>
                <li>• Data minimization principles</li>
                <li>• User consent management</li>
                <li>• Right to data deletion</li>
                <li>• Data retention policies</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2">Data Security Measures</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• Secure data transmission (TLS 1.3)</li>
                <li>• Access control and authentication</li>
                <li>• Regular security audits</li>
                <li>• Incident response procedures</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Data Processing Guidelines</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Clear data processing purposes</li>
                <li>• Limited data retention periods</li>
                <li>• Secure data disposal methods</li>
                <li>• Regular privacy impact assessments</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'technical'
    },
    {
      id: 'testing-requirements',
      question: 'What testing and quality assurance is required?',
      answer: (
        <div className="space-y-3">
          <p>We require comprehensive testing to ensure agent quality and reliability:</p>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Required Testing</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Unit tests (minimum 80% coverage)</li>
                <li>• Integration tests for API endpoints</li>
                <li>• Load testing for performance validation</li>
                <li>• Security testing (OWASP Top 10)</li>
                <li>• User acceptance testing</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Quality Metrics</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Response accuracy: &gt; 90%</li>
                <li>• User satisfaction: &gt; 4.0/5.0</li>
                <li>• Error handling: Graceful degradation</li>
                <li>• Documentation completeness</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-medium text-purple-800 mb-2">Testing Tools</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Automated testing frameworks</li>
                <li>• CI/CD pipeline integration</li>
                <li>• Performance monitoring tools</li>
                <li>• Security scanning tools</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'technical'
    },

    // Review Process
    {
      id: 'review-process',
      question: 'What is the agent review and approval process?',
      answer: (
        <div className="space-y-3">
          <p>Our review process ensures quality and safety for all users:</p>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Review Timeline</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Initial review: 2-3 business days</li>
                <li>• Technical assessment: 3-5 business days</li>
                <li>• Security review: 2-3 business days</li>
                <li>• Final approval: 1-2 business days</li>
                <li><strong>Total: 8-13 business days</strong></li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Review Criteria</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Technical quality and performance</li>
                <li>• Security and privacy compliance</li>
                <li>• Business model viability</li>
                <li>• User experience and accessibility</li>
                <li>• Content safety and ethical AI</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-2">Common Rejection Reasons</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Insufficient testing or documentation</li>
                <li>• Security vulnerabilities</li>
                <li>• Poor performance or reliability</li>
                <li>• Violation of content policies</li>
                <li>• Incomplete business plan</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'review'
    },
    {
      id: 'approval-requirements',
      question: 'What are the requirements for agent approval?',
      answer: (
        <div className="space-y-3">
          <p>To be approved, agents must meet all of the following requirements:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Technical Requirements</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Passes all security tests</li>
                <li>✓ Meets performance benchmarks</li>
                <li>✓ Comprehensive error handling</li>
                <li>✓ Complete API documentation</li>
                <li>✓ Automated testing suite</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Business Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Clear value proposition</li>
                <li>✓ Sustainable business model</li>
                <li>✓ Target market identification</li>
                <li>✓ Marketing and growth plan</li>
                <li>✓ Revenue projections</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-medium text-purple-800 mb-2">Compliance Requirements</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✓ Privacy policy compliance</li>
                <li>✓ Terms of service</li>
                <li>✓ Ethical AI guidelines</li>
                <li>✓ Data protection measures</li>
                <li>✓ User consent management</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2">Quality Requirements</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>✓ User experience excellence</li>
                <li>✓ Accessibility compliance</li>
                <li>✓ Comprehensive support</li>
                <li>✓ Regular updates planned</li>
                <li>✓ Community engagement</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'review'
    },

    // General Information
    {
      id: 'getting-started',
      question: 'How do I get started as a creator?',
      answer: (
        <div className="space-y-3">
          <p>Follow these steps to begin your creator journey:</p>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Step-by-Step Process</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li><strong>Complete Creator Registration:</strong> Fill out the application form with your information</li>
                <li><strong>Wait for Approval:</strong> Our team reviews your application (3-5 business days)</li>
                <li><strong>Access Creator Tools:</strong> Get access to our development platform and resources</li>
                <li><strong>Build Your Agent:</strong> Develop and test your AI agent</li>
                <li><strong>Submit for Review:</strong> Submit your agent for technical and business review</li>
                <li><strong>Launch and Monetize:</strong> Start earning revenue once approved</li>
              </ol>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Resources Available</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Development documentation and tutorials</li>
                <li>• Pre-built templates and examples</li>
                <li>• Technical support and community forums</li>
                <li>• Marketing and promotion tools</li>
                <li>• Analytics and performance insights</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'general'
    },
    {
      id: 'support-resources',
      question: 'What support and resources are available for creators?',
      answer: (
        <div className="space-y-3">
          <p>We provide comprehensive support to help creators succeed:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Technical Support</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 24/7 technical assistance</li>
                <li>• Code review and optimization</li>
                <li>• Performance tuning guidance</li>
                <li>• Security best practices</li>
                <li>• Integration support</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2">Business Support</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Market research tools</li>
                <li>• Pricing strategy guidance</li>
                <li>• Marketing and promotion</li>
                <li>• Customer acquisition</li>
                <li>• Revenue optimization</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-medium text-purple-800 mb-2">Community & Learning</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Creator community forums</li>
                <li>• Regular webinars and workshops</li>
                <li>• Best practices sharing</li>
                <li>• Networking opportunities</li>
                <li>• Mentorship programs</li>
              </ul>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2">Infrastructure & Tools</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Pre-configured AI environments</li>
                <li>• Monitoring and analytics</li>
                <li>• Automated testing tools</li>
                <li>• Deployment pipelines</li>
                <li>• Scaling infrastructure</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      category: 'general'
    }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Questions', count: faqItems.length },
    { id: 'business', name: 'Business', count: faqItems.filter(item => item.category === 'business').length },
    { id: 'technical', name: 'Technical', count: faqItems.filter(item => item.category === 'technical').length },
    { id: 'review', name: 'Review Process', count: faqItems.filter(item => item.category === 'review').length },
    { id: 'general', name: 'General', count: faqItems.filter(item => item.category === 'general').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agent Submission FAQ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about submitting AI agents to our marketplace. 
            From business requirements to technical specifications, we've got you covered.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={false}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.category === 'business' ? 'bg-blue-100 text-blue-600' :
                    item.category === 'technical' ? 'bg-green-100 text-green-600' :
                    item.category === 'review' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.category === 'business' && <CurrencyDollarIcon className="w-4 h-4" />}
                    {item.category === 'technical' && <CodeBracketIcon className="w-4 h-4" />}
                    {item.category === 'review' && <CheckCircleIcon className="w-4 h-4" />}
                    {item.category === 'general' && <InformationCircleIcon className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-gray-900">{item.question}</span>
                </div>
                {openItems.has(item.id) ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {openItems.has(item.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-700">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Become a Creator?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join our marketplace and start building the future of AI agents
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Start Creator Registration
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DemoVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  videoSrc: string;
  posterSrc?: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
}

export const demoVideos: DemoVideo[] = [
  {
    id: 'audience-engine',
    title: 'Audience Engine Demo',
    description: 'Watch how this agent transforms campaign briefs into actionable strategies, automatically identifying opportunities and optimizing for maximum impact.',
    category: 'Strategy & Planning',
    videoSrc: '/videos/audience-engine-demo.mp4',
    posterSrc: '/videos/audience-engine-poster.jpg',
    icon: '📋',
    color: 'blue',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-indigo-100',
    borderColor: 'border-blue-200'
  },
  {
    id: 'tmdqa',
    title: 'Transparent Marketing Data Query Agent',
    description: 'See real-time performance insights and automated optimization recommendations that drive measurable ROI improvements.',
    category: 'Analytics & Insights',
    videoSrc: '/videos/tmdqa-demo.mp4',
    posterSrc: '/videos/tmdqa-poster.jpg',
    icon: '📊',
    color: 'teal',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-emerald-100',
    borderColor: 'border-teal-200'
  },
  {
    id: 'interview-research',
    title: 'Interview & Research Agent',
    description: 'Discover how this agent conducts intelligent research, synthesizes insights, and collaborates seamlessly with your team.',
    category: 'Knowledge & Collaboration',
    videoSrc: '/videos/interview-research-demo.mp4',
    posterSrc: undefined, // Will show fallback placeholder
    icon: '🔍',
    color: 'purple',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-violet-100',
    borderColor: 'border-purple-200'
  },
  {
    id: 'content-creation',
    title: 'Content Creation Agent',
    description: 'Creative AI agent that generates engaging content, optimizes copy, and maintains brand voice across all channels.',
    category: 'Creative & Writing',
    videoSrc: '/videos/content-creation-demo.mp4',
    posterSrc: undefined, // Will show fallback placeholder
    icon: '✍️',
    color: 'orange',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-amber-100',
    borderColor: 'border-orange-200'
  },
  {
    id: 'operations',
    title: 'Operations Agent',
    description: 'Operations AI agent that automates workflows, optimizes processes, and identifies efficiency improvements across your organization.',
    category: 'Automation & Efficiency',
    videoSrc: '/videos/operations-demo.mp4',
    posterSrc: undefined, // Will show fallback placeholder
    icon: '⚙️',
    color: 'red',
    gradientFrom: 'from-red-50',
    gradientTo: 'to-pink-100',
    borderColor: 'border-red-200'
  }
];

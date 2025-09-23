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
    id: 'tp-audience-agent',
    title: 'Transparent Audience Agent',
    description: 'Watch how this agent transforms campaign briefs into actionable strategies, automatically identifying opportunities and optimizing for maximum impact.',
    category: 'Strategy & Planning',
    videoSrc: '/videos/Audience_Agent_Demo_925.mp4',
    posterSrc: '/videos/tp-audience-agent-poster.jpg',
    icon: '',
    color: 'blue',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-indigo-100',
    borderColor: 'border-blue-200'
  },
  {
    id: 'tp-intelligence-agent',
    title: 'Transparent Intelligence Agent',
    description: 'Experience advanced AI intelligence that analyzes data patterns, generates insights, and provides strategic recommendations for optimal decision-making.',
    category: 'AI & Intelligence',
    videoSrc: '/videos/Marketing_Data_Agent_Demo_925.mp4',
    posterSrc: '/videos/tp-intelligence-agent-poster.jpg',
    icon: '',
    color: 'purple',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-violet-100',
    borderColor: 'border-purple-200'
  },
  {
    id: 'knowledge-agent',
    title: 'Knowledge Agent',
    description: 'Experience how this intelligent knowledge agent processes information, answers questions, and provides contextual insights across your organization.',
    category: 'Knowledge & Collaboration',
    videoSrc: '/videos/transparent_knowledge_agent_demo_925.mp4',
    posterSrc: undefined, // Will show fallback placeholder
    icon: '',
    color: 'green',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-emerald-100',
    borderColor: 'border-green-200'
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

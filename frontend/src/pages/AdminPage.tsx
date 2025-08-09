import { motion } from 'framer-motion'
import { 
  Cog6ToothIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage your AI agents and monitor usage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Agent Management',
              description: 'Create, edit, and manage AI agents',
              icon: Cog6ToothIcon,
              color: 'bg-blue-500'
            },
            {
              title: 'Analytics',
              description: 'View usage statistics and insights',
              icon: ChartBarIcon,
              color: 'bg-green-500'
            },
            {
              title: 'User Management',
              description: 'Manage user access and permissions',
              icon: UserGroupIcon,
              color: 'bg-purple-500'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 text-center"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8 text-center"
        >
          <div className="text-gray-400 text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Admin Panel Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The admin dashboard is under development. You'll be able to manage agents, 
            view analytics, and control user access here.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

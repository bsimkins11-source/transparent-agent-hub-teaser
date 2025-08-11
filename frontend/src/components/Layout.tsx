import { Outlet } from 'react-router-dom'
import Header from './Header'
import { motion } from 'framer-motion'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-20 min-h-screen"
        style={{ 
          minHeight: 'calc(100vh - 80px)',
          paddingTop: '80px' // Ensure content starts below header
        }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}

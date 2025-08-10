import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Layout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded)
    }

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener)
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`pt-20 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'lg:ml-80' : 'lg:ml-0'
        }`}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}

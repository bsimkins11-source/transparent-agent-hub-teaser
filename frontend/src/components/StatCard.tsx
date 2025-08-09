interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  changeColor: string
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor, 
  changeColor 
}: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs ${changeColor}`}>{change}</div>
    </div>
  )
}


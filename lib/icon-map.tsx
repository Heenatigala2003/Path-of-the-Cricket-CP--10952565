import * as Icons from 'lucide-react'
import { FaRunning } from 'react-icons/fa'

export const getIcon = (iconName: string, className?: string) => {
  const LucideIcon = (Icons as any)[iconName]
  if (LucideIcon) {
    return <LucideIcon className={className} />
  }
 
  if (iconName === 'FaRunning') {
    return <FaRunning className={className} />
  }
  // Default fallback
  return <Icons.HelpCircle className={className} />
}
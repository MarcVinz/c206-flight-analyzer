import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="aviation-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors active:bg-muted/70"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 [&>.aviation-card]:border-0 [&>.aviation-card]:shadow-none [&>.aviation-card]:bg-transparent [&>.aviation-card]:p-0 [&_.aviation-card]:border-0 [&_.aviation-card]:shadow-none [&_.aviation-card]:bg-transparent [&_.aviation-card]:p-0 [&_.section-header]:hidden">{children}</div>
      </div>
    </div>
  )
}

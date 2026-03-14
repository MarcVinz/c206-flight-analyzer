import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

interface HeaderProps {
  onPrint: () => void
}

export function Header({ onPrint }: HeaderProps) {
  const { t, toggleLang } = useLanguage()

  return (
    <header className="bg-card border-b border-border sticky top-0 z-[1100] no-print">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo.png"
              alt="Africa Bushpilot"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
            />
            <div>
              <h1 className="text-base sm:text-xl font-bold text-foreground">Flight Analyzer</h1>
              <p className="text-xs text-muted-foreground">Africa Bushpilot Adventures</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLang}
              className="font-semibold text-xs px-2.5"
            >
              {t('langToggle')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onPrint}
              title={t('printBriefing')}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

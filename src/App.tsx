import Index from '@/pages/Index'
import { PasswordGate } from '@/components/PasswordGate'
import { LanguageProvider } from '@/contexts/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <PasswordGate>
        <Index />
      </PasswordGate>
    </LanguageProvider>
  )
}

export default App

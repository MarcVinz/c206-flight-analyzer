import Index from '@/pages/Index'
import { PasswordGate } from '@/components/PasswordGate'

function App() {
  return (
    <PasswordGate>
      <Index />
    </PasswordGate>
  )
}

export default App

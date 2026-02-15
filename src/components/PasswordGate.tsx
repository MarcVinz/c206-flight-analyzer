import { useState, useEffect } from 'react'
import { Lock, Plane } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Simple hash function for client-side password verification
// Note: This is NOT cryptographically secure, just basic access control
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// Password hash - change the password by updating this hash
// Current password: "bushpilot"
const PASSWORD_HASH = simpleHash('bushpilot')
const STORAGE_KEY = 'c206-auth'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const storedAuth = localStorage.getItem(STORAGE_KEY)
    if (storedAuth === PASSWORD_HASH) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const inputHash = simpleHash(password)

    if (inputHash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEY, PASSWORD_HASH)
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Plane className="h-12 w-12 text-primary animate-pulse" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="aviation-card p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Africa Bushpilot"
            className="w-[9.75rem] h-[9.75rem] rounded-full mb-4"
          />
          <h1 className="text-xl font-bold">Flight Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Africa Bushpilot Adventures</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                className={`pl-10 ${error ? 'border-aviation-red' : ''}`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-aviation-red mt-2">
                Incorrect password
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Access Application
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Contact administrator for access
        </p>
      </div>
    </div>
  )
}

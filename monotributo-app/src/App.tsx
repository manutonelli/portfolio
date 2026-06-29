import { useEffect, useState } from 'react'
import { LayoutDashboard, TrendingUp, Calendar, Settings } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Setup } from './pages/Setup'
import { Dashboard } from './pages/Dashboard'
import { Ingresos } from './pages/Ingresos'
import { Pagos } from './pages/Pagos'
import { Config } from './pages/Config'
import { supabase } from './lib/supabase'
import type { UserProfile } from './lib/types'
import './index.css'

type Tab = 'dashboard' | 'ingresos' | 'pagos' | 'config'

const TABS = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ingresos',  label: 'Ingresos', icon: TrendingUp },
  { id: 'pagos',     label: 'Pagos', icon: Calendar },
  { id: 'config',    label: 'Config', icon: Settings },
] as const

function AppInner() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')

  const fetchProfile = async () => {
    if (!user) { setProfileLoading(false); return }
    const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single()
    setProfile(data)
    setProfileLoading(false)
  }

  useEffect(() => { fetchProfile() }, [user])

  if (loading || profileLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Login />
  if (!profile) return <Setup onComplete={fetchProfile} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-white border-b border-gray-200 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <h1 className="font-bold text-gray-900">Monotributo</h1>
          <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Cat. {profile.categoria}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24">
        {tab === 'dashboard' && (
          <Dashboard profile={profile} onTabChange={t => setTab(t as Tab)} />
        )}
        {tab === 'ingresos' && <Ingresos />}
        {tab === 'pagos' && <Pagos profile={profile} />}
        {tab === 'config' && <Config profile={profile} onUpdate={fetchProfile} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200">
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                tab === id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

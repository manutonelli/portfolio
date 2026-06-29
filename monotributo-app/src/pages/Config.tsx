import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIAS, formatCurrency } from '../lib/categorias'
import type { UserProfile } from '../lib/types'

interface Props {
  profile: UserProfile
  onUpdate: () => void
}

export function Config({ profile, onUpdate }: Props) {
  const { user, signOut } = useAuth()
  const [categoria, setCategoria] = useState(profile.categoria)
  const [fechaInicio, setFechaInicio] = useState(profile.fecha_inicio)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error } = await supabase.from('user_profiles').update({
      categoria, fecha_inicio: fechaInicio, updated_at: new Date().toISOString()
    }).eq('user_id', user!.id)

    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); onUpdate() }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Configuración</h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-xs text-gray-500 mb-1">Cuenta</p>
        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categoría actual
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.letra}
                type="button"
                onClick={() => setCategoria(cat.letra)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  categoria === cat.letra
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-semibold text-sm ${categoria === cat.letra ? 'text-blue-600' : 'text-gray-700'}`}>
                  Categoría {cat.letra}
                </p>
                <p className="text-xs text-gray-500">{formatCurrency(cat.ingresoMaxAnual)}/año</p>
                <p className="text-xs text-gray-400">{formatCurrency(cat.cuotaMensual)}/mes</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio en monotributo
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full font-medium py-2.5 rounded-xl transition-colors text-sm ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white'
          }`}
        >
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </form>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-xl transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

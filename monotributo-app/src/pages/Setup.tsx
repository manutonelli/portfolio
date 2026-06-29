import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIAS, formatCurrency } from '../lib/categorias'

interface Props {
  onComplete: () => void
}

export function Setup({ onComplete }: Props) {
  const { user } = useAuth()
  const [categoria, setCategoria] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoria || !fechaInicio) return
    setLoading(true)
    setError('')

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user!.id,
      categoria,
      fecha_inicio: fechaInicio,
      updated_at: new Date().toISOString(),
    })

    if (error) setError(error.message)
    else onComplete()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurá tu perfil</h1>
          <p className="text-gray-500 mt-1 text-sm">Solo la primera vez. Esto se puede editar después.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿En qué categoría estás?
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
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${categoria === cat.letra ? 'text-blue-600' : 'text-gray-700'}`}>
                      Categoría {cat.letra}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(cat.ingresoMaxAnual)}/año</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Desde cuándo sos monotributista?
            </label>
            <input
              type="date"
              required
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
            disabled={loading || !categoria || !fechaInicio}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Guardando...' : 'Comenzar'}
          </button>
        </form>
      </div>
    </div>
  )
}

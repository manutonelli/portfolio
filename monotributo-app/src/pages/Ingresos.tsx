import { useEffect, useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/categorias'
import type { IngresoMensual } from '../lib/types'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function Ingresos() {
  const { user } = useAuth()
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const [anio, setAnio] = useState(anioActual)
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [editingMes, setEditingMes] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchIngresos = async () => {
    const { data } = await supabase
      .from('ingresos_mensuales')
      .select('*')
      .eq('user_id', user!.id)
      .eq('anio', anio)
    setIngresos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchIngresos() }, [anio, user])

  const getIngreso = (mes: number) => ingresos.find(i => i.mes === mes)

  const handleSave = async (mes: number) => {
    const monto = parseFloat(editValue.replace(/[^0-9.]/g, ''))
    if (isNaN(monto) || monto < 0) { setEditingMes(null); return }

    const existing = getIngreso(mes)
    if (existing) {
      await supabase.from('ingresos_mensuales').update({ monto }).eq('id', existing.id)
    } else {
      await supabase.from('ingresos_mensuales').insert({
        user_id: user!.id, anio, mes, monto
      })
    }
    setEditingMes(null)
    fetchIngresos()
  }

  const handleDelete = async (mes: number) => {
    const existing = getIngreso(mes)
    if (!existing) return
    await supabase.from('ingresos_mensuales').delete().eq('id', existing.id)
    fetchIngresos()
  }

  const total = ingresos.reduce((s, i) => s + i.monto, 0)
  const promedio = ingresos.length > 0 ? total / ingresos.length : 0
  const mesActual = hoy.getMonth() + 1
  const mesesVisibles = anio < anioActual ? 12 : mesActual

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ingresos</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <button onClick={() => setAnio(a => a - 1)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">‹</button>
          <span className="text-sm font-medium text-gray-700 w-10 text-center">{anio}</span>
          <button onClick={() => setAnio(a => Math.min(a + 1, anioActual))} disabled={anio >= anioActual} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg leading-none">›</button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total {anio}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Promedio mensual</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(promedio)}</p>
        </div>
      </div>

      {/* Lista meses */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {Array.from({ length: mesesVisibles }, (_, i) => i + 1).map(mes => {
          const ing = getIngreso(mes)
          const isEditing = editingMes === mes

          return (
            <div key={mes} className="flex items-center px-5 py-3.5 border-b border-gray-100 last:border-0">
              <div className="w-10 text-sm font-medium text-gray-500">{MESES[mes - 1]}</div>

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    type="number"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(mes); if (e.key === 'Escape') setEditingMes(null) }}
                    className="flex-1 border border-blue-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <button onClick={() => handleSave(mes)} className="text-green-600 hover:text-green-700">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingMes(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    {ing ? (
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(ing.monto)}</span>
                    ) : (
                      <span className="text-sm text-gray-300">Sin registrar</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingMes(mes); setEditValue(ing ? String(ing.monto) : '') }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      {ing ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    {ing && (
                      <button onClick={() => handleDelete(mes)} className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-50">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

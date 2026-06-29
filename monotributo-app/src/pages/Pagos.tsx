import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getCategoriaByLetra, formatCurrency } from '../lib/categorias'
import type { UserProfile, PagoMensual } from '../lib/types'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface Props {
  profile: UserProfile
}

export function Pagos({ profile }: Props) {
  const { user } = useAuth()
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const [anio, setAnio] = useState(anioActual)
  const [pagos, setPagos] = useState<PagoMensual[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const categoria = getCategoriaByLetra(profile.categoria)
  const cuota = categoria?.cuotaMensual || 0
  const mesActual = hoy.getMonth() + 1
  const mesesVisibles = anio < anioActual ? 12 : mesActual

  const fetchPagos = async () => {
    const { data } = await supabase
      .from('pagos_mensuales')
      .select('*')
      .eq('user_id', user!.id)
      .eq('anio', anio)
    setPagos(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPagos() }, [anio, user])

  const getPago = (mes: number) => pagos.find(p => p.mes === mes)

  const togglePago = async (mes: number) => {
    setToggling(mes)
    const existing = getPago(mes)
    if (existing) {
      if (existing.pagado) {
        await supabase.from('pagos_mensuales').update({ pagado: false, fecha_pago: null }).eq('id', existing.id)
      } else {
        await supabase.from('pagos_mensuales').update({ pagado: true, fecha_pago: hoy.toISOString() }).eq('id', existing.id)
      }
    } else {
      await supabase.from('pagos_mensuales').insert({
        user_id: user!.id, anio, mes, pagado: true,
        fecha_pago: hoy.toISOString(),
        monto: cuota,
      })
    }
    await fetchPagos()
    setToggling(null)
  }

  const totalPagado = pagos.filter(p => p.pagado).reduce((s, p) => s + p.monto, 0)
  const pendientes = Array.from({ length: mesesVisibles }, (_, i) => i + 1).filter(m => !getPago(m)?.pagado).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
          <button onClick={() => setAnio(a => a - 1)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">‹</button>
          <span className="text-sm font-medium text-gray-700 w-10 text-center">{anio}</span>
          <button onClick={() => setAnio(a => Math.min(a + 1, anioActual))} disabled={anio >= anioActual} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg leading-none">›</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{pagos.filter(p => p.pagado).length}</p>
          <p className="text-xs text-green-600 mt-0.5">Pagados</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendientes}</p>
          <p className="text-xs text-amber-600 mt-0.5">Pendientes</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-lg font-bold text-blue-600">{formatCurrency(totalPagado)}</p>
          <p className="text-xs text-blue-600 mt-0.5">Total</p>
        </div>
      </div>

      {/* Cuota info */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">Cuota categoría {profile.categoria}</span>
        <span className="font-semibold text-gray-900">{formatCurrency(cuota)}/mes</span>
      </div>

      {/* Lista */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {Array.from({ length: mesesVisibles }, (_, i) => i + 1).map(mes => {
          const pago = getPago(mes)
          const vencimiento = new Date(anio, mes - 1, 20)
          const vencido = hoy > vencimiento && !pago?.pagado
          const isToggling = toggling === mes

          return (
            <div key={mes} className="flex items-center px-5 py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{MESES[mes - 1]}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vence: {vencimiento.toLocaleDateString('es-AR')}
                  {pago?.fecha_pago && (
                    <span className="text-green-500"> · Pagado: {new Date(pago.fecha_pago).toLocaleDateString('es-AR')}</span>
                  )}
                </p>
                {vencido && (
                  <p className="text-xs text-red-500 mt-0.5">¡Vencido!</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{formatCurrency(cuota)}</span>
                <button
                  onClick={() => togglePago(mes)}
                  disabled={isToggling}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    pago?.pagado
                      ? 'bg-green-100 hover:bg-red-100 text-green-600 hover:text-red-500'
                      : vencido
                        ? 'bg-red-50 hover:bg-green-100 text-red-400 hover:text-green-600 border border-red-200'
                        : 'bg-gray-100 hover:bg-green-100 text-gray-400 hover:text-green-600'
                  }`}
                >
                  {isToggling ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : pago?.pagado ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, Calendar, DollarSign, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getCategoriaByLetra, getCategoriaByIngreso, formatCurrency, getProximoVencimiento, CATEGORIAS } from '../lib/categorias'
import type { UserProfile, IngresoMensual, PagoMensual } from '../lib/types'

interface Props {
  profile: UserProfile
  onTabChange: (tab: string) => void
}

export function Dashboard({ profile, onTabChange }: Props) {
  const { user } = useAuth()
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([])
  const [pagos, setPagos] = useState<PagoMensual[]>([])
  const [loading, setLoading] = useState(true)

  const hoy = new Date()
  const anioActual = hoy.getFullYear()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: ing }, { data: pag }] = await Promise.all([
        supabase.from('ingresos_mensuales').select('*').eq('user_id', user!.id).eq('anio', anioActual),
        supabase.from('pagos_mensuales').select('*').eq('user_id', user!.id).eq('anio', anioActual),
      ])
      setIngresos(ing || [])
      setPagos(pag || [])
      setLoading(false)
    }
    fetchData()
  }, [user, anioActual])

  const categoria = getCategoriaByLetra(profile.categoria)
  const ingresoTotalAnual = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const porcentajeUsado = categoria ? (ingresoTotalAnual / categoria.ingresoMaxAnual) * 100 : 0
  const categoriaRecomendada = getCategoriaByIngreso(ingresoTotalAnual)
  const debeRecategorizarse = categoriaRecomendada && categoriaRecomendada.letra !== profile.categoria

  const proximoVencimiento = getProximoVencimiento()
  const diasParaVencimiento = Math.ceil((proximoVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  const mesActual = hoy.getMonth() + 1
  const pagoMesActual = pagos.find(p => p.mes === mesActual)
  const pagosPendientes = Array.from({ length: mesActual }, (_, i) => i + 1)
    .filter(mes => !pagos.find(p => p.mes === mes && p.pagado))

  const indiceActual = CATEGORIAS.findIndex(c => c.letra === profile.categoria)
  const categoriaSiguiente = indiceActual < CATEGORIAS.length - 1 ? CATEGORIAS[indiceActual + 1] : null
  const categoriaAnterior = indiceActual > 0 ? CATEGORIAS[indiceActual - 1] : null

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {debeRecategorizarse && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 text-sm">Recategorizate</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Tus ingresos anuales ({formatCurrency(ingresoTotalAnual)}) corresponden a la categoría <strong>{categoriaRecomendada!.letra}</strong>.
            </p>
          </div>
        </div>
      )}

      {porcentajeUsado >= 80 && !debeRecategorizarse && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-orange-800 text-sm">Atención: cerca del límite</p>
            <p className="text-orange-700 text-xs mt-0.5">
              Usaste el {porcentajeUsado.toFixed(0)}% del tope anual de tu categoría.
            </p>
          </div>
        </div>
      )}

      {/* Categoría actual */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Tu categoría</h2>
          <button onClick={() => onTabChange('config')} className="text-blue-600 text-sm flex items-center gap-1">
            Cambiar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white text-3xl font-bold">{profile.categoria}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Categoría {profile.categoria}</p>
            <p className="font-semibold text-gray-900">{categoria ? formatCurrency(categoria.ingresoMaxAnual) : '—'}/año</p>
            <p className="text-sm text-gray-500">Cuota: {categoria ? formatCurrency(categoria.cuotaMensual) : '—'}/mes</p>
          </div>
        </div>
      </div>

      {/* Ingresos anuales */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Ingresos {anioActual}</h2>
          </div>
          <button onClick={() => onTabChange('ingresos')} className="text-blue-600 text-sm flex items-center gap-1">
            Ver <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(ingresoTotalAnual)}</p>
        {categoria && (
          <>
            <div className="mt-3 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${porcentajeUsado >= 90 ? 'bg-red-500' : porcentajeUsado >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-500">{porcentajeUsado.toFixed(1)}% del tope</p>
              <p className="text-xs text-gray-500">Tope: {formatCurrency(categoria.ingresoMaxAnual)}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
              {categoriaAnterior && (
                <div>
                  <p className="text-gray-400">Baja a {categoriaAnterior.letra} si facturás menos de</p>
                  <p className="font-medium">{formatCurrency(categoriaAnterior.ingresoMaxAnual)}/año</p>
                </div>
              )}
              {categoriaSiguiente && (
                <div className={categoriaAnterior ? 'text-right' : ''}>
                  <p className="text-gray-400">Sube a {categoriaSiguiente.letra} si facturás más de</p>
                  <p className="font-medium">{formatCurrency(categoria.ingresoMaxAnual)}/año</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Próximo pago */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Próximo vencimiento</h2>
          </div>
          <button onClick={() => onTabChange('pagos')} className="text-blue-600 text-sm flex items-center gap-1">
            Ver pagos <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {proximoVencimiento.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
            </p>
            <p className={`text-sm mt-0.5 ${diasParaVencimiento <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
              {diasParaVencimiento === 0 ? '¡Hoy vence!' : `En ${diasParaVencimiento} días`}
            </p>
          </div>
          {pagoMesActual?.pagado ? (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">✓ Pagado</span>
          ) : (
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">Pendiente</span>
          )}
        </div>
        {pagosPendientes.length > 1 && (
          <p className="text-xs text-red-500 mt-3">
            Tenés {pagosPendientes.length} pagos pendientes en {anioActual}
          </p>
        )}
      </div>

      {/* Resumen pagos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Pagos {anioActual}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {pagos.filter(p => p.pagado).length}
            </p>
            <p className="text-xs text-green-600 mt-0.5">Pagados</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{pagosPendientes.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">Pendientes</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(pagos.filter(p => p.pagado).reduce((s, p) => s + p.monto, 0))}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Total pagado</p>
          </div>
        </div>
      </div>
    </div>
  )
}

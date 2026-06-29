export interface UserProfile {
  id: string
  user_id: string
  categoria: string
  fecha_inicio: string
  created_at: string
  updated_at: string
}

export interface IngresoMensual {
  id: string
  user_id: string
  anio: number
  mes: number
  monto: number
  created_at: string
}

export interface PagoMensual {
  id: string
  user_id: string
  anio: number
  mes: number
  pagado: boolean
  fecha_pago: string | null
  monto: number
  created_at: string
}

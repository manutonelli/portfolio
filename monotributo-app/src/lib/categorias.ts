// Valores de monotributo actualizados a 2025 (en ARS)
// Fuente: RG AFIP - Escala vigente julio 2025

export interface Categoria {
  letra: string
  ingresoMaxAnual: number
  cuotaMensual: number
  descripcion: string
}

export const CATEGORIAS: Categoria[] = [
  { letra: 'A', ingresoMaxAnual: 7_858_000,    cuotaMensual: 9_320,   descripcion: 'Hasta $7.858.000/año' },
  { letra: 'B', ingresoMaxAnual: 11_611_000,   cuotaMensual: 10_880,  descripcion: 'Hasta $11.611.000/año' },
  { letra: 'C', ingresoMaxAnual: 16_271_000,   cuotaMensual: 12_760,  descripcion: 'Hasta $16.271.000/año' },
  { letra: 'D', ingresoMaxAnual: 20_146_000,   cuotaMensual: 16_600,  descripcion: 'Hasta $20.146.000/año' },
  { letra: 'E', ingresoMaxAnual: 24_134_000,   cuotaMensual: 22_400,  descripcion: 'Hasta $24.134.000/año' },
  { letra: 'F', ingresoMaxAnual: 28_881_000,   cuotaMensual: 27_970,  descripcion: 'Hasta $28.881.000/año' },
  { letra: 'G', ingresoMaxAnual: 33_750_000,   cuotaMensual: 34_560,  descripcion: 'Hasta $33.750.000/año' },
  { letra: 'H', ingresoMaxAnual: 50_724_000,   cuotaMensual: 62_410,  descripcion: 'Hasta $50.724.000/año' },
  { letra: 'I', ingresoMaxAnual: 59_509_000,   cuotaMensual: 87_360,  descripcion: 'Hasta $59.509.000/año' },
  { letra: 'J', ingresoMaxAnual: 69_014_000,   cuotaMensual: 113_090, descripcion: 'Hasta $69.014.000/año' },
  { letra: 'K', ingresoMaxAnual: 81_295_000,   cuotaMensual: 136_800, descripcion: 'Hasta $81.295.000/año' },
]

export function getCategoriaByLetra(letra: string): Categoria | undefined {
  return CATEGORIAS.find(c => c.letra === letra)
}

export function getCategoriaByIngreso(ingresoAnual: number): Categoria | undefined {
  return CATEGORIAS.find(c => ingresoAnual <= c.ingresoMaxAnual)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

export function getProximoVencimiento(): Date {
  const hoy = new Date()
  // El vencimiento del monotributo es el día 20 de cada mes
  let vencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 20)
  if (hoy > vencimiento) {
    vencimiento = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 20)
  }
  return vencimiento
}

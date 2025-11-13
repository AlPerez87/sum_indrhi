// Unidades de medida - Se cargarán dinámicamente desde la base de datos
// Solo se mantiene una unidad por defecto
export const UNIDADES_DEFAULT = [
  { value: 'UNIDAD', label: 'Unidad' }
]

export const formatUnidadLabel = (value) => {
  if (!value) return '-'
  // Convertir de mayúsculas a formato título
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export const getUnidadLabel = (value) => {
  return formatUnidadLabel(value)
}


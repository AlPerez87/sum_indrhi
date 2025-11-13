import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

/**
 * Componente de Select con capacidad de búsqueda/filtrado
 * @param {Object} props
 * @param {Array} props.options - Array de opciones [{value, label}]
 * @param {string} props.value - Valor seleccionado actualmente
 * @param {Function} props.onChange - Función callback cuando cambia la selección
 * @param {string} props.placeholder - Texto placeholder
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.disabled - Si el select está deshabilitado
 * @param {string} props.emptyMessage - Mensaje cuando no hay opciones
 * @param {string} props.searchPlaceholder - Placeholder del campo de búsqueda
 */
const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Seleccionar...',
  className = '',
  disabled = false,
  emptyMessage = 'No hay opciones disponibles',
  searchPlaceholder = 'Buscar...'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)
  
  // Debug: Mostrar opciones recibidas y validar
  useEffect(() => {
    if (options && options.length > 0) {
      console.log('SearchableSelect - Opciones recibidas:', options.length, 'Primer opción:', options[0])
      
      // Verificar si hay opciones con valores undefined
      const opcionesInvalidas = options.filter(opt => opt.value === undefined || opt.value === null)
      if (opcionesInvalidas.length > 0) {
        console.error('❌ SearchableSelect - Opciones con valor undefined/null:', opcionesInvalidas.length)
        console.error('❌ Ejemplos:', opcionesInvalidas.slice(0, 3))
      }
    }
  }, [options])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus en el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtener la opción seleccionada (comparación flexible para strings y números)
  const selectedOption = options.find(opt => String(opt.value) === String(value))
  
  // Debug: Mostrar valor actual
  useEffect(() => {
    console.log('SearchableSelect - Valor actual (value prop):', value)
    console.log('SearchableSelect - Opción seleccionada:', selectedOption)
  }, [value, selectedOption])

  const handleSelect = (optionValue) => {
    console.log('SearchableSelect - Seleccionando valor:', optionValue)
    if (onChange) {
      onChange(optionValue)
    }
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (onChange) {
      onChange('')
    }
    setSearchTerm('')
  }

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (isOpen) {
        setSearchTerm('')
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Campo de selección */}
      <div
        onClick={toggleOpen}
        className={`
          input-field cursor-pointer flex items-center justify-between gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
          ${className}
        `}
      >
        <span className={`flex-1 truncate ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Limpiar selección"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 flex flex-col">
          {/* Campo de búsqueda */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="overflow-y-auto custom-scrollbar max-h-60">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No se encontraron resultados' : emptyMessage}
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={option.value || `option-${index}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSelect(option.value)
                    }}
                    className={`
                      px-3 py-2 cursor-pointer text-sm transition-colors
                      ${String(option.value) === String(value)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect


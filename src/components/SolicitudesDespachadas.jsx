import { useState, useEffect } from 'react'
import { Search, Eye, X, Package, Truck, Printer } from 'lucide-react'
import { crmService } from '../services/crmService'
import Pagination from './Pagination'
import { usePagination } from '../hooks/usePagination'
import jsPDF from 'jspdf'

const SolicitudesDespachadas = () => {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState(null)

  // Cargar solicitudes
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await crmService.getSolicitudesDespachadas()

      if (result.success) {
        setSolicitudes(result.data.filter(s => s.id && s.id > 0))
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Ver detalles
  const handleVerDetalles = async (solicitud) => {
    const result = await crmService.getSolicitudDespachadaDetalle(solicitud.id)
    if (result.success) {
      setSelectedSolicitud(result.data)
      setShowDetailModal(true)
    }
  }

  // Generar PDF de la solicitud despachada
  const handleImprimirPDF = async (solicitud) => {
    try {
      // Obtener detalles completos de la solicitud
      const result = await crmService.getSolicitudDespachadaDetalle(solicitud.id)
      if (!result.success) {
        console.error('Error al obtener detalles:', result.message)
        return
      }

      const solicitudData = result.data
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)

      // Cargar y agregar logo (tamaño incrementado)
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.src = '/logo-indrhi.png'
      
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 2000) // Timeout de 2 segundos
        logoImg.onload = () => {
          clearTimeout(timeout)
          try {
            const logoWidth = 75 // Incrementado de 60 a 75
            const logoHeight = (logoImg.height * logoWidth) / logoImg.width
            const logoX = (pageWidth - logoWidth) / 2
            pdf.addImage(logoImg, 'PNG', logoX, margin, logoWidth, logoHeight)
          } catch (e) {
            console.warn('Error al agregar logo al PDF:', e)
          }
          resolve()
        }
        logoImg.onerror = () => {
          clearTimeout(timeout)
          resolve() // Continuar aunque falle la carga del logo
        }
      })

      let yPos = margin + 40

      // Título del documento
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('SOLICITUD DESPACHADA', pageWidth / 2, yPos, { align: 'center' })
      yPos += 12

      // Minitabla con información de la solicitud
      const fechaFormateada = new Date(solicitudData.fecha).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const departamento = solicitudData.departamento || 'N/A'
      const numeroSolicitud = solicitudData.numero_solicitud || 'N/A'

      const tableStartY = yPos
      const headerHeight = 7
      const tableWidth = contentWidth
      const col1Width = tableWidth / 3
      const col2Width = tableWidth / 3
      const col3Width = tableWidth / 3

      // Calcular altura de datos según el contenido más largo
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      const fechaLines = pdf.splitTextToSize(fechaFormateada, col1Width - 4)
      const solicitudLines = pdf.splitTextToSize(numeroSolicitud, col2Width - 4)
      const deptLines = pdf.splitTextToSize(departamento, col3Width - 4)
      const maxDataLines = Math.max(fechaLines.length, solicitudLines.length, deptLines.length)
      const dataRowHeight = Math.max(8, maxDataLines * 4 + 2)
      const totalTableHeight = headerHeight + dataRowHeight

      // Dibujar bordes de la tabla
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.5)
      
      // Rectángulo exterior
      pdf.rect(margin, tableStartY, tableWidth, totalTableHeight)
      
      // Línea horizontal entre encabezado y datos
      pdf.line(margin, tableStartY + headerHeight, margin + tableWidth, tableStartY + headerHeight)
      
      // Líneas verticales divisorias
      pdf.line(margin + col1Width, tableStartY, margin + col1Width, tableStartY + totalTableHeight)
      pdf.line(margin + col1Width + col2Width, tableStartY, margin + col1Width + col2Width, tableStartY + totalTableHeight)

      // Fondo del encabezado
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, tableStartY, tableWidth, headerHeight, 'F')

      // Texto del encabezado
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text('Fecha', margin + col1Width / 2, tableStartY + 5, { align: 'center' })
      pdf.text('Nº Solicitud', margin + col1Width + col2Width / 2, tableStartY + 5, { align: 'center' })
      pdf.text('Departamento', margin + col1Width + col2Width + col3Width / 2, tableStartY + 5, { align: 'center' })

      // Datos
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      const dataY = tableStartY + headerHeight + dataRowHeight / 2
      pdf.text(fechaLines, margin + col1Width / 2, dataY, { align: 'center' })
      pdf.text(solicitudLines, margin + col1Width + col2Width / 2, dataY, { align: 'center' })
      pdf.text(deptLines, margin + col1Width + col2Width + col3Width / 2, dataY, { align: 'center' })

      yPos = tableStartY + totalTableHeight + 10

      // Tabla de artículos
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Artículos Despachados', margin, yPos)
      yPos += 8

      const articulos = solicitudData.articulos || []
      const colArtWidth = contentWidth * 0.75
      const colCantWidth = contentWidth * 0.25

      // Encabezados de la tabla con bordes
      pdf.setFillColor(240, 240, 240)
      const headerHeight = 8
      pdf.rect(margin, yPos - 5, colArtWidth, headerHeight, 'F')
      pdf.rect(margin + colArtWidth, yPos - 5, colCantWidth, headerHeight, 'F')
      
      // Bordes del encabezado
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.5)
      pdf.rect(margin, yPos - 5, colArtWidth, headerHeight)
      pdf.rect(margin + colArtWidth, yPos - 5, colCantWidth, headerHeight)
      pdf.line(margin + colArtWidth, yPos - 5, margin + colArtWidth, yPos - 5 + headerHeight)
      
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('Artículo', margin + colArtWidth / 2, yPos, { align: 'center' })
      pdf.text('Cantidad', margin + colArtWidth + colCantWidth / 2, yPos, { align: 'center' })
      yPos += headerHeight

      // Datos de los artículos con bordes
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      articulos.forEach((articulo, index) => {
        // Verificar si necesitamos una nueva página
        if (yPos > pageHeight - 60) {
          pdf.addPage()
          yPos = margin + 10
        }

        const nombreArticulo = articulo.articulo || articulo.nombre || articulo.codigo || 'N/A'
        const cantidad = articulo.cantidad || 0

        // Calcular altura de la fila según el texto
        const articuloLines = pdf.splitTextToSize(nombreArticulo, colArtWidth - 4)
        const rowHeight = Math.max(8, articuloLines.length * 4 + 2)

        // Dibujar bordes de la fila
        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.3)
        pdf.rect(margin, yPos - rowHeight / 2, colArtWidth, rowHeight)
        pdf.rect(margin + colArtWidth, yPos - rowHeight / 2, colCantWidth, rowHeight)
        pdf.line(margin + colArtWidth, yPos - rowHeight / 2, margin + colArtWidth, yPos - rowHeight / 2 + rowHeight)

        // Texto del artículo
        pdf.text(articuloLines, margin + 2, yPos)

        // Cantidad (centrada)
        pdf.text(cantidad.toString(), margin + colArtWidth + colCantWidth / 2, yPos, { align: 'center' })

        yPos += rowHeight
      })

      // Espacio para firma al final (centralizado)
      yPos = pageHeight - 40
      
      // Línea horizontal centralizada
      const lineWidth = 60
      const lineX = (pageWidth - lineWidth) / 2
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.5)
      pdf.line(lineX, yPos, lineX + lineWidth, yPos)
      yPos += 8

      // Nombre del departamento centralizado
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text(departamento, pageWidth / 2, yPos, { align: 'center' })

      // Abrir PDF en nueva pestaña
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank')
      
      // Limpiar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    }
  }

  // Filtrar solicitudes
  const filteredSolicitudes = solicitudes.filter(solicitud =>
    Object.values(solicitud).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Paginación
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredSolicitudes)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Solicitudes Despachadas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {filteredSolicitudes.length} {filteredSolicitudes.length === 1 ? 'solicitud' : 'solicitudes'}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar solicitudes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filteredSolicitudes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredSolicitudes.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="top"
          />
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nº Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Despachado Por
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Artículos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSolicitudes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No se encontraron solicitudes' : 'No hay solicitudes despachadas'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((solicitud) => (
                  <tr
                    key={solicitud.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {solicitud.numero_solicitud}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(solicitud.fecha).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {solicitud.departamento}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {solicitud.despachado_por || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {solicitud.total_articulos}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerDetalles(solicitud)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleImprimirPDF(solicitud)}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Imprimir PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Inferior */}
        {filteredSolicitudes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredSolicitudes.length}
            onItemsPerPageChange={handleItemsPerPageChange}
            position="bottom"
          />
        )}
      </div>

      {/* Modal Ver Detalles */}
      {showDetailModal && selectedSolicitud && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalles de Solicitud Despachada
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUMNA IZQUIERDA: Información General */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nº Solicitud</label>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {selectedSolicitud.numero_solicitud}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {new Date(selectedSolicitud.fecha).toLocaleDateString('es-DO')}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Departamento</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {selectedSolicitud.departamento}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Despachado Por</label>
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                        {selectedSolicitud.despachado_por || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Artículos Despachados */}
                <div className="lg:col-span-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Artículos Despachados ({selectedSolicitud.articulos.length})
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                              Artículo
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300">
                              Cantidad
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedSolicitud.articulos && selectedSolicitud.articulos.map((art, index) => (
                            <tr key={`art-detalle-${art.articulo}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {art.articulo}
                              </td>
                              <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                                {art.cantidad}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SolicitudesDespachadas


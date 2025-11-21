import { db } from '../lib/databaseAdapter'
import { getCurrentYear, getTodayISO } from '../utils/dateUtils'

// Función auxiliar para obtener el usuario actual
const getCurrentUserId = () => {
  const userStr = localStorage.getItem('indrhi_user')
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return user.id
  } catch {
    return null
  }
}

// Función auxiliar para calcular total_articulos desde articulos_cantidades
const calcularTotalArticulos = (articulosCantidades) => {
  if (!articulosCantidades) return 0
  try {
    const articulos = typeof articulosCantidades === 'string' 
      ? JSON.parse(articulosCantidades) 
      : articulosCantidades
    return Array.isArray(articulos) ? articulos.length : 0
  } catch {
    return 0
  }
}

export const crmService = {
  // ========== ARTÍCULOS ==========
  getUnidades: async () => {
    try {
      // Las unidades son constantes según el sistema (formato para selectores)
      const unidades = [
        { value: 'UNIDAD', label: 'Unidad' },
        { value: 'RESMA', label: 'Resma' },
        { value: 'BLOCKS O TALONARIO', label: 'Blocks o Talonario' },
        { value: 'PAQUETE', label: 'Paquete' },
        { value: 'GALON', label: 'Galón' },
        { value: 'YARDA', label: 'Yarda' },
        { value: 'LIBRA', label: 'Libra' },
        { value: 'CAJA', label: 'Caja' }
      ]
      
      return {
        success: true,
        data: unidades
      }
    } catch (error) {
      console.error('Error al obtener unidades:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener unidades',
        data: []
      }
    }
  },

  getArticulos: async (page = 1, limit = 10, search = '') => {
    try {
      // MySQL: usar databaseAdapter
      let conditions = {}
      let orderBy = 'id ASC'
      
      // Construir condiciones de búsqueda para MySQL
      if (search) {
        // MySQL usa LIKE en lugar de ilike
        const searchPattern = `%${search}%`
        // Necesitamos usar una query SQL personalizada para OR
        const sql = `
          SELECT * FROM sum_articulos 
          WHERE codigo LIKE ? OR descripcion LIKE ?
          ORDER BY id ASC
          LIMIT ? OFFSET ?
        `
        const offset = (page - 1) * limit
        const data = await db.query(sql, [searchPattern, searchPattern, limit, offset])
        
        // Contar total
        const countSql = `SELECT COUNT(*) as total FROM sum_articulos WHERE codigo LIKE ? OR descripcion LIKE ?`
        const countResult = await db.query(countSql, [searchPattern, searchPattern])
        const total = countResult[0]?.total || 0
        
        return {
          success: true,
          data: data || [],
          total: total
        }
      } else {
        // Sin búsqueda
        const sql = `SELECT * FROM sum_articulos ORDER BY id ASC LIMIT ? OFFSET ?`
        const offset = (page - 1) * limit
        const data = await db.query(sql, [limit, offset])
        
        // Contar total
        const countResult = await db.query('SELECT COUNT(*) as total FROM sum_articulos')
        const total = countResult[0]?.total || 0
        
        return {
          success: true,
          data: data || [],
          total: total
        }
      }
    } catch (error) {
      console.error('Error al obtener artículos:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener artículos',
        data: []
      }
    }
  },

  createArticulo: async (articulo) => {
    try {
        // MySQL: usar databaseAdapter
        const data = await db.insert('sum_articulos', articulo)
        return {
          success: true,
          message: 'Artículo creado correctamente',
          data
        }
    } catch (error) {
      console.error('Error al crear artículo:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Ya existe un artículo con este código'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al crear artículo'
      }
    }
  },

  updateArticulo: async (id, articulo) => {
    try {
      // Validar que la unidad sea válida
      const unidadesValidas = ['UNIDAD', 'RESMA', 'BLOCKS O TALONARIO', 'PAQUETE', 'GALON', 'YARDA', 'LIBRA', 'CAJA']
      if (articulo.unidad && !unidadesValidas.includes(articulo.unidad)) {
        return {
          success: false,
          message: `La unidad "${articulo.unidad}" no es válida. Unidades permitidas: ${unidadesValidas.join(', ')}`
        }
      }

        // MySQL: usar databaseAdapter
        const data = await db.update('sum_articulos', id, articulo)
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_articulos WHERE id = ?', [id])
        return {
          success: true,
          message: 'Artículo actualizado correctamente',
          data: updated[0] || data
        }
    } catch (error) {
      console.error('Error al actualizar artículo:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Ya existe un artículo con este código'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al actualizar artículo'
      }
    }
  },

  deleteArticulo: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        await db.remove('sum_articulos', id)
        return {
          success: true,
          message: 'Artículo eliminado correctamente'
        }
    } catch (error) {
      console.error('Error al eliminar artículo:', error)
      return {
        success: false,
        message: error.message || 'Error al eliminar artículo'
      }
    }
  },

  // ========== DEPARTAMENTOS ==========
  getDepartamentos: async (page = 1, limit = 10, search = '') => {
    try {
        // MySQL: usar databaseAdapter
        if (search) {
          const searchPattern = `%${search}%`
          const sql = `
            SELECT * FROM sum_departamentos 
            WHERE codigo LIKE ? OR departamento LIKE ?
            ORDER BY id ASC
            LIMIT ? OFFSET ?
          `
          const offset = (page - 1) * limit
          const data = await db.query(sql, [searchPattern, searchPattern, limit, offset])
          
          const countSql = `SELECT COUNT(*) as total FROM sum_departamentos WHERE codigo LIKE ? OR departamento LIKE ?`
          const countResult = await db.query(countSql, [searchPattern, searchPattern])
          const total = countResult[0]?.total || 0
          
          return {
            success: true,
            data: data || [],
            total: total
          }
        } else {
          const sql = `SELECT * FROM sum_departamentos ORDER BY id ASC LIMIT ? OFFSET ?`
          const offset = (page - 1) * limit
          const data = await db.query(sql, [limit, offset])
          
          const countResult = await db.query('SELECT COUNT(*) as total FROM sum_departamentos')
          const total = countResult[0]?.total || 0
          
          return {
            success: true,
            data: data || [],
            total: total
          }
        }
    } catch (error) {
      console.error('Error al obtener departamentos:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener departamentos',
        data: []
      }
    }
  },

  createDepartamento: async (departamento) => {
    try {
        // MySQL: usar databaseAdapter
        const data = await db.insert('sum_departamentos', departamento)
        return {
          success: true,
          message: 'Departamento creado correctamente',
          data
        }
    } catch (error) {
      console.error('Error al crear departamento:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Ya existe un departamento con este código'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al crear departamento'
      }
    }
  },

  updateDepartamento: async (id, departamento) => {
    try {
        // MySQL: usar databaseAdapter
        await db.update('sum_departamentos', id, departamento)
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_departamentos WHERE id = ?', [id])
        return {
          success: true,
          message: 'Departamento actualizado correctamente',
          data: updated[0]
        }
    } catch (error) {
      console.error('Error al actualizar departamento:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Ya existe un departamento con este código'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al actualizar departamento'
      }
    }
  },

  deleteDepartamento: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        await db.remove('sum_departamentos', id)
        return {
          success: true,
          message: 'Departamento eliminado correctamente'
        }
    } catch (error) {
      console.error('Error al eliminar departamento:', error)
      // Manejar errores de foreign key constraint en MySQL
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        return {
          success: false,
          message: 'No se puede eliminar el departamento porque tiene registros relacionados'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al eliminar departamento'
      }
    }
  },

  // ========== USUARIOS ==========
  getUsuariosDepartamentos: async () => {
    try {
        // MySQL: usar JOINs explícitos
        const sql = `
          SELECT 
            sud.*,
            sd.id as dept_id,
            sd.codigo as dept_codigo,
            sd.departamento as dept_nombre,
            sr.id as rol_id_table,
            sr.nombre as rol_nombre,
            sr.descripcion as rol_descripcion
          FROM sum_usuarios_departamentos sud
          LEFT JOIN sum_departamentos sd ON sud.departamento_id = sd.id
          LEFT JOIN sum_roles sr ON sud.rol_id = sr.id
          ORDER BY sud.id ASC
        `
        const data = await db.query(sql)
        
        // Transformar datos para el formato esperado
        const transformedData = (data || []).map(row => ({
          ...row,
          sum_departamentos: row.dept_id ? {
            id: row.dept_id,
            codigo: row.dept_codigo,
            departamento: row.dept_nombre
          } : null,
          sum_roles: row.rol_id_table ? {
            id: row.rol_id_table,
            nombre: row.rol_nombre,
            descripcion: row.rol_descripcion
          } : null
        }))
        
        return {
          success: true,
          data: transformedData,
          total: transformedData.length
        }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener usuarios',
        data: []
      }
    }
  },

  updateUsuarioDepartamento: async (id, departamentoId) => {
    try {
        .from('sum_usuarios_departamentos')
        .update({ departamento_id: departamentoId })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Departamento actualizado correctamente',
        data
      }
    } catch (error) {
      console.error('Error al actualizar departamento:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar departamento'
      }
    }
  },

  updateUsuarioRol: async (id, rolId) => {
    try {
        // MySQL: usar databaseAdapter
        await db.update('sum_usuarios_departamentos', id, { rol_id: rolId })
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_usuarios_departamentos WHERE id = ?', [id])
        return {
          success: true,
          message: 'Rol actualizado correctamente',
          data: updated[0]
        }
    } catch (error) {
      console.error('Error al actualizar rol:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar rol'
      }
    }
  },

  updateUsuarioNombreCompleto: async (id, nombreCompleto) => {
    try {
        // MySQL: usar databaseAdapter
        await db.update('sum_usuarios_departamentos', id, { nombre_completo: nombreCompleto })
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_usuarios_departamentos WHERE id = ?', [id])
        return {
          success: true,
          message: 'Nombre completo actualizado correctamente',
          data: updated[0]
        }
    } catch (error) {
      console.error('Error al actualizar nombre completo:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar nombre completo'
      }
    }
  },

  // ========== ROLES ==========
  getRoles: async () => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_roles WHERE activo = 1 ORDER BY nombre ASC`
        const data = await db.query(sql)
        
        return {
          success: true,
          data: data || [],
          total: (data || []).length
        }
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener roles',
        data: []
      }
    }
  },

  createRol: async (rol) => {
    try {
        .from('sum_roles')
        .insert(rol)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Rol creado correctamente',
        data
      }
    } catch (error) {
      console.error('Error al crear rol:', error)
      return {
        success: false,
        message: error.message || 'Error al crear rol'
      }
    }
  },

  updateRol: async (id, rol) => {
    try {
        // MySQL: usar databaseAdapter
        await db.update('sum_roles', id, rol)
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_roles WHERE id = ?', [id])
        return {
          success: true,
          message: 'Rol actualizado correctamente',
          data: updated[0]
        }
    } catch (error) {
      console.error('Error al actualizar rol:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Ya existe un rol con este nombre'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al actualizar rol'
      }
    }
  },

  deleteRol: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        await db.remove('sum_roles', id)
        return {
          success: true,
          message: 'Rol eliminado correctamente'
        }
    } catch (error) {
      console.error('Error al eliminar rol:', error)
      // Manejar errores de foreign key constraint en MySQL
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        return {
          success: false,
          message: 'No se puede eliminar el rol porque tiene usuarios asignados'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al eliminar rol'
      }
    }
  },


  updateUsuarioPassword: async (id, password) => {
    try {
        // MySQL: usar endpoint /api/auth
        const API_BASE_URL = import.meta.env.DEV
          ? 'http://localhost:3000'
          : (import.meta.env.VITE_API_URL || '')
        
        const response = await fetch(`${API_BASE_URL}/api/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'updatePassword',
            userId: id,
            newPassword: password
          })
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || result.message || 'Error al actualizar contraseña')
        }

        return {
          success: true,
          message: result.message || 'Contraseña actualizada correctamente'
        }
    } catch (error) {
      console.error('Error al actualizar contraseña:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar contraseña'
      }
    }
  },

  // ========== ENTRADA DE MERCANCÍA ==========
  getEntradasMercancia: async () => {
    try {
        .from('sum_entrada_mercancia')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (error) throw error

      // Calcular total_articulos para cada entrada desde articulos_cantidades_unidades
      const entradasConTotal = (data || []).map(entrada => ({
        ...entrada,
        total_articulos: calcularTotalArticulos(entrada.articulos_cantidades_unidades)
      }))

      return {
        success: true,
        data: entradasConTotal,
        total: count || 0
      }
    } catch (error) {
      console.error('Error al obtener entradas:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener entradas',
        data: []
      }
    }
  },

  getEntradaMercanciaDetalle: async (id) => {
    try {
        .from('sum_entrada_mercancia')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Parsear articulos_cantidades_unidades
      if (data.articulos_cantidades_unidades) {
        try {
          let articulosParsed = null
          if (typeof data.articulos_cantidades_unidades === 'string') {
            articulosParsed = JSON.parse(data.articulos_cantidades_unidades)
          } else {
            articulosParsed = data.articulos_cantidades_unidades
          }
          
          // Crear propiedad articulos con el formato esperado por el componente
          data.articulos = articulosParsed.map(art => ({
            codigo: art.codigo || art.articulo || '',
            articulo: art.codigo || art.articulo || '',
            nombre: art.nombre || art.descripcion || art.codigo || art.articulo || '',
            cantidad: art.cantidad || 0,
            unidad: art.unidad || 'UNIDAD'
          }))
        } catch (parseError) {
          console.error('Error al parsear articulos_cantidades_unidades:', parseError)
          data.articulos = []
        }
      } else {
        data.articulos = []
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error al obtener detalle de entrada:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  getSiguienteNumeroEntrada: async () => {
    try {
      const currentYear = getCurrentYear()
      
        // MySQL: usar LIKE para buscar números del año actual
        const sql = `
          SELECT numero_entrada 
          FROM sum_entrada_mercancia 
          WHERE numero_entrada LIKE ?
          ORDER BY id DESC 
          LIMIT 1
        `
        const pattern = `INDRHI-EM-${currentYear}-%`
        const results = await db.query(sql, [pattern])

        let siguienteNumero = 1
        if (results && results.length > 0) {
          const ultimoNumero = results[0].numero_entrada
          const match = ultimoNumero.match(/-(\d+)$/)
          if (match) {
            siguienteNumero = parseInt(match[1]) + 1
          }
        }

        const numeroFormateado = `INDRHI-EM-${currentYear}-${String(siguienteNumero).padStart(4, '0')}`
        const numeroOrden = `INDRHI-DAF-CD-${currentYear}-${String(siguienteNumero).padStart(4, '0')}`
        const fechaActual = getTodayISO()

        return {
          success: true,
          data: { 
            siguiente_numero: numeroFormateado,
            numero_entrada: numeroFormateado,
            numero_orden: numeroOrden,
            fecha: fechaActual
          }
        }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener siguiente número'
      }
    }
  },

  createEntradaMercancia: async (entrada) => {
    try {
        // MySQL: usar databaseAdapter
        const data = await db.insert('sum_entrada_mercancia', entrada)

        // Actualizar existencia de artículos
        if (entrada.articulos_cantidades_unidades) {
          const articulos = typeof entrada.articulos_cantidades_unidades === 'string'
            ? JSON.parse(entrada.articulos_cantidades_unidades)
            : entrada.articulos_cantidades_unidades
          
          for (const articulo of articulos) {
            // Buscar artículo por código
            const artResults = await db.query(
              'SELECT id, existencia FROM sum_articulos WHERE codigo = ? LIMIT 1',
              [articulo.codigo]
            )

            if (artResults && artResults.length > 0) {
              const artData = artResults[0]
              const nuevaExistencia = (artData.existencia || 0) + articulo.cantidad
              await db.update('sum_articulos', artData.id, { existencia: nuevaExistencia })
            }
          }
        }

        // Obtener el registro completo creado
        const created = await db.query('SELECT * FROM sum_entrada_mercancia WHERE id = ?', [data.id])

        return {
          success: true,
          message: 'Entrada creada correctamente',
          data: created[0] || data
        }
    } catch (error) {
      console.error('Error al crear entrada:', error)
      return {
        success: false,
        message: error.message || 'Error al crear entrada'
      }
    }
  },

  updateEntradaMercancia: async (id, entrada) => {
    try {
      // Obtener la entrada original para revertir existencias
        .from('sum_entrada_mercancia')
        .select('articulos_cantidades_unidades')
        .eq('id', id)
        .single()

      if (errorOriginal) throw errorOriginal

      // Revertir existencias de artículos originales
      if (entradaOriginal.articulos_cantidades_unidades) {
        const articulosOriginales = JSON.parse(entradaOriginal.articulos_cantidades_unidades)
        
        for (const articulo of articulosOriginales) {
            .from('sum_articulos')
            .select('id, existencia')
            .eq('codigo', articulo.codigo)
            .single()

          if (!artError && artData) {
            const nuevaExistencia = Math.max(0, (artData.existencia || 0) - articulo.cantidad)
              .from('sum_articulos')
              .update({ existencia: nuevaExistencia })
              .eq('id', artData.id)
          }
        }
      }

      // Actualizar la entrada
        .from('sum_entrada_mercancia')
        .update(entrada)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Aplicar nuevas existencias de artículos
      if (entrada.articulos_cantidades_unidades) {
        const articulos = JSON.parse(entrada.articulos_cantidades_unidades)
        
        for (const articulo of articulos) {
            .from('sum_articulos')
            .select('id, existencia')
            .eq('codigo', articulo.codigo)
            .single()

          if (!artError && artData) {
            const nuevaExistencia = (artData.existencia || 0) + articulo.cantidad
              .from('sum_articulos')
              .update({ existencia: nuevaExistencia })
              .eq('id', artData.id)
          }
        }
      }

      return {
        success: true,
        message: 'Entrada actualizada correctamente',
        data
      }
    } catch (error) {
      console.error('Error al actualizar entrada:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar entrada'
      }
    }
  },

  deleteEntradaMercancia: async (id) => {
    try {
        // MySQL: obtener la entrada para revertir existencias
        const entradaResults = await db.query(
          'SELECT articulos_cantidades_unidades FROM sum_entrada_mercancia WHERE id = ? LIMIT 1',
          [id]
        )

        if (!entradaResults || entradaResults.length === 0) {
          throw new Error('Entrada no encontrada')
        }

        const entrada = entradaResults[0]

        // Revertir existencias de artículos
        if (entrada.articulos_cantidades_unidades) {
          const articulos = typeof entrada.articulos_cantidades_unidades === 'string'
            ? JSON.parse(entrada.articulos_cantidades_unidades)
            : entrada.articulos_cantidades_unidades
          
          for (const articulo of articulos) {
            const artResults = await db.query(
              'SELECT id, existencia FROM sum_articulos WHERE codigo = ? LIMIT 1',
              [articulo.codigo]
            )

            if (artResults && artResults.length > 0) {
              const artData = artResults[0]
              const nuevaExistencia = Math.max(0, (artData.existencia || 0) - articulo.cantidad)
              await db.update('sum_articulos', artData.id, { existencia: nuevaExistencia })
            }
          }
        }

        // Eliminar la entrada
        await db.remove('sum_entrada_mercancia', id)

        return {
          success: true,
          message: 'Entrada eliminada correctamente'
        }
    } catch (error) {
      console.error('Error al eliminar entrada:', error)
      return {
        success: false,
        message: error.message || 'Error al eliminar entrada'
      }
    }
  },

  // ========== SOLICITUDES DE ARTÍCULOS ==========
  getSolicitudes: async () => {
    try {
      const userId = getCurrentUserId()
      const userStr = localStorage.getItem('indrhi_user')
      let user = null
      
      if (userStr) {
        try {
          user = JSON.parse(userStr)
        } catch (e) {
          console.error('Error al parsear usuario:', e)
        }
      }

      // Verificar si el usuario puede ver todas las solicitudes
      const userRole = user?.roles?.[0] || user?.perfil || user?.rol || ''
      const roleLower = userRole.toLowerCase()
      const canViewAll = roleLower === 'administrador' || 
                         roleLower === 'encargado de suministro' || 
                         roleLower === 'suministro'

        // MySQL: construir query con JOINs
        let sql = `
          SELECT 
            s.*,
            sd.id as dept_id,
            sd.codigo as dept_codigo,
            sd.departamento as dept_nombre
          FROM sum_solicitudes s
          LEFT JOIN sum_departamentos sd ON s.departamento_id = sd.id
        `
        const params = []
        
        // Agregar filtros si es necesario
        if (!canViewAll && userId) {
          if (user?.departamento_id) {
            sql += ` WHERE s.departamento_id = ?`
            params.push(user.departamento_id)
          } else {
            sql += ` WHERE s.usuario_id = ?`
            params.push(userId)
          }
        }
        
        sql += ` ORDER BY s.id DESC`
        
        const data = await db.query(sql, params)
        
        // Transformar datos
        const transformedData = (data || []).map(row => ({
          ...row,
          sum_departamentos: row.dept_id ? {
            id: row.dept_id,
            codigo: row.dept_codigo,
            departamento: row.dept_nombre
          } : null
        }))
        
        // Obtener números de solicitudes ya enviadas (similar al código original)
        const numerosSolicitudes = transformedData.map(s => s.numero_solicitud).filter(Boolean)
        let solicitudesEnviadas = new Set()
        
        if (numerosSolicitudes.length > 0) {
          const enviadasSql = `SELECT numero_solicitud FROM sum_autorizar_solicitudes WHERE numero_solicitud IN (${numerosSolicitudes.map(() => '?').join(',')})`
          const enviadas = await db.query(enviadasSql, numerosSolicitudes)
          if (enviadas) {
            solicitudesEnviadas = new Set(enviadas.map(e => e.numero_solicitud))
          }
        }
        
        // Calcular total_articulos y marcar como enviadas
        const solicitudesConTotal = transformedData.map(solicitud => ({
          ...solicitud,
          total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades),
          departamento: solicitud.sum_departamentos?.departamento || solicitud.departamento,
          enviada: solicitudesEnviadas.has(solicitud.numero_solicitud) ? 1 : (solicitud.enviada || 0)
        }))
        
        return {
          success: true,
          data: solicitudesConTotal,
          total: solicitudesConTotal.length
        }
    } catch (error) {
      console.error('Error al obtener solicitudes:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudDetalle: async (id) => {
    try {
        // MySQL: usar JOINs explícitos
        const sql = `
          SELECT 
            s.*,
            sd.id as dept_id,
            sd.codigo as dept_codigo,
            sd.departamento as dept_nombre
          FROM sum_solicitudes s
          LEFT JOIN sum_departamentos sd ON s.departamento_id = sd.id
          WHERE s.id = ?
          LIMIT 1
        `
        const results = await db.query(sql, [id])
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'Solicitud no encontrada'
          }
        }
        
        const row = results[0]
        const data = {
          ...row,
          sum_departamentos: row.dept_id ? {
            id: row.dept_id,
            codigo: row.dept_codigo,
            departamento: row.dept_nombre
          } : null
        }
        
        // Parsear articulos_cantidades si es string
        if (data.articulos_cantidades && typeof data.articulos_cantidades === 'string') {
          data.articulos = JSON.parse(data.articulos_cantidades)
        } else {
          data.articulos = data.articulos_cantidades
        }

        return {
          success: true,
          data
        }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  getSiguienteNumeroSolicitud: async (departamentoId) => {
    try {
      if (!departamentoId) {
        throw new Error('El ID del departamento es requerido')
      }

      const currentYear = getCurrentYear()
      const prefix = `SD${departamentoId}-${currentYear}-`

        // MySQL: usar LIKE para buscar números del departamento y año actual
        const sql = `
          SELECT numero_solicitud 
          FROM sum_solicitudes 
          WHERE departamento_id = ? AND numero_solicitud LIKE ?
          ORDER BY id DESC 
          LIMIT 1
        `
        const pattern = `${prefix}%`
        const results = await db.query(sql, [departamentoId, pattern])

        let siguienteNumero = 1
        if (results && results.length > 0) {
          // Extraer el número secuencial del formato SD{departamento_id}-{año}-{número}
          const ultimoNumeroStr = results[0].numero_solicitud
          const match = ultimoNumeroStr.match(new RegExp(`^SD${departamentoId}-${currentYear}-(\\d+)$`))
          
          if (match && match[1]) {
            siguienteNumero = parseInt(match[1]) + 1
          }
        }

        // Formatear el número con 4 dígitos
        const numeroFormateado = `${prefix}${String(siguienteNumero).padStart(4, '0')}`
        const fechaActual = getTodayISO()

        return {
          success: true,
          data: { 
            siguiente_numero: numeroFormateado,
            numero_solicitud: numeroFormateado,
            fecha: fechaActual
          }
        }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener siguiente número'
      }
    }
  },

  createSolicitud: async (solicitud) => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

        // MySQL: obtener nombre del departamento
        const deptResults = await db.query(
          'SELECT departamento FROM sum_departamentos WHERE id = ? LIMIT 1',
          [solicitud.departamento_id]
        )

        const solicitudData = {
          numero_solicitud: solicitud.numero_solicitud,
          fecha: solicitud.fecha,
          departamento: deptResults[0]?.departamento || '',
          departamento_id: solicitud.departamento_id,
          usuario_id: userId,
          articulos_cantidades: typeof solicitud.articulos === 'string' 
            ? solicitud.articulos 
            : JSON.stringify(solicitud.articulos || [])
        }

        const data = await db.insert('sum_solicitudes', solicitudData)
        
        // Obtener el registro completo creado
        const created = await db.query('SELECT * FROM sum_solicitudes WHERE id = ?', [data.id])

        return {
          success: true,
          message: 'Solicitud creada correctamente',
          data: created[0] || data
        }
    } catch (error) {
      console.error('Error al crear solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al crear solicitud'
      }
    }
  },

  updateSolicitud: async (id, solicitud) => {
    try {
        // MySQL: obtener nombre del departamento si cambió
        let departamento = solicitud.departamento
        if (solicitud.departamento_id && !departamento) {
          const deptResults = await db.query(
            'SELECT departamento FROM sum_departamentos WHERE id = ? LIMIT 1',
            [solicitud.departamento_id]
          )
          departamento = deptResults[0]?.departamento || ''
        }

        const updateData = {
          ...solicitud,
          departamento,
          articulos_cantidades: solicitud.articulos 
            ? (typeof solicitud.articulos === 'string' ? solicitud.articulos : JSON.stringify(solicitud.articulos))
            : solicitud.articulos_cantidades
        }

        await db.update('sum_solicitudes', id, updateData)
        
        // Obtener el registro actualizado
        const updated = await db.query('SELECT * FROM sum_solicitudes WHERE id = ?', [id])

        return {
          success: true,
          message: 'Solicitud actualizada correctamente',
          data: updated[0]
        }
    } catch (error) {
      console.error('Error al actualizar solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar solicitud'
      }
    }
  },

  deleteSolicitud: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        await db.remove('sum_solicitudes', id)
        return {
          success: true,
          message: 'Solicitud eliminada correctamente'
        }
    } catch (error) {
      console.error('Error al eliminar solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al eliminar solicitud'
      }
    }
  },

  enviarSolicitud: async (id) => {
    try {
        // MySQL: obtener la solicitud
        const solicitudResults = await db.query(
          'SELECT * FROM sum_solicitudes WHERE id = ? LIMIT 1',
          [id]
        )

        if (!solicitudResults || solicitudResults.length === 0) {
          throw new Error('Solicitud no encontrada')
        }

        const solicitud = solicitudResults[0]
        const numeroSolicitud = String(solicitud.numero_solicitud || '')

        if (!numeroSolicitud) {
          throw new Error('El número de solicitud es requerido')
        }

        // Verificar si la solicitud ya fue enviada
        const existeResults = await db.query(
          'SELECT id FROM sum_autorizar_solicitudes WHERE numero_solicitud = ? LIMIT 1',
          [numeroSolicitud]
        )

        if (existeResults && existeResults.length > 0) {
          return {
            success: false,
            message: 'Esta solicitud ya fue enviada anteriormente'
          }
        }

        // Mover a tabla de autorizar_solicitudes
        await db.insert('sum_autorizar_solicitudes', {
          numero_solicitud: numeroSolicitud,
          fecha: solicitud.fecha,
          departamento: solicitud.departamento,
          articulos_cantidades: solicitud.articulos_cantidades
        })

        // Actualizar el campo enviada en sum_solicitudes (si existe)
        try {
          await db.query(
            'UPDATE sum_solicitudes SET enviada = 1 WHERE id = ?',
            [id]
          )
        } catch (e) {
          // Si el campo enviada no existe, ignorar el error
          console.warn('Campo enviada no existe o no se pudo actualizar:', e.message)
        }

        return {
          success: true,
          message: 'Solicitud enviada correctamente'
        }
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      // Manejar errores de duplicado en MySQL
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        return {
          success: false,
          message: 'Esta solicitud ya fue enviada anteriormente'
        }
      }
      return {
        success: false,
        message: error.message || 'Error al enviar solicitud'
      }
    }
  },

  // ========== AUTORIZAR SOLICITUDES ==========
  getAutorizarSolicitudes: async () => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_autorizar_solicitudes ORDER BY id DESC`
        const data = await db.query(sql)
        
        // Calcular total_articulos para cada solicitud
        const solicitudesConTotal = (data || []).map(solicitud => ({
          ...solicitud,
          total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
        }))

        return {
          success: true,
          data: solicitudesConTotal,
          total: solicitudesConTotal.length
        }
    } catch (error) {
      console.error('Error al obtener solicitudes de autorización:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getAutorizarSolicitudDetalle: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_autorizar_solicitudes WHERE id = ? LIMIT 1`
        const results = await db.query(sql, [id])
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'Solicitud no encontrada'
          }
        }
        
        const data = results[0]
        
        // Parsear articulos_cantidades
        if (data.articulos_cantidades && typeof data.articulos_cantidades === 'string') {
          data.articulos = JSON.parse(data.articulos_cantidades)
        } else {
          data.articulos = data.articulos_cantidades
        }

        return {
          success: true,
          data
        }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  rechazarSolicitud: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        await db.remove('sum_autorizar_solicitudes', id)
        return {
          success: true,
          message: 'Solicitud rechazada correctamente'
        }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al rechazar solicitud'
      }
    }
  },

  aprobarSolicitudes: async (ids) => {
    try {
      const idsArray = Array.isArray(ids) ? ids : [ids]
      
        // MySQL: obtener todas las solicitudes a aprobar
        const placeholders = idsArray.map(() => '?').join(',')
        const solicitudesResults = await db.query(
          `SELECT * FROM sum_autorizar_solicitudes WHERE id IN (${placeholders})`,
          idsArray
        )

        if (!solicitudesResults || solicitudesResults.length === 0) {
          throw new Error('No se encontraron solicitudes para aprobar')
        }

        // Insertar en solicitudes_aprobadas
        const solicitudesAprobadas = solicitudesResults.map(s => ({
          numero_solicitud: s.numero_solicitud,
          fecha: s.fecha,
          departamento: s.departamento,
          articulos_cantidades: s.articulos_cantidades
        }))

        for (const solicitud of solicitudesAprobadas) {
          await db.insert('sum_solicitudes_aprobadas', solicitud)
        }

        // Eliminar de autorizar_solicitudes
        for (const id of idsArray) {
          await db.remove('sum_autorizar_solicitudes', id)
        }

        return {
          success: true,
          message: `Solicitud(es) aprobada(s) correctamente`
        }
    } catch (error) {
      console.error('Error al aprobar solicitud(es):', error)
      return {
        success: false,
        message: error.message || 'Error al aprobar solicitud(es)'
      }
    }
  },

  // ========== SOLICITUDES APROBADAS ==========
  getSolicitudesAprobadas: async () => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_solicitudes_aprobadas ORDER BY id DESC`
        const data = await db.query(sql)
        
        // Calcular total_articulos para cada solicitud
        const solicitudesConTotal = (data || []).map(solicitud => ({
          ...solicitud,
          total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
        }))

        return {
          success: true,
          data: solicitudesConTotal,
          total: solicitudesConTotal.length
        }
    } catch (error) {
      console.error('Error al obtener solicitudes aprobadas:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudAprobadaDetalle: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_solicitudes_aprobadas WHERE id = ? LIMIT 1`
        const results = await db.query(sql, [id])
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'Solicitud no encontrada'
          }
        }
        
        const data = results[0]
        
        // Parsear articulos_cantidades
        if (data.articulos_cantidades && typeof data.articulos_cantidades === 'string') {
          data.articulos = JSON.parse(data.articulos_cantidades)
        } else {
          data.articulos = data.articulos_cantidades
        }

        return {
          success: true,
          data
        }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  gestionarSolicitudAprobada: async (id, articulos) => {
    try {
        // MySQL: obtener la solicitud aprobada
        const solicitudResults = await db.query(
          'SELECT * FROM sum_solicitudes_aprobadas WHERE id = ? LIMIT 1',
          [id]
        )

        if (!solicitudResults || solicitudResults.length === 0) {
          throw new Error('Solicitud no encontrada')
        }

        const solicitud = solicitudResults[0]

        // Actualizar articulos_cantidades con los artículos gestionados
        const articulosActualizados = articulos || (
          typeof solicitud.articulos_cantidades === 'string'
            ? JSON.parse(solicitud.articulos_cantidades)
            : solicitud.articulos_cantidades
        )
        
        // Mover a solicitudes_gestionadas
        await db.insert('sum_solicitudes_gestionadas', {
          numero_solicitud: solicitud.numero_solicitud,
          fecha: solicitud.fecha,
          departamento: solicitud.departamento,
          articulos_cantidades: typeof articulosActualizados === 'string'
            ? articulosActualizados
            : JSON.stringify(articulosActualizados)
        })

        // Eliminar de solicitudes_aprobadas
        await db.remove('sum_solicitudes_aprobadas', id)

        return {
          success: true,
          message: 'Solicitud gestionada correctamente'
        }
    } catch (error) {
      console.error('Error al gestionar solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al gestionar solicitud'
      }
    }
  },

  // ========== SOLICITUDES GESTIONADAS ==========
  getSolicitudesGestionadas: async () => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_solicitudes_gestionadas ORDER BY id DESC`
        const data = await db.query(sql)
        
        // Calcular total_articulos para cada solicitud
        const solicitudesConTotal = (data || []).map(solicitud => ({
          ...solicitud,
          total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
        }))

        return {
          success: true,
          data: solicitudesConTotal,
          total: solicitudesConTotal.length
        }
    } catch (error) {
      console.error('Error al obtener solicitudes gestionadas:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudGestionadaDetalle: async (id) => {
    try {
        // MySQL: usar databaseAdapter
        const sql = `SELECT * FROM sum_solicitudes_gestionadas WHERE id = ? LIMIT 1`
        const results = await db.query(sql, [id])
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'Solicitud no encontrada'
          }
        }
        
        const data = results[0]
        
        // Parsear articulos_cantidades
        if (data.articulos_cantidades && typeof data.articulos_cantidades === 'string') {
          data.articulos = JSON.parse(data.articulos_cantidades)
        } else {
          data.articulos = data.articulos_cantidades
        }

        return {
          success: true,
          data
        }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  despacharSolicitudes: async (ids) => {
    try {
      const idsArray = Array.isArray(ids) ? ids : [ids]
      
        // MySQL: obtener todas las solicitudes a despachar
        const placeholders = idsArray.map(() => '?').join(',')
        const solicitudesResults = await db.query(
          `SELECT * FROM sum_solicitudes_gestionadas WHERE id IN (${placeholders})`,
          idsArray
        )

        if (!solicitudesResults || solicitudesResults.length === 0) {
          throw new Error('No se encontraron solicitudes para despachar')
        }

        // Obtener usuario actual para despachado_por_id
        const userStr = localStorage.getItem('indrhi_user')
        const user = userStr ? JSON.parse(userStr) : null
        const userId = user?.id || user?.user_id
        
        // Buscar el registro en sum_usuarios_departamentos
        let despachadoPorId = null
        let despachadoPorNombre = user?.username || user?.email || 'Usuario desconocido'
        
        if (userId) {
          const usuarioDeptoResults = await db.query(
            'SELECT id, nombre_completo, username FROM sum_usuarios_departamentos WHERE user_id = ? LIMIT 1',
            [userId]
          )
          
          if (usuarioDeptoResults && usuarioDeptoResults.length > 0) {
            const usuarioDepto = usuarioDeptoResults[0]
            despachadoPorId = usuarioDepto.id
            despachadoPorNombre = usuarioDepto.nombre_completo || usuarioDepto.username || despachadoPorNombre
          }
        }

        // Insertar en solicitudes_despachadas
        for (const solicitud of solicitudesResults) {
          await db.insert('sum_solicitudes_despachadas', {
            numero_solicitud: solicitud.numero_solicitud,
            fecha: solicitud.fecha,
            departamento: solicitud.departamento,
            articulos_cantidades: solicitud.articulos_cantidades,
            despachado_por: despachadoPorNombre, // Mantener por compatibilidad
            despachado_por_id: despachadoPorId // Nuevo campo con foreign key
          })
        }

        // Actualizar existencia de artículos (reducir stock)
        for (const solicitud of solicitudesResults) {
          const articulos = typeof solicitud.articulos_cantidades === 'string'
            ? JSON.parse(solicitud.articulos_cantidades)
            : solicitud.articulos_cantidades
          
          for (const articulo of articulos) {
            const artResults = await db.query(
              'SELECT id, existencia FROM sum_articulos WHERE codigo = ? LIMIT 1',
              [articulo.codigo]
            )

            if (artResults && artResults.length > 0) {
              const artData = artResults[0]
              const nuevaExistencia = Math.max(0, (artData.existencia || 0) - articulo.cantidad)
              await db.update('sum_articulos', artData.id, { existencia: nuevaExistencia })
            }
          }
        }

        // Eliminar de solicitudes_gestionadas
        for (const id of idsArray) {
          await db.remove('sum_solicitudes_gestionadas', id)
        }

        return {
          success: true,
          message: `Solicitud(es) despachada(s) correctamente`
        }
    } catch (error) {
      console.error('Error al despachar solicitud(es):', error)
      return {
        success: false,
        message: error.message || 'Error al despachar solicitud(es)'
      }
    }
  },

  // ========== SOLICITUDES DESPACHADAS ==========
  getSolicitudesDespachadas: async () => {
    try {
        // MySQL: usar JOINs explícitos
        const sql = `
          SELECT 
            sd.*,
            sud.id as usuario_id,
            sud.nombre_completo as usuario_nombre_completo,
            sud.username as usuario_username,
            sud.email as usuario_email
          FROM sum_solicitudes_despachadas sd
          LEFT JOIN sum_usuarios_departamentos sud ON sd.despachado_por_id = sud.id
          ORDER BY sd.id DESC
        `
        const data = await db.query(sql)
        
        // Calcular total_articulos para cada solicitud y formatear despachado_por
        const solicitudesConTotal = (data || []).map(solicitud => {
          const despachadoPorNombre = solicitud.usuario_nombre_completo || 
                                     solicitud.usuario_username || 
                                     solicitud.despachado_por || 
                                     'N/A'
          
          return {
            ...solicitud,
            total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades),
            despachado_por: despachadoPorNombre,
            sum_usuarios_departamentos: solicitud.usuario_id ? {
              id: solicitud.usuario_id,
              nombre_completo: solicitud.usuario_nombre_completo,
              username: solicitud.usuario_username,
              email: solicitud.usuario_email
            } : null,
            despachado_por_usuario: solicitud.usuario_id ? {
              id: solicitud.usuario_id,
              nombre_completo: solicitud.usuario_nombre_completo,
              username: solicitud.usuario_username,
              email: solicitud.usuario_email
            } : null
          }
        })

        return {
          success: true,
          data: solicitudesConTotal,
          total: solicitudesConTotal.length
        }
    } catch (error) {
      console.error('Error al obtener solicitudes despachadas:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudDespachadaDetalle: async (id) => {
    try {
        // MySQL: usar JOINs explícitos
        const sql = `
          SELECT 
            sd.*,
            sud.id as usuario_id,
            sud.nombre_completo as usuario_nombre_completo,
            sud.username as usuario_username,
            sud.email as usuario_email,
            sr.id as rol_id_table,
            sr.nombre as rol_nombre,
            sr.descripcion as rol_descripcion
          FROM sum_solicitudes_despachadas sd
          LEFT JOIN sum_usuarios_departamentos sud ON sd.despachado_por_id = sud.id
          LEFT JOIN sum_roles sr ON sud.rol_id = sr.id
          WHERE sd.id = ?
          LIMIT 1
        `
        const results = await db.query(sql, [id])
        
        if (!results || results.length === 0) {
          return {
            success: false,
            message: 'Solicitud no encontrada'
          }
        }
        
        const row = results[0]
        const usuarioDespacho = row.usuario_id ? {
          id: row.usuario_id,
          nombre_completo: row.usuario_nombre_completo,
          username: row.usuario_username,
          email: row.usuario_email,
          sum_roles: row.rol_id_table ? {
            id: row.rol_id_table,
            nombre: row.rol_nombre,
            descripcion: row.rol_descripcion
          } : null
        } : null
        
        const data = {
          ...row,
          sum_usuarios_departamentos: usuarioDespacho
        }
        
        // Parsear articulos_cantidades
        if (data.articulos_cantidades && typeof data.articulos_cantidades === 'string') {
          data.articulos = JSON.parse(data.articulos_cantidades)
        } else {
          data.articulos = data.articulos_cantidades
        }

        // Formatear despachado_por con nombre_completo si está disponible
        if (usuarioDespacho) {
          data.despachado_por = usuarioDespacho.nombre_completo || 
                                usuarioDespacho.username || 
                                data.despachado_por || 
                                'N/A'
          data.despachado_por_usuario = usuarioDespacho
        }

        return {
          success: true,
          data
        }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al obtener detalle'
      }
    }
  },

  // ========== CAMBIAR CONTRASEÑA ==========
  cambiarPassword: async (userId, currentPassword, newPassword) => {
    try {
      // Verificar contraseña actual
      const userStr = localStorage.getItem('indrhi_user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user || !user.email) {
        throw new Error('Usuario no encontrado')
      }

      // Verificar contraseña actual intentando hacer login
        email: user.email,
        password: currentPassword
      })

      if (verifyError) {
        return {
          success: false,
          message: 'Contraseña actual incorrecta'
        }
      }

      // Actualizar contraseña
        password: newPassword
      })

      if (updateError) throw updateError

      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      return {
        success: false,
        message: error.message || 'Error al cambiar la contraseña'
      }
    }
  }
}

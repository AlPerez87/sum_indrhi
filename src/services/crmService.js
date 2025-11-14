import { supabase } from '../lib/supabaseClient'

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
      let query = supabase
        .from('sum_articulos')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      if (search) {
        query = query.or(`codigo.ilike.%${search}%,descripcion.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_articulos')
        .insert([articulo])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Artículo creado correctamente',
        data
      }
    } catch (error) {
      console.error('Error al crear artículo:', error)
      return {
        success: false,
        message: error.message || 'Error al crear artículo'
      }
    }
  },

  updateArticulo: async (id, articulo) => {
    try {
      const { data, error } = await supabase
        .from('sum_articulos')
        .update(articulo)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Artículo actualizado correctamente',
        data
      }
    } catch (error) {
      console.error('Error al actualizar artículo:', error)
      return {
        success: false,
        message: error.message || 'Error al actualizar artículo'
      }
    }
  },

  deleteArticulo: async (id) => {
    try {
      const { error } = await supabase
        .from('sum_articulos')
        .delete()
        .eq('id', id)

      if (error) throw error

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
      let query = supabase
        .from('sum_departamentos')
        .select('*', { count: 'exact' })
        .order('id', { ascending: true })

      if (search) {
        query = query.or(`codigo.ilike.%${search}%,departamento.ilike.%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_departamentos')
        .insert([departamento])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Departamento creado correctamente',
        data
      }
    } catch (error) {
      console.error('Error al crear departamento:', error)
      return {
        success: false,
        message: error.message || 'Error al crear departamento'
      }
    }
  },

  updateDepartamento: async (id, departamento) => {
    try {
      const { data, error } = await supabase
        .from('sum_departamentos')
        .update(departamento)
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

  deleteDepartamento: async (id) => {
    try {
      const { error } = await supabase
        .from('sum_departamentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        success: true,
        message: 'Departamento eliminado correctamente'
      }
    } catch (error) {
      console.error('Error al eliminar departamento:', error)
      return {
        success: false,
        message: error.message || 'Error al eliminar departamento'
      }
    }
  },

  // ========== USUARIOS ==========
  getUsuariosDepartamentos: async () => {
    try {
      const { data, error, count } = await supabase
        .from('sum_usuarios_departamentos')
        .select(`
          *,
          sum_departamentos:departamento_id (
            id,
            codigo,
            departamento
          )
        `, { count: 'exact' })
        .order('id', { ascending: true })

      if (error) throw error

      return {
        success: true,
        data: data || [],
        total: count || 0
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
      const { data, error } = await supabase
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

  updateUsuarioPassword: async (id, password) => {
    try {
      // Obtener el user_id de la tabla usuarios_departamentos
      const { data: usuario, error: usuarioError } = await supabase
        .from('sum_usuarios_departamentos')
        .select('user_id')
        .eq('id', id)
        .single()

      if (usuarioError || !usuario) {
        throw new Error('Usuario no encontrado')
      }

      // Actualizar contraseña en Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(
        usuario.user_id,
        { password }
      )

      if (error) throw error

      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
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
      const { data, error, count } = await supabase
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
      const { data, error } = await supabase
        .from('sum_entrada_mercancia')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

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
      const currentYear = new Date().getFullYear()
      
      // Obtener el último número de entrada del año actual
      const { data, error } = await supabase
        .from('sum_entrada_mercancia')
        .select('numero_entrada')
        .like('numero_entrada', `INDRHI-EM-${currentYear}-%`)
        .order('id', { ascending: false })
        .limit(1)

      if (error) throw error

      let siguienteNumero = 1
      if (data && data.length > 0) {
        const ultimoNumero = data[0].numero_entrada
        const match = ultimoNumero.match(/-(\d+)$/)
        if (match) {
          siguienteNumero = parseInt(match[1]) + 1
        }
      }

      const numeroFormateado = `INDRHI-EM-${currentYear}-${String(siguienteNumero).padStart(4, '0')}`
      const numeroOrden = `INDRHI-DAF-CD-${currentYear}-${String(siguienteNumero).padStart(4, '0')}`
      const fechaActual = new Date().toISOString().split('T')[0]

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
      const { data, error } = await supabase
        .from('sum_entrada_mercancia')
        .insert([entrada])
        .select()
        .single()

      if (error) throw error

      // Actualizar existencia de artículos
      if (entrada.articulos_cantidades_unidades) {
        const articulos = JSON.parse(entrada.articulos_cantidades_unidades)
        
        for (const articulo of articulos) {
          // Buscar artículo por código
          const { data: artData, error: artError } = await supabase
            .from('sum_articulos')
            .select('id, existencia')
            .eq('codigo', articulo.codigo)
            .single()

          if (!artError && artData) {
            const nuevaExistencia = (artData.existencia || 0) + articulo.cantidad
            await supabase
              .from('sum_articulos')
              .update({ existencia: nuevaExistencia })
              .eq('id', artData.id)
          }
        }
      }

      return {
        success: true,
        message: 'Entrada creada correctamente',
        data
      }
    } catch (error) {
      console.error('Error al crear entrada:', error)
      return {
        success: false,
        message: error.message || 'Error al crear entrada'
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

      // Verificar si el usuario es Administrador
      const isAdmin = user && (
        user.roles?.some(r => r.toLowerCase() === 'administrador') ||
        user.perfil?.toLowerCase() === 'administrador' ||
        user.rol?.toLowerCase() === 'administrador'
      )

      let query = supabase
        .from('sum_solicitudes')
        .select(`
          *,
          sum_departamentos:departamento_id (
            id,
            codigo,
            departamento
          )
        `, { count: 'exact' })
        .order('id', { ascending: false })

      // Si no es Administrador, filtrar por usuario_id o departamento_id
      if (!isAdmin && userId) {
        // Obtener el departamento_id del usuario si está disponible
        if (user?.departamento_id) {
          query = query.eq('departamento_id', user.departamento_id)
        } else {
          // Si no tiene departamento_id, filtrar por usuario_id
          query = query.eq('usuario_id', userId)
        }
      }

      const { data, error, count } = await query

      if (error) throw error

      // Calcular total_articulos para cada solicitud
      const solicitudesConTotal = (data || []).map(solicitud => ({
        ...solicitud,
        total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades),
        departamento: solicitud.sum_departamentos?.departamento || solicitud.departamento
      }))

      return {
        success: true,
        data: solicitudesConTotal,
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_solicitudes')
        .select(`
          *,
          sum_departamentos:departamento_id (
            id,
            codigo,
            departamento
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error

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

      const currentYear = new Date().getFullYear()
      const prefix = `SD${departamentoId}-${currentYear}-`

      // Buscar el último número de solicitud para este departamento y año
      // Usar ilike para búsqueda case-insensitive y filtrar por departamento_id para mejor rendimiento
      const { data, error } = await supabase
        .from('sum_solicitudes')
        .select('numero_solicitud')
        .eq('departamento_id', departamentoId)
        .ilike('numero_solicitud', `${prefix}%`)
        .order('id', { ascending: false })
        .limit(1)

      if (error) throw error

      let siguienteNumero = 1
      if (data && data.length > 0) {
        // Extraer el número secuencial del formato SD{departamento_id}-{año}-{número}
        const ultimoNumeroStr = data[0].numero_solicitud
        const match = ultimoNumeroStr.match(new RegExp(`^SD${departamentoId}-${currentYear}-(\\d+)$`))
        
        if (match && match[1]) {
          siguienteNumero = parseInt(match[1]) + 1
        }
      }

      // Formatear el número con 4 dígitos
      const numeroFormateado = `${prefix}${String(siguienteNumero).padStart(4, '0')}`
      const fechaActual = new Date().toISOString().split('T')[0]

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

      // Obtener nombre del departamento
      const { data: deptData } = await supabase
        .from('sum_departamentos')
        .select('departamento')
        .eq('id', solicitud.departamento_id)
        .single()

      const solicitudData = {
        numero_solicitud: solicitud.numero_solicitud,
        fecha: solicitud.fecha,
        departamento: deptData?.departamento || '',
        departamento_id: solicitud.departamento_id,
        usuario_id: userId,
        articulos_cantidades: JSON.stringify(solicitud.articulos || [])
      }

      const { data, error } = await supabase
        .from('sum_solicitudes')
        .insert([solicitudData])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Solicitud creada correctamente',
        data
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
      // Obtener nombre del departamento si cambió
      let departamento = solicitud.departamento
      if (solicitud.departamento_id && !departamento) {
        const { data: deptData } = await supabase
          .from('sum_departamentos')
          .select('departamento')
          .eq('id', solicitud.departamento_id)
          .single()
        departamento = deptData?.departamento || ''
      }

      const updateData = {
        ...solicitud,
        departamento,
        articulos_cantidades: solicitud.articulos 
          ? JSON.stringify(solicitud.articulos)
          : solicitud.articulos_cantidades
      }

      const { data, error } = await supabase
        .from('sum_solicitudes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        message: 'Solicitud actualizada correctamente',
        data
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
      const { error } = await supabase
        .from('sum_solicitudes')
        .delete()
        .eq('id', id)

      if (error) throw error

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
      // Obtener la solicitud
      const { data: solicitud, error: solicitudError } = await supabase
        .from('sum_solicitudes')
        .select('*')
        .eq('id', id)
        .single()

      if (solicitudError) throw solicitudError

      // El numero_solicitud ahora es un string con formato SD{departamento_id}-{año}-{número}
      // Mantener como string (la tabla debe ser VARCHAR, no INTEGER)
      const numeroSolicitud = String(solicitud.numero_solicitud || '')

      if (!numeroSolicitud) {
        throw new Error('El número de solicitud es requerido')
      }

      // Mover a tabla de autorizar_solicitudes
      const { error: insertError } = await supabase
        .from('sum_autorizar_solicitudes')
        .insert([{
          numero_solicitud: numeroSolicitud,
          fecha: solicitud.fecha,
          departamento: solicitud.departamento,
          articulos_cantidades: solicitud.articulos_cantidades
        }])

      if (insertError) throw insertError

      return {
        success: true,
        message: 'Solicitud enviada correctamente'
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      return {
        success: false,
        message: error.message || 'Error al enviar solicitud'
      }
    }
  },

  // ========== AUTORIZAR SOLICITUDES ==========
  getAutorizarSolicitudes: async () => {
    try {
      const { data, error, count } = await supabase
        .from('sum_autorizar_solicitudes')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (error) throw error

      // Calcular total_articulos para cada solicitud
      const solicitudesConTotal = (data || []).map(solicitud => ({
        ...solicitud,
        total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
      }))

      return {
        success: true,
        data: solicitudesConTotal,
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_autorizar_solicitudes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

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
      const { error } = await supabase
        .from('sum_autorizar_solicitudes')
        .delete()
        .eq('id', id)

      if (error) throw error

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
      
      // Obtener todas las solicitudes a aprobar
      const { data: solicitudes, error: fetchError } = await supabase
        .from('sum_autorizar_solicitudes')
        .select('*')
        .in('id', idsArray)

      if (fetchError) throw fetchError

      // Insertar en solicitudes_aprobadas
      const solicitudesAprobadas = solicitudes.map(s => ({
        numero_solicitud: s.numero_solicitud,
        fecha: s.fecha,
        departamento: s.departamento,
        articulos_cantidades: s.articulos_cantidades
      }))

      const { error: insertError } = await supabase
        .from('sum_solicitudes_aprobadas')
        .insert(solicitudesAprobadas)

      if (insertError) throw insertError

      // Eliminar de autorizar_solicitudes
      const { error: deleteError } = await supabase
        .from('sum_autorizar_solicitudes')
        .delete()
        .in('id', idsArray)

      if (deleteError) throw deleteError

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
      const { data, error, count } = await supabase
        .from('sum_solicitudes_aprobadas')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (error) throw error

      // Calcular total_articulos para cada solicitud
      const solicitudesConTotal = (data || []).map(solicitud => ({
        ...solicitud,
        total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
      }))

      return {
        success: true,
        data: solicitudesConTotal,
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_solicitudes_aprobadas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

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
      // Obtener la solicitud aprobada
      const { data: solicitud, error: solicitudError } = await supabase
        .from('sum_solicitudes_aprobadas')
        .select('*')
        .eq('id', id)
        .single()

      if (solicitudError) throw solicitudError

      // Actualizar articulos_cantidades con los artículos gestionados
      const articulosActualizados = articulos || JSON.parse(solicitud.articulos_cantidades)
      
      // Mover a solicitudes_gestionadas
      const { error: insertError } = await supabase
        .from('sum_solicitudes_gestionadas')
        .insert([{
          numero_solicitud: solicitud.numero_solicitud,
          fecha: solicitud.fecha,
          departamento: solicitud.departamento,
          articulos_cantidades: JSON.stringify(articulosActualizados)
        }])

      if (insertError) throw insertError

      // Eliminar de solicitudes_aprobadas
      const { error: deleteError } = await supabase
        .from('sum_solicitudes_aprobadas')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

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
      const { data, error, count } = await supabase
        .from('sum_solicitudes_gestionadas')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (error) throw error

      // Calcular total_articulos para cada solicitud
      const solicitudesConTotal = (data || []).map(solicitud => ({
        ...solicitud,
        total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
      }))

      return {
        success: true,
        data: solicitudesConTotal,
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_solicitudes_gestionadas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

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
      
      // Obtener todas las solicitudes a despachar
      const { data: solicitudes, error: fetchError } = await supabase
        .from('sum_solicitudes_gestionadas')
        .select('*')
        .in('id', idsArray)

      if (fetchError) throw fetchError

      // Obtener usuario actual para despachado_por
      const userStr = localStorage.getItem('indrhi_user')
      const user = userStr ? JSON.parse(userStr) : null
      const despachadoPor = user?.username || user?.email || 'Usuario desconocido'

      // Insertar en solicitudes_despachadas
      const solicitudesDespachadas = solicitudes.map(s => ({
        numero_solicitud: s.numero_solicitud,
        fecha: s.fecha,
        departamento: s.departamento,
        articulos_cantidades: s.articulos_cantidades,
        despachado_por: despachadoPor
      }))

      const { error: insertError } = await supabase
        .from('sum_solicitudes_despachadas')
        .insert(solicitudesDespachadas)

      if (insertError) throw insertError

      // Actualizar existencia de artículos (reducir stock)
      for (const solicitud of solicitudes) {
        const articulos = JSON.parse(solicitud.articulos_cantidades)
        for (const articulo of articulos) {
          const { data: artData } = await supabase
            .from('sum_articulos')
            .select('id, existencia')
            .eq('codigo', articulo.codigo)
            .single()

          if (artData) {
            const nuevaExistencia = Math.max(0, (artData.existencia || 0) - articulo.cantidad)
            await supabase
              .from('sum_articulos')
              .update({ existencia: nuevaExistencia })
              .eq('id', artData.id)
          }
        }
      }

      // Eliminar de solicitudes_gestionadas
      const { error: deleteError } = await supabase
        .from('sum_solicitudes_gestionadas')
        .delete()
        .in('id', idsArray)

      if (deleteError) throw deleteError

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
      const { data, error, count } = await supabase
        .from('sum_solicitudes_despachadas')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })

      if (error) throw error

      // Calcular total_articulos para cada solicitud
      const solicitudesConTotal = (data || []).map(solicitud => ({
        ...solicitud,
        total_articulos: calcularTotalArticulos(solicitud.articulos_cantidades)
      }))

      return {
        success: true,
        data: solicitudesConTotal,
        total: count || 0
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
      const { data, error } = await supabase
        .from('sum_solicitudes_despachadas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

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
      const { error: verifyError } = await supabase.auth.signInWithPassword({
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
      const { error: updateError } = await supabase.auth.updateUser({
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

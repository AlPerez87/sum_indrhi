import axios from 'axios'

const API_URL = 'http://localhost/suministros.indrhi.gob.do/wp-json/indrhi/v1'

const getAuthHeader = () => {
  const token = localStorage.getItem('indrhi_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const crmService = {
  // ========== ARTÍCULOS ==========
  getUnidades: async () => {
    try {
      const response = await axios.get(`${API_URL}/articulos/unidades`, {
        headers: getAuthHeader()
      })
      const unidades = Array.isArray(response.data) ? response.data : []
      return {
        success: true,
        data: unidades
      }
    } catch (error) {
      console.error('Error al obtener unidades:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener unidades',
        data: []
      }
    }
  },

  getArticulos: async () => {
    try {
      const response = await axios.get(`${API_URL}/articulos`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error al obtener artículos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener artículos',
        data: []
      }
    }
  },

  createArticulo: async (articulo) => {
    try {
      const response = await axios.post(`${API_URL}/articulos`, articulo, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Artículo creado'
      }
    } catch (error) {
      console.error('Error al crear artículo:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear artículo'
      }
    }
  },

  updateArticulo: async (id, articulo) => {
    try {
      const response = await axios.put(`${API_URL}/articulos/${id}`, articulo, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Artículo actualizado'
      }
    } catch (error) {
      console.error('Error al actualizar artículo:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar artículo'
      }
    }
  },

  deleteArticulo: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/articulos/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Artículo eliminado'
      }
    } catch (error) {
      console.error('Error al eliminar artículo:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar artículo'
      }
    }
  },

  // ========== DEPARTAMENTOS ==========
  getDepartamentos: async () => {
    try {
      const response = await axios.get(`${API_URL}/departamentos`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error al obtener departamentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener departamentos',
        data: []
      }
    }
  },

  createDepartamento: async (departamento) => {
    try {
      const response = await axios.post(`${API_URL}/departamentos`, departamento, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Departamento creado'
      }
    } catch (error) {
      console.error('Error al crear departamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear departamento'
      }
    }
  },

  updateDepartamento: async (id, departamento) => {
    try {
      const response = await axios.put(`${API_URL}/departamentos/${id}`, departamento, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Departamento actualizado'
      }
    } catch (error) {
      console.error('Error al actualizar departamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar departamento'
      }
    }
  },

  deleteDepartamento: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/departamentos/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Departamento eliminado'
      }
    } catch (error) {
      console.error('Error al eliminar departamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar departamento'
      }
    }
  },

  // ========== USUARIOS ==========

  getUsuariosDepartamentos: async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios-departamentos`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener usuarios',
        data: []
      }
    }
  },

  updateUsuarioDepartamento: async (id, departamentoId) => {
    try {
      const response = await axios.put(
        `${API_URL}/usuarios-departamentos/${id}`,
        { departamento_id: departamentoId },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Departamento actualizado'
      }
    } catch (error) {
      console.error('Error al actualizar departamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar departamento'
      }
    }
  },

  updateUsuarioPassword: async (id, password) => {
    try {
      const response = await axios.put(
        `${API_URL}/usuarios-departamentos/${id}/password`,
        { password },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Contraseña actualizada'
      }
    } catch (error) {
      console.error('Error al actualizar contraseña:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar contraseña'
      }
    }
  },

  // ========== ENTRADA DE MERCANCÍA ==========

  getEntradasMercancia: async () => {
    try {
      const response = await axios.get(`${API_URL}/entrada-mercancia`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener entradas:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener entradas',
        data: []
      }
    }
  },

  getEntradaMercanciaDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/entrada-mercancia/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de entrada:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  getSiguienteNumeroEntrada: async () => {
    try {
      const response = await axios.get(`${API_URL}/entrada-mercancia/siguiente-numero`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener siguiente número'
      }
    }
  },

  createEntradaMercancia: async (entrada) => {
    try {
      const response = await axios.post(
        `${API_URL}/entrada-mercancia`,
        entrada,
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Entrada creada correctamente',
        data: response.data
      }
    } catch (error) {
      console.error('Error al crear entrada:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear entrada'
      }
    }
  },

  // ========== SOLICITUDES DE ARTÍCULOS ==========

  getSolicitudes: async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener solicitudes:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  getSiguienteNumeroSolicitud: async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes/siguiente-numero`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener siguiente número'
      }
    }
  },

  createSolicitud: async (solicitud) => {
    try {
      const response = await axios.post(
        `${API_URL}/solicitudes`,
        solicitud,
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud creada correctamente',
        data: response.data
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear solicitud'
      }
    }
  },

  updateSolicitud: async (id, solicitud) => {
    try {
      const response = await axios.put(
        `${API_URL}/solicitudes/${id}`,
        solicitud,
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud actualizada correctamente'
      }
    } catch (error) {
      console.error('Error al actualizar solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar solicitud'
      }
    }
  },

  deleteSolicitud: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/solicitudes/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Solicitud eliminada correctamente'
      }
    } catch (error) {
      console.error('Error al eliminar solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar solicitud'
      }
    }
  },

  enviarSolicitud: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/solicitudes/${id}/enviar`,
        {},
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud enviada correctamente'
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar solicitud'
      }
    }
  },

  // ========== AUTORIZAR SOLICITUDES ==========

  getAutorizarSolicitudes: async () => {
    try {
      const response = await axios.get(`${API_URL}/autorizar-solicitudes`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener solicitudes de autorización:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getAutorizarSolicitudDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/autorizar-solicitudes/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  rechazarSolicitud: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/autorizar-solicitudes/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        message: response.data.message || 'Solicitud rechazada correctamente'
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al rechazar solicitud'
      }
    }
  },

  aprobarSolicitudes: async (ids) => {
    try {
      const response = await axios.post(`${API_URL}/autorizar-solicitudes/aprobar`, 
        { ids: Array.isArray(ids) ? ids : [ids] },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud(es) aprobada(s) correctamente',
        data: response.data
      }
    } catch (error) {
      console.error('Error al aprobar solicitud(es):', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al aprobar solicitud(es)'
      }
    }
  },

  // ========== SOLICITUDES APROBADAS ==========

  getSolicitudesAprobadas: async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-aprobadas`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener solicitudes aprobadas:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudAprobadaDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-aprobadas/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  gestionarSolicitudAprobada: async (id, articulos) => {
    try {
      const response = await axios.post(
        `${API_URL}/solicitudes-aprobadas/${id}/gestionar`,
        { articulos },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud gestionada correctamente'
      }
    } catch (error) {
      console.error('Error al gestionar solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al gestionar solicitud'
      }
    }
  },

  // ========== SOLICITUDES GESTIONADAS ==========

  getSolicitudesGestionadas: async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-gestionadas`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener solicitudes gestionadas:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudGestionadaDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-gestionadas/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  despacharSolicitudes: async (ids) => {
    try {
      const response = await axios.post(`${API_URL}/solicitudes-gestionadas/despachar`, 
        { ids: Array.isArray(ids) ? ids : [ids] },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Solicitud(es) despachada(s) correctamente',
        data: response.data
      }
    } catch (error) {
      console.error('Error al despachar solicitud(es):', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al despachar solicitud(es)'
      }
    }
  },

  // ========== SOLICITUDES DESPACHADAS ==========

  getSolicitudesDespachadas: async () => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-despachadas`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0
      }
    } catch (error) {
      console.error('Error al obtener solicitudes despachadas:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      }
    }
  },

  getSolicitudDespachadaDetalle: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/solicitudes-despachadas/${id}`, {
        headers: getAuthHeader()
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Error al obtener detalle de solicitud:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener detalle'
      }
    }
  },

  // ========== CAMBIAR CONTRASEÑA ==========
  
  cambiarPassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/usuarios-departamentos/${userId}/password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        { headers: getAuthHeader() }
      )
      return {
        success: true,
        message: response.data.message || 'Contraseña actualizada correctamente'
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar la contraseña'
      }
    }
  }
}


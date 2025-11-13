/**
 * Configuración de Sentry para monitoreo de errores
 * 
 * Para activar Sentry:
 * 1. Instalar: npm install @sentry/react
 * 2. Crear cuenta en https://sentry.io
 * 3. Configurar el DSN en las variables de entorno
 * 4. Descomentar el código de inicialización
 */

// Importar Sentry (descomentar cuando esté instalado)
// import * as Sentry from '@sentry/react'

/**
 * Inicializar Sentry
 */
export const initSentry = () => {
  // Verificar si Sentry está habilitado en las variables de entorno
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE
  
  // Solo inicializar si hay un DSN configurado y no estamos en desarrollo
  if (!sentryDsn || environment === 'development') {
    console.log('Sentry no inicializado (DSN no configurado o entorno de desarrollo)')
    return
  }

  try {
    // Descomentar cuando @sentry/react esté instalado
    /*
    Sentry.init({
      dsn: sentryDsn,
      environment: environment,
      
      // Tasa de muestreo de transacciones (0.0 a 1.0)
      tracesSampleRate: environment === 'production' ? 0.5 : 1.0,
      
      // Capturar errores de red
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', /^https:\/\/.*\.indrhi\.gob\.do/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Tasa de muestreo de sesiones para replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filtrar eventos sensibles
      beforeSend(event, hint) {
        // No enviar errores de desarrollo
        if (environment === 'development') {
          return null
        }
        
        // Filtrar datos sensibles de las URLs
        if (event.request && event.request.url) {
          event.request.url = event.request.url.replace(/token=[^&]+/g, 'token=REDACTED')
        }
        
        // Filtrar headers sensibles
        if (event.request && event.request.headers) {
          delete event.request.headers['Authorization']
          delete event.request.headers['authorization']
        }
        
        return event
      },
      
      // Ignorar ciertos errores conocidos
      ignoreErrors: [
        // Errores de navegación
        'Non-Error promise rejection captured',
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // Errores de extensiones del navegador
        'chrome-extension://',
        'moz-extension://',
      ],
    })
    
    console.log('Sentry inicializado correctamente')
    */
    
    console.log('Sentry configurado pero no inicializado. Instalar @sentry/react para activarlo.')
  } catch (error) {
    console.error('Error al inicializar Sentry:', error)
  }
}

/**
 * Capturar excepción manualmente
 */
export const captureException = (error, context = {}) => {
  console.error('Error capturado:', error, context)
  
  // Descomentar cuando @sentry/react esté instalado
  /*
  if (typeof Sentry !== 'undefined' && Sentry.captureException) {
    Sentry.captureException(error, {
      tags: context.tags,
      extra: context.extra,
      user: context.user
    })
  }
  */
}

/**
 * Capturar mensaje informativo
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  console.log(`[${level}]`, message, context)
  
  // Descomentar cuando @sentry/react esté instalado
  /*
  if (typeof Sentry !== 'undefined' && Sentry.captureMessage) {
    Sentry.captureMessage(message, {
      level,
      tags: context.tags,
      extra: context.extra
    })
  }
  */
}

/**
 * Configurar usuario actual para Sentry
 */
export const setUser = (user) => {
  if (!user) return
  
  // Descomentar cuando @sentry/react esté instalado
  /*
  if (typeof Sentry !== 'undefined' && Sentry.setUser) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      email: user.email,
      // No enviar datos sensibles
    })
  }
  */
}

/**
 * Limpiar usuario de Sentry (al hacer logout)
 */
export const clearUser = () => {
  // Descomentar cuando @sentry/react esté instalado
  /*
  if (typeof Sentry !== 'undefined' && Sentry.setUser) {
    Sentry.setUser(null)
  }
  */
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser
}


# 🧪 Guía de Pruebas Finales

## ✅ Próximos Pasos para Completar la Migración

### 1. Migrar Datos Restantes (Opcional)

Si necesitas migrar los datos históricos de solicitudes y entradas:

#### Datos a Migrar:
- `sum_entrada_mercancia` (2 registros)
- `sum_solicitudes` (5 registros) - ⚠️ Requiere conversión de `user_id` a UUID
- `sum_autorizar_solicitudes` (2 registros)
- `sum_solicitudes_aprobadas` (1 registro)
- `sum_solicitudes_gestionadas` (0 registros)
- `sum_solicitudes_despachadas` (2 registros)

**Nota:** Si prefieres empezar con datos limpios, puedes omitir esta migración y comenzar con datos nuevos.

### 2. Pruebas Funcionales

#### Prueba 1: Autenticación ✅
- [ ] Login con cada usuario creado funciona
- [ ] Logout funciona correctamente
- [ ] La sesión se mantiene al recargar la página
- [ ] Redirección funciona correctamente

#### Prueba 2: Visualización de Datos ✅
- [ ] Se muestran los 242 artículos correctamente
- [ ] Se muestran los 247 departamentos correctamente
- [ ] La búsqueda funciona en artículos
- [ ] La búsqueda funciona en departamentos
- [ ] La paginación funciona correctamente

#### Prueba 3: Gestión de Artículos (Roles: Administrador, Encargado)
- [ ] Crear nuevo artículo funciona
- [ ] Editar artículo funciona
- [ ] Eliminar artículo funciona
- [ ] Validaciones funcionan correctamente

#### Prueba 4: Gestión de Departamentos (Rol: Administrador)
- [ ] Crear nuevo departamento funciona
- [ ] Editar departamento funciona
- [ ] Eliminar departamento funciona

#### Prueba 5: Crear Solicitud (Todos los usuarios)
- [ ] Crear nueva solicitud funciona
- [ ] Agregar artículos a la solicitud funciona
- [ ] Enviar solicitud funciona
- [ ] Ver mis solicitudes funciona
- [ ] Editar solicitud pendiente funciona
- [ ] Eliminar solicitud pendiente funciona

#### Prueba 6: Autorizar Solicitudes (Roles: Administrador, Director, Encargado)
- [ ] Ver solicitudes pendientes de autorización funciona
- [ ] Aprobar solicitud individual funciona
- [ ] Aprobar múltiples solicitudes funciona
- [ ] Rechazar solicitud funciona

#### Prueba 7: Gestionar Solicitudes (Roles: Administrador, Encargado)
- [ ] Ver solicitudes aprobadas funciona
- [ ] Gestionar solicitud funciona
- [ ] Actualizar cantidades funciona

#### Prueba 8: Despachar Solicitudes (Roles: Administrador, Encargado)
- [ ] Ver solicitudes gestionadas funciona
- [ ] Despachar solicitud individual funciona
- [ ] Despachar múltiples solicitudes funciona
- [ ] El stock se actualiza correctamente al despachar

#### Prueba 9: Entrada de Mercancía (Roles: Administrador, Encargado)
- [ ] Crear entrada de mercancía funciona
- [ ] El stock se actualiza correctamente
- [ ] Ver historial de entradas funciona

#### Prueba 10: Gestión de Usuarios (Rol: Administrador)
- [ ] Ver lista de usuarios funciona
- [ ] Asignar departamento a usuario funciona
- [ ] Cambiar contraseña funciona

### 3. Pruebas de Rendimiento

- [ ] La aplicación carga rápidamente
- [ ] Las consultas a la base de datos son rápidas
- [ ] No hay errores en la consola del navegador
- [ ] La aplicación funciona bien en móviles

### 4. Verificación de Seguridad

- [ ] Los usuarios solo ven sus propias solicitudes
- [ ] Los roles funcionan correctamente
- [ ] No se puede acceder a rutas protegidas sin autenticación
- [ ] Las políticas RLS funcionan correctamente

## 🐛 Si Encuentras Problemas

### Error de CORS
**Solución:** Agrega tu dominio de Vercel a las URLs permitidas en Supabase:
1. Ve a **Settings** → **API** en Supabase
2. Agrega tu URL de Vercel a "Allowed URLs"

### Error: "Missing Supabase environment variables"
**Solución:** Verifica que las variables estén en Vercel y haz un redeploy

### Los datos no se muestran
**Solución:** 
- Verifica que los datos estén migrados
- Revisa las políticas RLS en Supabase
- Verifica la consola del navegador

### El login no funciona
**Solución:**
- Verifica que el usuario exista en Supabase Auth
- Verifica que el usuario esté en `sum_usuarios_departamentos`
- Verifica que uses el email correcto

## ✅ Checklist de Completitud

Una vez que todas las pruebas pasen:

- [ ] Todas las funcionalidades principales funcionan
- [ ] No hay errores críticos
- [ ] La aplicación está lista para producción
- [ ] Los usuarios pueden usar el sistema sin problemas

## 🎉 ¡Sistema Listo!

Una vez completadas las pruebas, tu sistema estará completamente funcional y listo para uso en producción.


# Revisión Completa de Migración Supabase → MySQL

## 📊 Estado Actual

### ✅ FUNCIONES DE LECTURA ADAPTADAS (100%)
Todas las funciones de lectura están completamente adaptadas para MySQL:

- ✅ `getUnidades`
- ✅ `getArticulos`
- ✅ `getDepartamentos`
- ✅ `getUsuariosDepartamentos`
- ✅ `getRoles`
- ✅ `getEntradasMercancia`
- ✅ `getEntradaMercanciaDetalle`
- ✅ `getSolicitudes`
- ✅ `getSolicitudDetalle`
- ✅ `getAutorizarSolicitudes`
- ✅ `getAutorizarSolicitudDetalle`
- ✅ `getSolicitudesAprobadas`
- ✅ `getSolicitudAprobadaDetalle`
- ✅ `getSolicitudesGestionadas`
- ✅ `getSolicitudGestionadaDetalle`
- ✅ `getSolicitudesDespachadas`
- ✅ `getSolicitudDespachadaDetalle`

---

## ⚠️ FUNCIONES CRUD PENDIENTES DE MIGRAR

### 1. ARTÍCULOS (3 funciones)
- ❌ `createArticulo` - Línea 142
- ❌ `updateArticulo` - Línea 166
- ❌ `deleteArticulo` - Línea 215

### 2. DEPARTAMENTOS (3 funciones)
- ❌ `createDepartamento` - Línea 310
- ❌ `updateDepartamento` - Línea 334
- ❌ `deleteDepartamento` - Línea 359

### 3. ROLES (3 funciones)
- ❌ `createRol` - Línea 573
- ❌ `updateRol` - Línea 597
- ❌ `deleteRol` - Línea 622

### 4. USUARIOS (3 funciones)
- ❌ `updateUsuarioDepartamento` - Línea 459
- ❌ `updateUsuarioRol` - Línea 484
- ❌ `updateUsuarioNombreCompleto` - Línea 509
- ⚠️ `sincronizarEmailUsuario` - Línea 647 (SOLO PARA SUPABASE - puede eliminarse)
- ⚠️ `updateUsuarioPassword` - Línea 708 (PARCIALMENTE ADAPTADA - usa Edge Function de Supabase)

### 5. ENTRADA DE MERCANCÍA (4 funciones)
- ❌ `getSiguienteNumeroEntrada` - Línea 863
- ❌ `createEntradaMercancia` - Línea 908
- ❌ `updateEntradaMercancia` - Línea 954
- ❌ `deleteEntradaMercancia` - Línea 1031

### 6. SOLICITUDES (6 funciones)
- ❌ `getSiguienteNumeroSolicitud` - Línea 1320
- ❌ `createSolicitud` - Línea 1373
- ❌ `updateSolicitud` - Línea 1418
- ❌ `deleteSolicitud` - Línea 1462
- ❌ `enviarSolicitud` - Línea 1484
- ❌ `rechazarSolicitud` - Línea 1669
- ❌ `aprobarSolicitudes` - Línea 1691
- ❌ `gestionarSolicitudAprobada` - Línea 1846
- ❌ `despacharSolicitudes` - Línea 2001

---

## 📁 ARCHIVOS QUE AÚN REFERENCIAN SUPABASE

### Archivos de Código Fuente:
1. **`src/services/crmService.js`**
   - Importa `supabase` desde `supabaseClient`
   - 231 referencias a métodos de Supabase
   - ~30 funciones CRUD aún usan Supabase directamente

2. **`src/services/authService.js`**
   - Importa `supabase` desde `supabaseClient`
   - Funciones `login`, `validateToken`, `logout`, `getSession` aún tienen código de Supabase
   - Ya está parcialmente adaptado (usa `isMySQL()` para condicionar)

3. **`src/lib/databaseAdapter.js`**
   - Importa `supabase` desde `supabaseClient`
   - Tiene funciones de adaptación que aún referencian Supabase
   - Necesario mantener para compatibilidad durante la migración

4. **`src/lib/supabaseClient.js`**
   - Archivo completo de configuración de Supabase
   - Puede eliminarse después de migrar completamente

5. **`src/config/database.js`**
   - Configuración de `DATABASE_TYPE`
   - Variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   - Puede simplificarse después de migrar

### Archivos de Configuración:
- **`package.json`**
  - Dependencia: `"@supabase/supabase-js": "^2.39.0"`
  - Puede eliminarse después de migrar completamente

### Archivos de Documentación/Guías:
- `guides/COMANDOS_SUPABASE_VERIFICACION.md`
- `guides/supabase-migration.sql`
- `guides/INSERT_DATOS_SUPABASE.sql`
- Estos pueden mantenerse como referencia histórica

---

## 🔧 FUNCIONES ESPECIALES QUE REQUIEREN ATENCIÓN

### 1. `sincronizarEmailUsuario` (Línea 647)
- **Propósito**: Sincronizar email entre tabla y Supabase Auth
- **Estado**: SOLO FUNCIONA CON SUPABASE
- **Acción**: Puede eliminarse completamente cuando se migre a MySQL, ya que MySQL no tiene Auth separado

### 2. `updateUsuarioPassword` (Línea 708)
- **Propósito**: Actualizar contraseña de usuario
- **Estado**: PARCIALMENTE ADAPTADA
- **Problema**: Usa Edge Function de Supabase (`/functions/v1/update-user-password`)
- **Acción**: Adaptar para usar el endpoint `/api/auth` con acción `updatePassword` (ya implementado en `api/auth.js`)

### 3. Funciones de "Siguiente Número"
- `getSiguienteNumeroEntrada` (Línea 863)
- `getSiguienteNumeroSolicitud` (Línea 1320)
- **Estado**: Usan Supabase directamente
- **Acción**: Adaptar para usar queries SQL con `MAX()` o contadores en MySQL

---

## 📋 RESUMEN DE FUNCIONES PENDIENTES

**Total de funciones CRUD pendientes: ~30 funciones**

### Por categoría:
- **Artículos**: 3 funciones
- **Departamentos**: 3 funciones
- **Roles**: 3 funciones
- **Usuarios**: 5 funciones (incluyendo sincronización y password)
- **Entrada de Mercancía**: 4 funciones
- **Solicitudes**: 9 funciones

---

## ✅ PLAN DE ACCIÓN PARA COMPLETAR LA MIGRACIÓN

### Fase 1: Migrar Funciones CRUD Básicas
1. ✅ Adaptar `createArticulo`, `updateArticulo`, `deleteArticulo`
2. ✅ Adaptar `createDepartamento`, `updateDepartamento`, `deleteDepartamento`
3. ✅ Adaptar `createRol`, `updateRol`, `deleteRol`
4. ✅ Adaptar `updateUsuarioDepartamento`, `updateUsuarioRol`, `updateUsuarioNombreCompleto`

### Fase 2: Migrar Funciones de Entrada de Mercancía
1. ✅ Adaptar `getSiguienteNumeroEntrada`
2. ✅ Adaptar `createEntradaMercancia`
3. ✅ Adaptar `updateEntradaMercancia` (requiere lógica de reversión de existencias)
4. ✅ Adaptar `deleteEntradaMercancia` (requiere lógica de reversión de existencias)

### Fase 3: Migrar Funciones de Solicitudes
1. ✅ Adaptar `getSiguienteNumeroSolicitud`
2. ✅ Adaptar `createSolicitud`
3. ✅ Adaptar `updateSolicitud`
4. ✅ Adaptar `deleteSolicitud`
5. ✅ Adaptar `enviarSolicitud` (mueve de `sum_solicitudes` a `sum_autorizar_solicitudes`)
6. ✅ Adaptar `rechazarSolicitud` (elimina de `sum_autorizar_solicitudes`)
7. ✅ Adaptar `aprobarSolicitudes` (mueve de `sum_autorizar_solicitudes` a `sum_solicitudes_aprobadas`)
8. ✅ Adaptar `gestionarSolicitudAprobada` (mueve de `sum_solicitudes_aprobadas` a `sum_solicitudes_gestionadas`)
9. ✅ Adaptar `despacharSolicitudes` (mueve de `sum_solicitudes_gestionadas` a `sum_solicitudes_despachadas` + actualiza existencias)

### Fase 4: Limpiar Código y Dependencias
1. ✅ Eliminar función `sincronizarEmailUsuario` (solo para Supabase)
2. ✅ Adaptar completamente `updateUsuarioPassword` para usar `/api/auth`
3. ✅ Eliminar importaciones de `supabase` en `crmService.js`
4. ✅ Simplificar `authService.js` eliminando código de Supabase
5. ✅ Eliminar `src/lib/supabaseClient.js`
6. ✅ Simplificar `src/config/database.js` (eliminar configuración de Supabase)
7. ✅ Eliminar dependencia `@supabase/supabase-js` de `package.json`
8. ✅ Actualizar `src/lib/databaseAdapter.js` para eliminar referencias a Supabase

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Lógica de Transacciones**: Algunas funciones (como `despacharSolicitudes`) realizan múltiples operaciones que deberían ser transaccionales. MySQL soporta transacciones, pero las API Routes actuales no las implementan.

2. **Actualización de Existencias**: Las funciones `updateEntradaMercancia`, `deleteEntradaMercancia` y `despacharSolicitudes` actualizan las existencias de artículos. Esta lógica debe mantenerse igual.

3. **Validaciones**: Las funciones CRUD tienen validaciones específicas (como unidades válidas en `updateArticulo`) que deben mantenerse.

4. **Códigos de Error**: Supabase usa códigos de error específicos (como `23505` para duplicados, `PGRST116` para "no rows"). MySQL usa códigos diferentes que deben mapearse.

5. **Autenticación**: `authService.js` aún tiene código de Supabase Auth que debe adaptarse completamente para MySQL.

---

## 🎯 CONCLUSIÓN

**Estado General**: ~50% migrado
- ✅ Todas las funciones de lectura están migradas
- ❌ Todas las funciones CRUD aún necesitan migración
- ⚠️ Algunas funciones especiales requieren atención específica

**Próximo Paso**: Comenzar con la Fase 1 (Funciones CRUD Básicas) y continuar secuencialmente.


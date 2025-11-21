# Estado Actual de la Migración Supabase → MySQL

## ✅ FUNCIONES COMPLETAMENTE MIGRADAS

### Funciones CRUD Básicas (13 funciones)
- ✅ `createArticulo`
- ✅ `updateArticulo`
- ✅ `deleteArticulo`
- ✅ `createDepartamento`
- ✅ `updateDepartamento`
- ✅ `deleteDepartamento`
- ✅ `createRol`
- ✅ `updateRol`
- ✅ `deleteRol`
- ✅ `updateUsuarioDepartamento`
- ✅ `updateUsuarioRol`
- ✅ `updateUsuarioNombreCompleto`
- ✅ `updateUsuarioPassword` (adaptada para usar `/api/auth`)

### Funciones de Lectura (16 funciones)
- ✅ Todas las funciones `get*` están migradas

### Endpoints API
- ✅ `api/auth.js` - Agregado caso `updatePassword`

---

## ⏳ FUNCIONES PENDIENTES DE MIGRAR

### Entrada de Mercancía (4 funciones)
- ❌ `getSiguienteNumeroEntrada`
- ❌ `createEntradaMercancia` (requiere actualizar existencias)
- ❌ `updateEntradaMercancia` (requiere revertir y aplicar existencias)
- ❌ `deleteEntradaMercancia` (requiere revertir existencias)

### Solicitudes (9 funciones)
- ❌ `getSiguienteNumeroSolicitud`
- ❌ `createSolicitud`
- ❌ `updateSolicitud`
- ❌ `deleteSolicitud`
- ❌ `enviarSolicitud` (mueve entre tablas)
- ❌ `rechazarSolicitud` (elimina de tabla)
- ❌ `aprobarSolicitudes` (mueve entre tablas)
- ❌ `gestionarSolicitudAprobada` (mueve entre tablas)
- ❌ `despacharSolicitudes` (mueve entre tablas + actualiza existencias)

### Funciones Especiales
- ⚠️ `sincronizarEmailUsuario` - Solo para Supabase, debe eliminarse o comentarse

---

## 📋 ARCHIVOS QUE AÚN REFERENCIAN SUPABASE

1. `src/services/crmService.js` - ~13 funciones CRUD pendientes
2. `src/services/authService.js` - Código parcial de Supabase Auth
3. `src/lib/databaseAdapter.js` - Referencias a Supabase (mantener para compatibilidad)
4. `src/lib/supabaseClient.js` - Puede eliminarse después
5. `src/config/database.js` - Configuración de Supabase (simplificar después)
6. `package.json` - Dependencia `@supabase/supabase-js`

---

## 🎯 PROGRESO GENERAL

**Funciones Migradas**: ~29 de ~42 funciones CRUD (~69%)
**Funciones de Lectura**: 100% migradas
**Funciones CRUD Pendientes**: ~13 funciones

---

## ⚠️ NOTAS IMPORTANTES

1. Las funciones de Entrada de Mercancía y Solicitudes requieren lógica de transacciones para mantener la integridad de las existencias.

2. Las funciones de flujo de Solicitudes (`enviarSolicitud`, `aprobarSolicitudes`, etc.) mueven registros entre múltiples tablas, lo que requiere cuidado especial.

3. `sincronizarEmailUsuario` solo funciona con Supabase Auth y debe eliminarse o comentarse cuando se complete la migración.

4. `authService.js` aún tiene código de Supabase Auth que debe adaptarse completamente.

---

## 🔄 PRÓXIMOS PASOS

1. Migrar funciones de Entrada de Mercancía
2. Migrar funciones de Solicitudes
3. Eliminar/comentar `sincronizarEmailUsuario`
4. Adaptar completamente `authService.js`
5. Limpiar referencias a Supabase
6. Eliminar dependencias de Supabase


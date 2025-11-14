# 🔧 Solución: Problemas con Roles y Permisos

## ❌ Problema Identificado

Los usuarios pueden acceder al sistema pero:
- No pueden crear solicitudes
- No pueden acceder a la mayoría de pantallas
- A pesar de tener rol de Administrador

## 🔍 Causa del Problema

El problema ocurre porque:
1. Los roles en la base de datos están en inglés (`Administrator`) pero el frontend espera español (`Administrador`)
2. El formato del usuario en `localStorage` no tiene los campos `roles` y `perfil` que espera `RequireRole`
3. Los usuarios que iniciaron sesión antes de la corrección tienen datos antiguos en `localStorage`

## ✅ Solución

### Paso 1: Cerrar Sesión y Volver a Iniciar

**IMPORTANTE:** Los usuarios deben cerrar sesión y volver a iniciar sesión para que se actualicen los roles.

1. Haz clic en tu nombre de usuario (esquina superior derecha)
2. Selecciona **"Cerrar Sesión"**
3. Vuelve a iniciar sesión con tu email y contraseña

Esto actualizará automáticamente los roles en el formato correcto.

### Paso 2: Verificar que Funcione

Después de iniciar sesión nuevamente:

1. Verifica que puedas ver tu rol en el Dashboard (debe decir "Administrador")
2. Intenta crear una nueva solicitud
3. Verifica que puedas acceder a todas las pantallas según tu rol

## 🔄 Cambios Realizados en el Código

### 1. Mapeo de Roles

Se agregó un mapeo automático de roles:
- `Administrator` → `Administrador`
- `Director` → `Director`
- `Encargado de suministro` → `Encargado de suministro`
- `Usuario` → `Usuario`

### 2. Formato del Usuario

Ahora el usuario se guarda con:
```javascript
{
  id: "...",
  email: "...",
  username: "...",
  rol: "Administrador",        // Para compatibilidad
  roles: ["Administrador"],     // Para RequireRole
  perfil: "Administrador",      // Para RequireRole
  departamento_id: 81,
  departamento: "..."
}
```

### 3. Validación Automática

El sistema ahora actualiza automáticamente los roles si detecta que faltan al validar el token.

## 🧪 Prueba Rápida

1. **Cierra sesión** completamente
2. **Limpia el localStorage** (opcional, pero recomendado):
   - Abre la consola del navegador (F12)
   - Ejecuta: `localStorage.clear()`
   - Recarga la página
3. **Inicia sesión** nuevamente
4. **Verifica** que puedas:
   - Ver tu rol como "Administrador"
   - Crear solicitudes
   - Acceder a todas las pantallas

## 📋 Roles y Permisos

### Administrador
- ✅ Acceso a todas las pantallas
- ✅ Gestión de artículos
- ✅ Gestión de departamentos
- ✅ Gestión de usuarios
- ✅ Autorizar solicitudes
- ✅ Gestionar solicitudes
- ✅ Despachar solicitudes
- ✅ Entrada de mercancía

### Director
- ✅ Autorizar solicitudes
- ✅ Ver solicitudes despachadas
- ❌ No puede gestionar artículos directamente

### Encargado de suministro
- ✅ Gestión de artículos
- ✅ Autorizar solicitudes
- ✅ Gestionar solicitudes
- ✅ Despachar solicitudes
- ✅ Entrada de mercancía
- ❌ No puede gestionar departamentos ni usuarios

### Usuario
- ✅ Crear solicitudes
- ✅ Ver sus propias solicitudes
- ❌ No puede acceder a otras funciones

## 🐛 Si Aún Tienes Problemas

### Error: "Debe tener un departamento asignado"

**Solución:**
1. Verifica que tu usuario tenga `departamento_id` en `sum_usuarios_departamentos`
2. Si no lo tiene, actualízalo en Supabase:
   ```sql
   UPDATE sum_usuarios_departamentos 
   SET departamento_id = 81 
   WHERE email = 'tu-email@indrhi.gob.do';
   ```
3. Cierra sesión y vuelve a iniciar

### Error: No puedo acceder a pantallas protegidas

**Solución:**
1. Verifica tu rol en Supabase:
   ```sql
   SELECT username, email, rol FROM sum_usuarios_departamentos;
   ```
2. Asegúrate de que el rol sea `Administrator` (en inglés en la BD)
3. Cierra sesión y vuelve a iniciar

### Los roles no se actualizan

**Solución:**
1. Limpia completamente el localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Recarga la página
3. Inicia sesión nuevamente

## ✅ Verificación Final

Después de cerrar sesión y volver a iniciar, verifica:

- [ ] Puedes ver tu rol en el Dashboard
- [ ] Puedes crear solicitudes
- [ ] Puedes acceder a "Artículos"
- [ ] Puedes acceder a "Departamentos" (si eres Administrador)
- [ ] Puedes acceder a "Usuarios" (si eres Administrador)
- [ ] Puedes acceder a "Autorizar Solicitudes"
- [ ] Puedes acceder a "Entrada de Mercancía"

---

**Nota:** Si después de cerrar sesión y volver a iniciar sigues teniendo problemas, verifica que los cambios en el código se hayan desplegado en Vercel (puede tomar unos minutos).


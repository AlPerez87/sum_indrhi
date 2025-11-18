# Configuración de Edge Function para Actualizar Contraseñas

## Problema Resuelto

El error "User not allowed" ocurría porque el código intentaba usar `supabase.auth.admin.updateUserById` desde el frontend, pero esta operación requiere permisos de administrador (service role key) que no están disponibles en el cliente del navegador por razones de seguridad.

## Solución Implementada

Se ha creado una **Edge Function de Supabase** llamada `update-user-password` que:
- Tiene acceso seguro a la service role key (solo en el servidor)
- Valida que el usuario esté autenticado
- Actualiza la contraseña de forma segura usando la API de administrador de Supabase

## Configuración Requerida

### 1. Verificar Variables de Entorno en Supabase

La Edge Function necesita acceso a las siguientes variables de entorno:

1. Ve a tu proyecto en **Supabase Dashboard**
2. Ve a **Edge Functions** → **Settings**
3. Asegúrate de que estén configuradas:
   - `SUPABASE_URL`: La URL de tu proyecto (ej: `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: La clave de servicio (service role key)

**⚠️ IMPORTANTE**: La `SUPABASE_SERVICE_ROLE_KEY` es muy sensible. Nunca la expongas en el frontend.

### 2. Configurar la Service Role Key como Secreto

**⚠️ IMPORTANTE**: Las Edge Functions de Supabase tienen acceso automático a `SUPABASE_URL`, pero necesitas configurar manualmente `SUPABASE_SERVICE_ROLE_KEY` como secreto.

1. Ve a **Settings** → **API** en Supabase Dashboard
2. Busca la sección **Project API keys**
3. Copia la **`service_role` key** (NO la `anon` key)
4. Ve a **Edge Functions** en el menú lateral
5. Haz clic en **Settings** (o el ícono de configuración)
6. Ve a la pestaña **Secrets**
7. Haz clic en **Add new secret**
8. Agrega:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (pega la service role key que copiaste)
9. Haz clic en **Save**

**Nota**: `SUPABASE_URL` está disponible automáticamente, no necesitas agregarla como secreto.

### 3. Verificar que la Edge Function Esté Desplegada

La Edge Function `update-user-password` ya debería estar desplegada. Para verificar:

1. Ve a **Edge Functions** en Supabase Dashboard
2. Deberías ver `update-user-password` en la lista
3. El estado debe ser **ACTIVE**

## Cómo Funciona

### Flujo de Actualización de Contraseña

1. **Frontend** (`CambiarPasswordAdminModal`):
   - El administrador ingresa la nueva contraseña
   - Llama a `crmService.updateUsuarioPassword(id, password)`

2. **Servicio** (`crmService.js`):
   - Obtiene el `user_id` del usuario desde `sum_usuarios_departamentos`
   - Obtiene el token de sesión del usuario autenticado
   - Hace una petición HTTP a la Edge Function

3. **Edge Function** (`update-user-password`):
   - Valida que el usuario esté autenticado
   - Usa la service role key para actualizar la contraseña
   - Retorna el resultado

## Pruebas

Para probar que funciona:

1. Inicia sesión como administrador
2. Ve a la sección de **Usuarios**
3. Selecciona un usuario y haz clic en **Cambiar Contraseña**
4. Ingresa una nueva contraseña
5. Debería actualizarse sin errores

## Solución de Problemas

### Error: "No autorizado"

**Causa**: El token de sesión no es válido o ha expirado.

**Solución**: 
- Cierra sesión y vuelve a iniciar sesión
- Verifica que estés autenticado correctamente

### Error: "Error al actualizar contraseña"

**Causa**: La Edge Function no puede acceder a la service role key.

**Solución**:
1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada en Edge Functions → Settings → Secrets
2. Asegúrate de usar la **service_role** key, no la **anon** key

### Error: "Configuración de Supabase no encontrada"

**Causa**: La variable `VITE_SUPABASE_URL` no está configurada.

**Solución**:
- Verifica que el archivo `.env` tenga `VITE_SUPABASE_URL` configurada
- Reinicia el servidor de desarrollo después de agregar variables de entorno

### La Edge Function no existe

Si necesitas volver a desplegarla, puedes usar el CLI de Supabase:

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular tu proyecto
supabase link --project-ref tu-project-ref

# Desplegar la función (si tienes el código localmente)
supabase functions deploy update-user-password
```

## Seguridad

✅ **Buenas prácticas implementadas**:
- La service role key nunca se expone al frontend
- Se valida que el usuario esté autenticado antes de actualizar
- La contraseña se valida (mínimo 6 caracteres)
- Los errores no exponen información sensible

⚠️ **Importante**:
- Nunca agregues la `SUPABASE_SERVICE_ROLE_KEY` al código del frontend
- Nunca la incluyas en archivos `.env` que se suban a Git
- Solo úsala en Edge Functions o en código del servidor

## Archivos Modificados

- `src/services/crmService.js`: Actualizado para usar la Edge Function
- Edge Function `update-user-password`: Creada y desplegada en Supabase


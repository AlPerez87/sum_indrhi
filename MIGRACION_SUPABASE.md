# 🚀 Guía de Migración a Supabase y Vercel

Esta guía te ayudará a migrar el Sistema de Suministros INDRHI de WordPress a Supabase y desplegarlo en Vercel.

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Migración de Datos](#migración-de-datos)
4. [Configuración del Frontend](#configuración-del-frontend)
5. [Despliegue en Vercel](#despliegue-en-vercel)
6. [Configuración de Usuarios](#configuración-de-usuarios)
7. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Prerrequisitos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com)
- Node.js 16+ instalado
- Git instalado

---

## 🗄️ Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `suministros-indrhi`
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Elige la región más cercana
4. Espera a que se cree el proyecto (2-3 minutos)

### Paso 2: Crear las Tablas

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en **"New Query"**
3. Copia y pega el contenido del archivo `supabase-migration.sql`
4. Haz clic en **"Run"** para ejecutar el script
5. Verifica que todas las tablas se hayan creado correctamente:
   - `sum_articulos`
   - `sum_departamentos`
   - `sum_usuarios_departamentos`
   - `sum_entrada_mercancia`
   - `sum_solicitudes`
   - `sum_autorizar_solicitudes`
   - `sum_solicitudes_aprobadas`
   - `sum_solicitudes_gestionadas`
   - `sum_solicitudes_despachadas`

### Paso 3: Obtener Credenciales de Supabase

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (clave pública)

Guarda estos valores, los necesitarás para configurar el frontend.

---

## 📊 Migración de Datos

### Opción A: Migración Manual (Recomendado para empezar)

1. Exporta los datos de MySQL usando phpMyAdmin o MySQL Workbench
2. Convierte los datos a formato CSV
3. En Supabase, ve a **Table Editor**
4. Para cada tabla:
   - Haz clic en **"Insert"** → **"Import data from CSV"**
   - Selecciona el archivo CSV correspondiente
   - Verifica que los datos se importaron correctamente

### Opción B: Script de Migración (Para grandes volúmenes)

Puedes crear un script Node.js que lea de MySQL y escriba en Supabase usando la API de Supabase.

---

## ⚙️ Configuración del Frontend

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio/frontend-indrhi
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de `frontend-indrhi/`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ENVIRONMENT=development
```

**⚠️ IMPORTANTE**: No subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

### Paso 4: Probar Localmente

```bash
npm run dev
```

La aplicación debería estar disponible en `http://localhost:5173`

---

## 🚀 Despliegue en Vercel

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los cambios estén commiteados:

```bash
git add .
git commit -m "Migración a Supabase completada"
git push origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite

### Paso 3: Configurar Variables de Entorno en Vercel

1. En la configuración del proyecto, ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
   - `VITE_ENVIRONMENT`: `production`

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el despliegue (2-3 minutos)
3. Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

---

## 👥 Configuración de Usuarios

### Crear Usuarios en Supabase

1. Ve a **Authentication** → **Users** en Supabase
2. Haz clic en **"Add User"** → **"Create New User"**
3. Completa:
   - **Email**: `usuario@indrhi.gob.do`
   - **Password**: Genera una contraseña segura
   - **Auto Confirm User**: ✅ (marcado)

### Sincronizar con sum_usuarios_departamentos

Después de crear un usuario en Supabase Auth, debes agregarlo a la tabla `sum_usuarios_departamentos`:

1. Ve a **Table Editor** → `sum_usuarios_departamentos`
2. Haz clic en **"Insert"** → **"Insert row"**
3. Completa:
   - **user_id**: El UUID del usuario creado (lo encuentras en Authentication → Users)
   - **username**: Nombre de usuario
   - **email**: El mismo email del usuario
   - **rol**: `Administrator`, `Director`, `Encargado de suministro`, o `Usuario`
   - **departamento_id**: ID del departamento (opcional)

### Roles Disponibles

- **Administrator**: Acceso total al sistema
- **Director**: Puede autorizar solicitudes
- **Encargado de suministro**: Gestión operativa
- **Usuario**: Crear solicitudes

---

## 🔒 Configuración de Seguridad

### Row Level Security (RLS)

Las políticas RLS ya están configuradas en el script SQL. Sin embargo, puedes ajustarlas según tus necesidades:

1. Ve a **Authentication** → **Policies** en Supabase
2. Revisa y ajusta las políticas según sea necesario

### Recomendaciones de Seguridad

1. **Nunca** expongas la clave `service_role` en el frontend
2. Usa solo la clave `anon` en el frontend
3. Configura políticas RLS apropiadas
4. Revisa regularmente los logs de autenticación

---

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución**: Verifica que las variables de entorno estén configuradas correctamente en:
- Archivo `.env` local
- Variables de entorno en Vercel

### Error: "User not found" al hacer login

**Solución**: 
1. Verifica que el usuario exista en Supabase Auth
2. Verifica que el usuario esté en `sum_usuarios_departamentos`
3. Asegúrate de usar el email correcto

### Error de CORS

**Solución**: 
1. Ve a **Settings** → **API** en Supabase
2. Agrega tu dominio de Vercel a la lista de URLs permitidas

### Las solicitudes no se muestran

**Solución**: 
1. Verifica las políticas RLS en Supabase
2. Asegúrate de que el usuario tenga los permisos correctos
3. Revisa la consola del navegador para errores específicos

### Error al actualizar contraseña

**Solución**: 
- La función `updateUsuarioPassword` requiere permisos de administrador en Supabase
- Considera usar Edge Functions para esta funcionalidad

---

## 📝 Notas Importantes

1. **Migración de Contraseñas**: Las contraseñas de WordPress no se pueden migrar directamente. Los usuarios necesitarán crear nuevas contraseñas o usar "Forgot Password" en Supabase.

2. **IDs de Usuarios**: Los IDs cambian de MySQL (INT) a Supabase (UUID). Asegúrate de actualizar todas las referencias.

3. **Campos JSON**: Los campos `articulos_cantidades` se almacenan como TEXT en Supabase. El código los parsea automáticamente.

4. **Números de Solicitud**: El sistema genera números automáticamente. Asegúrate de que la lógica de generación funcione correctamente.

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs en Supabase Dashboard
2. Revisa los logs en Vercel Dashboard
3. Revisa la consola del navegador para errores
4. Consulta la [documentación de Supabase](https://supabase.com/docs)
5. Consulta la [documentación de Vercel](https://vercel.com/docs)

---

## ✅ Checklist de Migración

- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas usando `supabase-migration.sql`
- [ ] Datos migrados desde MySQL
- [ ] Variables de entorno configuradas localmente
- [ ] Aplicación funciona en desarrollo
- [ ] Repositorio subido a GitHub
- [ ] Proyecto conectado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Despliegue exitoso en Vercel
- [ ] Usuarios creados en Supabase Auth
- [ ] Usuarios sincronizados en `sum_usuarios_departamentos`
- [ ] Pruebas de funcionalidad completadas
- [ ] Políticas RLS revisadas y ajustadas

---

**¡Migración completada! 🎉**

Tu sistema ahora está corriendo en Supabase y Vercel.


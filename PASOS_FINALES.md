# ✅ Pasos Finales para Completar la Configuración

## 🎯 Estado Actual

✅ Proyecto creado en Supabase  
✅ Tablas creadas en Supabase  
✅ Repositorio subido a Vercel  
✅ Credenciales disponibles  

## 📋 Pasos Restantes

### 1. Configurar Variables de Entorno en Vercel

**CRÍTICO:** Debes configurar estas variables en Vercel para que la aplicación funcione.

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas 3 variables:

```
VITE_SUPABASE_URL = https://uracpvmatedurfdsylxd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYWNwdm1hdGVkdXJmZHN5bHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTE5ODksImV4cCI6MjA3ODYyNzk4OX0.Z-Aiba6NKouJRR_hqsJzhWLwVhXUGIVs99i--muENXc
VITE_ENVIRONMENT = production
```

5. Marca las 3 opciones: ✅ Production, ✅ Preview, ✅ Development
6. Haz clic en **Save**
7. **IMPORTANTE:** Ve a **Deployments** y haz clic en **Redeploy** para aplicar los cambios

📖 **Guía detallada:** Ver `CONFIGURACION_VERCEL.md`

---

### 2. Crear Archivo .env Local (Para Desarrollo)

Crea un archivo `.env` en la carpeta `frontend-indrhi/` con este contenido:

```env
VITE_SUPABASE_URL=https://uracpvmatedurfdsylxd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyYWNwdm1hdGVkdXJmZHN5bHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTE5ODksImV4cCI6MjA3ODYyNzk4OX0.Z-Aiba6NKouJRR_hqsJzhWLwVhXUGIVs99i--muENXc
VITE_ENVIRONMENT=development
```

⚠️ **IMPORTANTE:** Este archivo NO se subirá a GitHub (está en .gitignore)

---

### 3. Migrar Datos a Supabase

Tienes dos opciones:

#### Opción A: Migración Manual (Recomendado para empezar)

1. Ve a **Supabase Dashboard** → **Table Editor**
2. Para cada tabla, haz clic en **Insert** → **Insert row**
3. Inserta los datos manualmente desde tu archivo SQL

#### Opción B: Migración por SQL

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Adapta las sentencias INSERT de tu archivo `suministros_indrhi.sql`
3. Ejecuta los INSERT statements

📖 **Guía detallada:** Ver `MIGRACION_DATOS.md`

**Datos a migrar:**
- ✅ `sum_articulos` (242 registros)
- ✅ `sum_departamentos` (247 registros)
- ✅ `sum_entrada_mercancia` (2 registros)
- ✅ `sum_solicitudes` (5 registros)
- ✅ `sum_autorizar_solicitudes` (2 registros)
- ✅ `sum_solicitudes_aprobadas` (1 registro)
- ✅ `sum_solicitudes_despachadas` (2 registros)
- ✅ `sum_solicitudes_gestionadas` (0 registros)

---

### 4. Crear Usuarios en Supabase Auth

**⚠️ CRÍTICO:** Los usuarios deben crearse en Supabase Auth primero.

1. Ve a **Supabase Dashboard** → **Authentication** → **Users**
2. Haz clic en **Add User** → **Create New User**
3. Para cada usuario del sistema:
   - **Email:** `usuario@indrhi.gob.do`
   - **Password:** Genera una contraseña segura
   - **Auto Confirm User:** ✅ (marcado)
   - Haz clic en **Create User**

4. **Después de crear cada usuario:**
   - Copia el **UUID** del usuario creado
   - Ve a **Table Editor** → `sum_usuarios_departamentos`
   - Inserta un registro con:
     - `user_id`: UUID del usuario (pegar aquí)
     - `username`: Nombre de usuario
     - `email`: Email del usuario
     - `rol`: `Administrator`, `Director`, `Encargado de suministro`, o `Usuario`
     - `departamento_id`: ID del departamento (opcional)

**Usuarios del sistema actual:**
- App (ing.aperezp@gmail.com) - Administrator
- TIC (tic@indrhi.gob.do) - Administrator
- emedina (emedina@indrhi.gob.do) - Administrator
- administrativo (administrativo@indrhi.gob.do) - Departamento_administrativo

---

### 5. Verificar la Conexión

#### En Desarrollo Local:

```bash
cd frontend-indrhi
npm install
npm run dev
```

1. Abre `http://localhost:5173`
2. Intenta hacer login con un usuario creado
3. Verifica que se muestren los datos

#### En Producción (Vercel):

1. Espera a que termine el redespliegue después de agregar las variables
2. Visita tu URL de Vercel
3. Intenta hacer login
4. Verifica que todo funcione

---

### 6. Configurar CORS en Supabase (Si es necesario)

Si tienes errores de CORS:

1. Ve a **Supabase Dashboard** → **Settings** → **API**
2. En **Allowed URLs**, agrega:
   - `http://localhost:5173` (para desarrollo)
   - `https://tu-proyecto.vercel.app` (tu URL de Vercel)
3. Haz clic en **Save**

---

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en Vercel
- [ ] Archivo `.env` creado localmente
- [ ] Datos migrados a Supabase
- [ ] Usuarios creados en Supabase Auth
- [ ] Usuarios sincronizados en `sum_usuarios_departamentos`
- [ ] Aplicación probada en desarrollo local
- [ ] Aplicación redesplegada en Vercel
- [ ] Aplicación probada en producción
- [ ] CORS configurado (si es necesario)

---

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"

**Solución:** 
- Verifica que las variables estén en Vercel
- Haz un **Redeploy** después de agregar las variables
- Verifica que el archivo `.env` exista localmente

### Error de CORS

**Solución:**
- Agrega tu dominio de Vercel a las URLs permitidas en Supabase
- Ver `CONFIGURACION_VERCEL.md` sección 6

### No puedo hacer login

**Solución:**
- Verifica que el usuario exista en Supabase Auth
- Verifica que el usuario esté en `sum_usuarios_departamentos`
- Verifica que uses el email correcto (no username)

### Los datos no se muestran

**Solución:**
- Verifica que los datos estén migrados
- Revisa las políticas RLS en Supabase
- Verifica la consola del navegador para errores

---

## 📞 Recursos

- **Guía de configuración Vercel:** `CONFIGURACION_VERCEL.md`
- **Guía de migración de datos:** `MIGRACION_DATOS.md`
- **Guía completa de migración:** `MIGRACION_SUPABASE.md`

---

**¡Una vez completados estos pasos, tu aplicación estará completamente funcional! 🎉**


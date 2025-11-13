# 🧹 Guía de Limpieza de Archivos

## 📁 Archivos a Mantener (Importantes)

Estos archivos son útiles para referencia futura y mantenimiento:

### Documentación Esencial
- ✅ `README.md` - Documentación principal del proyecto
- ✅ `MIGRACION_SUPABASE.md` - Guía completa de migración (referencia)
- ✅ `MIGRACION_DATOS.md` - Guía de migración de datos (referencia)
- ✅ `CONFIGURACION_VERCEL.md` - Configuración de Vercel (referencia)
- ✅ `ENV_SETUP.md` - Configuración de variables de entorno
- ✅ `CHECKLIST_FINAL.md` - Checklist de verificación

### Scripts SQL
- ✅ `supabase-migration.sql` - Script de creación de tablas (referencia)
- ✅ `INSERT_DATOS_SUPABASE.sql` - Script de inserción de datos (referencia, ya ejecutado)

### Configuración
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.gitignore` - Archivos a ignorar en Git
- ✅ `package.json` - Dependencias del proyecto

## 🗑️ Archivos que Puedes Eliminar (Opcional)

Estos archivos son temporales o ya no son necesarios:

### Archivos Temporales
- ⚠️ `RESUMEN_MIGRACION.md` - Resumen temporal (ya no necesario)
- ⚠️ `PASOS_FINALES.md` - Checklist temporal (reemplazado por CHECKLIST_FINAL.md)
- ⚠️ `.env.local.example` - Ejemplo de variables (ya tienes .env real)

### Nota sobre INSTRUCCIONES_USUARIOS.md
- ✅ **Mantener** si planeas agregar más usuarios en el futuro
- ⚠️ **Eliminar** si ya no necesitas agregar usuarios

## 📝 Recomendación

### Mantener para Producción:
```
frontend-indrhi/
├── README.md
├── MIGRACION_SUPABASE.md (referencia)
├── CHECKLIST_FINAL.md
├── CONFIGURACION_VERCEL.md (referencia)
├── ENV_SETUP.md
├── supabase-migration.sql (referencia)
├── INSERT_DATOS_SUPABASE.sql (referencia)
├── vercel.json
├── .gitignore
├── package.json
└── src/ (todo el código fuente)
```

### Puedes Eliminar (Opcional):
- `RESUMEN_MIGRACION.md`
- `PASOS_FINALES.md`
- `.env.local.example` (si existe)
- `INSTRUCCIONES_USUARIOS.md` (si ya no agregarás usuarios)

## ⚠️ IMPORTANTE

**NO elimines:**
- Archivos en `src/` (código fuente)
- `package.json` (dependencias)
- `.gitignore` (configuración de Git)
- `vercel.json` (configuración de Vercel)
- Archivos `.env` (contienen credenciales)

## 🎯 Siguiente Paso

Después de limpiar archivos innecesarios:

1. **Migrar datos restantes** (entradas, solicitudes, etc.)
2. **Probar todas las funcionalidades**
3. **Verificar que todo funcione en producción**


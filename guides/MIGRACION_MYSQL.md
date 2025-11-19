# Guía de Migración de Supabase (PostgreSQL) a MySQL

## 📋 Resumen

Esta guía describe cómo migrar el sistema de Supabase (PostgreSQL) a MySQL sin afectar la estructura completa del sistema actual. Se utiliza un patrón de adaptador que permite cambiar entre bases de datos fácilmente.

## 🎯 Estrategia de Migración

### Fase 1: Preparación (Sin afectar el sistema actual)
- ✅ Crear scripts SQL para MySQL
- ✅ Implementar capa de abstracción (Database Adapter)
- ✅ Configurar variables de entorno para seleccionar BD

### Fase 2: Implementación Paralela
- ✅ Crear cliente MySQL
- ✅ Adaptar servicios para usar el adaptador
- ✅ Implementar autenticación para MySQL

### Fase 3: Migración de Datos
- ✅ Script de exportación desde Supabase
- ✅ Script de importación a MySQL
- ✅ Validación de datos

### Fase 4: Cambio de Producción
- ✅ Cambiar variable de entorno
- ✅ Probar en producción
- ✅ Monitorear errores

## ⚠️ Consideraciones Importantes

### Diferencias Clave PostgreSQL vs MySQL

1. **Tipos de Datos**:
   - PostgreSQL `SERIAL` → MySQL `AUTO_INCREMENT`
   - PostgreSQL `UUID` → MySQL `CHAR(36)` o `BINARY(16)`
   - PostgreSQL `TEXT` → MySQL `TEXT` o `LONGTEXT`
   - PostgreSQL `BOOLEAN` → MySQL `TINYINT(1)` o `BOOLEAN`

2. **Autenticación**:
   - Supabase Auth → Sistema de autenticación propio con JWT
   - `auth.users` → Tabla `usuarios` en MySQL

3. **Row Level Security (RLS)**:
   - PostgreSQL RLS → Implementar en lógica de aplicación o triggers MySQL

4. **Funciones y Triggers**:
   - PostgreSQL PL/pgSQL → MySQL Stored Procedures/Triggers

## 📁 Estructura de Archivos Creados

```
guides/
├── MIGRACION_MYSQL.md                    # Esta guía
├── mysql-migration.sql                    # Script SQL para MySQL
└── INSTRUCCIONES_MIGRACION_MYSQL.md      # Instrucciones detalladas

scripts/
└── migrate-data-to-mysql.js               # Script de migración de datos

src/
├── config/
│   └── database.js                       # Configuración de BD
├── lib/
│   ├── supabaseClient.js                 # Cliente Supabase (mantener)
│   ├── mysqlClient.js                    # Cliente MySQL (nuevo)
│   ├── mysqlAuth.js                       # Autenticación MySQL (nuevo)
│   └── databaseAdapter.js                # Adaptador de BD (nuevo)
└── services/
    ├── authService.js                     # Adaptado para usar adapter
    └── crmService.js                      # Usa Supabase directamente (adaptar gradualmente)
```

## ✅ Estado de la Migración

### Completado ✅
- [x] Script SQL para MySQL creado
- [x] Cliente MySQL implementado
- [x] Sistema de autenticación MySQL implementado
- [x] Adaptador de base de datos creado
- [x] `authService` adaptado para ambas BD
- [x] Script de migración de datos creado
- [x] Documentación completa creada

### Pendiente (Opcional) 🔄
- [ ] Adaptar `crmService` para usar el adaptador (puede hacerse gradualmente)
- [ ] Probar migración completa en entorno de desarrollo
- [ ] Implementar sistema de permisos para MySQL (equivalente a RLS)

## 🔧 Pasos de Implementación

### Paso 1: Preparación
1. Instalar dependencias: `npm install`
2. Configurar variables de entorno en `.env`
3. Crear base de datos MySQL ejecutando `guides/mysql-migration.sql`

### Paso 2: Migración de Datos
1. Ejecutar script de migración: `node scripts/migrate-data-to-mysql.js`
2. Verificar datos migrados

### Paso 3: Cambiar a MySQL
1. Cambiar `VITE_DATABASE_TYPE=mysql` en `.env`
2. Reiniciar aplicación
3. Probar funcionalidades

### Paso 4: Verificación
1. Probar login
2. Probar CRUD de todas las entidades
3. Verificar que los datos se guardan correctamente

## 📝 Notas Importantes

### Compatibilidad hacia atrás
- El sistema sigue funcionando con Supabase si `VITE_DATABASE_TYPE=supabase`
- Puedes cambiar entre ambas bases de datos cambiando una variable de entorno
- Los datos en Supabase no se afectan durante la migración

### Autenticación
- **Supabase**: Usa Supabase Auth (JWT gestionado por Supabase)
- **MySQL**: Usa JWT propio con bcrypt para contraseñas
- Los usuarios migrados tendrán contraseña temporal: `TempPassword123!`

### Adaptación Gradual
- `authService` ya está completamente adaptado
- `crmService` puede seguir usando Supabase directamente o adaptarse gradualmente
- El adaptador está listo para usar cuando se necesite

## 🔄 Revertir Cambios

Si necesitas volver a Supabase:
1. Cambiar `VITE_DATABASE_TYPE=supabase` en `.env`
2. Reiniciar la aplicación
3. Todo volverá a funcionar con Supabase

## 📚 Documentación Adicional

- `guides/INSTRUCCIONES_MIGRACION_MYSQL.md` - Instrucciones paso a paso detalladas
- `guides/mysql-migration.sql` - Script SQL completo para MySQL
- `scripts/migrate-data-to-mysql.js` - Script de migración de datos


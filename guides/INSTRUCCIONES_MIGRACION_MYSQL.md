# Instrucciones Detalladas para Migración a MySQL

## 📋 Prerrequisitos

1. **MySQL instalado y corriendo** (versión 5.7+ o 8.0+)
   - Si usas XAMPP, MySQL viene incluido
2. **MySQL Workbench instalado** (recomendado para gestión visual)
3. **Node.js instalado** (versión 16+)
4. **Acceso a Supabase** (para exportar datos)
5. **Backup completo** de la base de datos actual

## 🔧 Paso 0: Configurar MySQL Workbench

**⚠️ IMPORTANTE**: Si aún no has configurado MySQL Workbench, sigue primero esta guía:

👉 **[Ver guía: CONFIGURAR_MYSQL_WORKBENCH.md](./CONFIGURAR_MYSQL_WORKBENCH.md)**

Esta guía te ayudará a:
- Conectar MySQL Workbench a tu servidor MySQL
- Crear la base de datos `sum_indrhi`
- Ejecutar el script SQL de migración
- Verificar que todo esté configurado correctamente

## 🔧 Paso 1: Instalar Dependencias

```bash
npm install mysql2 bcryptjs jsonwebtoken dotenv
```

## 🔧 Paso 2: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env`:

```env
# Supabase (para migración de datos)
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon

# MySQL
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=tu-password
VITE_MYSQL_DATABASE=sum_indrhi

# JWT Secret (cambiar en producción)
VITE_JWT_SECRET=tu-secret-key-muy-segura-aqui

# Tipo de base de datos (supabase o mysql)
VITE_DATABASE_TYPE=supabase  # Cambiar a 'mysql' después de migrar
```

## 🔧 Paso 3: Crear Base de Datos MySQL

### Opción A: Usando MySQL Workbench (Recomendado)

1. Abre **MySQL Workbench** y conéctate a tu servidor
2. Abre una nueva pestaña SQL (`File` → `New Query Tab` o `Ctrl + T`)
3. Abre el archivo `guides/mysql-migration.sql` en un editor de texto
4. Copia **TODO** el contenido del archivo
5. Pégalo en la pestaña SQL de MySQL Workbench
6. Haz clic en **⚡ Execute** (o `Ctrl + Shift + Enter`)
7. Verifica que no haya errores en el panel de resultados
8. Refresca el panel izquierdo (`Refresh All`) y verifica que la base de datos `sum_indrhi` se creó con todas las tablas

### Opción B: Usando Línea de Comandos

1. Abre una terminal/consola
2. Conecta a MySQL:
```bash
mysql -u root -p
```

3. Ejecuta el script de migración:
```bash
mysql -u root -p < guides/mysql-migration.sql
```

O ejecuta el SQL manualmente desde un cliente MySQL.

## 🔧 Paso 4: Probar Conexión (Opcional pero Recomendado)

Antes de migrar datos, prueba que la conexión funcione:

```bash
node test-mysql-connection.js
```

Este script verificará:
- ✅ Que la conexión a MySQL funcione
- ✅ Que la base de datos exista
- ✅ Que todas las tablas estén creadas
- ✅ Que puedas ejecutar queries

Si hay errores, el script te indicará qué corregir.

## 🔧 Paso 5: Migrar Datos

**⚠️ IMPORTANTE**: Haz un backup completo antes de migrar.

```bash
node scripts/migrate-data-to-mysql.js
```

Este script:
- Conecta a Supabase y MySQL
- Migra todas las tablas en orden
- Maneja transformaciones de datos necesarias
- Muestra progreso y errores

## 🔧 Paso 6: Verificar Datos Migrados

Conecta a MySQL y verifica:

```sql
USE sum_indrhi;

-- Verificar conteos
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'sum_articulos', COUNT(*) FROM sum_articulos
UNION ALL
SELECT 'sum_departamentos', COUNT(*) FROM sum_departamentos
UNION ALL
SELECT 'sum_usuarios_departamentos', COUNT(*) FROM sum_usuarios_departamentos
UNION ALL
SELECT 'sum_solicitudes', COUNT(*) FROM sum_solicitudes;

-- Verificar relaciones
SELECT 
    u.id,
    u.email,
    ud.username,
    ud.departamento_id,
    d.departamento
FROM usuarios u
LEFT JOIN sum_usuarios_departamentos ud ON u.id = ud.user_id
LEFT JOIN sum_departamentos d ON ud.departamento_id = d.id
LIMIT 10;
```

## 🔧 Paso 7: Cambiar a MySQL en la Aplicación

Una vez verificados los datos, cambia la variable de entorno:

```env
VITE_DATABASE_TYPE=mysql
```

## 🔧 Paso 8: Probar la Aplicación

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Prueba:
   - Login de usuarios
   - Crear/editar/eliminar artículos
   - Crear solicitudes
   - Todas las funcionalidades principales

## ⚠️ Consideraciones Importantes

### Autenticación

- **Supabase**: Usa Supabase Auth
- **MySQL**: Usa JWT con bcrypt para contraseñas

Los usuarios migrados tendrán contraseña temporal: `TempPassword123!`

**Debes cambiar las contraseñas después del primer login.**

### UUID vs INT

- **Supabase**: Usa UUID para `user_id`
- **MySQL**: Usa INT AUTO_INCREMENT

El script de migración maneja esta conversión, pero verifica que los mapeos sean correctos.

### Row Level Security (RLS)

- **Supabase**: RLS nativo de PostgreSQL
- **MySQL**: Implementado en lógica de aplicación

Asegúrate de que los permisos funcionen correctamente.

## 🔄 Revertir a Supabase

Si necesitas volver a Supabase:

1. Cambia la variable de entorno:
```env
VITE_DATABASE_TYPE=supabase
```

2. Reinicia la aplicación

Los datos en Supabase no se afectan durante la migración.

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs de migración
2. Revisa las relaciones de foreign keys
3. Verifica que todas las tablas se crearon correctamente
4. Asegúrate de que las variables de entorno estén correctas

## ✅ Checklist de Migración

- [ ] Backup completo de Supabase
- [ ] MySQL instalado y corriendo
- [ ] Base de datos MySQL creada
- [ ] Scripts SQL ejecutados
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Datos migrados
- [ ] Datos verificados
- [ ] Aplicación probada con MySQL
- [ ] Contraseñas de usuarios cambiadas
- [ ] Documentación actualizada


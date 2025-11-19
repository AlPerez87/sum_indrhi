# Pasos Siguientes - Migración a MySQL

## ✅ Paso Completado

- [x] Conexión a MySQL verificada exitosamente

## 📋 Próximos Pasos

### Paso 1: Verificar que las Tablas Estén Creadas

El script de prueba debería haber verificado esto, pero asegúrate de que todas las tablas estén creadas:

**En MySQL Workbench:**
1. Expande la base de datos `sum_indrhi` en el panel izquierdo
2. Expande la carpeta **Tables**
3. Verifica que existan estas 11 tablas:
   - ✅ `usuarios`
   - ✅ `sum_articulos`
   - ✅ `sum_departamentos`
   - ✅ `sum_roles`
   - ✅ `sum_usuarios_departamentos`
   - ✅ `sum_entrada_mercancia`
   - ✅ `sum_solicitudes`
   - ✅ `sum_autorizar_solicitudes`
   - ✅ `sum_solicitudes_aprobadas`
   - ✅ `sum_solicitudes_gestionadas`
   - ✅ `sum_solicitudes_despachadas`

**Si faltan tablas:**
1. Abre `guides/mysql-migration.sql` en un editor de texto
2. Copia TODO el contenido
3. En MySQL Workbench, abre una nueva pestaña SQL (`Ctrl + T`)
4. Pega el contenido y ejecuta (`Ctrl + Shift + Enter`)

### Paso 2: Preparar para Migrar Datos

Antes de migrar datos, asegúrate de tener:

1. **Backup de Supabase** (opcional pero recomendado)
   - Exporta los datos importantes desde Supabase Dashboard si es necesario

2. **Variables de entorno configuradas** en `.env`:
```env
# Supabase (para migración de datos)
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase

# MySQL (ya configurado)
VITE_MYSQL_HOST=127.0.0.1
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=
VITE_MYSQL_DATABASE=sum_indrhi

# Mantener Supabase por ahora
VITE_DATABASE_TYPE=supabase
```

### Paso 3: Migrar Datos desde Supabase a MySQL

**⚠️ IMPORTANTE**: Este paso copiará datos de Supabase a MySQL. Los datos en Supabase NO se eliminan.

Ejecuta el script de migración:

```bash
node scripts/migrate-data-to-mysql.js
```

Este script:
- Conectará a Supabase y MySQL
- Migrará todas las tablas en orden
- Mostrará progreso y errores
- Los usuarios tendrán contraseña temporal: `TempPassword123!`

**Tiempo estimado**: Depende de la cantidad de datos (generalmente 1-5 minutos)

### Paso 4: Verificar Datos Migrados

**En MySQL Workbench**, ejecuta estas queries para verificar:

```sql
-- Ver conteos de registros
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'sum_articulos', COUNT(*) FROM sum_articulos
UNION ALL
SELECT 'sum_departamentos', COUNT(*) FROM sum_departamentos
UNION ALL
SELECT 'sum_usuarios_departamentos', COUNT(*) FROM sum_usuarios_departamentos
UNION ALL
SELECT 'sum_roles', COUNT(*) FROM sum_roles
UNION ALL
SELECT 'sum_solicitudes', COUNT(*) FROM sum_solicitudes;

-- Ver algunos usuarios migrados
SELECT 
    u.id,
    u.email,
    ud.username,
    ud.nombre_completo,
    d.departamento,
    r.nombre as rol
FROM usuarios u
LEFT JOIN sum_usuarios_departamentos ud ON u.id = ud.user_id
LEFT JOIN sum_departamentos d ON ud.departamento_id = d.id
LEFT JOIN sum_roles r ON ud.rol_id = r.id
LIMIT 10;
```

Compara los conteos con los datos en Supabase para asegurarte de que todo se migró correctamente.

### Paso 5: Probar la Aplicación con MySQL (Opcional - Prueba)

Antes de cambiar completamente a MySQL, puedes probar:

1. **Cambiar temporalmente** en `.env`:
```env
VITE_DATABASE_TYPE=mysql
```

2. **Reiniciar el servidor de desarrollo**:
```bash
npm run dev
```

3. **Probar funcionalidades**:
   - Login con un usuario migrado (contraseña temporal: `TempPassword123!`)
   - Ver artículos
   - Ver departamentos
   - Crear/editar/eliminar registros
   - Verificar que todo funcione correctamente

4. **Si hay problemas**, vuelve a Supabase:
```env
VITE_DATABASE_TYPE=supabase
```

### Paso 6: Cambiar Contraseñas de Usuarios Migrados

**⚠️ IMPORTANTE**: Los usuarios migrados tienen contraseña temporal `TempPassword123!`

**Opción A: Cambiar desde la aplicación**
1. Inicia sesión con un usuario usando la contraseña temporal
2. Ve a configuración de perfil
3. Cambia la contraseña

**Opción B: Cambiar desde MySQL Workbench** (requiere hashear contraseñas)

```sql
-- Esto requiere hashear la contraseña primero con bcrypt
-- Mejor usar la aplicación o el script de cambio de contraseña
```

**Opción C: Usar el sistema de cambio de contraseña del admin**
- Si tienes acceso de administrador, puedes cambiar contraseñas desde la interfaz

### Paso 7: Cambiar a MySQL en Producción

Cuando estés seguro de que todo funciona:

1. **Cambiar en `.env`**:
```env
VITE_DATABASE_TYPE=mysql
```

2. **Reiniciar la aplicación**

3. **Monitorear** que todo funcione correctamente

4. **Mantener Supabase como respaldo** (opcional)
   - Puedes mantener ambos sistemas corriendo
   - Cambiar entre ellos cambiando `VITE_DATABASE_TYPE`

## 🔄 Revertir a Supabase (Si es Necesario)

Si necesitas volver a Supabase en cualquier momento:

1. Cambiar en `.env`:
```env
VITE_DATABASE_TYPE=supabase
```

2. Reiniciar la aplicación

Los datos en Supabase no se afectan durante la migración, así que puedes volver fácilmente.

## ✅ Checklist Final

- [ ] Todas las tablas creadas en MySQL
- [ ] Variables de entorno configuradas
- [ ] Datos migrados desde Supabase
- [ ] Datos verificados en MySQL Workbench
- [ ] Aplicación probada con MySQL (opcional)
- [ ] Contraseñas de usuarios cambiadas
- [ ] Cambio a MySQL en producción (cuando estés listo)

## 📞 Si Encuentras Problemas

1. **Error en migración de datos**: Verifica logs del script
2. **Error de conexión**: Verifica variables de entorno
3. **Datos faltantes**: Re-ejecuta el script de migración
4. **Problemas de autenticación**: Verifica que los usuarios se migraron correctamente

## 💡 Tips

- Mantén un backup de Supabase antes de migrar
- Prueba primero en desarrollo antes de producción
- Puedes mantener ambos sistemas corriendo durante la transición
- Los datos en Supabase no se eliminan, solo se copian a MySQL


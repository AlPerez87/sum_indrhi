# 📊 Guía de Migración de Datos a Supabase

Esta guía te ayudará a migrar los datos desde MySQL a Supabase.

## 📋 Prerrequisitos

- Acceso a la base de datos MySQL original
- Acceso al dashboard de Supabase
- Datos exportados desde MySQL (archivo SQL proporcionado)

## 🔄 Opción 1: Migración Manual (Recomendado para empezar)

### Paso 1: Preparar los Datos

Ya tienes el archivo `suministros_indrhi.sql` con todos los datos. Necesitamos adaptarlo para PostgreSQL.

### Paso 2: Migrar Tabla por Tabla

#### 2.1 Migrar `sum_articulos`

1. Ve a **Supabase Dashboard** → **Table Editor** → `sum_articulos`
2. Haz clic en **"Insert"** → **"Insert row"**
3. Inserta los datos manualmente o usa el siguiente método:

**Método SQL:**
```sql
-- Ejecuta esto en SQL Editor de Supabase
INSERT INTO sum_articulos (codigo, descripcion, existencia, cantidad_minima, valor, unidad)
VALUES 
('01-001', 'AGENDAS DE ESCRITORIO', 5, 0, 10, 'UNIDAD'),
('01-004', 'AZUCAR LIBRAS', 357, 0, 40.6, 'UNIDAD'),
-- ... continúa con todos los registros
```

#### 2.2 Migrar `sum_departamentos`

1. Ve a **Table Editor** → `sum_departamentos`
2. Inserta los 247 departamentos desde el archivo SQL

**Método SQL:**
```sql
INSERT INTO sum_departamentos (codigo, departamento)
VALUES 
('A-0001', 'AGUACATICO LAGO ENRIQUILLO'),
('A-0002', 'ALMACENES GENERALES'),
-- ... continúa con todos los registros
```

#### 2.3 Migrar `sum_usuarios_departamentos`

**⚠️ IMPORTANTE:** Primero debes crear los usuarios en Supabase Auth, luego sincronizarlos.

1. **Crear usuarios en Supabase Auth:**
   - Ve a **Authentication** → **Users**
   - Haz clic en **"Add User"** → **"Create New User"**
   - Crea cada usuario con su email y contraseña

2. **Sincronizar con la tabla:**
   - Ve a **Table Editor** → `sum_usuarios_departamentos`
   - Para cada usuario creado, inserta un registro con:
     - `user_id`: UUID del usuario de Supabase Auth
     - `username`: Nombre de usuario
     - `email`: Email del usuario
     - `rol`: Rol del usuario
     - `departamento_id`: ID del departamento (opcional)

#### 2.4 Migrar `sum_entrada_mercancia`

```sql
INSERT INTO sum_entrada_mercancia (numero_entrada, numero_orden, fecha, suplidor, articulos_cantidades_unidades)
VALUES 
('INDRHI-EM-2025-0001', 'INDRHI-DAF-CD-2025-0001', '2025-11-05', 'SUPLICENTRO', '[{"articulo":"CAFE MOLIDO SANTO DOMINGO (1 LBR.)","cantidad":12,"unidad":"UNIDAD"}]'),
-- ... continúa con todos los registros
```

#### 2.5 Migrar `sum_solicitudes`

```sql
INSERT INTO sum_solicitudes (numero_solicitud, fecha, departamento, departamento_id, usuario_id, articulos_cantidades)
VALUES 
('1', '2025-11-06', 'DIRECCION DE TECNOLOGIAS...', 81, 'uuid-del-usuario', '[{"articulo":"BANDEJAS P/ ESCRITORIO","codigo":"01-005","cantidad":2}]'),
-- ... continúa con todos los registros
```

**⚠️ NOTA:** Necesitas convertir los `user_id` de MySQL (bigint) a UUIDs de Supabase. Usa los UUIDs de los usuarios creados en Supabase Auth.

#### 2.6 Migrar Tablas de Solicitudes

- `sum_autorizar_solicitudes`
- `sum_solicitudes_aprobadas`
- `sum_solicitudes_gestionadas`
- `sum_solicitudes_despachadas`

Usa el mismo método SQL para insertar los datos.

## 🔄 Opción 2: Script de Migración Automática

Puedes crear un script Node.js para automatizar la migración:

```javascript
// migrate-data.js
import { createClient } from '@supabase/supabase-js'
import mysql from 'mysql2/promise'

const supabase = createClient(
  'https://uracpvmatedurfdsylxd.supabase.co',
  'tu-anon-key'
)

// Conectar a MySQL
const mysqlConnection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'suministros_indrhi'
})

// Migrar artículos
async function migrateArticulos() {
  const [rows] = await mysqlConnection.execute('SELECT * FROM sum_articulos')
  
  for (const row of rows) {
    const { error } = await supabase
      .from('sum_articulos')
      .insert([{
        codigo: row.codigo,
        descripcion: row.descripcion,
        existencia: row.existencia,
        cantidad_minima: row.cantidad_minima,
        valor: row.valor,
        unidad: row.unidad
      }])
    
    if (error) console.error('Error:', error)
  }
}

// Ejecutar migración
await migrateArticulos()
```

## 📝 Checklist de Migración

- [ ] Datos de `sum_articulos` migrados (242 registros)
- [ ] Datos de `sum_departamentos` migrados (247 registros)
- [ ] Usuarios creados en Supabase Auth
- [ ] Datos de `sum_usuarios_departamentos` sincronizados
- [ ] Datos de `sum_entrada_mercancia` migrados
- [ ] Datos de `sum_solicitudes` migrados (conversión de user_id)
- [ ] Datos de `sum_autorizar_solicitudes` migrados
- [ ] Datos de `sum_solicitudes_aprobadas` migrados
- [ ] Datos de `sum_solicitudes_gestionadas` migrados
- [ ] Datos de `sum_solicitudes_despachadas` migrados

## ⚠️ Consideraciones Importantes

### Conversión de IDs de Usuarios

Los `user_id` en MySQL son `bigint(20)`, pero en Supabase son `UUID`. Necesitas:

1. Crear cada usuario en Supabase Auth primero
2. Obtener el UUID de cada usuario
3. Mapear el `user_id` de MySQL al UUID de Supabase
4. Actualizar todas las referencias en las tablas

### Campos JSON

Los campos `articulos_cantidades` y `articulos_cantidades_unidades` se almacenan como TEXT en ambas bases de datos, así que la migración es directa.

### Fechas

Las fechas en MySQL (`DATE`) son compatibles con PostgreSQL (`DATE`), así que no necesitas conversión.

## 🔍 Verificar la Migración

Después de migrar los datos:

1. **Verifica el conteo:**
   ```sql
   SELECT COUNT(*) FROM sum_articulos; -- Debe ser 242
   SELECT COUNT(*) FROM sum_departamentos; -- Debe ser 247
   ```

2. **Verifica relaciones:**
   - Verifica que los `departamento_id` en `sum_solicitudes` existan en `sum_departamentos`
   - Verifica que los `user_id` en `sum_solicitudes` existan en `sum_usuarios_departamentos`

3. **Prueba la aplicación:**
   - Intenta hacer login
   - Verifica que se muestren los artículos
   - Verifica que se muestren los departamentos
   - Crea una solicitud de prueba

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs en Supabase Dashboard
2. Verifica que los tipos de datos coincidan
3. Asegúrate de que las foreign keys sean válidas
4. Consulta la documentación de Supabase

---

**Nota:** Para grandes volúmenes de datos, considera usar la API de Supabase o scripts automatizados.


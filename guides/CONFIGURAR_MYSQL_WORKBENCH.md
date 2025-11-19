# Guía: Configurar MySQL Workbench para el Proyecto

## 📋 Prerrequisitos

- MySQL Server instalado y corriendo (XAMPP incluye MySQL)
- MySQL Workbench instalado
- Proyecto INDRHI configurado

## 🔧 Paso 1: Verificar que MySQL esté Corriendo

### Si usas XAMPP:

1. Abre el **Panel de Control de XAMPP**
2. Verifica que **MySQL** esté corriendo (botón verde)
3. Si no está corriendo, haz clic en **Start** junto a MySQL
4. Anota el puerto (generalmente **3306**)

## 🔧 Paso 2: Conectar MySQL Workbench a tu Base de Datos

### 2.1 Crear Nueva Conexión

1. Abre **MySQL Workbench**
2. En la pantalla principal, busca la sección **MySQL Connections**
3. Haz clic en el botón **+** (o **Add Connection**)
4. Se abrirá el formulario de configuración

### 2.2 Configurar la Conexión

Completa los siguientes campos:

```
Connection Name: INDRHI Local
  (Puedes usar cualquier nombre descriptivo)

Connection Method: Standard (TCP/IP)

Hostname: localhost
  (o 127.0.0.1)

Port: 3306
  (puerto por defecto de MySQL)

Username: root
  (o tu usuario de MySQL)

Password: [Haz clic en "Store in Vault" y ingresa tu contraseña]
  (Si usas XAMPP, generalmente la contraseña está vacía o es "root")
```

### 2.3 Probar la Conexión

1. Haz clic en **Test Connection**
2. Si todo está bien, verás un mensaje de éxito
3. Si hay error, verifica:
   - Que MySQL esté corriendo en XAMPP
   - Que el puerto sea correcto (3306)
   - Que el usuario y contraseña sean correctos

### 2.4 Guardar y Conectar

1. Haz clic en **OK** para guardar la conexión
2. Haz doble clic en la conexión creada para conectarte
3. Si te pide contraseña nuevamente, ingrésala

## 🔧 Paso 3: Crear la Base de Datos

### 3.1 Abrir el Editor SQL

Una vez conectado:
1. Verás el panel izquierdo con las bases de datos
2. En la parte superior, haz clic en **File** → **New Query Tab**
   (O presiona `Ctrl + T`)

### 3.2 Ejecutar el Script de Migración

1. Abre el archivo `guides/mysql-migration.sql` en un editor de texto
2. Copia **TODO** el contenido del archivo
3. Pégalo en la pestaña SQL de MySQL Workbench
4. Haz clic en el botón **⚡ Execute** (o presiona `Ctrl + Shift + Enter`)

### 3.3 Verificar que se Creó Correctamente

En el panel izquierdo:
1. Haz clic derecho en el área de bases de datos
2. Selecciona **Refresh All**
3. Deberías ver la base de datos **sum_indrhi**
4. Expándela y verifica que todas las tablas estén creadas:
   - `usuarios`
   - `sum_articulos`
   - `sum_departamentos`
   - `sum_roles`
   - `sum_usuarios_departamentos`
   - `sum_entrada_mercancia`
   - `sum_solicitudes`
   - `sum_autorizar_solicitudes`
   - `sum_solicitudes_aprobadas`
   - `sum_solicitudes_gestionadas`
   - `sum_solicitudes_despachadas`

## 🔧 Paso 4: Configurar Variables de Entorno en el Proyecto

### 4.1 Crear/Actualizar archivo .env

En la raíz del proyecto (`C:\xampp\htdocs\sum_indrhi`), crea o edita el archivo `.env`:

```env
# Base de datos actual (mantener como 'supabase' por ahora)
VITE_DATABASE_TYPE=supabase

# Configuración Supabase (mantener tus valores actuales)
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase

# Configuración MySQL
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=
VITE_MYSQL_DATABASE=sum_indrhi

# JWT Secret (cambiar en producción)
VITE_JWT_SECRET=indrhi-secret-key-2024-cambiar-en-produccion

# Ambiente
VITE_ENVIRONMENT=development
```

**Nota sobre la contraseña de MySQL:**
- Si usas XAMPP y no configuraste contraseña, déjala vacía: `VITE_MYSQL_PASSWORD=`
- Si tienes contraseña, escríbela: `VITE_MYSQL_PASSWORD=tu-password`

### 4.2 Verificar que .env esté en .gitignore

Asegúrate de que `.env` esté en `.gitignore` para no subirlo a Git:

```
# En .gitignore debe estar:
.env
.env.local
.env.*.local
```

## 🔧 Paso 5: Instalar Dependencias de Node.js

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
npm install
```

Esto instalará:
- `mysql2` - Cliente MySQL para Node.js
- `bcryptjs` - Para hashear contraseñas
- `jsonwebtoken` - Para tokens JWT
- `dotenv` - Para variables de entorno (si usas el script de migración)

## 🔧 Paso 6: Probar la Conexión desde el Código

### 6.1 Crear Script de Prueba (Opcional)

Crea un archivo `test-mysql-connection.js` en la raíz:

```javascript
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.VITE_MYSQL_HOST || 'localhost',
      port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
      user: process.env.VITE_MYSQL_USER || 'root',
      password: process.env.VITE_MYSQL_PASSWORD || '',
      database: process.env.VITE_MYSQL_DATABASE || 'sum_indrhi',
    })
    
    console.log('✅ Conexión exitosa a MySQL!')
    
    // Probar una query simple
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM sum_articulos')
    console.log(`📊 Total de artículos: ${rows[0].total}`)
    
    await connection.end()
    console.log('✅ Conexión cerrada correctamente')
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message)
    process.exit(1)
  }
}

testConnection()
```

Ejecuta:
```bash
node test-mysql-connection.js
```

Si todo está bien, verás mensajes de éxito.

## 🔧 Paso 7: Verificar Tablas en MySQL Workbench

### 7.1 Ver Estructura de Tablas

1. En MySQL Workbench, expande `sum_indrhi` → **Tables**
2. Haz clic derecho en cualquier tabla → **Table Inspector**
3. Verifica que las columnas coincidan con lo esperado

### 7.2 Ver Datos (Después de Migrar)

Para verificar datos después de la migración:

```sql
-- Ver usuarios
SELECT * FROM usuarios LIMIT 10;

-- Ver artículos
SELECT * FROM sum_articulos LIMIT 10;

-- Ver departamentos
SELECT * FROM sum_departamentos LIMIT 10;

-- Ver usuarios con departamentos
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

## 🔧 Paso 8: Configurar Usuario de MySQL (Opcional pero Recomendado)

Por seguridad, es mejor crear un usuario específico para la aplicación:

### 8.1 Crear Usuario en MySQL Workbench

Ejecuta en MySQL Workbench:

```sql
-- Crear usuario para la aplicación
CREATE USER 'indrhi_app'@'localhost' IDENTIFIED BY 'password-segura-aqui';

-- Dar permisos solo a la base de datos sum_indrhi
GRANT ALL PRIVILEGES ON sum_indrhi.* TO 'indrhi_app'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;
```

### 8.2 Actualizar .env con el Nuevo Usuario

```env
VITE_MYSQL_USER=indrhi_app
VITE_MYSQL_PASSWORD=password-segura-aqui
```

## ✅ Checklist de Configuración

- [ ] MySQL corriendo en XAMPP
- [ ] Conexión creada en MySQL Workbench
- [ ] Conexión probada exitosamente
- [ ] Base de datos `sum_indrhi` creada
- [ ] Todas las tablas creadas correctamente
- [ ] Archivo `.env` configurado
- [ ] Dependencias de Node.js instaladas (`npm install`)
- [ ] Conexión probada desde código (opcional)

## 🐛 Solución de Problemas Comunes

### Error: "Can't connect to MySQL server"

**Solución:**
1. Verifica que MySQL esté corriendo en XAMPP
2. Verifica que el puerto sea 3306
3. Verifica que el firewall no esté bloqueando MySQL

### Error: "Access denied for user"

**Solución:**
1. Verifica usuario y contraseña en `.env`
2. Si usas XAMPP sin contraseña, déjala vacía: `VITE_MYSQL_PASSWORD=`
3. Prueba conectarte desde MySQL Workbench primero

### Error: "Unknown database 'sum_indrhi'"

**Solución:**
1. Ejecuta el script `mysql-migration.sql` completo
2. Verifica que la base de datos se creó: `SHOW DATABASES;`
3. Verifica el nombre en `.env`: `VITE_MYSQL_DATABASE=sum_indrhi`

### Error: "Table doesn't exist"

**Solución:**
1. Ejecuta nuevamente el script `mysql-migration.sql`
2. Verifica que todas las tablas se crearon: `SHOW TABLES FROM sum_indrhi;`

## 📝 Próximos Pasos

Una vez configurado MySQL Workbench:

1. **Migrar datos** (cuando estés listo):
   ```bash
   node scripts/migrate-data-to-mysql.js
   ```

2. **Cambiar a MySQL** en producción:
   ```env
   VITE_DATABASE_TYPE=mysql
   ```

3. **Probar la aplicación** con MySQL

## 💡 Tips Útiles de MySQL Workbench

- **Ejecutar query**: `Ctrl + Shift + Enter` o botón ⚡
- **Ejecutar query seleccionada**: `Ctrl + Enter`
- **Formatear SQL**: `Ctrl + B`
- **Ver datos de tabla**: Haz clic derecho en tabla → **Select Rows - Limit 1000**
- **Ver estructura**: Haz clic derecho en tabla → **Table Inspector**
- **Exportar datos**: Haz clic derecho en tabla → **Table Data Export Wizard**


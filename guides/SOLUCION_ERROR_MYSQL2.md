# Solución: Error "mysql2 no está disponible"

## Problema

El error `mysql2 no está disponible` ocurre porque **MySQL no puede ejecutarse directamente en el navegador**. Los módulos de Node.js como `mysql2` requieren un entorno de servidor.

## Solución Implementada

He creado un **servidor Express** que actúa como intermediario:

```
Frontend (Navegador) → API Routes (Express) → MySQL
```

## Archivos Creados

1. **`server.js`** - Servidor Express que maneja las peticiones MySQL
2. **`api/db.js`** - Funciones de base de datos MySQL
3. **`src/lib/mysqlClientApi.js`** - Cliente que hace peticiones HTTP
4. **`vite.config.js`** - Configuración de proxy para desarrollo

## Cómo Iniciar

### Opción 1: Todo Junto (Recomendado)

```bash
npm run dev:all
```

Esto iniciará ambos servidores automáticamente.

### Opción 2: Por Separado

**Terminal 1 - Servidor MySQL API:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Verificación

1. **Servidor Express:**
   - Abre `http://localhost:3000/api/health`
   - Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

2. **Frontend:**
   - Abre `http://localhost:5173`
   - Intenta iniciar sesión

## Variables de Entorno

Asegúrate de que tu `.env` tenga:

```env
VITE_DATABASE_TYPE=mysql
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=
VITE_MYSQL_DATABASE=sum_indrhi
```

## Troubleshooting

### Error: "Cannot connect to MySQL"

1. Verifica que MySQL esté corriendo (XAMPP)
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos `sum_indrhi` exista

### Error: "Port 3000 already in use"

Cambia el puerto en `server.js`:
```javascript
const PORT = 3001  // Usa otro puerto
```

Y actualiza `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    ...
  }
}
```

### El servidor no inicia

Verifica que las dependencias estén instaladas:
```bash
npm install
```

## Próximos Pasos

Una vez que funcione en desarrollo:

1. ✅ Configura MySQL remoto para producción
2. ✅ Configura variables en Vercel
3. ✅ Despliega


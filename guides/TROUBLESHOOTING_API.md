# Troubleshooting: Error "Not Found" en API

## Problema

Error: `Not Found` al intentar hacer login con MySQL.

## Causa

El cliente está haciendo peticiones a `/api/query` pero puede haber problemas con:
1. El servidor Express no está corriendo
2. La URL no está correcta
3. CORS está bloqueando la petición

## Solución

### 1. Verificar que el Servidor Esté Corriendo

```bash
# Verifica que el servidor Express esté corriendo
curl http://localhost:3000/api/health
```

Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

### 2. Verificar la URL en el Navegador

Abre la consola del navegador (F12) y verifica:
- Que veas los logs `🔍 API Request: http://localhost:3000/api/query?...`
- Que la URL sea correcta

### 3. Reiniciar los Servidores

**Detén todos los procesos Node.js y reinicia:**

```bash
# Terminal 1
npm run dev:server

# Terminal 2  
npm run dev
```

### 4. Verificar Variables de Entorno

Asegúrate de que tu `.env` tenga:

```env
VITE_DATABASE_TYPE=mysql
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=root
VITE_MYSQL_PASSWORD=
VITE_MYSQL_DATABASE=sum_indrhi
```

### 5. Verificar CORS

El servidor Express tiene CORS habilitado, pero si hay problemas:

1. Verifica que `cors` esté instalado: `npm list cors`
2. Verifica que el middleware esté configurado en `server.js`

### 6. Ver Logs del Servidor

El servidor ahora muestra logs de cada petición:
```
📥 GET /api/query { table: 'sum_usuarios_departamentos', where: '...' }
```

Si no ves estos logs, el servidor no está recibiendo las peticiones.

## Verificación Rápida

1. ✅ Servidor Express corriendo en puerto 3000
2. ✅ Frontend corriendo en puerto 5173
3. ✅ Variables de entorno configuradas
4. ✅ MySQL corriendo y accesible
5. ✅ Base de datos `sum_indrhi` existe

## Próximos Pasos

Si el problema persiste:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña Network
3. Intenta hacer login
4. Busca la petición a `/api/query`
5. Verifica el Status Code y la respuesta


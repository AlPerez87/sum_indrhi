# Error: HTML en lugar de JSON

## Problema

Error: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## Causa

El servidor está respondiendo con HTML (probablemente una página de error 404 o 500) en lugar de JSON. Esto generalmente significa:

1. **El servidor Express NO está corriendo**
2. **La URL está mal configurada**
3. **El endpoint `/api/auth` no existe o tiene un error**

## Solución

### 1. Verificar que el Servidor Esté Corriendo

```bash
curl http://localhost:3000/api/health
```

Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

Si no ves esto, el servidor NO está corriendo.

### 2. Iniciar el Servidor

```bash
npm run dev:server
```

Deberías ver:
```
🚀 MySQL API Server running on http://localhost:3000
📊 Database: sum_indrhi
```

### 3. Verificar la URL en el Código

Abre la consola del navegador (F12) y verifica:
- Que veas los logs `🔐 Login request to: http://localhost:3000/api/auth`
- Que la URL sea correcta

### 4. Verificar Logs del Servidor

Cuando intentas hacer login, deberías ver en la terminal del servidor:
```
🔐 POST /api/auth recibido
   Body: { action: 'login', usernameOrEmail: '...', password: '...' }
🔐 authHandler llamado, method: POST
```

Si no ves estos logs, el servidor no está recibiendo las peticiones.

## Troubleshooting

### El servidor no inicia

1. Verifica que el puerto 3000 no esté en uso:
   ```bash
   netstat -ano | findstr :3000
   ```

2. Si está en uso, detén el proceso o cambia el puerto en `server.js`

### El servidor inicia pero no responde

1. Verifica que las dependencias estén instaladas:
   ```bash
   npm install
   ```

2. Verifica que MySQL esté corriendo

3. Revisa los logs del servidor para errores

### La URL está mal

Verifica en `src/lib/mysqlAuth.js` que `API_BASE_URL` sea:
- En desarrollo: `http://localhost:3000`
- En producción: la URL de tu API

## Verificación Rápida

1. ✅ Servidor Express corriendo en puerto 3000
2. ✅ `curl http://localhost:3000/api/health` responde JSON
3. ✅ Frontend corriendo en puerto 5173
4. ✅ Variables de entorno configuradas
5. ✅ MySQL corriendo y accesible

## Próximos Pasos

Si el problema persiste:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña Network
3. Intenta hacer login
4. Busca la petición a `/api/auth`
5. Verifica:
   - Status Code (debería ser 200)
   - Response Headers (debería ser `application/json`)
   - Response Body (debería ser JSON, no HTML)


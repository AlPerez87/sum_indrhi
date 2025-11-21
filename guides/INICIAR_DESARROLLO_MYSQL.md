# Cómo Iniciar el Sistema con MySQL en Desarrollo

## Problema Resuelto

El error `mysql2 no está disponible` ocurría porque **MySQL no puede ejecutarse directamente en el navegador**. 

## Solución Implementada

He creado un **servidor Express** que actúa como intermediario entre el frontend y MySQL.

### Arquitectura

```
Frontend (React/Vite) → API Routes (Express) → MySQL
```

## Pasos para Iniciar

### Opción 1: Iniciar Todo Junto (Recomendado)

```bash
npm run dev:all
```

Esto iniciará:
- Servidor Express en `http://localhost:3000` (maneja MySQL)
- Servidor Vite en `http://localhost:5173` (frontend)

### Opción 2: Iniciar por Separado

**Terminal 1 - Servidor MySQL API:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Verificación

1. **Verifica que el servidor Express esté corriendo:**
   - Abre `http://localhost:3000/api/health`
   - Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

2. **Verifica que el frontend esté corriendo:**
   - Abre `http://localhost:5173`
   - Deberías ver la aplicación

3. **Intenta iniciar sesión:**
   - Usa uno de los usuarios migrados
   - Contraseña temporal: `TempPassword123!`

## Variables de Entorno Requeridas

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

1. Verifica que MySQL esté corriendo:
   ```bash
   # En XAMPP, verifica que MySQL esté iniciado
   ```

2. Verifica las credenciales en `.env`

3. Verifica que la base de datos exista:
   ```bash
   mysql -u root -e "SHOW DATABASES LIKE 'sum_indrhi';"
   ```

### Error: "Port 3000 already in use"

Cambia el puerto en `server.js`:
```javascript
const PORT = process.env.PORT || 3001  // Usa otro puerto
```

Y actualiza `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // Mismo puerto
    ...
  }
}
```

### Error: "API Error"

1. Verifica que el servidor Express esté corriendo
2. Abre la consola del navegador y revisa los errores
3. Verifica que las rutas `/api/*` estén funcionando

## Próximos Pasos

Una vez que funcione en desarrollo:

1. ✅ Configura MySQL remoto para producción
2. ✅ Configura variables de entorno en Vercel
3. ✅ Despliega y verifica


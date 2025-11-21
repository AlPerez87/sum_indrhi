# 🚀 Iniciar Sistema con MySQL

## ⚠️ IMPORTANTE: Debes iniciar DOS servidores

MySQL **NO puede ejecutarse en el navegador**, por lo que necesitas un servidor backend.

## Inicio Rápido

### Opción 1: Todo Junto (Recomendado)

```bash
npm run dev:all
```

Esto iniciará:
- ✅ Servidor Express (puerto 3000) - Maneja MySQL
- ✅ Servidor Vite (puerto 5173) - Frontend React

### Opción 2: Por Separado

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev
```

## Verificación

1. **Servidor Express:**
   - Abre: `http://localhost:3000/api/health`
   - Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

2. **Frontend:**
   - Abre: `http://localhost:5173`
   - Intenta iniciar sesión

## Credenciales de Prueba

- **Email:** emencia@indrhi.gob.do
- **Contraseña:** TempPassword123!

(O cualquier otro usuario migrado)

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

### Error: "mysql2 no está disponible"

✅ **SOLUCIONADO** - Ahora usa API Routes en lugar de conexión directa

### Error: "Cannot connect to MySQL"

1. Verifica que MySQL esté corriendo (XAMPP)
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos exista

### Error: "Port 3000 already in use"

Cambia el puerto en `server.js` y actualiza `vite.config.js`

### El servidor no responde

1. Verifica que el servidor Express esté corriendo
2. Abre `http://localhost:3000/api/health`
3. Revisa la consola del servidor para errores

## Arquitectura

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│   Navegador │ ──────> │ API Express  │ ──────> │  MySQL   │
│  (React)    │  HTTP   │  (Puerto 3000)│  TCP   │ (Puerto  │
│             │         │              │         │   3306)  │
└─────────────┘         └──────────────┘         └──────────┘
```

## Próximos Pasos

Una vez que funcione en desarrollo:

1. ✅ Configura MySQL remoto para producción
2. ✅ Configura variables en Vercel
3. ✅ Despliega


# Cómo Reiniciar los Servidores

## ⚠️ IMPORTANTE

Después de hacer cambios en el código, **debes reiniciar ambos servidores**.

## Pasos para Reiniciar

### 1. Detener Todos los Procesos Node.js

**En PowerShell:**
```powershell
# Detener todos los procesos Node.js
Get-Process node | Stop-Process -Force
```

**O manualmente:**
- Presiona `Ctrl+C` en cada terminal donde estén corriendo
- Cierra las terminales

### 2. Verificar que Estén Detenidos

```powershell
Get-Process node
```

No debería mostrar ningún proceso.

### 3. Iniciar de Nuevo

**Opción 1: Todo Junto**
```bash
npm run dev:all
```

**Opción 2: Por Separado**

**Terminal 1:**
```bash
npm run dev:server
```

Espera a ver:
```
🚀 MySQL API Server running on http://localhost:3000
📊 Database: sum_indrhi
```

**Terminal 2:**
```bash
npm run dev
```

Espera a ver:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 4. Verificar que Funcionen

1. **Servidor Express:**
   - Abre: `http://localhost:3000/api/health`
   - Deberías ver: `{"status":"ok","message":"MySQL API Server running"}`

2. **Frontend:**
   - Abre: `http://localhost:5173`
   - Deberías ver la aplicación

## Troubleshooting

### Error: "Port 3000 already in use"

El servidor Express ya está corriendo. Detén todos los procesos Node.js primero.

### Error: "Cannot find module"

Ejecuta:
```bash
npm install
```

### Los cambios no se aplican

1. Detén todos los servidores
2. Limpia la caché:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Reinicia los servidores

## Verificación Rápida

```bash
# Verificar procesos Node.js corriendo
Get-Process node

# Verificar que el puerto 3000 esté en uso
netstat -ano | findstr :3000

# Verificar que el puerto 5173 esté en uso
netstat -ano | findstr :5173
```


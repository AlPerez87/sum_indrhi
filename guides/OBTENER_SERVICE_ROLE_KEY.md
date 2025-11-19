# Cómo Obtener la Service Role Key de Supabase

Para migrar todos los datos, necesitas la **Service Role Key** que bypass las políticas RLS.

## Pasos:

1. Ve a tu proyecto en **Supabase Dashboard**
2. Ve a **Settings** → **API**
3. En la sección **Project API keys**, busca la clave **`service_role`** (NO la `anon` key)
4. Copia esta clave
5. Agrega esta variable a tu archivo `.env`:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**⚠️ IMPORTANTE**: 
- La service role key es muy sensible
- Nunca la subas a Git
- Solo úsala para scripts de migración
- No la uses en el frontend

## Alternativa: Usar SQL Directo

Si prefieres no usar la service role key, puedes exportar los datos directamente desde Supabase usando SQL y luego importarlos a MySQL.


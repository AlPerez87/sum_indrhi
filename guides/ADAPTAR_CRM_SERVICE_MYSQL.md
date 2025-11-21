# Adaptar CRM Service para MySQL

## Problema

El `crmService.js` está usando directamente `supabase` en lugar del `databaseAdapter`, por lo que no funciona con MySQL.

## Solución

Necesitamos adaptar todas las funciones de `crmService` para que:
1. Usen `db` del `databaseAdapter` cuando `VITE_DATABASE_TYPE=mysql`
2. Mantengan compatibilidad con Supabase cuando `VITE_DATABASE_TYPE=supabase`

## Funciones que necesitan adaptación

### Ya adaptadas:
- ✅ `getArticulos` - Adaptada para MySQL
- ✅ `getDepartamentos` - Adaptada para MySQL

### Pendientes:
- ⏳ `getSolicitudes` - Necesita adaptación
- ⏳ `getSolicitudesAprobadas` - Necesita adaptación
- ⏳ `getSolicitudesGestionadas` - Necesita adaptación
- ⏳ `getSolicitudesDespachadas` - Necesita adaptación
- ⏳ `getAutorizarSolicitudes` - Necesita adaptación
- ⏳ `getUsuariosDepartamentos` - Necesita adaptación
- ⏳ Todas las funciones de creación/actualización

## Patrón a seguir

```javascript
async functionName() {
  try {
    if (isMySQL()) {
      // Código para MySQL usando db.query() o db.from()
      const sql = `SELECT * FROM tabla WHERE ...`
      const data = await db.query(sql, params)
      return { success: true, data }
    } else {
      // Código original de Supabase
      const { data, error } = await supabase.from('tabla').select('*')
      if (error) throw error
      return { success: true, data }
    }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
```

## Notas importantes

1. **LIKE vs ILIKE**: MySQL usa `LIKE` (case-sensitive) o `LIKE BINARY` (case-insensitive), mientras que Supabase usa `ilike`
2. **Paginación**: MySQL usa `LIMIT` y `OFFSET`, mientras que Supabase usa `.range(from, to)`
3. **Joins**: MySQL usa `JOIN` explícito, mientras que Supabase usa `.select('*, tabla:foreign_key(*)')`
4. **Count**: MySQL necesita `SELECT COUNT(*)`, mientras que Supabase tiene `{ count: 'exact' }`


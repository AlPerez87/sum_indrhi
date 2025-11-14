# 📋 Formato de Número de Solicitud

## Formato Implementado

El sistema ahora genera números de solicitud con el siguiente formato:

```
SD{departamento_id}-{año}-{número_secuencial}
```

### Ejemplos:
- `SD81-2025-0001` - Primera solicitud del departamento 81 en 2025
- `SD81-2025-0002` - Segunda solicitud del departamento 81 en 2025
- `SD45-2025-0001` - Primera solicitud del departamento 45 en 2025

## Características

1. **Prefijo**: `SD` (Solicitud Departamento)
2. **ID del Departamento**: Número identificador del departamento del usuario
3. **Año**: Año actual (4 dígitos)
4. **Número Secuencial**: Número de 4 dígitos con ceros a la izquierda (0001, 0002, etc.)

## Ventajas

- ✅ **Evita conflictos**: Cada departamento tiene su propia secuencia de números
- ✅ **Identificación rápida**: Se puede identificar el departamento y año desde el número
- ✅ **Escalable**: Soporta hasta 9999 solicitudes por departamento por año
- ✅ **Único**: El formato garantiza unicidad combinando departamento, año y secuencia

## Implementación Técnica

- El número se genera automáticamente al crear una nueva solicitud
- Se busca el último número para el departamento y año específicos
- La secuencia se reinicia cada año para cada departamento
- El campo `numero_solicitud` en la base de datos es `VARCHAR(50)` para soportar este formato

## Migración

Si tienes solicitudes existentes con el formato antiguo (números simples), estas seguirán funcionando. Las nuevas solicitudes usarán el nuevo formato automáticamente.


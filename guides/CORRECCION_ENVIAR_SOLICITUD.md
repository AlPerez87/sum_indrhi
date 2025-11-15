# 🔧 Corrección: Error al Enviar Solicitud

## Problema Identificado

Al enviar una solicitud, se presentaba el siguiente error:
```
400 (Bad Request)
null value in column "numero_solicitud" of relation "sum_autorizar_solicitudes" violates not-null constraint
```

## Causa

El nuevo formato de número de solicitud (`SD{departamento_id}-{año}-{número}`) es un string, pero las tablas relacionadas (`sum_autorizar_solicitudes`, `sum_solicitudes_aprobadas`, etc.) tenían el campo `numero_solicitud` definido como `INTEGER`, lo que causaba el error al intentar insertar un string.

## Solución Implementada

### 1. Actualización del Código

- **`enviarSolicitud()`**: Ahora mantiene el `numero_solicitud` como string sin intentar convertirlo a entero
- **`getSolicitudes()`**: Implementado filtrado por rol:
  - **Administradores**: Ven todas las solicitudes
  - **Otros usuarios**: Solo ven las solicitudes de su departamento o las creadas por ellos

### 2. Actualización del Esquema de Base de Datos

Se creó el archivo `ACTUALIZAR_ESQUEMA_SOLICITUDES.sql` que debe ejecutarse en Supabase para cambiar el tipo de columna de `INTEGER` a `VARCHAR(50)` en las siguientes tablas:

- `sum_autorizar_solicitudes`
- `sum_solicitudes_aprobadas`
- `sum_solicitudes_gestionadas`
- `sum_solicitudes_despachadas`

## Pasos para Aplicar la Corrección

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre el SQL Editor en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `ACTUALIZAR_ESQUEMA_SOLICITUDES.sql`
3. Ejecuta el script

### Paso 2: Verificar los Cambios

Después de ejecutar el script, verifica que:
- Las tablas ahora aceptan strings en `numero_solicitud`
- Puedes crear y enviar solicitudes sin errores
- Los usuarios no administradores solo ven sus propias solicitudes

## Filtrado por Rol

### Administradores
- Pueden ver **todas** las solicitudes del sistema
- No hay restricciones de visualización

### Otros Usuarios
- Solo ven las solicitudes de su **departamento** (si tienen `departamento_id` asignado)
- O solo las solicitudes que **ellos crearon** (si no tienen `departamento_id`)

## Notas Importantes

- El filtrado se realiza en el frontend mediante el servicio `getSolicitudes()`
- Se recomienda implementar Row Level Security (RLS) en Supabase para mayor seguridad
- Los cambios son compatibles con solicitudes existentes que usen el formato antiguo


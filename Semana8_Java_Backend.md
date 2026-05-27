# Semana 8 — SQL Avanzado · Window Functions · Índices · Optimización

> **Fase 2 — Nivel Profesional** · Programa Intensivo Java Backend Developer  
> Tema central: **Window Functions · Índices · EXPLAIN · Optimización · Transacciones ACID**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Window Functions: ROW_NUMBER, RANK, DENSE_RANK | Análisis por particiones |
| Martes | Window Functions: LAG, LEAD, SUM/AVG acumulados | Comparaciones temporales |
| Miércoles | Índices: tipos, cuándo usarlos, cuándo no | Diseño de índices |
| Jueves | EXPLAIN, execution plans y optimización de queries | Diagnóstico de lentitud |
| Viernes | Simulación cronometrada: SQL avanzado completo | Prueba técnica real |
| Sábado | Transacciones: ACID, niveles de aislamiento, deadlocks | Integridad de datos |
| Domingo | Repaso completo + preguntas de entrevista | Verificación sin código |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Usar window functions para ranking, comparaciones y acumulados sin subqueries.
- Diseñar índices que aceleren queries sin dañar el rendimiento de escrituras.
- Leer un `EXPLAIN` y saber exactamente dónde está el cuello de botella.
- Reescribir queries lentas en versiones optimizadas.
- Explicar ACID y los niveles de aislamiento en una entrevista.

---

# LUNES — Window Functions: ROW_NUMBER, RANK, DENSE_RANK

## ¿Qué son las Window Functions?

Las window functions (funciones de ventana) realizan cálculos sobre un **conjunto de filas relacionadas con la fila actual**, sin colapsar las filas como hace `GROUP BY`. Cada fila conserva su identidad y el resultado del cálculo aparece en una columna adicional.

```sql
-- GROUP BY colapsa filas → un resultado por grupo
SELECT departamento, AVG(salario)
FROM empleados
GROUP BY departamento;
-- Resultado: 3 filas (una por departamento)

-- Window Function mantiene filas → resultado por cada empleado
SELECT nombre, departamento, salario,
       AVG(salario) OVER (PARTITION BY departamento) AS promedio_depto
FROM empleados;
-- Resultado: 50 filas (una por empleado, con el promedio de su depto)
```

---

## Sintaxis base

```sql
funcion() OVER (
    PARTITION BY columna    -- divide en grupos (opcional)
    ORDER BY columna        -- ordena dentro del grupo (opcional)
    ROWS/RANGE BETWEEN ...  -- define el "frame" (opcional)
)
```

---

## ROW_NUMBER — número de fila único

```sql
-- Numberar empleados dentro de cada departamento por salario
SELECT
    nombre,
    departamento,
    salario,
    ROW_NUMBER() OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
    ) AS fila
FROM empleados;

-- Resultado:
-- nombre  | departamento | salario | fila
-- Ana     | Dev          | 18000   |  1
-- María   | Dev          | 15000   |  2
-- Sara    | Dev          | 12000   |  3
-- Luis    | QA           | 10000   |  1
-- Pedro   | QA           | 9000    |  2
```

```sql
-- Caso de uso clásico: obtener el N-ésimo registro por grupo
-- Top 2 empleados mejor pagados por departamento
SELECT *
FROM (
    SELECT
        nombre,
        departamento,
        salario,
        ROW_NUMBER() OVER (
            PARTITION BY departamento
            ORDER BY salario DESC
        ) AS rn
    FROM empleados
) AS ranked
WHERE rn <= 2;
```

---

## RANK y DENSE_RANK — ranking con empates

```sql
SELECT
    nombre,
    departamento,
    salario,
    RANK()       OVER (PARTITION BY departamento ORDER BY salario DESC) AS rank_gaps,
    DENSE_RANK() OVER (PARTITION BY departamento ORDER BY salario DESC) AS rank_denso,
    ROW_NUMBER() OVER (PARTITION BY departamento ORDER BY salario DESC) AS row_num
FROM empleados
ORDER BY departamento, salario DESC;

-- Con empate en salario 15000:
-- nombre | salario | RANK | DENSE_RANK | ROW_NUMBER
-- Ana    |  18000  |  1   |     1      |     1
-- María  |  15000  |  2   |     2      |     2
-- Sara   |  15000  |  2   |     2      |     3     ← mismo salario
-- Luis   |  12000  |  4   |     3      |     4     ← RANK salta a 4, DENSE_RANK va a 3
-- Pedro  |  11000  |  5   |     4      |     5
```

> **Diferencia clave:**
> - `ROW_NUMBER`: siempre único, sin empates.
> - `RANK`: empates comparten posición, **salta** el siguiente número.
> - `DENSE_RANK`: empates comparten posición, **no salta** el siguiente número.

---

## NTILE — dividir en N grupos iguales (cuartiles, percentiles)

```sql
-- Dividir empleados en 4 cuartiles de salario
SELECT
    nombre,
    salario,
    NTILE(4) OVER (ORDER BY salario DESC) AS cuartil
FROM empleados;

-- cuartil 1 = top 25% mejor pagados
-- cuartil 4 = bottom 25%

-- Percentil 90 (empleados en el top 10%)
SELECT nombre, salario, cuartil
FROM (
    SELECT nombre, salario,
           NTILE(10) OVER (ORDER BY salario DESC) AS cuartil
    FROM empleados
) t
WHERE cuartil = 1;
```

---

# MARTES — LAG, LEAD y Acumulados

## LAG y LEAD — comparar con fila anterior/siguiente

```sql
-- LAG: valor de la fila ANTERIOR
-- LEAD: valor de la fila SIGUIENTE

SELECT
    mes,
    ventas,
    LAG(ventas)  OVER (ORDER BY mes) AS ventas_mes_anterior,
    LEAD(ventas) OVER (ORDER BY mes) AS ventas_mes_siguiente,
    ventas - LAG(ventas) OVER (ORDER BY mes) AS diferencia,
    ROUND(
        (ventas - LAG(ventas) OVER (ORDER BY mes))
        / LAG(ventas) OVER (ORDER BY mes) * 100,
        2
    ) AS crecimiento_pct
FROM ventas_mensuales
ORDER BY mes;

-- Resultado:
-- mes | ventas | anterior | siguiente | diferencia | crecimiento_pct
-- Ene | 10000  |  NULL    |  12000    |   NULL     |   NULL
-- Feb | 12000  |  10000   |  9000     |   2000     |   20.00
-- Mar |  9000  |  12000   |  15000    |  -3000     |  -25.00
-- Abr | 15000  |   9000   |  NULL     |   6000     |   66.67
```

```sql
-- LAG con offset y valor por defecto
-- LAG(columna, N, valorDefault)
SELECT
    mes,
    ventas,
    LAG(ventas, 3, 0) OVER (ORDER BY mes) AS ventas_hace_3_meses
FROM ventas_mensuales;
-- Compara con el mismo mes del trimestre anterior
```

---

## LAG/LEAD por partición

```sql
-- Comparar cada empleado con el que gana más antes que él en su depto
SELECT
    nombre,
    departamento,
    salario,
    LAG(nombre)  OVER (PARTITION BY departamento ORDER BY salario DESC)
        AS empleado_anterior,
    LAG(salario) OVER (PARTITION BY departamento ORDER BY salario DESC)
        AS salario_anterior,
    salario - LAG(salario) OVER (PARTITION BY departamento ORDER BY salario DESC)
        AS diferencia
FROM empleados;
```

---

## SUM y AVG acumulados (Running Totals)

```sql
-- Total acumulado de ventas mes a mes
SELECT
    mes,
    ventas,
    SUM(ventas) OVER (ORDER BY mes
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
        AS total_acumulado,
    AVG(ventas) OVER (ORDER BY mes
                      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
        AS promedio_acumulado
FROM ventas_mensuales;

-- mes | ventas | total_acumulado | promedio_acumulado
-- Ene | 10000  |  10000          |  10000.00
-- Feb | 12000  |  22000          |  11000.00
-- Mar |  9000  |  31000          |  10333.33
-- Abr | 15000  |  46000          |  11500.00
```

---

## Ventana móvil (Moving Average)

```sql
-- Promedio móvil de los últimos 3 meses
SELECT
    mes,
    ventas,
    AVG(ventas) OVER (
        ORDER BY mes
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS promedio_3_meses,
    -- Ventana de 7 días (útil para datos diarios)
    SUM(ventas) OVER (
        ORDER BY mes
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS suma_7_dias
FROM ventas_mensuales;
```

---

## FIRST_VALUE y LAST_VALUE

```sql
-- Salario del mejor y peor pagado del departamento en cada fila
SELECT
    nombre,
    departamento,
    salario,
    FIRST_VALUE(nombre) OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
    ) AS top_earner,
    FIRST_VALUE(salario) OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
    ) AS salario_maximo,
    LAST_VALUE(salario) OVER (
        PARTITION BY departamento
        ORDER BY salario DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS salario_minimo
FROM empleados;
```

---

# MIÉRCOLES — Índices

## ¿Qué es un índice?

Un índice es una **estructura de datos auxiliar** (generalmente B-Tree) que permite localizar filas rápidamente sin escanear toda la tabla. Es como el índice de un libro: en lugar de leer todo el libro para encontrar un tema, vas directo a la página.

```
Sin índice: Full Table Scan
  → lee TODAS las filas hasta encontrar la que cumple la condición
  → O(n): 1 millón de filas = 1 millón de comparaciones

Con índice: Index Seek
  → salta directamente a las filas relevantes
  → O(log n): 1 millón de filas ≈ 20 comparaciones
```

---

## Tipos de índices

```sql
-- Índice simple (una columna)
CREATE INDEX idx_empleados_email
ON empleados(email);

-- Índice compuesto (múltiples columnas)
-- El orden importa: útil para queries que filtran por (dept, salario)
CREATE INDEX idx_emp_dept_salario
ON empleados(departamento_id, salario);

-- Índice único (garantiza no duplicados)
CREATE UNIQUE INDEX idx_empleados_email_unico
ON empleados(email);

-- Índice de cobertura (covering index)
-- Incluye todas las columnas que la query necesita
-- El motor no necesita ir a la tabla principal
CREATE INDEX idx_emp_cobertura
ON empleados(departamento_id, salario, nombre);
-- Para: SELECT nombre, salario FROM empleados WHERE departamento_id = 3

-- Ver índices existentes
SHOW INDEX FROM empleados;

-- Eliminar índice
DROP INDEX idx_empleados_email ON empleados;
```

---

## Cuándo crear un índice — reglas prácticas

### SÍ crear índice en:

```sql
-- 1. Columnas usadas frecuentemente en WHERE
SELECT * FROM empleados WHERE email = 'ana@empresa.com';
-- → CREATE INDEX idx_email ON empleados(email)

-- 2. Columnas usadas en JOIN
SELECT e.nombre, d.nombre_dept
FROM empleados e
JOIN departamentos d ON e.departamento_id = d.id;
-- → departamento_id casi siempre tiene índice automático como FK

-- 3. Columnas usadas en ORDER BY con grandes resultados
SELECT * FROM ventas ORDER BY fecha DESC LIMIT 10;
-- → CREATE INDEX idx_ventas_fecha ON ventas(fecha)

-- 4. Columnas de alta selectividad (muchos valores distintos)
-- email, uuid, número de documento → buena selectividad
-- género, estado (activo/inactivo) → mala selectividad
```

### NO crear índice en:

```sql
-- 1. Tablas pequeñas (< 1000 filas): el full scan es más rápido
-- 2. Columnas con poca selectividad: sexo, estado, tipo (pocos valores distintos)
-- 3. Columnas que se actualizan muy frecuentemente (el índice se reconstruye)
-- 4. No indexar todo: cada índice ocupa espacio y ralentiza INSERT/UPDATE/DELETE
```

---

## El orden en índices compuestos

```sql
-- Índice: (departamento_id, salario)
CREATE INDEX idx_dept_sal ON empleados(departamento_id, salario);

-- ✅ Usa el índice completo
SELECT * FROM empleados WHERE departamento_id = 3 AND salario > 10000;

-- ✅ Usa el primer campo del índice
SELECT * FROM empleados WHERE departamento_id = 3;

-- ❌ NO usa el índice (falta la primera columna)
SELECT * FROM empleados WHERE salario > 10000;

-- Regla: el índice se usa de izquierda a derecha.
-- No puedes "saltarte" la primera columna.
```

---

## Cuándo los índices NO se usan

```sql
-- 1. Función sobre la columna indexada
-- ❌ No usa índice en fecha
SELECT * FROM ventas WHERE YEAR(fecha) = 2024;
-- ✅ Alternativa
SELECT * FROM ventas WHERE fecha BETWEEN '2024-01-01' AND '2024-12-31';

-- 2. Wildcard al inicio con LIKE
-- ❌ No usa índice
SELECT * FROM clientes WHERE nombre LIKE '%García';
-- ✅ Sí usa índice (wildcard al final)
SELECT * FROM clientes WHERE nombre LIKE 'García%';

-- 3. Negación (NOT, !=, <>)
-- ❌ Generalmente no usa índice
SELECT * FROM empleados WHERE departamento_id != 3;

-- 4. Conversión implícita de tipos
-- ❌ Si id es INT y lo comparas con String
SELECT * FROM empleados WHERE id = '42';
-- ✅ Usa el tipo correcto
SELECT * FROM empleados WHERE id = 42;
```

---

# JUEVES — EXPLAIN y Optimización de Queries

## ¿Qué hace EXPLAIN?

`EXPLAIN` muestra el **plan de ejecución** que el motor de base de datos elige para ejecutar una query: qué tablas escanea, qué índices usa, en qué orden hace los joins, cuántas filas estima procesar.

```sql
EXPLAIN SELECT e.nombre, d.nombre_dept
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id
WHERE e.salario > 10000;
```

---

## Columnas clave de EXPLAIN (MySQL)

```
id | select_type | table | type   | possible_keys | key          | rows | Extra
1  | SIMPLE      | d     | ALL    | PRIMARY       | NULL         | 10   | NULL
1  | SIMPLE      | e     | ref    | idx_dept_id   | idx_dept_id  | 5    | Using where
```

### `type` — el más importante, de mejor a peor:

| type | Significado | Velocidad |
|---|---|---|
| `system` | Una sola fila | ⚡⚡⚡⚡⚡ |
| `const` | Una fila por clave primaria/única | ⚡⚡⚡⚡⚡ |
| `eq_ref` | Una fila por join con PK/UK | ⚡⚡⚡⚡ |
| `ref` | Varias filas por índice | ⚡⚡⚡ |
| `range` | Rango de índice (BETWEEN, >, <) | ⚡⚡ |
| `index` | Scan completo del índice | ⚡ |
| `ALL` | Full table scan — **peligro** | 🐢 |

> **Alerta:** si ves `type = ALL` en tablas grandes, hay un problema de rendimiento.

---

## EXPLAIN ANALYZE — el plan real con tiempos

```sql
-- MySQL 8.0+ / PostgreSQL
EXPLAIN ANALYZE
SELECT e.nombre, d.nombre_dept, e.salario
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id
WHERE e.salario > 10000
ORDER BY e.salario DESC;

-- Muestra el tiempo real de ejecución, no solo la estimación
```

---

## Patrones de queries lentas y cómo arreglarlos

### Patrón 1: SELECT * innecesario

```sql
-- ❌ Trae todas las columnas aunque solo necesites 2
SELECT * FROM empleados WHERE departamento_id = 3;

-- ✅ Solo las columnas necesarias
SELECT nombre, salario FROM empleados WHERE departamento_id = 3;
-- Menos datos transferidos, puede aprovechar índices de cobertura
```

---

### Patrón 2: N+1 queries (el más común en ORMs)

```sql
-- ❌ N+1: primero traes todos los empleados (1 query)
-- luego para cada uno buscas su departamento (N queries)
-- Con 100 empleados = 101 queries

-- ✅ Un solo JOIN
SELECT e.nombre, e.salario, d.nombre_dept
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id;
```

---

### Patrón 3: Funciones en columnas indexadas

```sql
-- ❌ La función impide usar el índice
SELECT * FROM pedidos WHERE MONTH(fecha) = 3;

-- ✅ Rango equivalente que sí usa el índice
SELECT * FROM pedidos
WHERE fecha >= '2024-03-01' AND fecha < '2024-04-01';
```

---

### Patrón 4: Subquery correlacionado en bucle

```sql
-- ❌ El subquery se ejecuta una vez por cada fila del exterior
SELECT e.nombre,
    (SELECT COUNT(*) FROM pedidos p WHERE p.empleado_id = e.id) AS total_pedidos
FROM empleados e;

-- ✅ JOIN + GROUP BY — una sola pasada
SELECT e.nombre, COUNT(p.id) AS total_pedidos
FROM empleados e
LEFT JOIN pedidos p ON e.id = p.empleado_id
GROUP BY e.id, e.nombre;
```

---

### Patrón 5: LIKE con wildcard inicial

```sql
-- ❌ Full scan — no puede usar índice
SELECT * FROM clientes WHERE nombre LIKE '%García';

-- ✅ Si el caso de uso lo permite, wildcard solo al final
SELECT * FROM clientes WHERE nombre LIKE 'García%';

-- Para búsqueda de texto completo considera FULLTEXT index
ALTER TABLE clientes ADD FULLTEXT idx_nombre_fulltext (nombre);
SELECT * FROM clientes WHERE MATCH(nombre) AGAINST ('García');
```

---

### Patrón 6: Paginación con OFFSET grande

```sql
-- ❌ Con OFFSET 100000, lee y descarta 100000 filas
SELECT * FROM pedidos ORDER BY fecha DESC LIMIT 20 OFFSET 100000;

-- ✅ Keyset pagination (cursor-based)
-- Guarda el último id/fecha de la página anterior
SELECT * FROM pedidos
WHERE fecha < '2024-03-15 10:30:00'   -- último valor de la página anterior
ORDER BY fecha DESC
LIMIT 20;
-- O(1) en lugar de O(n)
```

---

### Patrón 7: OR en columnas diferentes

```sql
-- ❌ OR en columnas distintas dificulta el uso de índices
SELECT * FROM empleados
WHERE departamento_id = 3 OR email = 'ana@empresa.com';

-- ✅ UNION (cada rama puede usar su propio índice)
SELECT * FROM empleados WHERE departamento_id = 3
UNION
SELECT * FROM empleados WHERE email = 'ana@empresa.com';
```

---

## Métricas para monitorear queries lentas

```sql
-- Activar slow query log en MySQL
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;   -- queries > 1 segundo

-- Ver las queries más costosas
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;

-- Ver qué queries están corriendo ahora mismo
SHOW PROCESSLIST;

-- Estadísticas de uso de índices
SELECT * FROM sys.schema_index_statistics
ORDER BY rows_selected DESC;

-- Tablas sin índices o con índices sin usar
SELECT * FROM sys.schema_unused_indexes;
SELECT * FROM sys.schema_tables_with_full_table_scans;
```

---

# VIERNES — Simulación Cronometrada

> Sin apuntes. Cronómetro: 45 minutos.

## Tablas para los ejercicios

```sql
-- empleados(id, nombre, departamento_id, salario, fecha_ingreso, activo)
-- departamentos(id, nombre_dept, ciudad, presupuesto)
-- ventas(id, empleado_id, cliente_id, monto, fecha)
-- clientes(id, nombre, ciudad, email)
```

## Consulta 1: Ranking de empleados con comparación al promedio

```sql
-- Para cada empleado: su rank en el depto, su salario vs el promedio del depto,
-- y si gana más o menos que el anterior en el ranking
SELECT
    e.nombre,
    d.nombre_dept,
    e.salario,
    RANK() OVER (
        PARTITION BY e.departamento_id
        ORDER BY e.salario DESC
    ) AS rank_depto,
    ROUND(AVG(e.salario) OVER (
        PARTITION BY e.departamento_id
    ), 2) AS promedio_depto,
    ROUND(e.salario - AVG(e.salario) OVER (
        PARTITION BY e.departamento_id
    ), 2) AS vs_promedio,
    LAG(e.nombre) OVER (
        PARTITION BY e.departamento_id
        ORDER BY e.salario DESC
    ) AS empleado_anterior
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id
WHERE e.activo = 1
ORDER BY d.nombre_dept, rank_depto;
```

## Consulta 2: Análisis de ventas con acumulados

```sql
-- Ventas mensuales con total acumulado, promedio móvil 3 meses
-- y comparación con mes anterior por vendedor
SELECT
    e.nombre AS vendedor,
    DATE_FORMAT(v.fecha, '%Y-%m') AS mes,
    SUM(v.monto) AS ventas_mes,
    SUM(SUM(v.monto)) OVER (
        PARTITION BY e.id
        ORDER BY DATE_FORMAT(v.fecha, '%Y-%m')
        ROWS UNBOUNDED PRECEDING
    ) AS acumulado,
    AVG(SUM(v.monto)) OVER (
        PARTITION BY e.id
        ORDER BY DATE_FORMAT(v.fecha, '%Y-%m')
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS promedio_3_meses,
    LAG(SUM(v.monto)) OVER (
        PARTITION BY e.id
        ORDER BY DATE_FORMAT(v.fecha, '%Y-%m')
    ) AS mes_anterior
FROM ventas v
INNER JOIN empleados e ON v.empleado_id = e.id
WHERE v.fecha >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY e.id, e.nombre, DATE_FORMAT(v.fecha, '%Y-%m')
ORDER BY vendedor, mes;
```

## Consulta 3: Top 3 clientes por ciudad con window function

```sql
-- Los 3 clientes que más compraron en cada ciudad
SELECT *
FROM (
    SELECT
        c.ciudad,
        c.nombre AS cliente,
        SUM(v.monto) AS total_comprado,
        ROW_NUMBER() OVER (
            PARTITION BY c.ciudad
            ORDER BY SUM(v.monto) DESC
        ) AS ranking
    FROM clientes c
    INNER JOIN ventas v ON c.id = v.cliente_id
    GROUP BY c.ciudad, c.id, c.nombre
) ranked
WHERE ranking <= 3
ORDER BY ciudad, ranking;
```

---

# SÁBADO — Transacciones: ACID y Niveles de Aislamiento

## ¿Qué es una transacción?

Una transacción es un conjunto de operaciones que se ejecutan como una **unidad indivisible**: o todas se completan con éxito, o ninguna se aplica.

```sql
-- Sin transacción: si falla la segunda operación, el dinero desaparece
UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;  -- débito
UPDATE cuentas SET saldo = saldo + 1000 WHERE id = 2;  -- crédito ← si falla aquí

-- Con transacción: ambas o ninguna
START TRANSACTION;
    UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;
    UPDATE cuentas SET saldo = saldo + 1000 WHERE id = 2;
COMMIT;   -- confirma si todo salió bien

-- Si algo falla:
ROLLBACK;  -- deshace todo
```

---

## ACID — las 4 propiedades

```
A — Atomicidad (Atomicity)
    Todo o nada. Si una operación falla, se revierten todas.
    "El depósito de $1000 no puede debitarse de A sin acreditarse en B."

C — Consistencia (Consistency)
    La BD pasa de un estado válido a otro estado válido.
    "El saldo nunca puede quedar negativo si la regla lo prohíbe."

I — Aislamiento (Isolation)
    Las transacciones concurrentes no se interfieren.
    "Dos transferencias simultáneas no se pisan."

D — Durabilidad (Durability)
    Una vez confirmada, la transacción sobrevive fallos del sistema.
    "Si el servidor se cae después del COMMIT, los datos persisten."
```

---

## Problemas de concurrencia sin aislamiento

```
Dirty Read:
  T1 modifica dato X (sin commit).
  T2 lee X.
  T1 hace ROLLBACK.
  T2 tiene un valor que nunca existió.

Non-Repeatable Read:
  T1 lee dato X → valor 100.
  T2 modifica X a 200 y hace COMMIT.
  T1 vuelve a leer X → valor 200. ← ¡cambió dentro de la misma transacción!

Phantom Read:
  T1 lee filas donde salario > 10000 → 5 filas.
  T2 inserta una fila con salario 15000.
  T1 vuelve a leer → 6 filas. ← ¡aparecieron filas nuevas!
```

---

## Niveles de aislamiento

| Nivel | Dirty Read | Non-Repeatable | Phantom | Rendimiento |
|---|---|---|---|---|
| `READ UNCOMMITTED` | ✅ posible | ✅ posible | ✅ posible | ⚡⚡⚡⚡ |
| `READ COMMITTED` | ❌ no | ✅ posible | ✅ posible | ⚡⚡⚡ |
| `REPEATABLE READ` | ❌ no | ❌ no | ✅ posible | ⚡⚡ |
| `SERIALIZABLE` | ❌ no | ❌ no | ❌ no | ⚡ |

```sql
-- Cambiar nivel de aislamiento
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;   -- default en MySQL InnoDB
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Ver nivel actual
SELECT @@transaction_isolation;
```

> **Regla práctica:** `READ COMMITTED` para la mayoría de aplicaciones web. `REPEATABLE READ` cuando necesitas consistencia dentro de una transacción larga. `SERIALIZABLE` solo cuando la corrección es crítica y el rendimiento no importa.

---

## Transacciones en Spring Boot

```java
// Con @Transactional — Spring maneja el BEGIN/COMMIT/ROLLBACK automáticamente
@Service
public class TransferenciaService {

    private final CuentaRepository cuentaRepo;

    public TransferenciaService(CuentaRepository cuentaRepo) {
        this.cuentaRepo = cuentaRepo;
    }

    @Transactional
    public void transferir(Long origenId, Long destinoId, double monto) {
        Cuenta origen  = cuentaRepo.findById(origenId)
            .orElseThrow(() -> new RuntimeException("Cuenta origen no existe"));
        Cuenta destino = cuentaRepo.findById(destinoId)
            .orElseThrow(() -> new RuntimeException("Cuenta destino no existe"));

        if (origen.getSaldo() < monto)
            throw new RuntimeException("Saldo insuficiente");

        origen.setSaldo(origen.getSaldo() - monto);
        destino.setSaldo(destino.getSaldo() + monto);

        cuentaRepo.save(origen);
        cuentaRepo.save(destino);
        // Si cualquier línea lanza excepción → ROLLBACK automático
        // Si todo termina bien → COMMIT automático
    }
}
```

---

## Opciones de @Transactional

```java
// Propagación: qué pasa cuando un método transaccional llama a otro
@Transactional(propagation = Propagation.REQUIRED)      // default: unirse a la existente o crear nueva
@Transactional(propagation = Propagation.REQUIRES_NEW)  // siempre crear nueva (suspende la actual)
@Transactional(propagation = Propagation.NESTED)        // nested: savepoint interno
@Transactional(propagation = Propagation.NEVER)         // error si hay una transacción activa

// Solo rollback en excepciones unchecked por defecto
// Para incluir checked exceptions:
@Transactional(rollbackFor = Exception.class)

// Solo lectura — optimización para queries de solo SELECT
@Transactional(readOnly = true)

// Timeout — rollback si tarda más de 5 segundos
@Transactional(timeout = 5)

// Nivel de aislamiento
@Transactional(isolation = Isolation.READ_COMMITTED)
```

---

## Deadlocks en bases de datos

```sql
-- Escenario de deadlock:
-- T1: UPDATE cuenta SET saldo=900 WHERE id=1;  (bloquea fila 1)
-- T2: UPDATE cuenta SET saldo=600 WHERE id=2;  (bloquea fila 2)
-- T1: UPDATE cuenta SET saldo=600 WHERE id=2;  (espera T2)
-- T2: UPDATE cuenta SET saldo=900 WHERE id=1;  (espera T1) ← DEADLOCK

-- El motor detecta el deadlock y hace rollback de una de las transacciones
-- (la que tiene menor costo de rollback)

-- Estrategias para evitar deadlocks:
-- 1. Acceder a las filas siempre en el mismo orden (por id)
-- 2. Transacciones cortas y rápidas
-- 3. Índices adecuados (bloqueos de rango son más problemáticos)
-- 4. Usar SELECT ... FOR UPDATE para bloquear antes de leer

-- Bloqueo explícito para evitar condición de carrera
START TRANSACTION;
SELECT * FROM cuentas WHERE id = 1 FOR UPDATE;   -- bloquea la fila
UPDATE cuentas SET saldo = saldo - 1000 WHERE id = 1;
COMMIT;
```

---

## Savepoints — rollback parcial

```sql
-- Guardar un punto intermedio en la transacción
START TRANSACTION;

    INSERT INTO pedidos(cliente_id, total) VALUES (1, 500);
    SAVEPOINT despues_pedido;

    INSERT INTO detalle_pedido(pedido_id, producto_id, cantidad)
    VALUES (LAST_INSERT_ID(), 10, 2);

    -- Si el detalle falla, solo revertimos el detalle, no el pedido
    ROLLBACK TO SAVEPOINT despues_pedido;
    -- El pedido sigue existiendo, el detalle no

COMMIT;
```

---

# DOMINGO — Repaso + Preguntas de Entrevista

## Lista de verificación

- [ ] Sé la diferencia entre `ROW_NUMBER`, `RANK` y `DENSE_RANK` con un ejemplo de empate.
- [ ] Puedo usar `LAG` y `LEAD` para comparar filas consecutivas.
- [ ] Sé cómo calcular un total acumulado y un promedio móvil.
- [ ] Entiendo cuándo un índice se usa y cuándo no.
- [ ] Sé leer las columnas `type` y `rows` en un `EXPLAIN`.
- [ ] Puedo identificar al menos 4 patrones de queries lentas.
- [ ] Puedo explicar ACID con un ejemplo concreto.
- [ ] Sé la diferencia entre los 4 niveles de aislamiento.
- [ ] Entiendo para qué sirve `@Transactional` en Spring Boot.

---

## Ejercicios de repaso propuestos

### Window Functions

1. Dado un historial de precios de productos, muestra para cada producto el precio actual, el anterior y el cambio porcentual.
2. Para cada vendedor, muestra su mes de mayor venta y el monto de ese mes.
3. Calcula el percentil 75 de salarios por departamento usando `NTILE`.
4. Encuentra empleados cuyo salario está por encima del promedio de los últimos 3 contratados en su depto.

### Índices y Optimización

1. ¿Qué índices agregarías a esta query? `SELECT * FROM ventas WHERE empleado_id = 5 AND fecha BETWEEN '2024-01-01' AND '2024-12-31' ORDER BY monto DESC`
2. Identifica qué está mal: `SELECT * FROM clientes WHERE LOWER(email) = 'ana@empresa.com'`
3. Reescribe usando keyset pagination: `SELECT * FROM logs ORDER BY created_at DESC LIMIT 20 OFFSET 50000`

### Transacciones

1. Escribe una transacción que transfiera inventario de un almacén a otro con validación de stock disponible.
2. ¿Qué nivel de aislamiento usarías para un sistema de reservas de asientos de avión? ¿Por qué?

---

## Preguntas de entrevista frecuentes — Semana 8

**1. ¿Cuál es la diferencia entre RANK y DENSE_RANK?**  
Ambos asignan la misma posición a valores iguales. `RANK` salta el siguiente número (empate en pos 2 → siguiente es 4). `DENSE_RANK` no salta (empate en pos 2 → siguiente es 3).

**2. ¿Para qué sirven LAG y LEAD?**  
Para acceder al valor de la fila anterior (`LAG`) o siguiente (`LEAD`) dentro de una ventana ordenada, sin necesidad de un self-join. Muy usados para calcular variaciones entre períodos, detectar gaps, o comparar con el registro anterior.

**3. ¿Cuándo NO deberías crear un índice?**  
En tablas pequeñas (full scan es más rápido), en columnas con baja selectividad (pocos valores distintos como género o estado), en columnas que se actualizan muy frecuentemente, y cuando ya hay demasiados índices que ralentizan las escrituras.

**4. ¿Qué es un Full Table Scan y cuándo es aceptable?**  
Es cuando el motor lee todas las filas de la tabla. Es inevitable y aceptable en tablas pequeñas, o cuando la query retorna más del 20-30% de las filas (en ese caso el índice tiene overhead sin beneficio). En tablas grandes con queries selectivas, es un problema.

**5. ¿Qué significa ACID?**  
Atomicidad (todo o nada), Consistencia (de estado válido a estado válido), Isolation (transacciones concurrentes no se interfieren) y Durabilidad (los datos confirmados persisten ante fallos).

**6. ¿Cuál es la diferencia entre COMMIT y ROLLBACK?**  
`COMMIT` confirma todos los cambios de la transacción de forma permanente. `ROLLBACK` deshace todos los cambios desde el inicio de la transacción (o hasta el último `SAVEPOINT`).

**7. ¿Qué hace `@Transactional(readOnly = true)`?**  
Le indica a Hibernate y al motor de BD que la transacción solo hará lecturas. Esto permite optimizaciones: Hibernate omite el dirty checking (rastreo de cambios), y algunos motores pueden usar réplicas de solo lectura o reducir la granularidad de los locks.

**8. ¿Cómo prevenirías el problema N+1 en JPA?**  
Usando `JOIN FETCH` en JPQL, `@EntityGraph`, o cambiando el tipo de fetch a `EAGER` cuando siempre necesitas los datos relacionados. En consultas específicas, es mejor usar una query con `JOIN FETCH` que cambiar el fetch type global de la entidad.

---

## Métricas de la semana 8

| Métrica | Meta | Tu resultado |
|---|---|---|
| Window functions escritas sin ayuda | 5 o más | |
| Queries lentas identificadas y optimizadas | 4 o más | |
| EXPLAIN analizado e interpretado | Sí / No | |
| Transacción con @Transactional implementada | Sí / No | |
| Horas reales cumplidas | 14+ L-V + 6 fin de semana | |
| Errores aprendidos | Anotar al menos 3 | |

---

## Errores de la semana — anótalos aquí

| # | Error | ¿Cómo lo resolví? |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

## Autoevaluación Fase 2 — ¿Estás listo para la Fase 3?

| # | ¿Puedo hacer esto sin ayuda? | ✓ |
|---|---|---|
| 1 | Construir una API REST completa con Spring Boot en 2 horas | |
| 2 | Implementar autenticación JWT con roles en una API existente | |
| 3 | Usar ExecutorService y CompletableFuture para tareas paralelas | |
| 4 | Escribir window functions para ranking y acumulados | |
| 5 | Leer un EXPLAIN e identificar el cuello de botella | |
| 6 | Crear índices correctos para una query dada | |
| 7 | Explicar ACID y los niveles de aislamiento con ejemplos | |
| 8 | Usar @Transactional con la propagación y rollback correctos | |
| 9 | Identificar y corregir el problema N+1 en JPA | |
| 10 | Explicar todo lo anterior en voz alta como en una entrevista | |

---

> **La semana que viene — FASE 3:** Mock Interviews · Grabarte respondiendo · Arquitectura · Algoritmos  
> *Fase 2 completada. Ya tienes las herramientas. Ahora toca demostrar que las dominas.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

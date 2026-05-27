# Semana 12 — Simulación Final Completa · Evaluación · Plan

> **Fase 3 — Simulación y Entrevistas** · Programa Intensivo Java Backend Developer  
> Sin temas nuevos. Todo es integración, medición y cierre.

---

## Estructura de la semana

| Día | Tema | Tiempo |
|---|---|---|
| Lunes | Autoevaluación total · repaso dirigido por puntos débiles | 2 hrs |
| Martes | Prueba técnica Java · 4 ejercicios reales sin ayuda | 90 min |
| Miércoles | Examen SQL · 5 consultas + Psicométrico final | 60 + 45 min |
| Jueves | Entrevista simulada completa grabada | 75 min |
| Viernes | Evaluación final · comparar semana 9 vs semana 12 | 2 hrs |
| Sábado | Plan post-programa: mes 1, 2 y 3 | 1.5 hrs |
| Domingo | Cierre · próximos pasos · recursos | 1 hr |

---

## Objetivo de la semana

Esta semana no introduces nada nuevo. El objetivo es medir en números concretos cuánto mejoraste en 12 semanas y tener un plan claro de qué sigue después del programa.

Al terminar el domingo debes poder responder:

- ¿Qué sé hacer solo, sin ayuda y bajo presión?
- ¿Qué temas todavía necesito reforzar antes de aplicar?
- ¿Estoy listo para aplicar a posiciones Java Backend Senior?
- ¿Cuál es mi plan concreto para los próximos 90 días?

---

# LUNES — Autoevaluación Total

## Instrucciones

1. Lee cada tema de la tabla de abajo.
2. Márcalo con honestidad: sin ayuda ni apuntes, ¿podrías resolver un ejercicio o responder la pregunta en una entrevista?
3. Para cada tema marcado como `❌` o `⚠️`, dedica 20-30 minutos a repasar la guía correspondiente.
4. No avances al martes hasta tener el mapa claro de tus puntos ciegos.

```
✅  Sólido   — puedo explicarlo y codificarlo sin ayuda
⚠️  Regular  — entiendo el concepto pero me trabo en los detalles
❌  Débil    — necesito repasar antes de ir a la entrevista
```

---

## Tabla de autoevaluación — Fase 1 (Semanas 1-4)

| Tema | Nivel |
|---|---|
| Arrays: máximo, mínimo, inversión, suma | |
| Strings: palíndromo, frecuencias, anagramas | |
| ArrayList: CRUD, ordenar, buscar | |
| HashSet: eliminar duplicados en O(n), operaciones de conjuntos | |
| HashMap: frecuencias, conteo, Two Sum | |
| POO: herencia, polimorfismo, encapsulamiento con validación | |
| Interfaces vs clases abstractas: cuándo usar cada una | |
| Streams: filter, map, collect, groupingBy, max, min | |
| Optional: orElse, map, flatMap, orElseThrow | |
| Excepciones custom: jerarquía y cuándo lanzarlas | |
| SQL: JOINs (INNER, LEFT, RIGHT) con múltiples tablas | |
| SQL: GROUP BY + HAVING: regla de columnas, diferencia con WHERE | |
| SQL: subqueries en WHERE, FROM, EXISTS/NOT EXISTS | |

## Tabla de autoevaluación — Fase 2 (Semanas 5-8)

| Tema | Nivel |
|---|---|
| Spring Boot: Controller → Service → Repository · DTOs | |
| JPA: entidades, relaciones, @OneToMany, LAZY vs EAGER | |
| Problema N+1: qué es y cómo solucionarlo con JOIN FETCH | |
| JWT: flujo completo de autenticación (login → token → request) | |
| Spring Security: filtro JWT, SecurityConfig, @PreAuthorize | |
| Threads vs ExecutorService: cuándo usar cada uno | |
| Race condition: qué es, cómo ocurre, cómo prevenirla | |
| CompletableFuture: thenApply, thenCompose, allOf | |

## Tabla de autoevaluación — Preguntas teóricas frecuentes

| Pregunta | Nivel |
|---|---|
| ¿Qué es la inyección de dependencias y por qué la usa Spring? | |
| ¿Qué hace @Transactional? ¿Cuándo hace ROLLBACK? | |
| ¿Cuál es la diferencia entre WHERE y HAVING? | |
| ¿Qué es un índice y cuándo NO lo crearías? | |
| ¿Cuál es la diferencia entre == y .equals()? | |
| ¿Qué hace volatile y para qué NO sirve? | |
| ¿Por qué el payload de JWT no es seguro para datos sensibles? | |
| ¿Cuál es la diferencia entre RANK() y DENSE_RANK()? | |

---

## Plan del día basado en la autoevaluación

```
Temas con ❌ (repasa hoy, son los que pueden costarte la entrevista):
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Temas con ⚠️ (refuerza con 1 ejercicio práctico cada uno):
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

# MARTES — Prueba Técnica Java (90 minutos)

## Instrucciones

- **Tiempo total: 90 minutos.** Cronómetro desde la primera línea.
- Sin apuntes. Sin Google. Sin autocompletado si puedes evitarlo.
- Antes de codificar cada ejercicio: explica en voz alta tu approach (como en una entrevista real).
- Al terminar, califica con la rúbrica al final de la sección.

---

## Ejercicio 1 — Collections + lógica (20 min)

**Enunciado:** Dado un texto en español, devuelve un `Map<String, Long>` con las 5 palabras más frecuentes ignorando mayúsculas/minúsculas y palabras de menos de 4 letras. Si hay empate en frecuencia, ordena alfabéticamente.

```java
public static Map<String, Long> top5Palabras(String texto) {
    return Arrays.stream(
            texto.toLowerCase()
                 .replaceAll("[^a-záéíóúüñ\\s]", "")
                 .split("\\s+")
        )
        .filter(p -> p.length() >= 4)
        .collect(Collectors.groupingBy(
            Function.identity(), Collectors.counting()
        ))
        .entrySet().stream()
        .sorted(
            Map.Entry.<String, Long>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey())
        )
        .limit(5)
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue,
            (e1, e2) -> e1,
            LinkedHashMap::new
        ));
}

// Prueba:
// top5Palabras("java es genial java back java back end back java fin")
// → {java=4, back=3, genial=1, ...}
```

---

## Ejercicio 2 — POO con lógica de negocio (25 min)

**Enunciado:** Diseña un sistema de calificaciones para un bootcamp. Un `Estudiante` tiene nombre, lista de calificaciones (0-100) y un método `obtenerPromedio()`. Un `Grupo` contiene estudiantes y debe poder: agregar estudiantes, retornar el top N por promedio, retornar los estudiantes que reprobaron (promedio < 70), y retornar el promedio general del grupo.

```java
public class Estudiante {

    private final String nombre;
    private final List<Double> calificaciones;

    public Estudiante(String nombre) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("Nombre requerido");
        this.nombre        = nombre;
        this.calificaciones = new ArrayList<>();
    }

    public void agregarCalificacion(double cal) {
        if (cal < 0 || cal > 100)
            throw new IllegalArgumentException("Calificación fuera de rango: " + cal);
        calificaciones.add(cal);
    }

    public double obtenerPromedio() {
        if (calificaciones.isEmpty()) return 0;
        return calificaciones.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0);
    }

    public String getNombre()            { return nombre; }
    public List<Double> getCalificaciones() { return Collections.unmodifiableList(calificaciones); }

    @Override
    public String toString() {
        return String.format("%s (promedio: %.1f)", nombre, obtenerPromedio());
    }
}

public class Grupo {

    private final String nombre;
    private final List<Estudiante> estudiantes = new ArrayList<>();

    public Grupo(String nombre) { this.nombre = nombre; }

    public void agregar(Estudiante e) {
        if (e == null) throw new IllegalArgumentException("Estudiante nulo");
        estudiantes.add(e);
    }

    public List<Estudiante> topN(int n) {
        return estudiantes.stream()
            .sorted(Comparator.comparingDouble(Estudiante::obtenerPromedio).reversed())
            .limit(n)
            .collect(Collectors.toList());
    }

    public List<Estudiante> reprobados() {
        return estudiantes.stream()
            .filter(e -> e.obtenerPromedio() < 70)
            .collect(Collectors.toList());
    }

    public double promedioGeneral() {
        return estudiantes.stream()
            .mapToDouble(Estudiante::obtenerPromedio)
            .average()
            .orElse(0);
    }
}

// Prueba:
Grupo g = new Grupo("Java Backend");
Estudiante e1 = new Estudiante("Ana");
e1.agregarCalificacion(90); e1.agregarCalificacion(85);
Estudiante e2 = new Estudiante("Luis");
e2.agregarCalificacion(60); e2.agregarCalificacion(65);
g.agregar(e1); g.agregar(e2);

System.out.println(g.topN(1));          // [Ana (promedio: 87.5)]
System.out.println(g.reprobados());     // [Luis (promedio: 62.5)]
System.out.printf("%.1f%n", g.promedioGeneral()); // 75.0
```

---

## Ejercicio 3 — Excepciones + Optional + Streams (20 min)

**Enunciado:** Implementa un `CuentaService` que gestione cuentas bancarias en memoria. Debe tener: `crearCuenta(String titular, double saldoInicial)`, `depositar(Long id, double monto)`, `retirar(Long id, double monto)` y `buscarPorTitular(String titular)` que retorne `Optional<Cuenta>`. Usa excepciones custom para errores de negocio.

```java
class CuentaException extends RuntimeException {
    private final String codigo;
    public CuentaException(String codigo, String msg) {
        super(msg); this.codigo = codigo;
    }
    public String getCodigo() { return codigo; }
}

class Cuenta {
    private static final AtomicLong contador = new AtomicLong(0);
    private final Long   id;
    private final String titular;
    private double       saldo;

    public Cuenta(String titular, double saldoInicial) {
        if (saldoInicial < 0)
            throw new CuentaException("SALDO_INV", "Saldo inicial negativo");
        this.id      = contador.incrementAndGet();
        this.titular = titular;
        this.saldo   = saldoInicial;
    }

    public void depositar(double monto) {
        if (monto <= 0)
            throw new CuentaException("MONTO_INV", "Monto debe ser positivo");
        this.saldo += monto;
    }

    public void retirar(double monto) {
        if (monto <= 0)
            throw new CuentaException("MONTO_INV", "Monto debe ser positivo");
        if (monto > saldo)
            throw new CuentaException("SALDO_INSUF",
                String.format("Saldo: %.2f, monto: %.2f", saldo, monto));
        this.saldo -= monto;
    }

    public Long   getId()      { return id; }
    public String getTitular() { return titular; }
    public double getSaldo()   { return saldo; }

    @Override
    public String toString() {
        return String.format("Cuenta#%d [%s] Saldo: $%.2f", id, titular, saldo);
    }
}

class CuentaService {

    private final Map<Long, Cuenta> cuentas = new ConcurrentHashMap<>();

    public Cuenta crearCuenta(String titular, double saldoInicial) {
        Cuenta nueva = new Cuenta(titular, saldoInicial);
        cuentas.put(nueva.getId(), nueva);
        return nueva;
    }

    public void depositar(Long id, double monto) {
        obtenerOLanzar(id).depositar(monto);
    }

    public void retirar(Long id, double monto) {
        obtenerOLanzar(id).retirar(monto);
    }

    public Optional<Cuenta> buscarPorTitular(String titular) {
        return cuentas.values().stream()
            .filter(c -> c.getTitular().equalsIgnoreCase(titular))
            .findFirst();
    }

    private Cuenta obtenerOLanzar(Long id) {
        return Optional.ofNullable(cuentas.get(id))
            .orElseThrow(() ->
                new CuentaException("CUENTA_NF", "Cuenta no encontrada: " + id));
    }
}
```

---

## Ejercicio 4 — Concurrencia básica (25 min)

**Enunciado:** Implementa un `ProcesadorPedidos` que procese una lista de pedidos de forma concurrente usando un `ExecutorService` con 3 threads. Cada pedido tiene un `id` y un `tipo` (NORMAL, URGENTE). Los URGENTES deben procesarse primero. Retorna la lista de resultados en el orden en que terminaron. Usa `CompletableFuture`.

```java
public record Pedido(Long id, String tipo, String descripcion) {}
public record ResultadoPedido(Long pedidoId, String resultado, long tiempoMs) {}

public class ProcesadorPedidos {

    private final ExecutorService executor = Executors.newFixedThreadPool(3);

    public List<ResultadoPedido> procesarTodos(List<Pedido> pedidos) {
        // Ordenar: URGENTES primero
        List<Pedido> ordenados = pedidos.stream()
            .sorted(Comparator.comparing(p ->
                p.tipo().equals("URGENTE") ? 0 : 1))
            .collect(Collectors.toList());

        // Lanzar todos en paralelo y recolectar futuros
        List<CompletableFuture<ResultadoPedido>> futuros = ordenados.stream()
            .map(pedido -> CompletableFuture.supplyAsync(
                () -> procesarPedido(pedido), executor
            ))
            .collect(Collectors.toList());

        // Esperar que todos terminen y recolectar resultados
        return futuros.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
    }

    private ResultadoPedido procesarPedido(Pedido pedido) {
        long inicio = System.currentTimeMillis();
        try {
            // Simular trabajo
            long tiempo = pedido.tipo().equals("URGENTE") ? 100 : 300;
            Thread.sleep(tiempo);
            return new ResultadoPedido(
                pedido.id(),
                "Procesado: " + pedido.descripcion(),
                System.currentTimeMillis() - inicio
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrumpido: " + pedido.id());
        }
    }

    public void cerrar() { executor.shutdown(); }
}

// Prueba:
ProcesadorPedidos proc = new ProcesadorPedidos();
List<Pedido> pedidos = List.of(
    new Pedido(1L, "NORMAL",   "Pedido estándar A"),
    new Pedido(2L, "URGENTE",  "Pedido urgente B"),
    new Pedido(3L, "NORMAL",   "Pedido estándar C"),
    new Pedido(4L, "URGENTE",  "Pedido urgente D")
);
proc.procesarTodos(pedidos).forEach(System.out::println);
proc.cerrar();
```

---

## Rúbrica de calificación — Prueba Técnica Java

| Ejercicio | Criterio | Pts | Tus pts |
|---|---|---|---|
| **Ej 1** | Compila y retorna resultado correcto | 8 | |
| | Usa Streams correctamente | 5 | |
| | Maneja empates y filtra palabras cortas | 7 | |
| **Ej 2** | Clase Estudiante: validaciones y métodos | 8 | |
| | Clase Grupo: topN, reprobados, promedio | 9 | |
| | Manejo correcto de listas inmutables | 3 | |
| **Ej 3** | Excepciones custom con código | 6 | |
| | Optional usado correctamente | 6 | |
| | Operaciones con validaciones | 8 | |
| **Ej 4** | Ordenar urgentes primero | 5 | |
| | CompletableFuture con ExecutorService | 10 | |
| | Recolectar resultados correctamente | 5 | |
| **TOTAL** | | **80** | |

**Interpretación:**
- 68-80: Sólido — listo para pruebas técnicas Senior
- 52-67: Bien — refuerza los puntos perdidos
- 36-51: Aceptable — practica más antes de aplicar
- < 36: Repasar Fases 1 y 2 antes de avanzar

---

# MIÉRCOLES — Examen SQL (60 min) + Psicométrico (45 min)

## Instrucciones SQL

- **Tiempo total: 60 minutos.** Sin apuntes.
- Escribe alias descriptivos en todas las consultas.
- Al terminar, califica con la rúbrica.

---

## Esquema de tablas

```sql
empleados (
    id INT PK, nombre VARCHAR(100), email VARCHAR(150) UNIQUE,
    salario DECIMAL(10,2), dept_id INT FK, fecha_ingreso DATE, activo BOOLEAN
)

departamentos (
    id INT PK, nombre VARCHAR(80), ciudad VARCHAR(80), presupuesto DECIMAL(12,2)
)

proyectos (
    id INT PK, nombre VARCHAR(100), dept_id INT FK,
    presupuesto DECIMAL(12,2), activo BOOLEAN
)

asignaciones (
    empleado_id INT FK, proyecto_id INT FK, rol VARCHAR(50),
    PRIMARY KEY (empleado_id, proyecto_id)
)
```

---

## Consulta 1 — JOINs con 3 tablas y CASE (12 min)

Para cada departamento muestra: nombre, ciudad, total de empleados activos, salario promedio redondeado y una columna `estado_presupuesto` que diga `"En riesgo"` si la masa salarial supera el 80% del presupuesto del departamento, o `"Saludable"` si no.

```sql
SELECT
    d.nombre                                        AS departamento,
    d.ciudad,
    COUNT(e.id)                                     AS empleados_activos,
    ROUND(AVG(e.salario), 2)                        AS salario_promedio,
    ROUND(SUM(e.salario), 2)                        AS masa_salarial,
    CASE
        WHEN SUM(e.salario) > d.presupuesto * 0.80
        THEN 'En riesgo'
        ELSE 'Saludable'
    END                                             AS estado_presupuesto
FROM departamentos d
LEFT JOIN empleados e
    ON d.id = e.dept_id AND e.activo = TRUE
GROUP BY d.id, d.nombre, d.ciudad, d.presupuesto
ORDER BY masa_salarial DESC;
```

---

## Consulta 2 — GROUP BY + HAVING (12 min)

Lista los departamentos que tengan más de 3 empleados activos Y donde el salario mínimo sea mayor a $8,000. Muestra también el salario máximo y el rango (máx - mín) de ese departamento.

```sql
SELECT
    d.nombre                            AS departamento,
    COUNT(e.id)                         AS total_empleados,
    MIN(e.salario)                      AS salario_minimo,
    MAX(e.salario)                      AS salario_maximo,
    MAX(e.salario) - MIN(e.salario)     AS rango_salarial
FROM departamentos d
INNER JOIN empleados e ON d.id = e.dept_id
WHERE e.activo = TRUE
GROUP BY d.id, d.nombre
HAVING COUNT(e.id) > 3
   AND MIN(e.salario) > 8000
ORDER BY rango_salarial DESC;
```

---

## Consulta 3 — Subquery correlacionado (12 min)

Muestra los empleados activos que ganan más que el promedio de su propio departamento. Incluye nombre, salario, departamento y cuánto ganan por encima del promedio.

```sql
SELECT
    e.nombre,
    e.salario,
    d.nombre                            AS departamento,
    ROUND(e.salario - (
        SELECT AVG(e2.salario)
        FROM empleados e2
        WHERE e2.dept_id = e.dept_id
          AND e2.activo = TRUE
    ), 2)                               AS sobre_promedio
FROM empleados e
INNER JOIN departamentos d ON e.dept_id = d.id
WHERE e.activo = TRUE
  AND e.salario > (
      SELECT AVG(e3.salario)
      FROM empleados e3
      WHERE e3.dept_id = e.dept_id
        AND e3.activo = TRUE
  )
ORDER BY sobre_promedio DESC;
```

---

## Consulta 4 — EXISTS y NOT EXISTS (12 min)

Lista los empleados activos que están asignados a al menos un proyecto activo con rol `"Líder"`, y también lista los departamentos que no tienen ningún proyecto activo asignado.

```sql
-- Parte A: empleados líderes en proyectos activos
SELECT
    e.nombre,
    e.salario,
    d.nombre    AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.dept_id = d.id
WHERE e.activo = TRUE
  AND EXISTS (
      SELECT 1
      FROM asignaciones a
      INNER JOIN proyectos p ON a.proyecto_id = p.id
      WHERE a.empleado_id = e.id
        AND a.rol = 'Líder'
        AND p.activo = TRUE
  )
ORDER BY e.nombre;

-- Parte B: departamentos sin proyectos activos
SELECT d.nombre AS departamento, d.ciudad
FROM departamentos d
WHERE NOT EXISTS (
    SELECT 1
    FROM proyectos p
    WHERE p.dept_id = d.id
      AND p.activo = TRUE
)
ORDER BY d.nombre;
```

---

## Consulta 5 — Identificar y optimizar una query lenta (12 min)

La siguiente query tarda mucho en producción con 2 millones de registros. Identifica al menos 3 problemas y reescríbela.

```sql
-- QUERY LENTA ORIGINAL:
SELECT *
FROM empleados
WHERE UPPER(nombre) LIKE '%MARTINEZ%'
  AND YEAR(fecha_ingreso) = 2023
  AND salario > (SELECT AVG(salario) FROM empleados)
ORDER BY salario DESC;
```

**Problemas identificados:**

```
1. UPPER(nombre) aplica función sobre la columna → el índice en nombre no se puede usar.
2. YEAR(fecha_ingreso) aplica función sobre columna → el índice en fecha_ingreso no se usa.
3. El subquery (SELECT AVG(salario)) se ejecuta una vez por cada fila → ineficiente.
4. SELECT * trae todas las columnas aunque quizás solo se necesiten algunas.
```

```sql
-- QUERY OPTIMIZADA:
SELECT
    e.id, e.nombre, e.salario, e.fecha_ingreso, e.dept_id
FROM empleados e
CROSS JOIN (SELECT AVG(salario) AS promedio FROM empleados) stats
WHERE e.nombre LIKE '%Martínez%'               -- sin UPPER (BD case-insensitive por defecto)
  AND e.fecha_ingreso
      BETWEEN '2023-01-01' AND '2023-12-31'    -- rango: sí usa el índice
  AND e.salario > stats.promedio               -- AVG calculado una sola vez
  AND e.activo = TRUE
ORDER BY e.salario DESC;

-- Índices recomendados:
-- CREATE INDEX idx_emp_fecha     ON empleados(fecha_ingreso);
-- CREATE INDEX idx_emp_salario   ON empleados(salario);
-- CREATE FULLTEXT INDEX idx_nombre_ft ON empleados(nombre);
-- Para búsqueda de texto completo: MATCH(nombre) AGAINST ('Martínez')
```

---

## Rúbrica — Examen SQL

| Consulta | Criterio | Pts | Tus pts |
|---|---|---|---|
| **1** | JOINs correctos + CASE bien aplicado + GROUP BY completo | 18 | |
| **2** | HAVING con condiciones múltiples + columnas calculadas | 16 | |
| **3** | Subquery correlacionado correcto + diferencia calculada | 20 | |
| **4** | EXISTS y NOT EXISTS funcionando correctamente | 22 | |
| **5** | Identifica ≥ 3 problemas + query optimizada válida | 24 | |
| **TOTAL** | | **100** | |

---

## Psicométrico Final — 45 minutos

> Sin pausas. Cronómetro activo desde la primera pregunta. Si te trabas en una, pasa y vuelve al final.

### Sección 1 — Series numéricas (15 min · 1 pto c/u)

```
 1.  3,   7,  13,  21,  31,  43, ___     →  ___
 2.  2,   6,  18,  54, 162, ___          →  ___
 3.  1,   1,   2,   3,   5,   8,  13, ___ →  ___
 4.  100, 90,  81,  73,  66,  60, ___    →  ___
 5.  1,   4,   9,  16,  25,  36, ___     →  ___
 6.  2,   3,   5,   7,  11,  13,  17, ___ →  ___
 7.  512, 256, 128,  64,  32, ___        →  ___
 8.  0,   1,   3,   6,  10,  15,  21, ___ →  ___
 9.  1,   2,   6,  24, 120, ___          →  ___
10.  5,  10,  20,  35,  55,  80, ___     →  ___
```

**Respuestas:**
```
 1.  57   (+4, +6, +8, +10, +12, +14)
 2.  486  (×3)
 3.  21   (Fibonacci)
 4.  55   (−10, −9, −8, −7, −6, −5)
 5.  49   (cuadrados: 7²)
 6.  19   (números primos)
 7.  16   (÷2)
 8.  28   (+1, +2, +3, +4, +5, +6, +7)
 9.  720  (factoriales: 6!)
10.  110  (+5, +10, +15, +20, +25, +30)
```

---

### Sección 2 — Razonamiento lógico (15 min · 2 ptos c/u)

**Problema 1:**

> Todos los desarrolladores senior conocen Spring Boot.
> Algunos que conocen Spring Boot también conocen Kubernetes.
> Emmanuel es desarrollador senior.

¿Cuáles conclusiones son necesariamente verdaderas?

- A) Emmanuel conoce Kubernetes.
- B) Emmanuel conoce Spring Boot.
- C) Todos los que conocen Kubernetes son desarrolladores senior.
- D) Algunos desarrolladores senior no conocen Kubernetes.

> **Respuesta: B y D.**  
> A: posible pero no garantizado ("algunos" no implica "todos"). C: invierte la premisa, es falacia. D: se deduce de "algunos conocen" → implica que otros no.

---

**Problema 2:**

> En un rack de servidores hay 5 slots numerados del 1 al 5.
> El servidor de BD está dos posiciones a la derecha del de autenticación.
> El servidor de caché está inmediatamente a la izquierda del de BD.
> El servidor de archivos está en el slot 1.
> El slot 5 está vacío.

¿En qué slot está el servidor de autenticación?

> **Respuesta: Slot 2.**  
> Archivos=1, vacío=5. Auth+2=BD → si Auth=2, BD=4, Caché=3.  
> Distribución: Archivos(1), Auth(2), Caché(3), BD(4), Vacío(5). ✓

---

**Problema 3:**

> Si un proyecto tiene más de 5 desarrolladores, necesita un tech lead.
> El proyecto Alpha tiene 7 desarrolladores.
> El proyecto Beta tiene 3 desarrolladores.
> Los proyectos con tech lead tienen reuniones diarias.

¿Cuál es la conclusión más sólida?

- A) El proyecto Beta tiene reuniones diarias.
- B) El proyecto Alpha necesita un tech lead.
- C) Todo proyecto con reuniones diarias tiene más de 5 desarrolladores.
- D) El proyecto Beta no necesita tech lead.

> **Respuesta: B y D.**  
> B: directo de la primera premisa con Alpha=7. D: Beta=3 < 5 → no necesita. A: no hay suficiente información (Beta no cumple la condición). C: invierte la implicación.

---

### Sección 3 — Operaciones bajo presión (15 min · 1 pto c/u)

Resuelve sin calculadora. Máximo 45 segundos por operación.

```
 1.  480  ÷ 16        = ___       (30)
 2.  15%  de 1200     = ___       (180)
 3.  √441             = ___       (21)
 4.  2^8              = ___       (256)
 5.  37   × 12        = ___       (444)
 6.  25%  de 960      = ___       (240)
 7.  1000 − 437       = ___       (563)
 8.  33%  de 600      = ___       (198)
 9.  144  ÷ 9  × 6    = ___       (96)
10.  7^3              = ___       (343)
11.  18   × 15        = ___       (270)
12.  40%  de 850      = ___       (340)
```

---

## Rúbrica — Psicométrico

| Sección | Pts máx | Tus pts |
|---|---|---|
| Series numéricas (10 × 1 pt) | 10 | |
| Razonamiento lógico (3 × 2 pts) | 6 | |
| Operaciones (12 × 1 pt) | 12 | |
| **TOTAL** | **28** | |

---

# JUEVES — Entrevista Simulada Completa Grabada (75 min)

## Instrucciones

- Grábate en video o al menos en audio.
- Habla como si hubiera un entrevistador real frente a ti.
- No te detengas para consultar apuntes.
- Al terminar, escucha la grabación y completa la autoevaluación de abajo.

---

## Parte 1 — Presentación (5 min)

Responde en voz alta:

> "Buenos días. Cuéntame sobre tu experiencia y qué te trae a esta posición."

**Estructura recomendada:**
```
1. Quién eres y tu stack principal (30 seg)
2. Un proyecto concreto relevante: qué construiste, con qué tecnologías, qué reto resolviste (90 seg)
3. Por qué quieres el cambio y qué buscas en esta posición (60 seg)
4. Cierra con algo que te diferencie (30 seg)
```

---

## Parte 2 — Preguntas técnicas teóricas (25 min · ~3 min c/u)

Responde en voz alta. Formato: definición + razón + ejemplo.

1. ¿Cuál es la diferencia entre `@Service`, `@Repository` y `@Component` en Spring?

2. Tengo este código — ¿qué problema tiene y cómo lo arreglarías?

```java
@Service
public class ProductoService {
    @Autowired
    ProductoRepository repo;

    public List<Producto> listarTodos() {
        return repo.findAll();
    }

    public void procesarTodos() {
        List<Producto> productos = listarTodos();
        for (Producto p : productos) {
            System.out.println(p.getCategoria().getNombre()); // ← problema aquí
        }
    }
}
```

> **Respuesta modelo:** Es el problema N+1. `findAll()` carga los productos (1 query), pero `getCategoria().getNombre()` lanza una query por cada producto porque la relación está en LAZY. Solución: usar `@Query("SELECT p FROM Producto p JOIN FETCH p.categoria")` en el repositorio o agregar `@EntityGraph(attributePaths = {"categoria"})`.

3. ¿Qué es una race condition? Dame un ejemplo en Java y cómo la resolverías.

4. Explica el flujo completo de autenticación con JWT: desde que el usuario hace POST /auth/login hasta que accede a un endpoint protegido.

5. ¿Cuándo usarías `LEFT JOIN` en lugar de `INNER JOIN`? Da un caso concreto.

6. ¿Qué hace `@Transactional`? ¿En qué capa lo pondrías y por qué no en el Controller?

---

## Parte 3 — Código en vivo (25 min)

**Enunciado:** Dada una lista de `Empleado(id, nombre, departamento, salario, fechaIngreso)`, implementa con Streams:

1. El empleado mejor pagado por departamento.
2. El total de la nómina de los empleados contratados en los últimos 6 meses.
3. Los departamentos ordenados por salario promedio descendente, con su promedio.

```java
// 1. Mejor pagado por departamento
Map<String, Optional<Empleado>> topPorDepto = empleados.stream()
    .collect(Collectors.groupingBy(
        Empleado::getDepartamento,
        Collectors.maxBy(Comparator.comparingDouble(Empleado::getSalario))
    ));

// 2. Nómina de contratados en últimos 6 meses
LocalDate hace6Meses = LocalDate.now().minusMonths(6);
double nominaReciente = empleados.stream()
    .filter(e -> e.getFechaIngreso().isAfter(hace6Meses))
    .mapToDouble(Empleado::getSalario)
    .sum();

// 3. Departamentos ordenados por promedio
Map<String, Double> promedioPorDepto = empleados.stream()
    .collect(Collectors.groupingBy(
        Empleado::getDepartamento,
        Collectors.averagingDouble(Empleado::getSalario)
    ))
    .entrySet().stream()
    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
    .collect(Collectors.toMap(
        Map.Entry::getKey,
        Map.Entry::getValue,
        (e1, e2) -> e1,
        LinkedHashMap::new
    ));
```

---

## Parte 4 — Pregunta de comportamiento (10 min)

Responde en voz alta con el formato **STAR** (Situación, Tarea, Acción, Resultado):

> "Cuéntame de una ocasión en que tuviste que resolver un problema técnico que no conocías. ¿Qué hiciste?"

**Formato STAR:**
```
Situación: contexto, cuándo ocurrió (30 seg)
Tarea:     cuál era tu responsabilidad específica (30 seg)
Acción:    qué pasos concretos tomaste (90 seg)
Resultado: qué pasó, qué aprendiste (30 seg)
```

---

## Rúbrica de autoevaluación — Entrevista grabada

Escucha la grabación y evalúa del 1 al 5 cada criterio:

| Criterio | 1 (Muy débil) | 3 (Aceptable) | 5 (Sólido) | Tu nota |
|---|---|---|---|---|
| **Claridad** | Confuso, rodeos | Entendible | Directo desde el inicio | |
| **Completitud** | Omite puntos clave | Cubre lo básico | Definición + razón + ejemplo | |
| **Código** | No compila o incompleto | Funciona con ajustes | Limpio, compila, maneja errores | |
| **Confianza** | Voz dudosa, muchas pausas | Algunas dudas | Responde con seguridad | |
| **Tiempo** | Muy fuera del límite | Dentro con ajuste | Bien distribuido | |

**Puntaje:** ___ / 25

---

# VIERNES — Evaluación Final

## Puntuación total de la semana

| Evaluación | Pts máx | Tus pts |
|---|---|---|
| Prueba técnica Java (Martes) | 80 | |
| Examen SQL (Miércoles) | 100 | |
| Psicométrico (Miércoles) | 28 | |
| Entrevista simulada (Jueves) | 25 | |
| **TOTAL** | **233** | |

**Nivel estimado:**

| Puntaje | Nivel |
|---|---|
| 190 – 233 | Sólido — aplica sin dudar |
| 145 – 189 | Listo — refuerza 2-3 temas antes de aplicar |
| 100 – 144 | Casi — necesitas 2-3 semanas más de práctica |
| < 100 | Repasa Fases 1 y 2 antes de avanzar |

---

## Comparativa semana 9 vs semana 12

| Métrica | Semana 9 | Semana 12 | Mejora |
|---|---|---|---|
| Puntaje técnico Java (sobre 80) | | | |
| Puntaje SQL (sobre 100) | | | |
| Puntaje psicométrico (sobre 28) | | | |
| Puntaje entrevista simulada (sobre 25) | | | |
| Tiempo promedio por problema Java | | | |
| Claridad en respuestas verbales (1-5) | | | |
| Confianza general (1-5) | | | |

---

## Análisis de fortalezas y áreas de mejora

```
MIS 3 FORTALEZAS TÉCNICAS:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

MIS 3 ÁREAS QUE AÚN NECESITO REFORZAR:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

LA PREGUNTA QUE MÁS ME CUESTA RESPONDER EN VOZ ALTA:
_______________________________________________

EL TIPO DE PROBLEMA QUE MÁS TARDO EN RESOLVER:
_______________________________________________
```

---

## Las 10 preguntas que nunca debes responder mal

Marca las que ya tienes sólidas:

| # | Pregunta | ✅ |
|---|---|---|
| 1 | ¿Qué es la inyección de dependencias? | |
| 2 | ¿Qué hace @Transactional? | |
| 3 | ¿Qué es el problema N+1 y cómo lo resuelves? | |
| 4 | ¿Cuál es la diferencia entre WHERE y HAVING? | |
| 5 | ¿Cómo funciona JWT? Explica el flujo completo. | |
| 6 | ¿Qué es un índice y cuándo NO lo crearías? | |
| 7 | ¿Cuál es la diferencia entre ArrayList y LinkedList? | |
| 8 | ¿Qué es ACID? | |
| 9 | ¿Qué es una race condition y cómo la evitas? | |
| 10 | ¿Cuál es la diferencia entre == y .equals()? | |

---

# SÁBADO — Plan Post-Programa

## Mes 1 (días 1–30): Consolidación y primeras aplicaciones

```
Semanas 1-2: Reforzar los 3 temas más débiles identificados el viernes
  - 1 hora diaria enfocada en esos temas
  - 2 problemas Java de dificultad media por día (sin ayuda, cronometrado)
  - 1 consulta SQL nueva por día

Semanas 3-4: Empezar a aplicar
  - Actualizar CV con los proyectos del programa (CRUD REST, sistema de reservas, etc.)
  - Perfil LinkedIn: headline claro, stack actualizado, descripción de proyectos
  - Aplicar a 3-5 posiciones por semana
  - Registrar cada proceso: empresa, requisitos, resultado, qué preguntaron
```

---

## Mes 2 (días 31–60): Entrevistas activas

```
Semana diaria:
  - 1 problema Java o SQL por día (mantener velocidad)
  - 1 mock interview por semana (grabado)
  - Mantener el horario de estudio aunque estés en procesos activos

Si recibes rechazo:
  - Pide feedback específico (muchos lo dan si lo pides bien)
  - ¿Qué preguntaron que no supiste responder? → estudia ese tema 3 días
  - No lo tomes personal: a veces es fit cultural, no técnico

Si recibes oferta:
  - Evalúa: stack técnico, posibilidad de crecimiento, equipo, sueldo, modalidad
  - Si puedes, no aceptes la primera sin ver qué más hay disponible
```

---

## Mes 3 (días 61–90): Adaptación o profundización

```
Si ya entraste a un nuevo trabajo:
  - Primeros 30 días: observar, preguntar, entender el dominio antes de proponer cambios
  - Identifica el stack real que usan y cuáles de tus habilidades aplican ya
  - Mantén 30 min diarios de estudio — no pares aunque estés ocupado

Si aún estás buscando:
  - Considera subir un proyecto a GitHub con README claro y código limpio
  - Un proyecto real visible vale más que el CV en muchos procesos
  - Evalúa si necesitas reforzar Spring Boot o SQL con un proyecto personal nuevo
```

---

## Actualización del CV — lo que puedes incluir del programa

```
Proyectos:
  ✅ API REST de gestión de empleados — Spring Boot 3, JPA, H2
  ✅ Sistema de autenticación JWT — Spring Security, BCrypt, roles
  ✅ Sistema de inventario — POO, Streams, Java 17
  ✅ Procesador de tareas concurrente — ExecutorService, CompletableFuture

Habilidades técnicas:
  ✅ Java 17 · Spring Boot 3 · Spring Security · JPA/Hibernate
  ✅ SQL (MySQL/PostgreSQL) · JOINs · Subqueries · Optimización básica
  ✅ REST APIs · JWT · Maven
  ✅ Git · Postman
```

---

## Recursos para seguir creciendo

### Práctica de código
```
LeetCode     leetcode.com          → problemas Java de dificultad Easy/Medium
NeetCode     neetcode.io           → roadmap por patrón (muy recomendado)
HackerRank   hackerrank.com        → secciones Java y SQL
```

### Spring Boot y Java
```
Baeldung     baeldung.com          → referencia práctica de Spring Boot
Java Guides  javaguides.net        → tutoriales concretos
Spring Docs  docs.spring.io        → documentación oficial
```

### SQL
```
SQLZoo       sqlzoo.net            → ejercicios interactivos
Mode SQL     mode.com/sql-tutorial → SQL para análisis
PGExercises  pgexercises.com       → PostgreSQL específico
```

### Preparación de entrevistas
```
Glassdoor → busca "Java Backend Developer interview questions [empresa]"
LinkedIn  → activa "Open to Work" con los roles correctos
Blind     → experiencias reales de procesos técnicos
```

---

# DOMINGO — Cierre

## Revisión final del programa completo

| Fase | Semanas | ¿Completada? |
|---|---|---|
| Fase 1 — Fundamentos Sólidos | 1 – 4 | |
| Fase 2 — Nivel Profesional | 5 – 8 | |
| Fase 3 — Simulación y Entrevistas | 9 – 12 | |

---

## Métricas totales del programa

| Métrica | Meta | Logrado |
|---|---|---|
| Semanas completadas | 12 | |
| Ejercicios Java resueltos (estimado) | 150+ | |
| Consultas SQL escritas (estimado) | 80+ | |
| Psicométricos realizados | 12 sesiones | |
| Proyectos construidos | 8 | |
| Simulaciones de entrevista grabadas | 4+ | |

---

## Errores de la semana — anótalos aquí

| # | Error | Plan de acción |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

```
Doce semanas atrás empezaste con un objetivo claro:
prepararte para un cambio de trabajo como Java Backend Developer Senior.

Si llegaste hasta aquí cumpliendo los bloques —
no perfectamente, no sin fallar días,
pero consistentemente — ya eres diferente al que empezó.

Mide el cambio en los números de esta semana,
no en cómo te sientes.

Lo que sigue no es el final del estudio.
Es el inicio del proceso real de contratación
que construiste con disciplina, sin supervisión externa,
un bloque a la vez.
```

---

> **Fin del Programa Intensivo — Java Backend Developer · 12 Semanas**  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importó durante 12 semanas.*

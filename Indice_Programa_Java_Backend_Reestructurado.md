# Índice — Programa Intensivo Java Backend Developer
## 12 Semanas · Reestructurado

---

## Resumen de fases

| Fase | Semanas | Enfoque |
|---|---|---|
| **Fase 1 — Fundamentos Sólidos** | 1 – 4 | Java core + SQL básico/medio + Psicométrico |
| **Fase 2 — Nivel Profesional** | 5 – 8 | Spring Boot + JWT + Concurrencia + Repaso general |
| **Fase 3 — Simulación y Entrevistas** | 9 – 12 | Práctica intensiva + Mock interviews + Simulación final |

---

## FASE 1 — Fundamentos Sólidos · Semanas 1–4

---

### Semana 1 — Arrays · Strings · Loops · Métodos · SQL básico

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | Arrays: recorrer, máximo, mínimo, invertir, sumar. Declaración e inicialización | — |
| Martes | Strings: reverse, palíndromos, frecuencia de caracteres. Métodos clave de String | SELECT · WHERE · ORDER BY |
| Miércoles | Loops: for, while, nested loops. Patrones y pirámides | **Psicométrico:** series numéricas básicas (×, +, −) · 30 min cronometrado |
| Jueves | Métodos: parámetros, retorno, modularización | LIKE · IN · BETWEEN · COUNT · AVG · SUM · MIN · MAX |
| Viernes | **Simulación:** 3 ejercicios Java + 3 consultas SQL · tiempo limitado | — |
| Sábado | **Proyecto:** menú en consola + CRUD simple en memoria con ArrayList | — |
| Domingo | **Repaso:** rehacer ejercicios difíciles sin ayuda · registro de errores | — |

---

### Semana 2 — Collections · JOINs

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | ArrayList: CRUD, recorridos, ordenar. Eliminar duplicados | INNER JOIN |
| Martes | HashSet: unicidad O(1). Operaciones de conjuntos (unión, intersección, diferencia) | LEFT JOIN · RIGHT JOIN |
| Miércoles | HashMap: frecuencias, conteo, agrupación. getOrDefault, putIfAbsent | **Psicométrico:** series con diferencias de segundo orden · analogías numéricas · 30 min |
| Jueves | Ejercicios integrados: Two Sum, primer repetido, intersección de arrays | JOINs combinados + GROUP BY |
| Viernes | **Simulación:** 3 ejercicios Java (Collections) + 3 consultas SQL · tiempo limitado | — |
| Sábado | **Proyecto:** agenda de contactos con HashMap · menú + búsqueda + agrupación por categoría | — |
| Domingo | **Repaso:** rehacer ejercicios difíciles sin ayuda · registro de errores | — |

---

### Semana 3 — POO · Streams · GROUP BY

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | Clases, objetos, constructores. Encapsulamiento: atributos private, getters/setters con validación | GROUP BY: regla de columnas, ejemplos prácticos |
| Martes | Herencia (extends), polimorfismo, @Override. Clases abstractas e interfaces | HAVING: diferencia con WHERE · combinado con GROUP BY |
| Miércoles | Streams: filter, map, forEach, collect. Ordenar y limitar. distinct, limit | **Psicométrico:** problemas matemáticos verbales · series alfanuméricas · 30 min |
| Jueves | Streams avanzado: groupingBy, summingDouble, max, min, count. Ejercicios con objetos | GROUP BY + HAVING + JOINs combinados |
| Viernes | **Simulación:** jerarquía de clases + pipeline de Streams + 3 consultas SQL · tiempo limitado | — |
| Sábado | **Proyecto:** sistema de inventario con POO + Streams + interfaz + menú en consola | — |
| Domingo | **Repaso:** rehacer ejercicios difíciles sin ayuda · registro de errores | — |

---

### Semana 4 — Excepciones · Optional · Subqueries

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | try/catch/finally. Checked vs unchecked. throw y throws. try-with-resources | Subqueries en WHERE: escalar y con IN |
| Martes | Excepciones personalizadas: jerarquía de dominio (NegocioException → subclases) | Subqueries en FROM (tabla derivada). EXISTS y NOT EXISTS |
| Miércoles | Optional: orElse, map, flatMap, ifPresentOrElse. Cuándo usarlo y cuándo no | **Psicométrico:** series complejas · razonamiento lógico (silogismos) · 30 min |
| Jueves | Integración: Excepciones + Optional + Streams + Collections en un solo servicio | Subqueries correlacionados · segundo salario más alto (clásica de entrevistas) |
| Viernes | **Simulación:** 3 ejercicios Java + 3 consultas SQL · tiempo limitado | — |
| Sábado | **Proyecto:** sistema de reservas con excepciones custom + Optional + Streams | — |
| Domingo | **Simulación Fase 1:** 60–90 min · Java + SQL sin apuntes · autoevaluación completa | — |

---

## FASE 2 — Nivel Profesional · Semanas 5–8

---

### Semana 5 — APIs REST · Spring Boot · JPA

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Fundamentos REST: verbos HTTP, códigos de respuesta (200, 201, 204, 400, 401, 403, 404, 500) · Setup Spring Boot · Primer endpoint funcional | Teoría + práctica |
| Martes | Arquitectura 3 capas: Controller → Service → Repository · DTOs (Request/Response) · GlobalExceptionHandler con @RestControllerAdvice | Estructura profesional |
| Miércoles | JPA: entidades (@Entity, @Id, @Column, @GeneratedValue) · Repository por convención de nombres · queries @Query JPQL y nativas | Persistencia |
| Miércoles | **Psicométrico:** operaciones rápidas · series mixtas · atención al detalle · 30 min | — |
| Jueves | Relaciones JPA: @OneToMany, @ManyToOne, @ManyToMany · LAZY vs EAGER · CascadeType · consultas con JOIN FETCH | Relaciones |
| Viernes | **Simulación:** CRUD completo desde cero (entidad + repo + service + controller) · 60 min sin ayuda | — |
| Sábado | **Proyecto:** API de gestión de empleados con departamentos relacionados · resumen salarial con DoubleSummaryStatistics | — |
| Domingo | **Repaso:** pruebas con Postman · preguntas teóricas de entrevista sobre Spring/JPA | — |

---

### Semana 6 — JWT · Spring Security · Roles

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Autenticación vs Autorización · Estructura JWT (header, payload, signature) · por qué el payload no es seguro · Dependencias y configuración | Fundamentos |
| Martes | JwtService: generar, firmar y validar tokens · UserDetailsServiceImpl · DTOs de auth (LoginRequest, RegisterRequest, AuthResponse) | Token |
| Miércoles | JwtAuthFilter paso a paso · SecurityConfig: rutas públicas, STATELESS, BCrypt, DaoAuthenticationProvider | Filtro |
| Miércoles | **Psicométrico:** razonamiento abstracto · series con doble patrón · 30 min | — |
| Jueves | AuthService + AuthController · @PreAuthorize por roles · Refresh token: flujo, entidad y servicio | Auth completo |
| Viernes | **Simulación:** proteger la API de la semana 5 con JWT y roles · colección Postman completa | — |
| Sábado | **Proyecto:** sistema completo de auth: registro, login, endpoints protegidos por rol | — |
| Domingo | **Repaso:** preguntas teóricas JWT/Seguridad · 9 casos de prueba en Postman | — |

---

### Semana 7 — Concurrencia · Threads · CompletableFuture

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Threads: ciclo de vida · Runnable vs Callable · start() vs run() · join() · Thread.sleep() | Fundamentos |
| Martes | Race conditions · synchronized · volatile · AtomicInteger · Deadlock: cómo ocurre y cómo evitarlo · Collections thread-safe | Seguridad |
| Miércoles | ExecutorService: 4 tipos de thread pool · submit() vs execute() · invokeAll · ScheduledExecutorService | Pools |
| Miércoles | **Psicométrico:** problemas de velocidad y distancia · series de Fibonacci y variantes · 30 min | — |
| Jueves | CompletableFuture: supplyAsync, thenApply, thenCompose, thenCombine, allOf · manejo de errores con exceptionally y handle | Asincronía |
| Viernes | **Simulación:** contador thread-safe · productor-consumidor con BlockingQueue · pipeline asíncrono | — |
| Sábado | **Proyecto:** procesador de tareas concurrente con reintentos, cancelación y estadísticas en tiempo real | — |
| Domingo | **Repaso:** tabla comparativa de herramientas · preguntas de entrevista sobre concurrencia | — |

---

### Semana 8 — Repaso General Fases 1 y 2 *(Reestructurada — sin temas nuevos)*

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | **Repaso Java Core:** arrays, strings, collections · 10 ejercicios cronometrados sin ayuda | Velocidad |
| Martes | **Repaso POO + Streams + Excepciones + Optional** · ejercicios integrados · **SQL:** JOINs + GROUP BY + HAVING con tablas nuevas | Integración |
| Miércoles | **Repaso Spring Boot:** preguntas teóricas + reconstruir un CRUD sin ver el código | Práctica |
| Miércoles | **Psicométrico:** simulacro completo mixto (series + lógica + matemáticas) · 45 min | — |
| Jueves | **Repaso JWT y Seguridad:** flujo en voz alta · preguntas clave de concurrencia · **SQL:** subqueries + EXISTS con ejercicios nuevos | Teoría |
| Viernes | **Mini-examen:** 4 ejercicios Java + 4 consultas SQL · sin apuntes · 90 min | — |
| Sábado | **Autoevaluación:** identificar los 5 temas más débiles · plan de refuerzo para semanas 9–12 | — |
| Domingo | **Repaso dirigido:** estudiar exclusivamente los temas marcados como débiles en la autoevaluación | — |

---

## FASE 3 — Simulación y Entrevistas · Semanas 9–12 *(Reestructurada)*

---

### Semana 9 — Práctica intensiva Java · Técnicas de entrevista

| Día | Java / SQL | Extra |
|---|---|---|
| Lunes | **Java:** problemas típicos de entrevista: frecuencias, duplicados, inversión, anagramas · HashMap como herramienta central | — |
| Martes | **Java:** problemas con Streams y colecciones: top N, agrupación, filtrado complejo · Optional encadenado · **SQL:** JOINs con 3 tablas | — |
| Miércoles | **Java:** preguntas teóricas frecuentes: OOP, colecciones, JVM, String pool, equals vs == | **Psicométrico:** simulacro intensivo (series + lógica + matemáticas verbales) · 45 min |
| Jueves | **Spring:** preguntas teóricas: inyección de dependencias, @Transactional, N+1, LAZY/EAGER · responder en voz alta · **SQL:** GROUP BY + HAVING + subqueries | — |
| Viernes | **Simulación:** 4 problemas Java cronometrados · explicar proceso en voz alta · 60 min | — |
| Sábado | **SQL:** 5 consultas de dificultad media: JOINs + agregación + subqueries · sin ayuda | — |
| Domingo | **Mock grabado:** 5 preguntas teóricas + 1 problema de código · autoevaluación con rúbrica | — |

---

### Semana 10 — SQL consolidado · Preguntas técnicas Spring y JWT

| Día | Java / SQL | Extra |
|---|---|---|
| Lunes | **SQL:** JOINs complejos (3-4 tablas) · CASE WHEN · consultas de análisis frecuentes en entrevistas | — |
| Martes | **SQL:** subqueries correlacionados · EXISTS con condiciones múltiples · segundo mayor valor · **Java:** FizzBuzz, palíndromo numérico, número primo | — |
| Miércoles | **SQL:** índices básicos: cuándo crear, cuándo no · queries lentas comunes · EXPLAIN básico | **Psicométrico:** simulacro completo mixto · 45 min · medir mejora vs semana anterior |
| Jueves | **Spring/JWT:** preguntas teóricas: flujo JWT, @PreAuthorize, BCrypt, stateless · responder en voz alta sin apuntes | — |
| Viernes | **Simulación:** 3 Java + 4 SQL cronometrados · explicar cada decisión · 75 min | — |
| Sábado | **Java:** problemas de colecciones + POO combinados · sistema pequeño con múltiples clases | — |
| Domingo | **Mock grabado:** preguntas teóricas Spring + 1 SQL en vivo + 1 problema Java · comparar con semana 9 | — |

---

### Semana 11 — Mock Interviews completas · Corrección y mejora

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | **Las 10 preguntas Java Core que no debes fallar:** responder y grabar cada una · formato: definición + razón + ejemplo | Preguntas teóricas |
| Martes | **Las 10 preguntas Spring/JPA/Seguridad esenciales:** responder en voz alta · **SQL:** diseño básico de esquema: normalización, claves foráneas, índices | Preguntas técnicas |
| Miércoles | **Código en vivo grabado:** explicar proceso mientras codificas · 30 min | **Psicométrico:** simulacro de examen real bajo presión · 45 min |
| Jueves | **Preguntas de comportamiento (situacionales):** "cuéntame de un reto técnico", "cómo manejas desacuerdos en el equipo" · antipatrones comunes de respuesta | Comunicación |
| Viernes | **Simulación completa grabada:** presentación + 6 preguntas técnicas + 1 código en vivo · 60 min | — |
| Sábado | **Corrección:** escuchar grabación · identificar respuestas vagas · regrabar las 3 peores respuestas | — |
| Domingo | **Segunda simulación grabada:** medir mejora con rúbrica · plan de últimos puntos débiles | — |

---

### Semana 12 — Simulación Final Completa · Evaluación · Plan

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | **Autoevaluación total:** mapa de los 12 temas del programa · identificar últimos puntos ciegos · repaso dirigido por tema | — |
| Martes | **Prueba técnica Java:** 4 ejercicios de dificultad real (lógica + colecciones + POO + concurrencia básica) · 90 min sin ayuda | — |
| Miércoles | **Examen SQL:** 5 consultas (JOINs + GROUP BY/HAVING + subqueries + optimización básica) · 60 min | **Psicométrico:** examen final (series + lógica + operaciones) · 45 min |
| Jueves | **Entrevista simulada completa grabada:** presentación + preguntas técnicas + comportamiento + código en vivo · 75 min | — |
| Viernes | **Evaluación final:** calificar pruebas · comparar semana 9 vs semana 12 · análisis de fortalezas y áreas de mejora | — |
| Sábado | **Plan post-programa:** mes 1-2-3 · actualizar CV y LinkedIn · cuándo empezar a aplicar · recursos recomendados | — |
| Domingo | **Cierre:** revisión final · próximos pasos concretos · recursos para seguir creciendo | — |

---

## Temas psicométricos por semana

| Semana | Tipo | Contenido |
|---|---|---|
| 1 | Series básicas | Patrones ×, +, − · progressiones simples |
| 2 | Series intermedias | Diferencias de segundo orden · analogías numéricas |
| 3 | Problemas verbales | Enunciados matemáticos · series alfanuméricas |
| 4 | Razonamiento lógico | Silogismos · series complejas |
| 5 | Operaciones rápidas | Porcentajes, raíces, potencias · atención al detalle |
| 6 | Razonamiento abstracto | Series con doble patrón · matrices lógicas |
| 7 | Problemas mixtos | Velocidad y distancia · Fibonacci y variantes |
| 8 | Simulacro mixto | Series + lógica + matemáticas verbales · 45 min |
| 9 | Simulacro intensivo | Series + lógica + matemáticas verbales · 45 min |
| 10 | Simulacro con medición | Mismo formato · comparar mejora vs semana 9 |
| 11 | Examen bajo presión | Condiciones de examen real · cronometrado |
| 12 | Examen final | Series + lógica + operaciones · evaluación total |

---

## Temas teóricos cubiertos en entrevistas (sin práctica avanzada)

Los siguientes temas aparecen en entrevistas **a nivel conceptual**. Se cubren como preguntas y respuestas en las semanas 9–11, sin implementación profunda.

| Tema | Nivel cubierto | Semana |
|---|---|---|
| Arquitectura REST y buenas prácticas | Teórico | 5 y 9 |
| Diferencia monolito vs microservicios | Conceptual | 11 |
| Qué es un índice en SQL y cuándo usarlo | Básico práctico | 10 |
| ACID y transacciones | Conceptual | 9 y 10 |
| Qué es un caché y estrategias básicas | Conceptual | 11 |
| Big O: leer y comparar complejidades | Básico | 9 |
| Sorting: cuál usa Java internamente | Conceptual | 9 |

---

## Reglas del programa

```
Horario L–V
  6:00–8:00 am   Entrenamiento principal
  10:00–11:00 pm Repaso ligero

Horario S–D
  6:00–9:00 am   Práctica extendida

Métricas semanales
  Ejercicios Java resueltos
  Consultas SQL resueltas
  Psicométricos realizados
  Horas reales cumplidas
  Errores aprendidos

Regla más importante
  No evalúes emoción ni motivación.
  Evalúa: ¿cumplí el bloque hoy? Sí o No.
```

---

> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

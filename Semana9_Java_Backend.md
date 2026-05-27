# Semana 9 — Mock Interviews · Preguntas Técnicas · Arquitectura

> **Fase 3 — Entrevistas y Consolidación** · Programa Intensivo Java Backend Developer  
> Tema central: **Simulaciones reales · Java · Spring · SQL · Arquitectura · Comunicación técnica**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Preguntas Java Core + JVM | Responder en voz alta y por escrito |
| Martes | Preguntas Spring Boot + JPA + Seguridad | Flujo de una entrevista técnica |
| Miércoles | Preguntas SQL + diseño de base de datos | Consultas en vivo y modelado |
| Jueves | Preguntas de arquitectura y diseño de sistemas | Monolito vs microservicios |
| Viernes | Simulación completa 90 min grabada | Entrevista real con feedback propio |
| Sábado | Corrección, respuestas vagas y comunicación | Mejorar lo que falló |
| Domingo | Segunda simulación + plan de mejora | Medir progreso |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Responder preguntas técnicas con claridad y sin rodeos.
- Estructurar una respuesta técnica: definición → por qué → ejemplo → cuándo.
- Identificar tus puntos débiles antes de que lo haga el entrevistador.
- Hablar de arquitectura sin haber trabajado en un sistema de millones de usuarios.
- Grabar tu propia voz y evaluar tus respuestas con objetividad.

---

## Cómo usar esta semana

Cada sección tiene preguntas con respuesta modelo. El ejercicio es:

1. **Lee la pregunta, cierra la guía.**
2. **Responde en voz alta** como si estuvieras en la entrevista.
3. **Grábate** al menos en las simulaciones del viernes y domingo.
4. **Abre la guía** y compara tu respuesta con la modelo.
5. **Anota** qué dijiste diferente, qué omitiste, qué fue vago.

> La diferencia entre un candidato que pasa y uno que no no siempre es el conocimiento — es la capacidad de comunicarlo con claridad bajo presión.

---

# LUNES — Preguntas Java Core + JVM

## Formato de respuesta recomendado

Para preguntas de definición usa siempre este esquema:

```
1. Definición clara (1-2 oraciones)
2. Por qué existe / problema que resuelve
3. Ejemplo concreto en código o escenario
4. Cuándo usarlo / cuándo no
```

---

## Bloque 1 — Fundamentos del Lenguaje

---

**P: ¿Cuál es la diferencia entre `==` y `.equals()` en Java?**

> `==` compara referencias: verifica si dos variables apuntan al mismo objeto en memoria. `.equals()` compara contenido: verifica si los valores son lógicamente iguales.
>
> Para primitivos (`int`, `double`...) solo puedes usar `==` porque no son objetos. Para `String` y objetos en general, siempre debes usar `.equals()` para comparar valores.

```java
String a = new String("hola");
String b = new String("hola");

System.out.println(a == b);       // false — objetos distintos en memoria
System.out.println(a.equals(b));  // true  — mismo contenido

// Excepción: String literals del pool
String c = "hola";
String d = "hola";
System.out.println(c == d);       // true — mismo objeto del string pool
```

---

**P: ¿Qué es la inmutabilidad y por qué String es inmutable en Java?**

> Un objeto inmutable no puede modificarse después de creado. `String` es inmutable porque cada operación que "modifica" un String en realidad crea un nuevo objeto.
>
> Razones de diseño: seguridad (no puede modificarse mientras viaja por la red o se usa como clave en un HashMap), eficiencia del string pool (múltiples variables pueden compartir el mismo objeto sin riesgo), y thread-safety automático.

```java
String s = "hola";
s.toUpperCase();          // crea un nuevo String — s NO cambia
System.out.println(s);    // "hola" — sin cambios

String resultado = s.toUpperCase();
System.out.println(resultado);   // "HOLA" — el nuevo String

// Para muchas concatenaciones, usa StringBuilder (mutable)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append("item").append(i).append(",");
}
String resultado2 = sb.toString();
```

---

**P: ¿Qué es autoboxing y unboxing?**

> Autoboxing es la conversión automática de un tipo primitivo a su wrapper class correspondiente (`int` → `Integer`). Unboxing es el proceso inverso.
>
> Existe para permitir usar primitivos en colecciones genéricas como `ArrayList<Integer>`. El compilador inserta las conversiones automáticamente.

```java
// Autoboxing
Integer x = 42;           // equivale a Integer.valueOf(42)
List<Integer> lista = new ArrayList<>();
lista.add(5);             // autoboxing: int → Integer

// Unboxing
int y = x;                // equivale a x.intValue()
int suma = lista.get(0) + 10;  // unboxing automático

// Trampa clásica en entrevistas
Integer a = 127;
Integer b = 127;
System.out.println(a == b);   // true  — cached (-128 a 127)

Integer c = 200;
Integer d = 200;
System.out.println(c == d);   // false — fuera del cache, objetos distintos
// Siempre usa .equals() con Integer
```

---

**P: ¿Cuál es la diferencia entre `ArrayList` y `LinkedList`?**

> `ArrayList` usa un array interno de tamaño dinámico. `LinkedList` usa nodos doblemente enlazados.
>
> Acceso por índice: `ArrayList` O(1), `LinkedList` O(n).  
> Inserción/eliminación al inicio o medio: `ArrayList` O(n) (desplaza elementos), `LinkedList` O(1) si tienes la referencia al nodo.  
> En la práctica el 95% de los casos `ArrayList` es más rápido porque tiene mejor localidad de caché.

```java
// Usa ArrayList casi siempre
List<String> lista = new ArrayList<>();

// Usa LinkedList solo si haces muchas inserciones/eliminaciones
// al inicio/final y pocas búsquedas por índice
Deque<String> cola = new LinkedList<>();
cola.addFirst("primero");
cola.removeLast();
```

---

**P: Explica el principio SOLID.**

> SOLID son 5 principios de diseño orientado a objetos que hacen el código más mantenible, flexible y testeable.

```
S — Single Responsibility: una clase, una razón para cambiar.
    "EmpleadoService" calcula salarios. No envía emails.

O — Open/Closed: abierto para extensión, cerrado para modificación.
    Agrego un nuevo tipo de descuento creando una clase nueva,
    no modificando la existente.

L — Liskov Substitution: una subclase debe poder reemplazar
    a su superclase sin romper el programa.
    Si tengo List<Animal>, puedo poner Perro o Gato sin problema.

I — Interface Segregation: interfaces pequeñas y específicas.
    No obligo a una clase a implementar métodos que no usa.

D — Dependency Inversion: depende de abstracciones, no de implementaciones.
    EmpleadoService depende de EmpleadoRepository (interfaz),
    no de EmpleadoRepositoryImpl (clase concreta).
```

---

## Bloque 2 — Colecciones y Genéricos

---

**P: ¿Cuándo usarías `HashMap` vs `TreeMap` vs `LinkedHashMap`?**

> `HashMap`: acceso O(1), sin orden garantizado. La opción por defecto para conteo y mapeo.  
> `TreeMap`: mantiene las claves ordenadas (natural o por Comparator). Acceso O(log n). Úsalo cuando necesitas iterar en orden.  
> `LinkedHashMap`: mantiene el orden de inserción. Acceso O(1). Úsalo cuando el orden de inserción importa.

```java
// HashMap — default
Map<String, Integer> frecuencia = new HashMap<>();

// TreeMap — ordenado alfabéticamente
Map<String, Integer> ordenado = new TreeMap<>();
ordenado.put("banana", 3);
ordenado.put("apple", 1);
// iteración: apple, banana (orden alfabético)

// LinkedHashMap — orden de inserción
Map<String, Integer> insercion = new LinkedHashMap<>();
insercion.put("banana", 3);
insercion.put("apple", 1);
// iteración: banana, apple (orden de inserción)
```

---

**P: ¿Qué hace `Optional` y por qué se usa?**

> `Optional<T>` es un contenedor que puede o no tener un valor. Existe para eliminar `NullPointerException` de forma explícita y comunicar que un método puede no encontrar resultado.

```java
// Sin Optional — propenso a NPE
public Empleado buscar(Long id) {
    return repo.findById(id);   // podría retornar null
}
Empleado e = buscar(99L);
e.getNombre();   // NPE si no existe

// Con Optional — explícito y seguro
public Optional<Empleado> buscar(Long id) {
    return repo.findById(id);
}
buscar(99L)
    .map(Empleado::getNombre)
    .ifPresentOrElse(
        System.out::println,
        () -> System.out.println("No encontrado")
    );
```

---

## Bloque 3 — JVM y Memoria

---

**P: ¿Cómo funciona el Garbage Collector en Java?**

> El GC libera automáticamente la memoria de objetos que ya no tienen referencias. El heap se divide en generaciones: Young Generation (objetos recientes), Old Generation (objetos que sobrevivieron varios GC), y Metaspace (metadatos de clases).
>
> El GC más usado hoy es G1GC (Java 9+ default). En Java 17+ también está ZGC para pausas de baja latencia.

```
Young Gen:
  Eden    → nuevos objetos se crean aquí
  S0, S1  → objetos que sobrevivieron un Minor GC

Old Gen   → objetos que sobrevivieron varios Minor GC

Proceso:
1. Minor GC: limpia Young Gen (rápido, frecuente)
2. Major GC / Full GC: limpia Old Gen (lento, infrecuente)

Señales de problema:
- Muchos Full GC en los logs → posible memory leak
- OutOfMemoryError: Java heap space → necesitas más heap o hay leak
```

---

**P: ¿Qué es el String Pool?**

> Es una zona especial en el heap donde Java almacena literales de String únicos. Cuando escribes `"hola"` dos veces en el código, ambas variables apuntan al mismo objeto del pool en lugar de crear dos objetos separados.

```java
String a = "hola";          // en el pool
String b = "hola";          // mismo objeto del pool
String c = new String("hola"); // FUERA del pool — objeto nuevo

System.out.println(a == b);   // true  — mismo objeto del pool
System.out.println(a == c);   // false — objetos distintos

// intern() mueve un String al pool
String d = c.intern();
System.out.println(a == d);   // true — ahora d apunta al pool
```

---

# MARTES — Preguntas Spring Boot, JPA y Seguridad

## Bloque 4 — Spring Boot y Spring Framework

---

**P: ¿Qué es la inyección de dependencias y por qué la usa Spring?**

> La inyección de dependencias (DI) es un patrón donde los objetos que una clase necesita se le proveen externamente en lugar de crearlos ella misma. Spring actúa como contenedor IoC (Inversion of Control) que crea y gestiona esos objetos (beans).
>
> Beneficios: bajo acoplamiento, fácil de testear (puedes inyectar mocks), y cambiar implementaciones sin modificar el código que las usa.

```java
// Sin DI — alto acoplamiento
public class EmpleadoService {
    private EmpleadoRepository repo =
        new EmpleadoRepositoryImpl();  // acoplado a la implementación
}

// Con DI — bajo acoplamiento
@Service
public class EmpleadoService {
    private final EmpleadoRepository repo;

    // Spring inyecta la implementación correcta
    public EmpleadoService(EmpleadoRepository repo) {
        this.repo = repo;
    }
}
// En tests: new EmpleadoService(mockRepository)
```

---

**P: ¿Cuál es la diferencia entre `@Component`, `@Service`, `@Repository` y `@Controller`?**

> Las cuatro registran un bean en el contexto de Spring. La diferencia es semántica y técnica:
> - `@Component`: bean genérico, sin rol específico.
> - `@Service`: lógica de negocio. Solo semántico.
> - `@Repository`: acceso a datos. Además traduce excepciones de persistencia a `DataAccessException` de Spring.
> - `@Controller` / `@RestController`: capa web. `@RestController` agrega `@ResponseBody` a todos los métodos.

---

**P: ¿Qué hace `@Transactional` y dónde deberías ponerlo?**

> `@Transactional` envuelve el método en una transacción de base de datos: si el método termina correctamente hace `COMMIT`, si lanza una excepción hace `ROLLBACK`.
>
> Se debe poner en la capa de Service, no en el Repository ni en el Controller. En el Repository porque Spring Data JPA ya gestiona transacciones. En el Controller porque mezclaría responsabilidades HTTP con lógica de BD.

```java
@Service
public class TransferenciaService {

    @Transactional   // ← aquí, en el Service
    public void transferir(Long origenId, Long destinoId, double monto) {
        // todas las operaciones de BD dentro de esta transacción
    }
}
```

---

**P: ¿Qué es el problema N+1 en JPA y cómo lo solucionas?**

> Es cuando se ejecuta 1 query para traer N entidades y luego N queries adicionales para cargar sus relaciones. Con 100 empleados = 101 queries en lugar de 1.

```java
// El problema: fetch LAZY + acceder a la relación en un loop
List<Empleado> empleados = repo.findAll();  // 1 query
for (Empleado e : empleados) {
    // JPA lanza 1 query por cada empleado para cargar su departamento
    System.out.println(e.getDepartamento().getNombre());
}
// Total: 1 + N queries

// Solución 1: JOIN FETCH en JPQL
@Query("SELECT e FROM Empleado e JOIN FETCH e.departamento")
List<Empleado> findAllConDepartamento();

// Solución 2: @EntityGraph
@EntityGraph(attributePaths = {"departamento"})
List<Empleado> findAll();
// Total: 1 query con JOIN
```

---

## Bloque 5 — Seguridad y JWT

---

**P: ¿Cómo funciona el flujo de autenticación con JWT?**

```
1. Cliente → POST /auth/login  { email, password }
2. Servidor valida credenciales contra la BD
3. Servidor genera JWT firmado con clave secreta
4. Servidor → Cliente  { accessToken, refreshToken }
5. Cliente guarda el token (localStorage, cookie httpOnly)
6. En cada petición: Authorization: Bearer <token>
7. Servidor: JwtAuthFilter intercepta → extrae token →
   valida firma → verifica expiración → carga usuario →
   registra en SecurityContext
8. Controller ejecuta → responde
```

---

**P: ¿Por qué el payload de JWT no es seguro para datos sensibles?**

> El payload es solo Base64 encoded, no cifrado. Cualquier persona que tenga el token puede decodificarlo y leer su contenido. La seguridad viene de la firma: nadie puede modificar el token sin conocer la clave secreta, pero sí pueden leer lo que contiene.
>
> Nunca guardes contraseñas, números de tarjeta, datos médicos u otra información sensible en el payload del JWT.

---

**P: ¿Cuál es la diferencia entre autenticación y autorización?**

> Autenticación: verificar identidad. "¿Quién eres?" → usuario + contraseña → token.  
> Autorización: verificar permisos. "¿Qué puedes hacer?" → tiene el rol ADMIN para acceder a este endpoint.
>
> En Spring Security: la autenticación la maneja `AuthenticationManager` + `UserDetailsService`. La autorización la maneja `@PreAuthorize`, `SecurityFilterChain` y los roles en `GrantedAuthority`.

---

# MIÉRCOLES — Preguntas SQL y Diseño de BD

## Bloque 6 — SQL en entrevistas

---

**P: ¿Cuál es la diferencia entre `WHERE` y `HAVING`?**

> `WHERE` filtra filas individuales **antes** de agrupar. `HAVING` filtra grupos **después** de que `GROUP BY` los forma. Solo `HAVING` puede usar funciones de agregación como condición.

```sql
-- WHERE: filtra empleados antes de agrupar
SELECT departamento_id, AVG(salario)
FROM empleados
WHERE activo = 1               -- filtra filas
GROUP BY departamento_id
HAVING AVG(salario) > 12000;   -- filtra grupos
```

---

**P: ¿Cuándo usarías un índice compuesto vs dos índices simples?**

> Un índice compuesto `(dept_id, salario)` es más eficiente que dos índices separados cuando la query filtra por ambas columnas juntas. El motor puede satisfacer la query con un solo recorrido del índice.
>
> Dos índices simples implican que el motor haga un merge de dos resultados (index merge), que es más costoso.
>
> Regla del prefijo: el índice `(a, b, c)` sirve para queries que filtran por `a`, por `(a, b)`, o por `(a, b, c)`. No sirve para queries que solo filtran por `b` o por `c`.

---

**P: Escribe una query que encuentre empleados que ganan más que el promedio de su departamento.**

```sql
-- Opción 1: subquery correlacionado
SELECT nombre, departamento_id, salario
FROM empleados e1
WHERE salario > (
    SELECT AVG(salario)
    FROM empleados e2
    WHERE e2.departamento_id = e1.departamento_id
);

-- Opción 2: window function (más eficiente)
SELECT nombre, departamento_id, salario
FROM (
    SELECT nombre, departamento_id, salario,
           AVG(salario) OVER (PARTITION BY departamento_id) AS prom_depto
    FROM empleados
) t
WHERE salario > prom_depto;
```

---

**P: ¿Qué es un índice y cómo afecta al rendimiento de escrituras?**

> Un índice es una estructura B-Tree que permite localizar filas sin escanear toda la tabla. Acelera lecturas (`SELECT`, `JOIN`, `WHERE`) pero penaliza escrituras porque cada `INSERT`, `UPDATE` o `DELETE` debe actualizar también todos los índices de la tabla.
>
> Una tabla con 10 índices puede tener un `INSERT` 5-10 veces más lento que una sin índices. El balance correcto depende del ratio lectura/escritura de la aplicación.

---

## Bloque 7 — Diseño de Base de Datos

---

**P: Explica las formas normales (1NF, 2NF, 3NF).**

```
1NF — Primera Forma Normal:
  - Cada columna tiene un solo valor (atómico)
  - No hay columnas repetidas ni grupos
  ❌ columna "telefonos" = "555-1234, 555-5678"
  ✅ tabla separada: usuario_telefonos(usuario_id, telefono)

2NF — Segunda Forma Normal (requiere 1NF):
  - Ningún atributo no-clave depende PARCIALMENTE de la PK
  - Solo aplica si la PK es compuesta
  ❌ PK(pedido_id, producto_id) y nombre_producto depende solo de producto_id
  ✅ mover nombre_producto a la tabla productos

3NF — Tercera Forma Normal (requiere 2NF):
  - Ningún atributo no-clave depende de otro atributo no-clave
  ❌ empleado tiene (departamento_id, nombre_departamento)
     nombre_departamento depende de departamento_id, no del empleado
  ✅ mover nombre_departamento a la tabla departamentos
```

---

**P: ¿Cuándo desnormalizarías una base de datos?**

> La desnormalización (guardar datos redundantes intencionalmente) se justifica cuando las queries de lectura son tan frecuentes y los JOINs tan costosos que el rendimiento se ve afectado de forma inaceptable.
>
> Ejemplos: guardar el total de un pedido aunque se pueda calcular de los ítems (evita recalcular en cada consulta), guardar el nombre del departamento en empleados para reportes de solo lectura, o usar tablas resumen (summary tables) para dashboards.
>
> Contra: los datos redundantes pueden quedar inconsistentes si no se mantienen sincronizados.

---

# JUEVES — Preguntas de Arquitectura

## Bloque 8 — Arquitectura Backend

---

**P: ¿Cuál es la diferencia entre monolito y microservicios?**

```
Monolito:
  - Una sola aplicación desplegada como una unidad
  - Todos los módulos comparten la misma BD
  - Fácil de desarrollar al inicio, difícil de escalar selectivamente
  - Un bug puede tirar todo el sistema
  ✅ Startups, equipos pequeños, dominio no bien entendido aún

Microservicios:
  - Múltiples servicios independientes, cada uno con su BD
  - Comunicación por HTTP (REST) o mensajería (Kafka, RabbitMQ)
  - Escala selectiva: si Pagos tiene alta carga, solo escala Pagos
  - Más complejo: red, latencia, consistencia eventual, monitoreo
  ✅ Equipos grandes, dominios bien definidos, escala diferencial necesaria
```

> **Respuesta honesta para junior/mid:** "En mi experiencia he trabajado con arquitecturas monolíticas bien estructuradas con separación de capas. Entiendo los conceptos de microservicios y las razones para adoptarlos, aunque no he implementado uno en producción."

---

**P: ¿Qué es un API Gateway?**

> Es un punto de entrada único para todos los clientes de una arquitectura de microservicios. Centraliza responsabilidades transversales: autenticación, rate limiting, logging, routing, transformación de requests.
>
> En lugar de que cada microservicio implemente seguridad, el gateway la aplica antes de pasar el request al servicio.

```
Cliente
   ↓
API Gateway (auth, rate limit, logging, routing)
   ├── /usuarios  → Servicio de Usuarios
   ├── /pedidos   → Servicio de Pedidos
   └── /pagos     → Servicio de Pagos
```

---

**P: ¿Qué es el patrón Circuit Breaker?**

> Es un patrón de resiliencia que evita llamadas repetidas a un servicio que está fallando. Tiene tres estados: Closed (funcionando normal), Open (servicio caído — retorna error inmediatamente sin intentar la llamada), Half-Open (prueba si el servicio se recuperó).
>
> Sin Circuit Breaker: si el servicio de pagos tarda 30 segundos en responder, cada request espera 30 segundos agotando threads y memoria.  
> Con Circuit Breaker: después de N fallos, el circuito se "abre" y retorna un fallback inmediatamente.

```
Estado CLOSED:
  Request → Servicio → Respuesta OK
  (monitorea fallos)

Demasiados fallos → Estado OPEN:
  Request → Circuit Breaker → Fallback inmediato (sin llamar al servicio)
  (espera tiempo de recuperación)

Después del timeout → Estado HALF-OPEN:
  Permite un request de prueba
  Si OK → vuelve a CLOSED
  Si falla → vuelve a OPEN
```

---

**P: ¿Qué es el patrón Repository y por qué lo usa Spring?**

> El patrón Repository abstrae el acceso a la fuente de datos. La lógica de negocio no sabe si los datos vienen de una BD relacional, NoSQL, una API externa o una caché. Solo llama métodos del repositorio.
>
> Spring Data JPA lo implementa automáticamente: defines la interfaz con los métodos que necesitas y Spring genera la implementación. Para testear, puedes inyectar un repositorio en memoria sin tocar la BD.

---

**P: ¿Qué es REST y cuáles son sus principios?**

```
REST (Representational State Transfer) tiene 6 principios:

1. Stateless: el servidor no guarda estado del cliente entre requests.
   Cada request contiene toda la info necesaria (ej: el JWT).

2. Client-Server: separación de responsabilidades. El cliente
   maneja la UI, el servidor maneja los datos.

3. Cacheable: las respuestas deben indicar si son cacheables
   (Cache-Control, ETag headers).

4. Uniform Interface: URLs identifican recursos, verbos HTTP
   definen acciones, JSON/XML como representación.

5. Layered System: el cliente no sabe si habla con el servidor
   final, un proxy, un CDN o un API Gateway.

6. Code on Demand (opcional): el servidor puede enviar código
   ejecutable al cliente (JavaScript).
```

---

# VIERNES — Simulación Completa Grabada (90 min)

> Esta es la simulación más importante de la semana. Grábate. Sin apuntes.

## Instrucciones

1. Pon un cronómetro de 90 minutos.
2. Responde cada pregunta en voz alta, como si estuvieras frente al entrevistador.
3. Después de cada respuesta, escribe en tu cuaderno: qué dijiste, qué omitiste, qué fue vago.
4. Al final, escucha la grabación completa y evalúate con la rúbrica al final de esta sección.

---

## Parte 1 — Preguntas conceptuales (20 min)

Responde en voz alta. Máximo 3 minutos por pregunta.

1. Explica la diferencia entre `interface` y `abstract class` con un ejemplo de cuándo usarías cada una.
2. ¿Qué es un thread pool y por qué es mejor que crear threads manualmente?
3. ¿Qué hace `@Transactional` en Spring? ¿Qué pasa si el método lanza una excepción checked?
4. Explica el flujo completo de una petición HTTP en una API REST con JWT, desde que el cliente hace el request hasta que recibe la respuesta.
5. ¿Cuál es la diferencia entre INNER JOIN y LEFT JOIN? ¿Cuándo usarías cada uno?

---

## Parte 2 — Código en vivo (40 min)

Escribe el código en tu IDE. Sin buscar en Google.

**Ejercicio 1 (15 min):** Implementa un servicio `BancoService` con el método `transferir(Long origen, Long destino, double monto)`. Debe: validar que el origen existe, validar saldo suficiente, hacer el débito y crédito, y ser transaccional. Maneja los errores con excepciones custom.

**Ejercicio 2 (15 min):** Dada una lista de `Transaccion(id, tipo, monto, fecha)`, usa Streams para retornar: el monto total por tipo, las 3 transacciones de mayor monto, y las transacciones de los últimos 30 días ordenadas por fecha.

**Ejercicio 3 (10 min):** Escribe las siguientes queries SQL:
- Top 3 empleados mejor pagados por departamento.
- Departamentos donde el salario promedio bajó respecto al mes anterior.
- Clientes que compraron en más de 3 categorías distintas en el último trimestre.

---

## Parte 3 — Preguntas de arquitectura (30 min)

Dibuja en papel y explica en voz alta.

1. Diseña la arquitectura de un sistema de e-commerce con: catálogo de productos, carrito, órdenes y pagos. ¿Monolito o microservicios? Justifica tu elección.
2. ¿Cómo manejarías 10,000 peticiones por segundo en una API de lectura intensiva? ¿Qué cambiarías si el 80% de las peticiones son para los mismos 100 productos?
3. Tu API de pedidos llama al servicio de pagos y tarda 10 segundos en responder. ¿Qué harías?

---

## Rúbrica de autoevaluación

Evalúa cada respuesta del 1 al 5:

| Criterio | 1 (Muy débil) | 3 (Aceptable) | 5 (Sólido) |
|---|---|---|---|
| **Claridad** | Confuso, rodeos | Entendible con esfuerzo | Directo y claro desde el inicio |
| **Completitud** | Omite puntos clave | Cubre lo básico | Cubre definición, razón y ejemplo |
| **Código** | No compila o incompleto | Funciona con errores menores | Limpio, compila, maneja errores |
| **Confianza** | Voz dudosa, muchas pausas | Algunas dudas | Responde con seguridad |
| **Tiempo** | Muy por encima del límite | Dentro con ajuste | Bien distribuido |

**Puntaje total / 25 por sección:**
- Parte 1: ___ / 25
- Parte 2: ___ / 25
- Parte 3: ___ / 25
- **Total: ___ / 75**

---

# SÁBADO — Corrección y Mejora de Respuestas

## Errores más comunes en entrevistas técnicas

### Error 1: Definición sin ejemplo

```
❌ "Optional es un contenedor que puede tener o no un valor."
✅ "Optional es un contenedor que puede tener o no un valor.
    Lo uso cuando un método de búsqueda puede no encontrar resultado,
    en lugar de retornar null. Por ejemplo, en un repositorio:
    findByEmail retorna Optional<Usuario>, y en el service hago
    .orElseThrow() para lanzar 404 si no existe."
```

---

### Error 2: Respuesta demasiado larga y sin estructura

```
❌ Hablar 5 minutos sobre GC sin llegar a un punto claro.

✅ Estructura PREP:
   Punto:    "El GC libera memoria de objetos sin referencias."
   Razón:    "Evita memory leaks manuales como en C/C++."
   Ejemplo:  "El heap se divide en Young y Old Generation..."
   Punto de nuevo: "Por eso en producción monitoreamos Full GC frecuente
                    como señal de memory leak."
```

---

### Error 3: "No sé" sin recovery

```
❌ "No sé qué es ZGC."

✅ "No he trabajado con ZGC directamente, pero sé que es el garbage
    collector de baja latencia de Java 15+, diseñado para pausas
    menores a 10ms. Lo que sí he configurado es el heap size y
    monitoreo de Full GC en producción."
```

---

### Error 4: Respuesta técnica sin contexto de negocio

```
❌ "Usaría SERIALIZABLE para mayor seguridad."

✅ "Depende del caso. Para un sistema de reservas de asientos donde
    dos usuarios no pueden comprar el mismo asiento, usaría
    SERIALIZABLE o SELECT FOR UPDATE. Para la mayoría de operaciones
    de lectura en una app web, READ COMMITTED es suficiente y mucho
    más performante."
```

---

## Ejercicio del sábado: Regrabar 3 preguntas

Elige las 3 respuestas con menor puntaje del viernes. Estúdialas. Vuélvelas a grabar. Compara.

### Preguntas adicionales para practicar hoy:

1. ¿Qué es el patrón DTO y por qué lo usarías en lugar de exponer las entidades JPA directamente?
2. ¿Qué diferencia hay entre `@PathVariable` y `@RequestParam`?
3. Si una query tarda 5 segundos en producción y en local tarda 50ms, ¿cuáles serían tus primeros pasos para diagnosticarla?
4. ¿Cómo harías que tu API soporte paginación?

```java
// Respuesta a paginación en Spring Data JPA:
// Repository
Page<Empleado> findByDepartamentoId(Long id, Pageable pageable);

// Controller
@GetMapping
public ResponseEntity<Page<EmpleadoDTO>> listar(
        @RequestParam(defaultValue = "0")  int pagina,
        @RequestParam(defaultValue = "10") int tamaño,
        @RequestParam(defaultValue = "nombre") String ordenPor) {

    Pageable pageable = PageRequest.of(pagina, tamaño,
                                       Sort.by(ordenPor));
    Page<Empleado> resultado = repo.findAll(pageable);

    Page<EmpleadoDTO> dtos = resultado.map(this::toDTO);
    return ResponseEntity.ok(dtos);
}

// Request: GET /api/empleados?pagina=0&tamaño=10&ordenPor=salario
```

---

# DOMINGO — Segunda Simulación + Plan de Mejora

## Segunda simulación (60 min)

Usa las mismas reglas del viernes. Mide si mejoraste.

### Preguntas nuevas para esta simulación:

**Conceptual:**
1. ¿Qué es la programación funcional y qué características de Java 8 la soportan?
2. ¿Cómo funciona `CompletableFuture.allOf()`? ¿Cuándo lo usarías?
3. ¿Qué es un índice de cobertura (covering index)?

**Código:**

```java
// Ejercicio 1: Implementa un caché LRU simple usando LinkedHashMap
public class CacheLRU<K, V> {
    private final int capacidad;
    private final LinkedHashMap<K, V> mapa;

    public CacheLRU(int capacidad) {
        this.capacidad = capacidad;
        // accessOrder=true: reordena por último acceso
        this.mapa = new LinkedHashMap<>(capacidad, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {
                return size() > capacidad;
            }
        };
    }

    public synchronized V get(K key) {
        return mapa.getOrDefault(key, null);
    }

    public synchronized void put(K key, V value) {
        mapa.put(key, value);
    }

    public synchronized int size() { return mapa.size(); }
}
```

```sql
-- Ejercicio SQL: para cada producto encuentra su rango de precio
-- dentro de su categoría, el cambio de precio respecto al mes anterior,
-- y si está por encima o por debajo del promedio de la categoría
SELECT
    p.nombre,
    p.categoria,
    p.precio,
    RANK() OVER (PARTITION BY p.categoria ORDER BY p.precio DESC)
        AS rank_precio,
    LAG(p.precio) OVER (PARTITION BY p.categoria ORDER BY p.fecha_actualizacion)
        AS precio_anterior,
    ROUND(AVG(p.precio) OVER (PARTITION BY p.categoria), 2)
        AS promedio_categoria,
    CASE
        WHEN p.precio > AVG(p.precio) OVER (PARTITION BY p.categoria)
        THEN 'Sobre promedio'
        ELSE 'Bajo promedio'
    END AS posicion
FROM productos p
ORDER BY p.categoria, rank_precio;
```

---

## Plan de mejora — llena esto al final del domingo

```
Mis 3 puntos más débiles esta semana:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Acción concreta para cada uno:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Puntaje viernes:  ___ / 75
Puntaje domingo:  ___ / 75
Mejora:           ___ puntos
```

---

## Métricas de la semana 9

| Métrica | Meta | Tu resultado |
|---|---|---|
| Simulación viernes completada y grabada | Sí / No | |
| Puntaje simulación viernes | 50+ / 75 | |
| Puntaje simulación domingo | 55+ / 75 | |
| 3 respuestas regrabadas el sábado | Sí / No | |
| Preguntas sin responder (puntos ciegos) | 0 idealmente | |
| Horas reales cumplidas | 14+ L-V + 6 fin de semana | |

---

## Errores de la semana — anótalos aquí

| # | Error / Punto débil detectado | Plan de acción |
|---|---|---|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

---

## Preguntas que NO debes responder mal en ninguna entrevista

Estas son las preguntas que todo entrevistador de Java backend hace. Si no puedes responderlas con claridad y un ejemplo, estudia hasta que puedas.

| # | Pregunta | ¿La tienes? |
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
| 10 | ¿Cuándo usarías microservicios vs monolito? | |

---

> **La semana que viene — Semana 10:** Algoritmos · Sorting · Searching · Recursión · Complejidad O(n)  
> *Ya sabes responder. La semana que viene aprendes a resolver problemas bajo presión.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

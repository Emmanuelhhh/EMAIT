# Semana 4 — Excepciones · Optional · Subqueries

> **Fase 1 — Fundamentos Sólidos** · Programa Intensivo Java Backend Developer  
> Tema central: **try/catch · Excepciones custom · Optional · Subqueries · EXISTS**

---

## Estructura de la semana

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | try/catch/finally, jerarquía de excepciones | Subqueries en WHERE |
| Martes | Excepciones personalizadas (custom exceptions) | Subqueries en FROM y SELECT |
| Miércoles | Optional: orElse, map, ifPresent, filter | Psicométricos — 30 min |
| Jueves | Integración: excepciones + Optional + colecciones | EXISTS y NOT EXISTS |
| Viernes | Simulación cronometrada: 3 Java + 3 SQL | Revisión propia |
| Sábado | Proyecto mini: sistema de reservas con manejo robusto de errores | — |
| Domingo | Repaso completo sin ayuda + Simulación final Fase 1 | — |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Manejar errores sin que el programa explote, con mensajes útiles.
- Crear excepciones propias que comuniquen el problema exacto.
- Usar `Optional` para eliminar los `NullPointerException` de tu código.
- Escribir subqueries en SQL sin dudar dónde colocarlos.
- Completar la Fase 1 con una simulación final el domingo.

---

# LUNES — try/catch/finally y jerarquía de excepciones

## ¿Qué es una excepción?

Una excepción es un **evento que interrumpe el flujo normal** del programa cuando ocurre algo inesperado: dividir entre cero, acceder a un índice inválido, leer un archivo que no existe, etc.

Sin manejo de excepciones el programa **termina abruptamente**. Con manejo correcto, **recupera el control** y da mensajes útiles.

```
Jerarquía en Java:
Throwable
├── Error              (no manejar: OutOfMemoryError, StackOverflowError)
└── Exception
    ├── RuntimeException          (unchecked — no obligatorio atrapar)
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── IllegalArgumentException
    │   ├── ArithmeticException
    │   └── NumberFormatException
    └── IOException               (checked — obligatorio atrapar o declarar)
        ├── FileNotFoundException
        └── SQLException
```

---

## Estructura try/catch/finally

```java
try {
    // código que PUEDE fallar
} catch (TipoExcepcion e) {
    // qué hacer SI falla
} finally {
    // se ejecuta SIEMPRE, falle o no
    // ideal para cerrar recursos
}
```

### Ejemplo básico

```java
public static int dividir(int a, int b) {
    try {
        return a / b;
    } catch (ArithmeticException e) {
        System.out.println("Error: " + e.getMessage());  // / by zero
        return 0;
    }
}

dividir(10, 2);   // 5
dividir(10, 0);   // Error: / by zero → 0
```

---

## Múltiples catch — del más específico al más general

```java
public static int parsearNumero(String texto) {
    try {
        return Integer.parseInt(texto);
    } catch (NumberFormatException e) {
        System.out.println("No es un número válido: " + texto);
        return -1;
    } catch (NullPointerException e) {
        System.out.println("El texto es null");
        return -1;
    } catch (Exception e) {
        // captura cualquier otra excepción no prevista
        System.out.println("Error inesperado: " + e.getMessage());
        return -1;
    }
}
```

> **Regla de orden:** el `catch` más específico siempre va primero. Si pones `Exception` primero, los siguientes catch nunca se ejecutan — el compilador lo marca como error.

---

## Multi-catch (Java 7+)

```java
try {
    // código riesgoso
} catch (NumberFormatException | NullPointerException e) {
    System.out.println("Error de formato o null: " + e.getMessage());
}
```

---

## finally — siempre se ejecuta

```java
public static void leerArchivo(String ruta) {
    Scanner archivo = null;
    try {
        archivo = new Scanner(new File(ruta));
        while (archivo.hasNextLine()) {
            System.out.println(archivo.nextLine());
        }
    } catch (FileNotFoundException e) {
        System.out.println("Archivo no encontrado: " + ruta);
    } finally {
        if (archivo != null) archivo.close();   // se cierra aunque haya error
        System.out.println("Proceso terminado.");
    }
}
```

### try-with-resources (forma moderna — preferida)

```java
// Java 7+: cierra el recurso automáticamente
try (Scanner archivo = new Scanner(new File(ruta))) {
    while (archivo.hasNextLine()) {
        System.out.println(archivo.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("Archivo no encontrado: " + ruta);
}
// archivo.close() se llama automáticamente
```

---

## throw — lanzar excepciones manualmente

```java
public void setSalario(double salario) {
    if (salario < 0) {
        throw new IllegalArgumentException(
            "El salario no puede ser negativo: " + salario
        );
    }
    this.salario = salario;
}

// Uso:
try {
    empleado.setSalario(-500);
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
    // El salario no puede ser negativo: -500.0
}
```

---

## throws — declarar que un método puede lanzar

```java
// El método declara que puede lanzar IOException
// El que lo llame DEBE manejarlo
public String leerPrimerLinea(String ruta) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(ruta));
    return br.readLine();
}

// Quien llame debe usar try/catch:
try {
    String linea = leerPrimerLinea("datos.txt");
} catch (IOException e) {
    System.out.println("Error de lectura: " + e.getMessage());
}
```

---

## SQL del Lunes — Subqueries en WHERE

Una **subconsulta** (subquery) es una consulta dentro de otra consulta. Se ejecuta primero y su resultado se usa en la consulta exterior.

```sql
-- Estructura básica
SELECT columnas
FROM tabla
WHERE columna operador (SELECT ... FROM ... WHERE ...);
```

### Subquery que retorna un solo valor (escalar)

```sql
-- Empleados que ganan más que el promedio general
SELECT nombre, salario
FROM empleados
WHERE salario > (SELECT AVG(salario) FROM empleados);

-- El subquery (SELECT AVG(salario)) retorna un número, ej: 12500
-- La query exterior filtra: salario > 12500
```

```sql
-- Empleado con el salario máximo del departamento 3
SELECT nombre, salario
FROM empleados
WHERE salario = (
    SELECT MAX(salario)
    FROM empleados
    WHERE departamento_id = 3
);
```

### Subquery con IN — retorna múltiples valores

```sql
-- Empleados que trabajan en departamentos de CDMX
SELECT nombre, salario
FROM empleados
WHERE departamento_id IN (
    SELECT id
    FROM departamentos
    WHERE ciudad = 'CDMX'
);
```

```sql
-- Productos que nunca han sido vendidos
SELECT nombre, precio
FROM productos
WHERE id NOT IN (
    SELECT DISTINCT producto_id
    FROM ventas
);
```

---

# MARTES — Excepciones Personalizadas

## ¿Por qué crear excepciones propias?

Las excepciones estándar de Java son genéricas. Las excepciones personalizadas comunican exactamente **qué salió mal en tu dominio de negocio**, hacen el código más legible y facilitan el manejo específico de cada error.

```java
// Genérico — no dice nada útil
throw new Exception("Error");

// Específico — comunica el problema exacto
throw new SaldoInsuficienteException("Saldo: $500, intento de retiro: $800");
```

---

## Crear una excepción unchecked (RuntimeException)

La más común en aplicaciones modernas. No obliga a quien la llama a usar try/catch.

```java
// Excepción base del dominio
public class NegocioException extends RuntimeException {

    private final String codigo;

    public NegocioException(String codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }

    public NegocioException(String codigo, String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.codigo = codigo;
    }

    public String getCodigo() { return codigo; }
}
```

```java
// Excepciones específicas que extienden la base
public class SaldoInsuficienteException extends NegocioException {
    public SaldoInsuficienteException(double saldo, double monto) {
        super("SALDO_INSUF",
              String.format("Saldo disponible: $%.2f, monto solicitado: $%.2f",
                            saldo, monto));
    }
}

public class ProductoNoEncontradoException extends NegocioException {
    public ProductoNoEncontradoException(String nombre) {
        super("PROD_NOT_FOUND",
              "Producto no encontrado: '" + nombre + "'");
    }
}

public class StockInsuficienteException extends NegocioException {
    public StockInsuficienteException(String producto, int disponible, int pedido) {
        super("STOCK_INSUF",
              String.format("'%s': stock=%d, pedido=%d", producto, disponible, pedido));
    }
}
```

---

## Usar las excepciones en servicios

```java
public class CuentaBancaria {

    private String titular;
    private double saldo;

    public CuentaBancaria(String titular, double saldoInicial) {
        if (saldoInicial < 0)
            throw new IllegalArgumentException("Saldo inicial no puede ser negativo");
        this.titular = titular;
        this.saldo   = saldoInicial;
    }

    public void depositar(double monto) {
        if (monto <= 0)
            throw new IllegalArgumentException("El monto debe ser positivo");
        this.saldo += monto;
    }

    public void retirar(double monto) {
        if (monto <= 0)
            throw new IllegalArgumentException("El monto debe ser positivo");
        if (monto > saldo)
            throw new SaldoInsuficienteException(saldo, monto);
        this.saldo -= monto;
    }

    public double getSaldo() { return saldo; }
}
```

```java
// Manejo en la capa de aplicación
public static void procesarRetiro(CuentaBancaria cuenta, double monto) {
    try {
        cuenta.retirar(monto);
        System.out.printf("Retiro exitoso. Saldo restante: $%.2f%n",
                          cuenta.getSaldo());
    } catch (SaldoInsuficienteException e) {
        System.out.println("[" + e.getCodigo() + "] " + e.getMessage());
        // [SALDO_INSUF] Saldo disponible: $500.00, monto solicitado: $800.00
    } catch (IllegalArgumentException e) {
        System.out.println("Datos inválidos: " + e.getMessage());
    }
}
```

---

## Excepción checked (Exception) — cuándo usarla

```java
// Para errores recuperables que el llamador DEBE manejar
public class ConexionException extends Exception {

    public ConexionException(String host, Throwable causa) {
        super("No se pudo conectar a: " + host, causa);
    }
}

public class BaseDatos {
    public void conectar(String host) throws ConexionException {
        try {
            // intento de conexión...
        } catch (IOException e) {
            throw new ConexionException(host, e);
        }
    }
}
```

> **Regla práctica:** usa `RuntimeException` (unchecked) para errores de programación o de negocio. Usa `Exception` (checked) cuando el llamador puede y debe hacer algo para recuperarse (reintentar, usar alternativa, notificar al usuario).

---

## SQL del Martes — Subqueries en FROM y SELECT

### Subquery en FROM (tabla derivada)

```sql
-- El resultado del subquery se usa como si fuera una tabla
SELECT dept_resumen.departamento, dept_resumen.promedio
FROM (
    SELECT departamento_id AS departamento,
           AVG(salario)    AS promedio
    FROM empleados
    GROUP BY departamento_id
) AS dept_resumen
WHERE dept_resumen.promedio > 10000;
```

```sql
-- Top departamentos con el promedio más alto (subquery + ORDER BY externo)
SELECT departamento, ROUND(promedio, 2) AS promedio_redondeado
FROM (
    SELECT departamento_id AS departamento,
           AVG(salario)    AS promedio,
           COUNT(*)        AS total
    FROM empleados
    GROUP BY departamento_id
) AS resumen
WHERE total >= 3
ORDER BY promedio DESC
LIMIT 3;
```

### Subquery en SELECT (subquery correlacionado)

```sql
-- Para cada empleado, mostrar cuánto gana vs el promedio de su departamento
SELECT
    nombre,
    salario,
    (SELECT AVG(salario)
     FROM empleados e2
     WHERE e2.departamento_id = e1.departamento_id) AS promedio_depto,
    salario - (SELECT AVG(salario)
               FROM empleados e2
               WHERE e2.departamento_id = e1.departamento_id) AS diferencia
FROM empleados e1
ORDER BY diferencia DESC;
```

> **Nota de rendimiento:** los subqueries correlacionados (que referencian la tabla exterior) se ejecutan una vez por cada fila. Para tablas grandes, considera reemplazarlos con `JOIN` o window functions (Semana 8).

---

# MIÉRCOLES — Optional

## El problema: NullPointerException

`NullPointerException` es el error más común en Java. Ocurre cuando intentas llamar un método sobre una referencia `null`.

```java
// Código peligroso
String nombre = obtenerNombreUsuario();  // podría retornar null
System.out.println(nombre.toUpperCase()); // NullPointerException si nombre es null

// Solución antigua — verbosa y olvidable
if (nombre != null) {
    System.out.println(nombre.toUpperCase());
}
```

---

## Optional — la solución moderna

`Optional<T>` es un contenedor que **puede o no contener** un valor. Obliga al programador a pensar en el caso vacío.

```java
import java.util.Optional;

// Crear Optional
Optional<String> conValor  = Optional.of("Hola");          // contiene "Hola"
Optional<String> vacio     = Optional.empty();              // vacío
Optional<String> nullable  = Optional.ofNullable(null);     // vacío si null
Optional<String> nullable2 = Optional.ofNullable("Texto");  // contiene "Texto"
```

---

## Métodos fundamentales

```java
Optional<String> opt = Optional.of("java backend");

// isPresent() / isEmpty() — verificar si tiene valor
if (opt.isPresent()) {
    System.out.println("Tiene valor: " + opt.get());
}

// ifPresent() — ejecutar acción solo si hay valor
opt.ifPresent(v -> System.out.println(v.toUpperCase()));
// JAVA BACKEND

// get() — obtener el valor (lanza excepción si está vacío — úsalo con cuidado)
String valor = opt.get();

// orElse() — valor por defecto si está vacío
String resultado = opt.orElse("sin nombre");

// orElseGet() — valor por defecto con Supplier (se evalúa solo si es necesario)
String resultado2 = opt.orElseGet(() -> generarNombreDefault());

// orElseThrow() — lanzar excepción si está vacío
String resultado3 = opt.orElseThrow(
    () -> new ProductoNoEncontradoException("desconocido")
);
```

---

## Transformar con map y filter

```java
Optional<String> nombre = Optional.of("  Ana García  ");

// map() — transforma el valor si existe
Optional<String> nombreLimpio = nombre
    .map(String::trim)
    .map(String::toUpperCase);
// Optional["ANA GARCÍA"]

// filter() — conserva el valor solo si cumple la condición
Optional<String> nombreLargo = nombre
    .map(String::trim)
    .filter(n -> n.length() > 5);
// Optional["Ana García"] — tiene 10 chars > 5 ✓

Optional<String> nombreCorto = Optional.of("Ana")
    .filter(n -> n.length() > 5);
// Optional.empty — "Ana" tiene 3 chars, no cumple

// flatMap() — cuando map retornaría Optional<Optional<T>>
Optional<String> ciudad = obtenerUsuario(id)
    .flatMap(u -> obtenerDireccion(u.getId()))
    .flatMap(d -> Optional.ofNullable(d.getCiudad()));
```

---

## Optional en métodos de búsqueda

```java
public class RepositorioEmpleados {

    private ArrayList<Empleado> lista = new ArrayList<>();

    // Retornar Optional en lugar de null
    public Optional<Empleado> buscarPorNombre(String nombre) {
        return lista.stream()
            .filter(e -> e.getNombre().equalsIgnoreCase(nombre))
            .findFirst();
    }

    public Optional<Empleado> empleadoMejorPagado() {
        return lista.stream()
            .max(Comparator.comparingDouble(Empleado::getSalario));
    }
}

// Uso limpio — sin if (x != null)
RepositorioEmpleados repo = new RepositorioEmpleados();

repo.buscarPorNombre("Ana")
    .map(e -> e.getNombre() + " gana $" + e.getSalario())
    .ifPresentOrElse(
        System.out::println,
        () -> System.out.println("Empleado no encontrado")
    );

double salarioTop = repo.empleadoMejorPagado()
    .map(Empleado::getSalario)
    .orElse(0.0);
```

---

## Cuándo NO usar Optional

```java
// MAL: Optional como parámetro de método
public void procesar(Optional<String> nombre) { ... }   // ← evitar

// MAL: Optional en campos de clase
private Optional<String> telefono;   // ← evitar

// MAL: Optional en colecciones
List<Optional<String>> lista;        // ← evitar

// BIEN: Optional solo como tipo de retorno de métodos que pueden no encontrar algo
public Optional<Empleado> buscar(int id) { ... }   // ← correcto
```

---

## Psicométricos — 30 minutos

### Series mixtas — nivel avanzado

```
Serie:  2,  3,  5,  9, 17, 33, ___
Patrón: ×2-1, ×2-1, ×2-1...  →  33×2-1 = 65

Serie:  1,  4,  9, 16, 25, ___
Patrón: cuadrados perfectos: 1², 2², 3², 4², 5²  →  6² = 36

Serie:  0,  1,  1,  2,  3,  5,  8, 13, ___
Patrón: Fibonacci  →  21

Serie:  2,  5, 11, 23, 47, ___
Patrón: ×2+1 cada vez  →  47×2+1 = 95
```

### Razonamiento abstracto — figuras

```
Técnica para matrices de figuras:
1. Observa qué cambia de izquierda a derecha en cada fila
2. Observa qué cambia de arriba a abajo en cada columna
3. Aplica ambos patrones para encontrar la figura faltante

Patrones comunes: rotación, reflexión, adición de elementos,
                  cambio de tamaño, inversión de color.
```

### Velocidad numérica — ejercicio rápido

Resuelve estas operaciones en menos de 3 minutos:

```
45 × 11 = ___        (4_5 → 4+5=9 en medio → 495)
68 × 5  = ___        (68/2 × 10 = 340)
15% de 240 = ___     (10%=24, 5%=12 → 36)
√169 = ___           (13)
25% de 360 = ___     (360/4 = 90)
```

---

# JUEVES — Integración + EXISTS

## Integración: Excepciones + Optional + Streams + POO

### Servicio de empleados robusto

```java
import java.util.*;
import java.util.stream.*;

// Excepción de dominio
class EmpleadoException extends RuntimeException {
    private final String codigo;
    public EmpleadoException(String codigo, String msg) {
        super(msg); this.codigo = codigo;
    }
    public String getCodigo() { return codigo; }
}

// Servicio completo
public class EmpleadoService {

    private final ArrayList<Empleado> empleados = new ArrayList<>();

    // ── Agregar con validación ────────────────────────────────
    public void agregar(Empleado e) {
        if (e == null)
            throw new IllegalArgumentException("Empleado no puede ser null");
        boolean existe = empleados.stream()
            .anyMatch(x -> x.getNombre().equalsIgnoreCase(e.getNombre()));
        if (existe)
            throw new EmpleadoException("DUP_EMP",
                "Ya existe un empleado con nombre: " + e.getNombre());
        empleados.add(e);
    }

    // ── Buscar con Optional ───────────────────────────────────
    public Optional<Empleado> buscarPorNombre(String nombre) {
        return empleados.stream()
            .filter(e -> e.getNombre().equalsIgnoreCase(nombre))
            .findFirst();
    }

    // ── Actualizar salario ────────────────────────────────────
    public void actualizarSalario(String nombre, double nuevoSalario) {
        if (nuevoSalario <= 0)
            throw new IllegalArgumentException("Salario debe ser positivo");

        Empleado emp = buscarPorNombre(nombre)
            .orElseThrow(() -> new EmpleadoException(
                "EMP_NOT_FOUND", "No existe: " + nombre));

        emp.setSalario(nuevoSalario);
    }

    // ── Queries con Streams ───────────────────────────────────
    public List<Empleado> porDepartamento(String depto) {
        return empleados.stream()
            .filter(e -> e.getDepartamento().equalsIgnoreCase(depto))
            .sorted(Comparator.comparingDouble(Empleado::getSalario).reversed())
            .collect(Collectors.toList());
    }

    public Map<String, Double> promedioPorDepto() {
        return empleados.stream()
            .collect(Collectors.groupingBy(
                Empleado::getDepartamento,
                Collectors.averagingDouble(Empleado::getSalario)
            ));
    }

    public Optional<Empleado> mejorPagado() {
        return empleados.stream()
            .max(Comparator.comparingDouble(Empleado::getSalario));
    }

    public double totalNomina() {
        return empleados.stream()
            .mapToDouble(Empleado::getSalario)
            .sum();
    }
}
```

---

## SQL del Jueves — EXISTS y NOT EXISTS

### EXISTS

`EXISTS` verifica si una subconsulta retorna **al menos una fila**. Es más eficiente que `IN` cuando la subconsulta trabaja con tablas grandes.

```sql
-- Clientes que tienen al menos un pedido
SELECT nombre
FROM clientes c
WHERE EXISTS (
    SELECT 1
    FROM pedidos p
    WHERE p.cliente_id = c.id
);

-- El SELECT 1 es convención: no importa qué retorna,
-- solo importa SI retorna algo
```

### NOT EXISTS

```sql
-- Clientes que NUNCA han hecho un pedido
SELECT nombre, email
FROM clientes c
WHERE NOT EXISTS (
    SELECT 1
    FROM pedidos p
    WHERE p.cliente_id = c.id
);
```

### EXISTS vs IN — cuándo usar cada uno

```sql
-- Con IN: el subquery se ejecuta una vez y retorna una lista
SELECT nombre FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos);

-- Con EXISTS: el subquery se ejecuta por cada fila del exterior
-- Más eficiente cuando la tabla interior es grande
-- y puede cortarse en cuanto encuentra la primera coincidencia
SELECT nombre FROM clientes c
WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id);
```

```sql
-- EXISTS con condición adicional
-- Empleados que tienen al menos un proyecto activo con presupuesto > $100,000
SELECT e.nombre, e.departamento_id
FROM empleados e
WHERE EXISTS (
    SELECT 1
    FROM proyectos p
    WHERE p.dept_id = e.departamento_id
      AND p.activo = 1
      AND p.presupuesto > 100000
);
```

### Subquery correlacionado con comparación

```sql
-- Empleados que ganan más que el promedio de su propio departamento
SELECT nombre, salario, departamento_id
FROM empleados e1
WHERE salario > (
    SELECT AVG(salario)
    FROM empleados e2
    WHERE e2.departamento_id = e1.departamento_id
);
```

---

# VIERNES — Simulación Final (Tiempo Limitado)

> Regla: sin apuntes los primeros 15 min de cada problema. Cronómetro encendido.  
> Esta es la última simulación de la Fase 1 — exígete más que las semanas anteriores.

## 3 Ejercicios Java

### Problema 1: Calculadora con manejo de excepciones

Implementa una calculadora que maneje división entre cero, operación inválida y entrada no numérica.

```java
class OperacionInvalidaException extends RuntimeException {
    public OperacionInvalidaException(String op) {
        super("Operación no soportada: '" + op + "'. Use: +, -, *, /");
    }
}

public class Calculadora {

    public double calcular(double a, String operacion, double b) {
        return switch (operacion) {
            case "+" -> a + b;
            case "-" -> a - b;
            case "*" -> a * b;
            case "/" -> {
                if (b == 0)
                    throw new ArithmeticException("No se puede dividir entre cero");
                yield a / b;
            }
            default -> throw new OperacionInvalidaException(operacion);
        };
    }

    public Optional<Double> calcularSeguro(double a, String op, double b) {
        try {
            return Optional.of(calcular(a, op, b));
        } catch (ArithmeticException | OperacionInvalidaException e) {
            System.out.println("Error: " + e.getMessage());
            return Optional.empty();
        }
    }
}

// Uso:
Calculadora calc = new Calculadora();

calc.calcularSeguro(10, "/", 0)
    .ifPresentOrElse(
        r -> System.out.println("Resultado: " + r),
        () -> System.out.println("No hay resultado.")
    );
```

---

### Problema 2: Pipeline de transformación con Streams y Optional

```java
// Dado un array de Strings que representan números (algunos inválidos),
// obtener la suma de los válidos mayores a 10.

public static double sumarValidos(String[] entradas) {
    return Arrays.stream(entradas)
        .map(s -> {
            try {
                return Optional.of(Double.parseDouble(s));
            } catch (NumberFormatException e) {
                return Optional.<Double>empty();
            }
        })
        .filter(Optional::isPresent)
        .mapToDouble(Optional::get)
        .filter(n -> n > 10)
        .sum();
}

// sumarValidos(new String[]{"5","abc","15","20","xx","8","12"})  →  47.0
// (15 + 20 + 12 = 47)
```

---

### Problema 3: Sistema de búsqueda con Optional encadenado

```java
// Simula una cadena de búsqueda: Usuario → Dirección → Ciudad → País

class Usuario {
    String nombre;
    Direccion direccion;
    Usuario(String n, Direccion d) { this.nombre=n; this.direccion=d; }
    Optional<Direccion> getDireccion() { return Optional.ofNullable(direccion); }
}

class Direccion {
    String ciudad;
    String pais;
    Direccion(String ciudad, String pais) { this.ciudad=ciudad; this.pais=pais; }
    Optional<String> getCiudad() { return Optional.ofNullable(ciudad); }
    Optional<String> getPais()   { return Optional.ofNullable(pais); }
}

// Obtener país del usuario sin riesgo de NullPointerException
public static String obtenerPais(Usuario usuario) {
    return Optional.ofNullable(usuario)
        .flatMap(Usuario::getDireccion)
        .flatMap(Direccion::getPais)
        .orElse("País desconocido");
}

// Funciona aunque usuario, dirección o país sean null
System.out.println(obtenerPais(null));                             // País desconocido
System.out.println(obtenerPais(new Usuario("Ana", null)));         // País desconocido
System.out.println(obtenerPais(new Usuario("Ana",
    new Direccion("Monterrey", "México"))));                       // México
```

---

## 3 Consultas SQL

Tablas: `empleados(id, nombre, salario, dept_id)`, `departamentos(id, nombre_dept)`, `proyectos(id, nombre_proy, dept_id, presupuesto, activo)`

### Consulta 1: Empleados en departamentos con presupuesto activo > $500,000

```sql
SELECT e.nombre, e.salario, d.nombre_dept
FROM empleados e
INNER JOIN departamentos d ON e.dept_id = d.id
WHERE EXISTS (
    SELECT 1
    FROM proyectos p
    WHERE p.dept_id = e.dept_id
      AND p.activo = 1
      AND p.presupuesto > 500000
)
ORDER BY e.salario DESC;
```

### Consulta 2: Departamentos donde todos ganan más que el promedio general

```sql
SELECT d.nombre_dept, AVG(e.salario) AS promedio_depto
FROM departamentos d
INNER JOIN empleados e ON d.id = e.dept_id
GROUP BY d.id, d.nombre_dept
HAVING MIN(e.salario) > (SELECT AVG(salario) FROM empleados)
ORDER BY promedio_depto DESC;
```

### Consulta 3: Segundo salario más alto (clásica de entrevistas)

```sql
-- Opción 1: con subquery
SELECT MAX(salario) AS segundo_mayor
FROM empleados
WHERE salario < (SELECT MAX(salario) FROM empleados);

-- Opción 2: con LIMIT y OFFSET
SELECT DISTINCT salario
FROM empleados
ORDER BY salario DESC
LIMIT 1 OFFSET 1;
```

---

# SÁBADO — Proyecto Mini: Sistema de Reservas

## Requisitos

- Clase `Reserva` con `id`, `cliente`, `fecha`, `habitacion`, `noches`.
- Excepción `ReservaException` con subcategorías: `HabitacionOcupadaException`, `FechaInvalidaException`.
- Clase `HotelService` que gestiona reservas con validaciones.
- Usar `Optional` en todos los métodos de búsqueda.
- Usar Streams para reportes: reservas por cliente, ingreso total, habitación más ocupada.

## Código base

```java
import java.util.*;
import java.util.stream.*;
import java.time.LocalDate;

// ── Excepciones ───────────────────────────────────────
class ReservaException extends RuntimeException {
    private final String codigo;
    public ReservaException(String codigo, String msg) {
        super(msg); this.codigo = codigo;
    }
    public String getCodigo() { return codigo; }
}

class HabitacionOcupadaException extends ReservaException {
    public HabitacionOcupadaException(int habitacion, LocalDate fecha) {
        super("HAB_OCUPADA",
              "Habitación " + habitacion + " ya ocupada para " + fecha);
    }
}

class FechaInvalidaException extends ReservaException {
    public FechaInvalidaException(LocalDate fecha) {
        super("FECHA_INV",
              "Fecha inválida o en el pasado: " + fecha);
    }
}

// ── Modelo ────────────────────────────────────────────
class Reserva {
    private static int contador = 1;

    private final int       id;
    private final String    cliente;
    private final LocalDate fecha;
    private final int       habitacion;
    private final int       noches;
    private final double    precioPorNoche;

    public Reserva(String cliente, LocalDate fecha,
                   int habitacion, int noches, double precioPorNoche) {
        this.id             = contador++;
        this.cliente        = cliente;
        this.fecha          = fecha;
        this.habitacion     = habitacion;
        this.noches         = noches;
        this.precioPorNoche = precioPorNoche;
    }

    public int       getId()            { return id; }
    public String    getCliente()       { return cliente; }
    public LocalDate getFecha()         { return fecha; }
    public int       getHabitacion()    { return habitacion; }
    public int       getNoches()        { return noches; }
    public double    getTotal()         { return precioPorNoche * noches; }

    @Override
    public String toString() {
        return String.format(
            "#%d | %-12s | Hab.%d | %s | %d noches | $%.2f",
            id, cliente, habitacion, fecha, noches, getTotal()
        );
    }
}

// ── Servicio ──────────────────────────────────────────
class HotelService {

    private final ArrayList<Reserva> reservas = new ArrayList<>();

    public Reserva crear(String cliente, LocalDate fecha,
                         int habitacion, int noches, double precio) {
        // Validar fecha
        if (fecha.isBefore(LocalDate.now()))
            throw new FechaInvalidaException(fecha);

        // Validar disponibilidad
        boolean ocupada = reservas.stream()
            .anyMatch(r -> r.getHabitacion() == habitacion
                        && r.getFecha().equals(fecha));
        if (ocupada)
            throw new HabitacionOcupadaException(habitacion, fecha);

        Reserva nueva = new Reserva(cliente, fecha, habitacion, noches, precio);
        reservas.add(nueva);
        return nueva;
    }

    public Optional<Reserva> buscarPorId(int id) {
        return reservas.stream()
            .filter(r -> r.getId() == id)
            .findFirst();
    }

    public boolean cancelar(int id) {
        return reservas.removeIf(r -> r.getId() == id);
    }

    public List<Reserva> reservasPorCliente(String cliente) {
        return reservas.stream()
            .filter(r -> r.getCliente().equalsIgnoreCase(cliente))
            .sorted(Comparator.comparing(Reserva::getFecha))
            .collect(Collectors.toList());
    }

    public double ingresoTotal() {
        return reservas.stream()
            .mapToDouble(Reserva::getTotal)
            .sum();
    }

    public Optional<Map.Entry<Integer, Long>> habitacionMasOcupada() {
        return reservas.stream()
            .collect(Collectors.groupingBy(
                Reserva::getHabitacion, Collectors.counting()
            ))
            .entrySet().stream()
            .max(Map.Entry.comparingByValue());
    }

    public void listarTodas() {
        if (reservas.isEmpty()) {
            System.out.println("Sin reservas.");
            return;
        }
        reservas.stream()
            .sorted(Comparator.comparing(Reserva::getFecha))
            .forEach(System.out::println);
        System.out.printf("─── Total ingreso: $%.2f%n", ingresoTotal());
    }
}

// ── Main ──────────────────────────────────────────────
public class SistemaReservas {

    static HotelService hotel = new HotelService();
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        // Datos de prueba
        try {
            hotel.crear("Ana García",  LocalDate.now().plusDays(3),  101, 2, 850);
            hotel.crear("Luis Pérez",  LocalDate.now().plusDays(1),  202, 5, 1200);
            hotel.crear("María López", LocalDate.now().plusDays(7),  101, 3, 850);
            hotel.crear("Ana García",  LocalDate.now().plusDays(10), 305, 1, 950);
        } catch (ReservaException e) {
            System.out.println("[" + e.getCodigo() + "] " + e.getMessage());
        }

        int op;
        do {
            System.out.println("\n=== HOTEL RESERVAS ===");
            System.out.println("1. Listar todas");
            System.out.println("2. Buscar por ID");
            System.out.println("3. Reservas de un cliente");
            System.out.println("4. Nueva reserva");
            System.out.println("5. Cancelar reserva");
            System.out.println("6. Habitación más ocupada");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            op = Integer.parseInt(sc.nextLine());

            switch (op) {
                case 1 -> hotel.listarTodas();
                case 2 -> {
                    System.out.print("ID: ");
                    int id = Integer.parseInt(sc.nextLine());
                    hotel.buscarPorId(id)
                         .ifPresentOrElse(System.out::println,
                             () -> System.out.println("No encontrada."));
                }
                case 3 -> {
                    System.out.print("Cliente: ");
                    String c = sc.nextLine();
                    List<Reserva> lista = hotel.reservasPorCliente(c);
                    if (lista.isEmpty()) System.out.println("Sin reservas.");
                    else lista.forEach(System.out::println);
                }
                case 4 -> crearReservaInteractivo();
                case 5 -> {
                    System.out.print("ID a cancelar: ");
                    int id = Integer.parseInt(sc.nextLine());
                    System.out.println(hotel.cancelar(id)
                        ? "Cancelada." : "No encontrada.");
                }
                case 6 -> hotel.habitacionMasOcupada().ifPresent(e ->
                    System.out.printf("Habitación %d con %d reservas%n",
                                      e.getKey(), e.getValue()));
            }
        } while (op != 0);
    }

    static void crearReservaInteractivo() {
        try {
            System.out.print("Cliente: ");     String cli  = sc.nextLine();
            System.out.print("Fecha (YYYY-MM-DD): "); LocalDate f =
                LocalDate.parse(sc.nextLine());
            System.out.print("Habitación: ");  int hab    = Integer.parseInt(sc.nextLine());
            System.out.print("Noches: ");      int noches = Integer.parseInt(sc.nextLine());
            System.out.print("Precio/noche: "); double precio = Double.parseDouble(sc.nextLine());
            Reserva r = hotel.crear(cli, f, hab, noches, precio);
            System.out.println("Reserva creada: " + r);
        } catch (ReservaException e) {
            System.out.println("[" + e.getCodigo() + "] " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Datos inválidos: " + e.getMessage());
        }
    }
}
```

---

# DOMINGO — Repaso + Simulación Final Fase 1

> Este domingo es el cierre de la Fase 1. Dos partes: repaso de lo visto en la semana y simulación completa de las 4 semanas.

## Lista de verificación — Semana 4

- [ ] Sé la diferencia entre excepción checked y unchecked y cuándo usar cada una.
- [ ] Puedo crear una jerarquía de excepciones de dominio.
- [ ] Sé la diferencia entre `throw` y `throws`.
- [ ] Uso `Optional` en métodos de búsqueda en lugar de retornar `null`.
- [ ] Puedo encadenar `map`, `filter`, `flatMap` sobre `Optional`.
- [ ] Puedo escribir un subquery en `WHERE`, en `FROM` y en `SELECT`.
- [ ] Sé cuándo usar `EXISTS` vs `IN` y puedo explicarlo.
- [ ] El sistema de reservas corre sin errores.

---

## Simulación Final — Fase 1 (60–90 minutos)

> Sin apuntes. Sin Google. Cronómetro. Este es el estándar de una prueba técnica real.

### Parte A — Java (30 min)

**Ejercicio 1:** Implementa una clase `Pila<T>` (stack) usando `ArrayList` con los métodos `push(T)`, `pop()` (retorna `Optional<T>`), `peek()` (retorna `Optional<T>`), `isEmpty()` y `size()`.

```java
public class Pila<T> {
    private ArrayList<T> datos = new ArrayList<>();

    public void push(T elemento) {
        datos.add(elemento);
    }

    public Optional<T> pop() {
        if (datos.isEmpty()) return Optional.empty();
        return Optional.of(datos.remove(datos.size() - 1));
    }

    public Optional<T> peek() {
        if (datos.isEmpty()) return Optional.empty();
        return Optional.of(datos.get(datos.size() - 1));
    }

    public boolean isEmpty() { return datos.isEmpty(); }
    public int     size()    { return datos.size(); }
}
```

**Ejercicio 2:** Dada una lista de objetos `Empleado`, usa Streams para:
- Agrupar por departamento.
- Dentro de cada departamento, retornar solo el empleado mejor pagado.
- El resultado debe ser `Map<String, Optional<Empleado>>`.

```java
Map<String, Optional<Empleado>> topPorDepto = empleados.stream()
    .collect(Collectors.groupingBy(
        Empleado::getDepartamento,
        Collectors.maxBy(Comparator.comparingDouble(Empleado::getSalario))
    ));
```

**Ejercicio 3:** Implementa un método que reciba un `String` representando una expresión matemática simple (`"10 + 5"`, `"20 / 4"`) y retorne el resultado como `Optional<Double>`. Maneja todos los casos de error con excepciones.

---

### Parte B — SQL (20 min)

Tablas: `tienda.productos(id, nombre, categoria, precio, stock)`, `tienda.ventas(id, producto_id, cliente, cantidad, fecha)`

**Consulta 1:** Categorías con más de 10 productos en stock y precio promedio mayor a $500.

```sql
SELECT categoria, COUNT(*) AS productos, AVG(precio) AS precio_prom
FROM productos
WHERE stock > 0
GROUP BY categoria
HAVING COUNT(*) > 10 AND AVG(precio) > 500
ORDER BY precio_prom DESC;
```

**Consulta 2:** Productos más vendidos que nunca han tenido stock cero (es decir, que existen en productos con stock > 0 Y tienen ventas).

```sql
SELECT p.nombre, SUM(v.cantidad) AS total_vendido
FROM productos p
INNER JOIN ventas v ON p.id = v.producto_id
WHERE p.stock > 0
GROUP BY p.id, p.nombre
ORDER BY total_vendido DESC
LIMIT 5;
```

**Consulta 3:** Clientes que compraron en más de una categoría diferente.

```sql
SELECT v.cliente, COUNT(DISTINCT p.categoria) AS categorias
FROM ventas v
INNER JOIN productos p ON v.producto_id = p.id
GROUP BY v.cliente
HAVING COUNT(DISTINCT p.categoria) > 1
ORDER BY categorias DESC;
```

---

## Métricas de la semana 4

| Métrica | Meta | Tu resultado |
|---|---|---|
| Ejercicios Java resueltos | 15 o más | |
| Consultas SQL resueltas | 10 o más | |
| Psicométricos realizados | 1 sesión completa (30 min) | |
| Horas reales cumplidas | 14+ hrs L–V + 6 fin de semana | |
| Errores cometidos y aprendidos | Anotar al menos 3 | |
| Proyecto Reservas: ¿corre sin errores? | Sí / No | |
| Simulación Final Fase 1: completada | Sí / No | |

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

## Autoevaluación Fase 1 — ¿Estás listo para la Fase 2?

Responde honestamente. Si marcas menos de 8 de 10, dedica un día extra de repaso antes de avanzar.

| # | ¿Puedo hacer esto sin ayuda? | ✓ |
|---|---|---|
| 1 | Resolver ejercicios de arrays y strings en < 10 min | |
| 2 | Elegir entre ArrayList, HashSet y HashMap correctamente | |
| 3 | Escribir una clase con herencia, encapsulamiento y polimorfismo | |
| 4 | Transformar una lista de objetos con Streams en < 5 min | |
| 5 | Crear y lanzar excepciones personalizadas | |
| 6 | Usar Optional para evitar nulls en métodos de búsqueda | |
| 7 | Escribir SELECT con JOINs, GROUP BY y HAVING correcto | |
| 8 | Escribir subqueries en WHERE, FROM y EXISTS | |
| 9 | Construir un CRUD funcional en consola | |
| 10 | Explicar todo lo anterior en voz alta como en una entrevista | |

---

> **La semana que viene — FASE 2:** APIs REST · Spring Boot · JPA · CRUD completo con base de datos  
> *Pasas de consola a servidor. El ritmo sube. La recompensa también.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

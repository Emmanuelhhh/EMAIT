# Semana 3 — POO · Streams · GROUP BY · HAVING

> **Fase 1 — Fundamentos Sólidos** · Programa Intensivo Java Backend Developer  
> Tema central: **Clases · Herencia · Encapsulamiento · Streams · GROUP BY · HAVING**

---

## Estructura de la semana

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | Clases, objetos, constructores, encapsulamiento | GROUP BY |
| Martes | Herencia, polimorfismo, sobrescritura | HAVING |
| Miércoles | Interfaces y clases abstractas | Psicométricos — 30 min |
| Jueves | Streams: filter, map, forEach, collect | GROUP BY + HAVING combinados |
| Viernes | Simulación cronometrada: 3 Java + 3 SQL | Revisión propia |
| Sábado | Proyecto mini: sistema de inventario con POO | — |
| Domingo | Repaso completo sin ayuda | — |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Diseñar clases con atributos privados, constructores y métodos bien definidos.
- Aplicar herencia para evitar repetición de código.
- Distinguir cuándo usar una interfaz vs una clase abstracta.
- Transformar colecciones con Streams en una línea limpia de código.
- Escribir consultas SQL con `GROUP BY` y `HAVING` sin dudar.

---

# LUNES — Clases, Objetos y Encapsulamiento

## ¿Qué es una clase?

Una clase es un **molde** que define atributos (datos) y métodos (comportamiento). Un objeto es una **instancia concreta** de ese molde.

```
Clase: Empleado          Objeto: empleado1
┌──────────────────┐     ┌──────────────────┐
│ - nombre: String │     │ nombre = "Ana"    │
│ - salario: double│  →  │ salario = 12000.0 │
│ + getSalario()   │     │ getSalario() → ok │
└──────────────────┘     └──────────────────┘
```

---

## Estructura completa de una clase

```java
public class Empleado {

    // ── Atributos (privados — encapsulamiento) ──────────
    private String nombre;
    private double salario;
    private String puesto;

    // ── Constructor principal ───────────────────────────
    public Empleado(String nombre, double salario, String puesto) {
        this.nombre  = nombre;
        this.salario = salario;
        this.puesto  = puesto;
    }

    // ── Constructor sobrecargado ────────────────────────
    public Empleado(String nombre) {
        this(nombre, 0.0, "Sin asignar");
    }

    // ── Getters ─────────────────────────────────────────
    public String getNombre()  { return nombre; }
    public double getSalario() { return salario; }
    public String getPuesto()  { return puesto; }

    // ── Setters con validación ───────────────────────────
    public void setSalario(double salario) {
        if (salario < 0) throw new IllegalArgumentException("Salario negativo");
        this.salario = salario;
    }

    // ── Método de negocio ────────────────────────────────
    public double calcularBono(double porcentaje) {
        return salario * (porcentaje / 100);
    }

    // ── toString para depuración ─────────────────────────
    @Override
    public String toString() {
        return String.format("Empleado{nombre='%s', salario=%.2f, puesto='%s'}",
                             nombre, salario, puesto);
    }
}
```

---

## Encapsulamiento — por qué importa

El encapsulamiento protege el estado interno del objeto. Los atributos son `private` y solo se accede a ellos mediante getters/setters.

```java
// MAL: atributo público — cualquiera puede romper el estado
public class CuentaBancaria {
    public double saldo;  // ← peligroso
}
cuenta.saldo = -99999;   // esto es válido y destruye el estado

// BIEN: encapsulado con validación
public class CuentaBancaria {
    private double saldo;

    public void depositar(double monto) {
        if (monto <= 0) throw new IllegalArgumentException("Monto inválido");
        this.saldo += monto;
    }

    public boolean retirar(double monto) {
        if (monto > saldo) return false;
        this.saldo -= monto;
        return true;
    }

    public double getSaldo() { return saldo; }
}
```

---

## Uso de la clase

```java
// Crear objetos
Empleado e1 = new Empleado("Ana", 12000.0, "Desarrolladora");
Empleado e2 = new Empleado("Luis", 9500.0, "QA");
Empleado e3 = new Empleado("María");  // constructor sobrecargado

// Acceder y modificar
System.out.println(e1.getNombre());   // Ana
e2.setSalario(10000.0);               // actualiza con validación

// Método de negocio
double bono = e1.calcularBono(10);    // 1200.0

// toString
System.out.println(e1);
// Empleado{nombre='Ana', salario=12000.00, puesto='Desarrolladora'}

// Guardar en ArrayList
ArrayList<Empleado> equipo = new ArrayList<>();
equipo.add(e1);
equipo.add(e2);
equipo.add(e3);
```

---

## SQL del Lunes — GROUP BY

### ¿Qué hace GROUP BY?

Agrupa las filas que tienen el mismo valor en una columna, para luego aplicar funciones de agregación (`COUNT`, `SUM`, `AVG`, etc.) **por grupo**.

```sql
-- Sin GROUP BY: una sola fila con el total general
SELECT COUNT(*) FROM empleados;          -- 50

-- Con GROUP BY: una fila por departamento
SELECT departamento_id, COUNT(*)
FROM empleados
GROUP BY departamento_id;
```

### Regla fundamental

> Toda columna en el `SELECT` que **no sea** una función de agregación, **debe estar** en el `GROUP BY`.

```sql
-- CORRECTO
SELECT departamento_id, puesto, AVG(salario)
FROM empleados
GROUP BY departamento_id, puesto;

-- ERROR: 'nombre' no está en GROUP BY ni es agregación
SELECT departamento_id, nombre, AVG(salario)   -- ← error
FROM empleados
GROUP BY departamento_id;
```

### Ejemplos prácticos

```sql
-- Cantidad de empleados por departamento
SELECT departamento_id, COUNT(*) AS total
FROM empleados
GROUP BY departamento_id
ORDER BY total DESC;

-- Salario promedio y total por puesto
SELECT
    puesto,
    COUNT(*)        AS empleados,
    AVG(salario)    AS promedio,
    SUM(salario)    AS masa_salarial
FROM empleados
GROUP BY puesto
ORDER BY masa_salarial DESC;

-- Ventas por mes (usando funciones de fecha)
SELECT
    MONTH(fecha_venta)  AS mes,
    COUNT(*)            AS pedidos,
    SUM(monto)          AS ingreso
FROM ventas
GROUP BY MONTH(fecha_venta)
ORDER BY mes;
```

---

# MARTES — Herencia y Polimorfismo

## ¿Qué es la herencia?

La herencia permite que una clase **hijo** reutilice atributos y métodos de una clase **padre**, y agregue o modifique comportamiento propio.

```
        Persona
       /        \
  Empleado    Cliente
      |
  Gerente
```

---

## Clase padre

```java
public class Persona {

    private String nombre;
    private int    edad;

    public Persona(String nombre, int edad) {
        this.nombre = nombre;
        this.edad   = edad;
    }

    // Getters
    public String getNombre() { return nombre; }
    public int    getEdad()   { return edad; }

    public void presentarse() {
        System.out.println("Hola, soy " + nombre + " y tengo " + edad + " años.");
    }

    @Override
    public String toString() {
        return "Persona{nombre='" + nombre + "', edad=" + edad + "}";
    }
}
```

---

## Clase hija con `extends`

```java
public class Empleado extends Persona {

    private double salario;
    private String departamento;

    // super() llama al constructor del padre — debe ser la primera línea
    public Empleado(String nombre, int edad, double salario, String departamento) {
        super(nombre, edad);
        this.salario      = salario;
        this.departamento = departamento;
    }

    public double getSalario()      { return salario; }
    public String getDepartamento() { return departamento; }

    // Sobrescribir (override) un método del padre
    @Override
    public void presentarse() {
        super.presentarse();   // llama al método del padre
        System.out.println("Trabajo en " + departamento + " con salario " + salario);
    }

    @Override
    public String toString() {
        return "Empleado{nombre='" + getNombre() + "', dept='" + departamento + "'}";
    }
}
```

---

## Polimorfismo

El polimorfismo permite tratar objetos de subclases como si fueran del tipo padre. En tiempo de ejecución, Java llama al método correcto según el tipo real del objeto.

```java
// Polimorfismo: la variable es de tipo Persona pero el objeto es Empleado
Persona p = new Empleado("Ana", 28, 12000, "Dev");
p.presentarse();   // llama a Empleado.presentarse(), NO a Persona.presentarse()

// Lista polimórfica
ArrayList<Persona> personas = new ArrayList<>();
personas.add(new Persona("Carlos", 40));
personas.add(new Empleado("Ana", 28, 12000, "Dev"));
personas.add(new Empleado("Luis", 32, 9500, "QA"));

// Todos responden a presentarse() cada uno a su manera
for (Persona per : personas) {
    per.presentarse();   // método correcto según tipo real
}
```

---

## Segunda clase hija — Gerente

```java
public class Gerente extends Empleado {

    private int equipoACargo;

    public Gerente(String nombre, int edad, double salario,
                   String departamento, int equipoACargo) {
        super(nombre, edad, salario, departamento);
        this.equipoACargo = equipoACargo;
    }

    public double calcularBonoGerente() {
        return getSalario() * 0.20 * equipoACargo;
    }

    @Override
    public void presentarse() {
        super.presentarse();
        System.out.println("Gestiono un equipo de " + equipoACargo + " personas.");
    }
}
```

---

## SQL del Martes — HAVING

### ¿Qué hace HAVING?

`HAVING` filtra **grupos** después de que `GROUP BY` los forma. Es como el `WHERE` pero para grupos.

```
ORDER DE EJECUCIÓN:
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

```sql
-- WHERE filtra filas individuales (antes de agrupar)
-- HAVING filtra grupos (después de agrupar)

-- Departamentos con más de 5 empleados
SELECT departamento_id, COUNT(*) AS total
FROM empleados
GROUP BY departamento_id
HAVING COUNT(*) > 5;

-- NO puedes poner COUNT(*) > 5 en el WHERE
-- porque WHERE se ejecuta antes que GROUP BY
```

### Ejemplos prácticos

```sql
-- Puestos con salario promedio mayor a $12,000
SELECT puesto, AVG(salario) AS promedio
FROM empleados
GROUP BY puesto
HAVING AVG(salario) > 12000
ORDER BY promedio DESC;

-- Clientes que han hecho más de 3 pedidos
SELECT cliente_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY cliente_id
HAVING COUNT(*) > 3;

-- WHERE + GROUP BY + HAVING juntos
SELECT
    departamento_id,
    AVG(salario) AS promedio
FROM empleados
WHERE activo = 1                    -- filtra ANTES de agrupar
GROUP BY departamento_id
HAVING AVG(salario) BETWEEN 10000 AND 20000  -- filtra grupos
ORDER BY promedio DESC;
```

> **Pregunta de entrevista frecuente:** ¿Cuál es la diferencia entre `WHERE` y `HAVING`?  
> `WHERE` filtra filas antes de agrupar. `HAVING` filtra grupos después de agrupar.  
> Solo `HAVING` puede usar funciones de agregación como condición.

---

# MIÉRCOLES — Interfaces y Clases Abstractas

## Clase Abstracta

Una clase abstracta **no puede instanciarse directamente**. Define una plantilla con métodos concretos y métodos abstractos (sin implementación) que las subclases deben completar.

```java
public abstract class Figura {

    private String color;

    public Figura(String color) {
        this.color = color;
    }

    public String getColor() { return color; }

    // Método abstracto: cada figura lo implementa diferente
    public abstract double calcularArea();
    public abstract double calcularPerimetro();

    // Método concreto: igual para todas
    public void describir() {
        System.out.printf("Figura %s | Área: %.2f | Perímetro: %.2f%n",
                          color, calcularArea(), calcularPerimetro());
    }
}
```

```java
public class Circulo extends Figura {

    private double radio;

    public Circulo(String color, double radio) {
        super(color);
        this.radio = radio;
    }

    @Override
    public double calcularArea() {
        return Math.PI * radio * radio;
    }

    @Override
    public double calcularPerimetro() {
        return 2 * Math.PI * radio;
    }
}

public class Rectangulo extends Figura {

    private double ancho, alto;

    public Rectangulo(String color, double ancho, double alto) {
        super(color);
        this.ancho = ancho;
        this.alto  = alto;
    }

    @Override
    public double calcularArea()      { return ancho * alto; }

    @Override
    public double calcularPerimetro() { return 2 * (ancho + alto); }
}
```

---

## Interfaz

Una interfaz define un **contrato**: qué métodos debe tener una clase, sin importar cómo los implementa. Una clase puede implementar múltiples interfaces.

```java
public interface Pagable {
    double calcularPago();       // abstracto por defecto
    String generarRecibo();
}

public interface Notificable {
    void enviarNotificacion(String mensaje);
}
```

```java
// Una clase puede implementar múltiples interfaces
public class EmpleadoPorHora extends Empleado
        implements Pagable, Notificable {

    private double horasTrabajadas;
    private double tarifaPorHora;

    public EmpleadoPorHora(String nombre, int edad,
                            double horas, double tarifa) {
        super(nombre, edad, 0, "Temporal");
        this.horasTrabajadas = horas;
        this.tarifaPorHora   = tarifa;
    }

    @Override
    public double calcularPago() {
        return horasTrabajadas * tarifaPorHora;
    }

    @Override
    public String generarRecibo() {
        return String.format("Recibo: %s — %.1f hrs × $%.2f = $%.2f",
                             getNombre(), horasTrabajadas,
                             tarifaPorHora, calcularPago());
    }

    @Override
    public void enviarNotificacion(String mensaje) {
        System.out.println("[SMS a " + getNombre() + "]: " + mensaje);
    }
}
```

---

## Clase Abstracta vs Interfaz

| | Clase Abstracta | Interfaz |
|---|---|---|
| **Instanciable** | No | No |
| **Herencia** | Solo una (extends) | Múltiples (implements) |
| **Atributos** | Sí, con estado | Solo constantes (static final) |
| **Constructores** | Sí | No |
| **Métodos concretos** | Sí | Sí (desde Java 8 con default) |
| **Uso típico** | Jerarquía de clases relacionadas | Contrato de comportamiento |

> **Regla práctica:** ¿Tienen una relación "ES UN"? → Clase abstracta.  
> ¿Comparten un comportamiento sin importar la jerarquía? → Interfaz.  
> Círculo ES UNA Figura. Empleado PUEDE SER Pagable (no "es un pagable").

---

## Psicométricos — 30 minutos

### Series con patrones combinados

```
Serie: 1, 1, 2, 3, 5, 8, 13, ___
Patrón: cada término = suma de los dos anteriores (Fibonacci) → 21

Serie: 2, 6, 12, 20, 30, ___
Diff:    4  6   8  10
Diff2:     2   2   2    → diferencias de diferencias = 2 → siguiente: 30+12=42

Serie: 3, 6, 11, 18, 27, ___
Diff:   3  5   7   9       → +2 cada vez → siguiente diff = 11 → 27+11=38
```

### Razonamiento verbal — analogías

```
Técnica: A es a B como C es a D
  Leer   : Libro   ::   Escuchar  : ___   →  Podcast / Música

Pasos:
1. Identifica la relación entre A y B
2. Aplica la misma relación a C
```

### Matrices lógicas

```
Técnica: analiza fila a fila Y columna a columna
  - ¿Aumenta algo? ¿Rota? ¿Se agrega un elemento?
  - Busca el patrón en horizontal primero, luego vertical
```

---

# JUEVES — Streams

## ¿Qué son los Streams?

Los Streams permiten procesar colecciones de forma **declarativa** (dices QUÉ quieres, no CÓMO hacerlo). No modifican la colección original — producen un resultado nuevo.

```java
import java.util.*;
import java.util.stream.*;
```

---

## Operaciones intermedias (devuelven otro Stream)

```java
ArrayList<Integer> nums = new ArrayList<>(
    Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
);

// filter — conserva los que cumplen la condición
List<Integer> pares = nums.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
// [2, 4, 6, 8, 10]

// map — transforma cada elemento
List<Integer> cuadrados = nums.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());
// [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

// sorted — ordena
List<Integer> descendente = nums.stream()
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.toList());
// [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

// distinct — elimina duplicados
List<Integer> unicos = Arrays.asList(1,2,2,3,3,3).stream()
    .distinct()
    .collect(Collectors.toList());
// [1, 2, 3]

// limit — toma los primeros N
List<Integer> primerosTres = nums.stream()
    .limit(3)
    .collect(Collectors.toList());
// [1, 2, 3]
```

---

## Operaciones terminales (producen un resultado final)

```java
// forEach — itera sin retornar valor
nums.stream()
    .filter(n -> n > 5)
    .forEach(System.out::println);

// count — cuenta elementos
long cantidad = nums.stream()
    .filter(n -> n % 2 == 0)
    .count();   // 5

// reduce — combina todos los elementos en uno
int suma = nums.stream()
    .reduce(0, Integer::sum);   // 55

int producto = nums.stream()
    .reduce(1, (a, b) -> a * b);

// findFirst — primer elemento que cumple la condición
Optional<Integer> primero = nums.stream()
    .filter(n -> n > 5)
    .findFirst();
primero.ifPresent(System.out::println);   // 6

// anyMatch / allMatch / noneMatch
boolean hayMayores = nums.stream().anyMatch(n -> n > 9);   // true
boolean todosPares = nums.stream().allMatch(n -> n % 2 == 0); // false
boolean sinNegativos = nums.stream().noneMatch(n -> n < 0);   // true

// min y max
Optional<Integer> maximo = nums.stream().max(Integer::compareTo);  // 10
Optional<Integer> minimo = nums.stream().min(Integer::compareTo);  // 1
```

---

## Streams con objetos — el caso más común en entrevistas

```java
ArrayList<Empleado> empleados = new ArrayList<>();
empleados.add(new Empleado("Ana",   28, 12000, "Dev"));
empleados.add(new Empleado("Luis",  32, 9500,  "QA"));
empleados.add(new Empleado("María", 25, 14000, "Dev"));
empleados.add(new Empleado("Pedro", 45, 8000,  "Soporte"));
empleados.add(new Empleado("Sara",  30, 15000, "Dev"));

// Nombres de empleados del área Dev con salario > 11000
List<String> devsSenior = empleados.stream()
    .filter(e -> e.getDepartamento().equals("Dev"))
    .filter(e -> e.getSalario() > 11000)
    .map(Empleado::getNombre)
    .sorted()
    .collect(Collectors.toList());
// [Ana, María, Sara]

// Salario promedio por departamento
Map<String, Double> promedioPorDepto = empleados.stream()
    .collect(Collectors.groupingBy(
        Empleado::getDepartamento,
        Collectors.averagingDouble(Empleado::getSalario)
    ));
// {Dev=13666.66, QA=9500.0, Soporte=8000.0}

// Empleado con mayor salario
Optional<Empleado> mejorPagado = empleados.stream()
    .max(Comparator.comparingDouble(Empleado::getSalario));
mejorPagado.ifPresent(e ->
    System.out.println("Mejor pagado: " + e.getNombre()));  // Sara

// Suma total de salarios
double totalSalarios = empleados.stream()
    .mapToDouble(Empleado::getSalario)
    .sum();   // 58500.0
```

---

## SQL del Jueves — GROUP BY + HAVING combinados

```sql
-- Escenario: tienda con tablas
-- productos(id, nombre, categoria, precio)
-- ventas(id, producto_id, cantidad, fecha, cliente_id)

-- Ingreso total por categoría, solo las que superan $50,000
SELECT
    p.categoria,
    COUNT(v.id)             AS total_ventas,
    SUM(v.cantidad)         AS unidades_vendidas,
    SUM(p.precio * v.cantidad) AS ingreso_total
FROM productos p
INNER JOIN ventas v ON p.id = v.producto_id
GROUP BY p.categoria
HAVING SUM(p.precio * v.cantidad) > 50000
ORDER BY ingreso_total DESC;

-- Clientes frecuentes con alto gasto (más de 5 pedidos Y más de $10,000)
SELECT
    cliente_id,
    COUNT(*)        AS pedidos,
    SUM(monto)      AS total_gastado
FROM ventas
GROUP BY cliente_id
HAVING COUNT(*) > 5
   AND SUM(monto) > 10000
ORDER BY total_gastado DESC;

-- Productos vendidos más de 100 unidades en el último trimestre
SELECT
    p.nombre,
    SUM(v.cantidad) AS unidades
FROM productos p
INNER JOIN ventas v ON p.id = v.producto_id
WHERE v.fecha >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY p.id, p.nombre
HAVING SUM(v.cantidad) > 100
ORDER BY unidades DESC;
```

---

# VIERNES — Simulación (Tiempo Limitado)

> Regla: sin apuntes los primeros 15 min de cada problema. Cronómetro encendido.

## 3 Ejercicios Java

### Problema 1: Jerarquía de vehículos

Crea las clases `Vehiculo` (padre), `Auto` y `Camion` (hijos). `Vehiculo` tiene `marca`, `modelo` y el método abstracto `calcularCostoViaje(double km)`. `Auto` cobra $2.50/km y `Camion` cobra $5.00/km más $500 de cuota fija.

```java
public abstract class Vehiculo {
    private String marca;
    private String modelo;

    public Vehiculo(String marca, String modelo) {
        this.marca  = marca;
        this.modelo = modelo;
    }

    public String getMarca()  { return marca; }
    public String getModelo() { return modelo; }

    public abstract double calcularCostoViaje(double km);

    @Override
    public String toString() {
        return marca + " " + modelo;
    }
}

public class Auto extends Vehiculo {
    public Auto(String marca, String modelo) {
        super(marca, modelo);
    }

    @Override
    public double calcularCostoViaje(double km) {
        return km * 2.50;
    }
}

public class Camion extends Vehiculo {
    public Camion(String marca, String modelo) {
        super(marca, modelo);
    }

    @Override
    public double calcularCostoViaje(double km) {
        return (km * 5.00) + 500;
    }
}

// Uso polimórfico:
ArrayList<Vehiculo> flota = new ArrayList<>();
flota.add(new Auto("Toyota", "Corolla"));
flota.add(new Camion("Ford", "F-350"));

for (Vehiculo v : flota) {
    System.out.printf("%s → $%.2f para 100 km%n",
                      v, v.calcularCostoViaje(100));
}
```

---

### Problema 2: Filtrar y transformar con Streams

Dada una lista de `Empleado`, obtén en una sola cadena de Streams:
- Los del área **Dev** con salario mayor a $10,000.
- Ordenados por salario descendente.
- Solo sus nombres en mayúsculas.

```java
List<String> resultado = empleados.stream()
    .filter(e -> "Dev".equals(e.getDepartamento()))
    .filter(e -> e.getSalario() > 10000)
    .sorted(Comparator.comparingDouble(Empleado::getSalario).reversed())
    .map(e -> e.getNombre().toUpperCase())
    .collect(Collectors.toList());
```

---

### Problema 3: Interfaz Descuentable

Crea una interfaz `Descuentable` con el método `aplicarDescuento(double pct)`. Impleméntala en `Producto` y en `Servicio`. Cada uno aplica el descuento diferente (Producto lo resta del precio, Servicio solo si la tarifa supera $1,000).

```java
public interface Descuentable {
    double aplicarDescuento(double porcentaje);
}

public class Producto implements Descuentable {
    private String nombre;
    private double precio;

    public Producto(String nombre, double precio) {
        this.nombre = nombre;
        this.precio = precio;
    }

    @Override
    public double aplicarDescuento(double porcentaje) {
        return precio - (precio * porcentaje / 100);
    }
}

public class Servicio implements Descuentable {
    private String descripcion;
    private double tarifa;

    public Servicio(String descripcion, double tarifa) {
        this.descripcion = descripcion;
        this.tarifa      = tarifa;
    }

    @Override
    public double aplicarDescuento(double porcentaje) {
        if (tarifa <= 1000) return tarifa;   // sin descuento
        return tarifa - (tarifa * porcentaje / 100);
    }
}
```

---

## 3 Consultas SQL

Tablas: `empleados(id, nombre, puesto, salario, dept_id, fecha_ingreso)`, `departamentos(id, nombre_dept, ciudad)`

### Consulta 1: Departamentos con más de 3 empleados y salario promedio > $10,000

```sql
SELECT
    d.nombre_dept,
    COUNT(e.id)      AS empleados,
    AVG(e.salario)   AS promedio
FROM departamentos d
INNER JOIN empleados e ON d.id = e.dept_id
GROUP BY d.id, d.nombre_dept
HAVING COUNT(e.id) > 3
   AND AVG(e.salario) > 10000
ORDER BY promedio DESC;
```

### Consulta 2: Ciudad con mayor masa salarial

```sql
SELECT
    d.ciudad,
    SUM(e.salario) AS masa_salarial
FROM departamentos d
INNER JOIN empleados e ON d.id = e.dept_id
GROUP BY d.ciudad
ORDER BY masa_salarial DESC
LIMIT 1;
```

### Consulta 3: Puestos donde todos ganan más de $8,000

```sql
SELECT puesto
FROM empleados
GROUP BY puesto
HAVING MIN(salario) > 8000;
```

---

# SÁBADO — Proyecto Mini: Sistema de Inventario con POO

## Requisitos

- Clase `Producto` con atributos privados, constructor y getters/setters con validación.
- Interfaz `Inventariable` con métodos `agregarStock(int)` y `reducirStock(int)`.
- Clase `Almacen` que gestiona una lista de productos.
- Menú en consola: agregar producto, listar, buscar por nombre, reducir stock.
- Usa Streams para listar productos con stock bajo (< 5 unidades).

## Código base

```java
import java.util.*;
import java.util.stream.*;

// ── Interfaz ──────────────────────────────────────────
interface Inventariable {
    void agregarStock(int cantidad);
    boolean reducirStock(int cantidad);   // retorna false si no hay suficiente
}

// ── Clase Producto ────────────────────────────────────
class Producto implements Inventariable {

    private String nombre;
    private double precio;
    private int    stock;
    private String categoria;

    public Producto(String nombre, double precio, int stock, String categoria) {
        if (precio < 0 || stock < 0)
            throw new IllegalArgumentException("Precio/stock no puede ser negativo");
        this.nombre    = nombre;
        this.precio    = precio;
        this.stock     = stock;
        this.categoria = categoria;
    }

    // Getters
    public String getNombre()    { return nombre; }
    public double getPrecio()    { return precio; }
    public int    getStock()     { return stock; }
    public String getCategoria() { return categoria; }

    @Override
    public void agregarStock(int cantidad) {
        if (cantidad <= 0) throw new IllegalArgumentException("Cantidad inválida");
        this.stock += cantidad;
    }

    @Override
    public boolean reducirStock(int cantidad) {
        if (cantidad > stock) return false;
        this.stock -= cantidad;
        return true;
    }

    @Override
    public String toString() {
        return String.format("%-20s | $%8.2f | Stock: %3d | %s",
                             nombre, precio, stock, categoria);
    }
}

// ── Clase Almacen ─────────────────────────────────────
class Almacen {

    private ArrayList<Producto> inventario = new ArrayList<>();

    public void agregar(Producto p) {
        inventario.add(p);
        System.out.println("Producto '" + p.getNombre() + "' agregado.");
    }

    public void listarTodos() {
        if (inventario.isEmpty()) { System.out.println("Inventario vacío."); return; }
        System.out.println("─".repeat(60));
        inventario.stream()
            .sorted(Comparator.comparing(Producto::getNombre))
            .forEach(System.out::println);
        System.out.println("─".repeat(60));
        System.out.printf("Total productos: %d%n", inventario.size());
    }

    public Optional<Producto> buscarPorNombre(String nombre) {
        return inventario.stream()
            .filter(p -> p.getNombre().equalsIgnoreCase(nombre))
            .findFirst();
    }

    public void listarStockBajo(int umbral) {
        System.out.println("⚠ Productos con stock < " + umbral + ":");
        inventario.stream()
            .filter(p -> p.getStock() < umbral)
            .forEach(p -> System.out.println("  → " + p));
    }

    public Map<String, Double> valorPorCategoria() {
        return inventario.stream()
            .collect(Collectors.groupingBy(
                Producto::getCategoria,
                Collectors.summingDouble(p -> p.getPrecio() * p.getStock())
            ));
    }
}

// ── Menú principal ────────────────────────────────────
public class SistemaInventario {

    static Almacen almacen = new Almacen();
    static Scanner sc      = new Scanner(System.in);

    public static void main(String[] args) {
        // Datos de prueba
        almacen.agregar(new Producto("Laptop",      18999, 10, "Electrónica"));
        almacen.agregar(new Producto("Teclado",      850,  3,  "Electrónica"));
        almacen.agregar(new Producto("Silla Gamer", 4500, 7,  "Muebles"));
        almacen.agregar(new Producto("Monitor",     6200,  2,  "Electrónica"));

        int op;
        do {
            System.out.println("\n=== INVENTARIO ===");
            System.out.println("1. Listar todos");
            System.out.println("2. Buscar producto");
            System.out.println("3. Reducir stock");
            System.out.println("4. Agregar stock");
            System.out.println("5. Alerta stock bajo");
            System.out.println("6. Valor por categoría");
            System.out.println("0. Salir");
            System.out.print("Opción: ");
            op = Integer.parseInt(sc.nextLine());

            switch (op) {
                case 1 -> almacen.listarTodos();
                case 2 -> {
                    System.out.print("Nombre: ");
                    String nom = sc.nextLine();
                    almacen.buscarPorNombre(nom)
                        .ifPresentOrElse(
                            System.out::println,
                            () -> System.out.println("No encontrado.")
                        );
                }
                case 3 -> {
                    System.out.print("Nombre: ");
                    String nom = sc.nextLine();
                    System.out.print("Cantidad a reducir: ");
                    int cant = Integer.parseInt(sc.nextLine());
                    almacen.buscarPorNombre(nom).ifPresentOrElse(
                        p -> System.out.println(p.reducirStock(cant)
                            ? "Stock actualizado." : "Stock insuficiente."),
                        () -> System.out.println("No encontrado.")
                    );
                }
                case 4 -> {
                    System.out.print("Nombre: ");
                    String nom = sc.nextLine();
                    System.out.print("Cantidad a agregar: ");
                    int cant = Integer.parseInt(sc.nextLine());
                    almacen.buscarPorNombre(nom).ifPresentOrElse(
                        p -> { p.agregarStock(cant);
                               System.out.println("Stock actualizado."); },
                        () -> System.out.println("No encontrado.")
                    );
                }
                case 5 -> almacen.listarStockBajo(5);
                case 6 -> almacen.valorPorCategoria()
                    .forEach((cat, val) ->
                        System.out.printf("%-15s → $%.2f%n", cat, val));
            }
        } while (op != 0);
    }
}
```

---

# DOMINGO — Repaso Completo sin Ayuda

> Resuelve todo sin ver el código. Si te trabas, anota exactamente dónde y vuelve a resolverlo una vez más.

## Lista de verificación — Java

- [ ] Puedo crear una clase completa con atributos privados, constructor y getters/setters con validación.
- [ ] Puedo explicar qué es el encapsulamiento y por qué los atributos son `private`.
- [ ] Puedo crear una clase hija con `extends` y sobrescribir un método del padre.
- [ ] Puedo explicar polimorfismo con un ejemplo concreto.
- [ ] Sé cuándo usar clase abstracta vs interfaz y puedo justificarlo.
- [ ] Puedo filtrar una lista de objetos con Streams en menos de 5 minutos.
- [ ] Puedo agrupar objetos por campo usando `Collectors.groupingBy`.
- [ ] El sistema de inventario corre sin errores.

## Lista de verificación — SQL

- [ ] Puedo escribir una consulta con `GROUP BY` correcto sin mezclar columnas no agregadas.
- [ ] Sé la diferencia entre `WHERE` y `HAVING` y puedo explicarla en una entrevista.
- [ ] Puedo combinar `INNER JOIN` + `GROUP BY` + `HAVING` en una sola consulta.
- [ ] Puedo encontrar el grupo con el valor máximo o mínimo usando `ORDER BY + LIMIT`.

## Ejercicios propuestos

### Java

1. Crea una interfaz `Comparable` propia con el método `comparar(T otro)` e impleméntala en `Empleado` para comparar por salario.
2. Dada una lista de `Producto`, usa Streams para obtener el producto más caro de cada categoría.
3. Implementa una clase abstracta `Animal` con el método abstracto `hacerSonido()` y dos subclases concretas.
4. Usa `Collectors.groupingBy` para agrupar una lista de Strings por su longitud.

### SQL

Tablas: `alumnos(id, nombre, carrera)`, `calificaciones(id, alumno_id, materia, calificacion)`

1. Promedio de calificación por alumno, solo los que tienen promedio mayor a 8.0.
2. Materia con el promedio más bajo.
3. Carreras donde todos los alumnos tienen al menos una calificación de 10.
4. Alumnos con calificaciones en más de 4 materias distintas.

---

## Métricas de la semana 3

| Métrica | Meta | Tu resultado |
|---|---|---|
| Ejercicios Java resueltos | 15 o más | |
| Consultas SQL resueltas | 10 o más | |
| Psicométricos realizados | 1 sesión completa (30 min) | |
| Horas reales cumplidas | 14+ hrs L–V + 6 fin de semana | |
| Errores cometidos y aprendidos | Anotar al menos 3 | |
| Proyecto Inventario: ¿corre sin errores? | Sí / No | |

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

> **La semana que viene:** Excepciones · Optional · Subqueries · Simulación final de Fase 1  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

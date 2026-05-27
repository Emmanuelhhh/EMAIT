# Semana 2 — Collections · JOINs · Psicométricos

> **Fase 1 — Fundamentos Sólidos** · Programa Intensivo Java Backend Developer  
> Tema central: **ArrayList · HashSet · HashMap + INNER JOIN · LEFT JOIN · RIGHT JOIN**

---

## Estructura de la semana

| Día | Java | SQL / Extra |
|---|---|---|
| Lunes | ArrayList: agregar, recorrer, buscar, eliminar | INNER JOIN |
| Martes | HashSet: unicidad, búsqueda, operaciones de conjuntos | LEFT JOIN · RIGHT JOIN |
| Miércoles | HashMap: frecuencias, conteo, mapeo clave-valor | Psicométricos — 30 min |
| Jueves | Ejercicios integrados de Collections | JOINs combinados |
| Viernes | Simulación cronometrada: 3 Java + 3 SQL | Revisión propia |
| Sábado | Proyecto mini: agenda de contactos con Collections | — |
| Domingo | Repaso completo sin ayuda | — |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Elegir entre `ArrayList`, `HashSet` y `HashMap` según el problema.
- Resolver ejercicios de duplicados, frecuencias y agrupación en menos de 10 minutos.
- Escribir JOINs correctos sin dudar qué tipo usar según el caso.
- Explicar en voz alta la diferencia entre los tres tipos de JOIN.

---

# LUNES — ArrayList

## ¿Qué es un ArrayList?

`ArrayList` es una lista dinámica respaldada por un array interno. A diferencia de los arrays normales, **crece automáticamente** cuando se agrega un elemento. Permite duplicados y mantiene el orden de inserción.

```java
import java.util.ArrayList;

ArrayList<String> nombres = new ArrayList<>();
```

> **¿Cuándo usar ArrayList?**  
> Cuando necesitas una colección ordenada que puede crecer, y donde los duplicados son válidos.  
> Acceso por índice en O(1). Inserción/eliminación en el medio en O(n).

---

## Operaciones fundamentales

```java
ArrayList<String> nombres = new ArrayList<>();

// Agregar elementos
nombres.add("Ana");
nombres.add("Luis");
nombres.add("María");
nombres.add("Ana");         // duplicado permitido

// Acceder por índice
System.out.println(nombres.get(0));   // Ana

// Tamaño
System.out.println(nombres.size());   // 4

// Modificar un elemento
nombres.set(1, "Carlos");             // reemplaza "Luis"

// Eliminar por índice
nombres.remove(0);                    // elimina "Ana" (primero)

// Eliminar por valor (primera ocurrencia)
nombres.remove("Ana");

// Verificar si existe
System.out.println(nombres.contains("María"));  // true

// Recorrer con for-each
for (String n : nombres) {
    System.out.println(n);
}

// Recorrer con índice (cuando necesitas el índice)
for (int i = 0; i < nombres.size(); i++) {
    System.out.println(i + ": " + nombres.get(i));
}
```

---

## Ejercicios resueltos — ArrayList

### Ejercicio 1: Eliminar duplicados de una lista

```java
public static ArrayList<Integer> eliminarDuplicados(ArrayList<Integer> lista) {
    ArrayList<Integer> resultado = new ArrayList<>();
    for (int n : lista) {
        if (!resultado.contains(n)) {
            resultado.add(n);
        }
    }
    return resultado;
}

// Uso:
ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 2, 3, 3, 3, 4));
System.out.println(eliminarDuplicados(nums));  // [1, 2, 3, 4]
```

> **Nota:** Este enfoque es O(n²). La versión óptima usa `HashSet` — la verás el martes.

---

### Ejercicio 2: Encontrar el elemento más frecuente

```java
public static int masFrequente(ArrayList<Integer> lista) {
    int maxFreq = 0;
    int elemento = lista.get(0);

    for (int i = 0; i < lista.size(); i++) {
        int freq = 0;
        for (int j = 0; j < lista.size(); j++) {
            if (lista.get(j).equals(lista.get(i))) freq++;
        }
        if (freq > maxFreq) {
            maxFreq = freq;
            elemento = lista.get(i);
        }
    }
    return elemento;
}
```

---

### Ejercicio 3: Ordenar un ArrayList

```java
import java.util.Collections;

ArrayList<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9));

Collections.sort(nums);                    // ascendente: [1, 2, 5, 8, 9]
Collections.sort(nums, Collections.reverseOrder()); // descendente: [9, 8, 5, 2, 1]

// Con Strings (ordena alfabéticamente)
ArrayList<String> nombres = new ArrayList<>(Arrays.asList("Carlos", "Ana", "María"));
Collections.sort(nombres);                 // [Ana, Carlos, María]
```

---

## SQL del Lunes — INNER JOIN

### ¿Qué hace INNER JOIN?

Retorna **solo las filas que tienen coincidencia en ambas tablas**. Si un registro no tiene pareja en la otra tabla, no aparece en el resultado.

```
Tabla A          Tabla B
┌───────┐        ┌───────┐
│   1   │        │   1   │
│   2   │ ──▶▶──│   3   │  ← INNER JOIN: solo 1 y 3 (comunes)
│   3   │        │   4   │
└───────┘        └───────┘
```

```sql
-- Sintaxis básica
SELECT columnas
FROM tabla_a
INNER JOIN tabla_b ON tabla_a.id = tabla_b.fk_id;
```

### Ejemplo práctico

Tablas: `empleados(id, nombre, departamento_id)` y `departamentos(id, nombre_dept)`

```sql
-- Obtener empleados con su departamento
SELECT
    e.nombre        AS empleado,
    d.nombre_dept   AS departamento
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id;

-- Solo aparecen empleados que TIENEN departamento asignado
-- Los empleados sin departamento_id quedan fuera
```

```sql
-- INNER JOIN con condición adicional
SELECT e.nombre, d.nombre_dept, e.salario
FROM empleados e
INNER JOIN departamentos d ON e.departamento_id = d.id
WHERE e.salario > 10000
ORDER BY e.salario DESC;
```

> **Regla de oro:** Cuando en duda entre JOIN types, piensa: "¿necesito TODOS los registros de alguna tabla aunque no tengan pareja?" Si no → INNER JOIN.

---

# MARTES — HashSet

## ¿Qué es un HashSet?

`HashSet` almacena elementos **únicos** sin un orden garantizado. Internamente usa una tabla hash, lo que le da búsqueda, inserción y eliminación en **O(1)** promedio.

```java
import java.util.HashSet;

HashSet<String> ciudades = new HashSet<>();
```

> **¿Cuándo usar HashSet?**  
> Cuando necesitas eliminar duplicados o verificar existencia de forma rápida.  
> **No garantiza orden.** Si necesitas orden, usa `TreeSet` o `LinkedHashSet`.

---

## Operaciones fundamentales

```java
HashSet<String> ciudades = new HashSet<>();

// Agregar (retorna false si ya existe)
ciudades.add("Monterrey");
ciudades.add("CDMX");
ciudades.add("Guadalajara");
boolean agregado = ciudades.add("Monterrey");  // false — ya existe

// Verificar existencia — O(1)
System.out.println(ciudades.contains("CDMX"));   // true

// Eliminar
ciudades.remove("CDMX");

// Tamaño
System.out.println(ciudades.size());  // 2

// Recorrer (orden NO garantizado)
for (String ciudad : ciudades) {
    System.out.println(ciudad);
}
```

---

## Operaciones de conjuntos con HashSet

```java
HashSet<Integer> setA = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
HashSet<Integer> setB = new HashSet<>(Arrays.asList(3, 4, 5, 6, 7));

// Unión (A ∪ B)
HashSet<Integer> union = new HashSet<>(setA);
union.addAll(setB);
// [1, 2, 3, 4, 5, 6, 7]

// Intersección (A ∩ B)
HashSet<Integer> interseccion = new HashSet<>(setA);
interseccion.retainAll(setB);
// [3, 4, 5]

// Diferencia (A - B)
HashSet<Integer> diferencia = new HashSet<>(setA);
diferencia.removeAll(setB);
// [1, 2]
```

---

## Ejercicios resueltos — HashSet

### Ejercicio 1: Eliminar duplicados (versión óptima)

```java
// Con HashSet: O(n) en lugar de O(n²)
public static ArrayList<Integer> eliminarDuplicadosOptimo(ArrayList<Integer> lista) {
    HashSet<Integer> vistos = new HashSet<>();
    ArrayList<Integer> resultado = new ArrayList<>();
    for (int n : lista) {
        if (vistos.add(n)) {        // add() retorna false si ya existía
            resultado.add(n);
        }
    }
    return resultado;
}
```

---

### Ejercicio 2: Verificar si dos listas tienen elementos en común

```java
public static boolean tienenComunes(ArrayList<Integer> a, ArrayList<Integer> b) {
    HashSet<Integer> setA = new HashSet<>(a);
    for (int n : b) {
        if (setA.contains(n)) return true;
    }
    return false;
}
```

---

### Ejercicio 3: Encontrar el primer elemento repetido

```java
public static int primerRepetido(int[] arr) {
    HashSet<Integer> vistos = new HashSet<>();
    for (int n : arr) {
        if (!vistos.add(n)) return n;   // add() retorna false si ya existía
    }
    return -1;  // sin repetidos
}

// primerRepetido(new int[]{3, 1, 4, 2, 1, 5})  →  1
```

---

## SQL del Martes — LEFT JOIN y RIGHT JOIN

### LEFT JOIN

Retorna **todos los registros de la tabla izquierda** y los que coincidan de la derecha. Donde no hay coincidencia, los campos de la derecha son `NULL`.

```sql
-- Todos los empleados, tengan o no departamento
SELECT
    e.nombre        AS empleado,
    d.nombre_dept   AS departamento
FROM empleados e
LEFT JOIN departamentos d ON e.departamento_id = d.id;

-- Los empleados sin departamento aparecen con NULL en 'departamento'
```

```sql
-- Caso de uso clásico: encontrar registros sin pareja
SELECT e.nombre
FROM empleados e
LEFT JOIN departamentos d ON e.departamento_id = d.id
WHERE d.id IS NULL;
-- Empleados que NO tienen departamento asignado
```

---

### RIGHT JOIN

Retorna **todos los registros de la tabla derecha** y los que coincidan de la izquierda. Es el espejo del LEFT JOIN.

```sql
-- Todos los departamentos, tengan o no empleados
SELECT
    e.nombre        AS empleado,
    d.nombre_dept   AS departamento
FROM empleados e
RIGHT JOIN departamentos d ON e.departamento_id = d.id;

-- Departamentos sin empleados aparecen con NULL en 'empleado'
```

---

### Comparativa de los tres JOINs

| JOIN | ¿Qué retorna? | Caso de uso típico |
|---|---|---|
| `INNER JOIN` | Solo filas con coincidencia en ambas tablas | Datos completos y relacionados |
| `LEFT JOIN` | Todos de la izquierda + coincidencias de la derecha | Encontrar registros huérfanos |
| `RIGHT JOIN` | Todos de la derecha + coincidencias de la izquierda | Igual que LEFT pero invirtiendo tablas |

> **Tip de entrevista:** `RIGHT JOIN` puede reescribirse siempre como `LEFT JOIN` invirtiendo el orden de las tablas. La mayoría de los equipos prefieren estandarizarse en LEFT JOIN por legibilidad.

---

# MIÉRCOLES — HashMap + Psicométricos

## ¿Qué es un HashMap?

`HashMap` almacena pares **clave → valor**. Cada clave es única. Permite buscar, insertar y eliminar en **O(1)** promedio. Es la estructura más usada para conteo y mapeo.

```java
import java.util.HashMap;

HashMap<String, Integer> edades = new HashMap<>();
```

> **¿Cuándo usar HashMap?**  
> Cuando necesitas asociar información: nombre→edad, producto→precio, palabra→frecuencia.

---

## Operaciones fundamentales

```java
HashMap<String, Integer> edades = new HashMap<>();

// Agregar / actualizar
edades.put("Ana", 28);
edades.put("Luis", 34);
edades.put("Ana", 29);      // actualiza, no duplica

// Obtener valor
System.out.println(edades.get("Luis"));          // 34
System.out.println(edades.get("NoExiste"));      // null

// getOrDefault — evita null
System.out.println(edades.getOrDefault("X", 0)); // 0

// Verificar existencia
System.out.println(edades.containsKey("Ana"));   // true
System.out.println(edades.containsValue(34));    // true

// Eliminar
edades.remove("Luis");

// Recorrer todas las entradas
for (Map.Entry<String, Integer> entry : edades.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}

// Solo claves / solo valores
for (String clave : edades.keySet()) { ... }
for (int valor : edades.values()) { ... }
```

---

## Ejercicios resueltos — HashMap

### Ejercicio 1: Mapa de frecuencias de caracteres

```java
public static HashMap<Character, Integer> frecuenciaChars(String s) {
    HashMap<Character, Integer> mapa = new HashMap<>();
    for (char c : s.toCharArray()) {
        mapa.put(c, mapa.getOrDefault(c, 0) + 1);
    }
    return mapa;
}

// frecuenciaChars("programacion")
// {p=1, r=2, o=2, g=1, a=2, m=1, c=1, i=1, n=1}
```

---

### Ejercicio 2: Contar palabras en una oración

```java
public static HashMap<String, Integer> contarPalabras(String oracion) {
    HashMap<String, Integer> mapa = new HashMap<>();
    String[] palabras = oracion.toLowerCase().split("\\s+");
    for (String p : palabras) {
        mapa.put(p, mapa.getOrDefault(p, 0) + 1);
    }
    return mapa;
}

// contarPalabras("el gato y el perro")
// {el=2, gato=1, y=1, perro=1}
```

---

### Ejercicio 3: Verificar si dos Strings son anagramas

```java
// Dos palabras son anagramas si tienen los mismos caracteres con la misma frecuencia
public static boolean sonAnagramas(String a, String b) {
    if (a.length() != b.length()) return false;

    HashMap<Character, Integer> mapa = new HashMap<>();

    for (char c : a.toCharArray())
        mapa.put(c, mapa.getOrDefault(c, 0) + 1);

    for (char c : b.toCharArray()) {
        mapa.put(c, mapa.getOrDefault(c, 0) - 1);
        if (mapa.get(c) < 0) return false;
    }
    return true;
}

// sonAnagramas("listen", "silent")  →  true
// sonAnagramas("hello", "world")    →  false
```

---

### Ejercicio 4: Agrupar elementos por categoría

```java
// Agrupar strings por su primera letra
public static HashMap<Character, ArrayList<String>> agruparPorLetra(String[] palabras) {
    HashMap<Character, ArrayList<String>> mapa = new HashMap<>();
    for (String p : palabras) {
        char primera = p.charAt(0);
        mapa.putIfAbsent(primera, new ArrayList<>());
        mapa.get(primera).add(p);
    }
    return mapa;
}

// agruparPorLetra(new String[]{"Ana","Arturo","Bruno","Beatriz"})
// {A=[Ana, Arturo], B=[Bruno, Beatriz]}
```

---

## Psicométricos — 30 minutos

### Tipos y estrategias

#### Series numéricas
Calcula las diferencias entre términos consecutivos para encontrar el patrón.

```
Serie:  2,  4,  8,  16,  32, ___
        ×2  ×2  ×2   ×2       → 64

Serie:  3,  7,  12,  18,  25, ___
        +4  +5  +6   +7       → 33
```

#### Razonamiento lógico
Lee **todas** las premisas antes de responder. Las respuestas trampa cambian un solo detalle.

```
Premisas:
  • Todos los desarrolladores conocen Java.
  • Ana es desarrolladora.
Conclusión válida: Ana conoce Java. ✓
Conclusión inválida: Todos los que conocen Java son desarrolladores. ✗
```

#### Atención a detalle
Compara columna por columna, no renglón completo. El cerebro tiende a "adivinar" — frena ese impulso.

#### Operaciones rápidas — practica esto:

| Operación | Técnica rápida |
|---|---|
| `× 11` | Suma los dos dígitos y ponlos en medio: `35 × 11 = 3(3+5)5 = 385` |
| `× 5` | Multiplica por 10 y divide entre 2: `48 × 5 = 480/2 = 240` |
| `% de N` | Mueve el decimal: `15% de 80 = 10% (8) + 5% (4) = 12` |
| Raíz cuadrada | Memoriza del 1 al 15 |

---

# JUEVES — Ejercicios integrados + JOINs combinados

## Comparativa final de las tres Collections

| | `ArrayList` | `HashSet` | `HashMap` |
|---|---|---|---|
| **Duplicados** | ✅ Sí | ❌ No | ❌ (claves únicas) |
| **Orden** | ✅ Inserción | ❌ No garantizado | ❌ No garantizado |
| **Acceso** | Por índice O(1) | Solo contains O(1) | Por clave O(1) |
| **Uso típico** | Lista ordenada | Eliminar duplicados | Conteo / mapeo |

---

## Ejercicios integrados

### Ejercicio 1: Encontrar el elemento que aparece una sola vez

```java
// En un array donde todos los elementos se repiten excepto uno
public static int elementoUnico(int[] arr) {
    HashMap<Integer, Integer> freq = new HashMap<>();
    for (int n : arr)
        freq.put(n, freq.getOrDefault(n, 0) + 1);

    for (Map.Entry<Integer, Integer> e : freq.entrySet())
        if (e.getValue() == 1) return e.getKey();

    return -1;
}

// elementoUnico(new int[]{4, 3, 2, 4, 1, 3, 2})  →  1
```

---

### Ejercicio 2: Top 3 palabras más frecuentes

```java
public static List<String> top3Palabras(String texto) {
    HashMap<String, Integer> freq = new HashMap<>();
    for (String p : texto.toLowerCase().split("\\s+"))
        freq.put(p, freq.getOrDefault(p, 0) + 1);

    return freq.entrySet().stream()
        .sorted((a, b) -> b.getValue() - a.getValue())
        .limit(3)
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());
}
```

---

### Ejercicio 3: Dos sumas (Two Sum — clásico de entrevistas)

```java
// Dado un array y un objetivo, encontrar los dos índices que suman el objetivo
public static int[] dosSum(int[] nums, int objetivo) {
    HashMap<Integer, Integer> mapa = new HashMap<>();  // valor → índice
    for (int i = 0; i < nums.length; i++) {
        int complemento = objetivo - nums[i];
        if (mapa.containsKey(complemento)) {
            return new int[]{mapa.get(complemento), i};
        }
        mapa.put(nums[i], i);
    }
    return new int[]{};
}

// dosSum(new int[]{2, 7, 11, 15}, 9)  →  [0, 1]
// Porque nums[0] + nums[1] = 2 + 7 = 9
```

---

## SQL del Jueves — JOINs combinados

```sql
-- Tres tablas: empleados, departamentos, proyectos
-- empleados(id, nombre, dept_id)
-- departamentos(id, nombre_dept, ciudad)
-- proyectos(id, nombre_proy, dept_id)

-- Empleados con su departamento y proyectos activos
SELECT
    e.nombre           AS empleado,
    d.nombre_dept      AS departamento,
    d.ciudad,
    p.nombre_proy      AS proyecto
FROM empleados e
INNER JOIN departamentos d ON e.dept_id = d.id
LEFT JOIN proyectos p ON d.id = p.dept_id
ORDER BY d.nombre_dept, e.nombre;
```

```sql
-- Departamentos sin proyectos asignados
SELECT d.nombre_dept
FROM departamentos d
LEFT JOIN proyectos p ON d.id = p.dept_id
WHERE p.id IS NULL;
```

---

# VIERNES — Simulación (Tiempo Limitado)

> Regla: no consultes apuntes los primeros 15 minutos de cada problema. Cronómetro encendido.

## 3 Ejercicios Java

### Problema 1: Agrupar números pares e impares

```java
// Entrada: [1, 2, 3, 4, 5, 6]
// Salida: {par=[2,4,6], impar=[1,3,5]}

public static HashMap<String, ArrayList<Integer>> agruparParidad(int[] nums) {
    HashMap<String, ArrayList<Integer>> mapa = new HashMap<>();
    mapa.put("par", new ArrayList<>());
    mapa.put("impar", new ArrayList<>());
    for (int n : nums)
        mapa.get(n % 2 == 0 ? "par" : "impar").add(n);
    return mapa;
}
```

---

### Problema 2: Intersección de dos arrays

```java
public static ArrayList<Integer> interseccion(int[] a, int[] b) {
    HashSet<Integer> setA = new HashSet<>();
    for (int n : a) setA.add(n);

    ArrayList<Integer> resultado = new ArrayList<>();
    HashSet<Integer> vistos = new HashSet<>();
    for (int n : b) {
        if (setA.contains(n) && vistos.add(n))
            resultado.add(n);
    }
    return resultado;
}

// interseccion([1,2,3,4], [3,4,5,6])  →  [3, 4]
```

---

### Problema 3: Verificar si una lista es subconjunto de otra

```java
public static boolean esSubconjunto(ArrayList<Integer> sub, ArrayList<Integer> conjunto) {
    HashSet<Integer> set = new HashSet<>(conjunto);
    for (int n : sub)
        if (!set.contains(n)) return false;
    return true;
}

// esSubconjunto([1,3], [1,2,3,4])  →  true
// esSubconjunto([1,5], [1,2,3,4])  →  false
```

---

## 3 Consultas SQL

Tablas: `clientes(id, nombre, ciudad)`, `pedidos(id, cliente_id, producto, monto, fecha)`

### Consulta 1: Clientes con al menos un pedido

```sql
SELECT DISTINCT c.nombre, c.ciudad
FROM clientes c
INNER JOIN pedidos p ON c.id = p.cliente_id
ORDER BY c.nombre;
```

### Consulta 2: Clientes que NUNCA han hecho un pedido

```sql
SELECT c.nombre, c.ciudad
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
WHERE p.id IS NULL;
```

### Consulta 3: Total gastado por cliente, solo los que superan $5,000

```sql
SELECT
    c.nombre,
    SUM(p.monto)  AS total_gastado
FROM clientes c
INNER JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nombre
HAVING SUM(p.monto) > 5000
ORDER BY total_gastado DESC;
```

---

# SÁBADO — Proyecto Mini: Agenda de Contactos

## Requisitos

- Menú en consola con Scanner.
- Contactos almacenados en `HashMap<String, String>` (nombre → teléfono).
- Operaciones: agregar, buscar, listar todos, eliminar.
- Validar que no se agreguen contactos con nombre duplicado.
- Extensión opcional: agregar categoría y agrupar por ella con `HashMap<String, ArrayList<String>>`.

## Código base

```java
import java.util.*;

public class Agenda {

    static HashMap<String, String> contactos = new HashMap<>();
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        int op;
        do {
            mostrarMenu();
            op = Integer.parseInt(sc.nextLine());
            switch (op) {
                case 1 -> agregar();
                case 2 -> buscar();
                case 3 -> listarTodos();
                case 4 -> eliminar();
                case 0 -> System.out.println("Hasta luego.");
                default -> System.out.println("Opción inválida.");
            }
        } while (op != 0);
    }

    static void mostrarMenu() {
        System.out.println("\n=== AGENDA ===");
        System.out.println("1. Agregar contacto");
        System.out.println("2. Buscar por nombre");
        System.out.println("3. Listar todos");
        System.out.println("4. Eliminar contacto");
        System.out.println("0. Salir");
        System.out.print("Opción: ");
    }

    static void agregar() {
        System.out.print("Nombre: ");
        String nombre = sc.nextLine().trim();
        if (contactos.containsKey(nombre)) {
            System.out.println("Ya existe ese contacto.");
            return;
        }
        System.out.print("Teléfono: ");
        String tel = sc.nextLine().trim();
        contactos.put(nombre, tel);
        System.out.println("Contacto agregado.");
    }

    static void buscar() {
        System.out.print("Nombre a buscar: ");
        String nombre = sc.nextLine().trim();
        String tel = contactos.getOrDefault(nombre, null);
        if (tel != null) System.out.println(nombre + ": " + tel);
        else System.out.println("Contacto no encontrado.");
    }

    static void listarTodos() {
        if (contactos.isEmpty()) {
            System.out.println("Agenda vacía.");
            return;
        }
        // Ordenar alfabéticamente por nombre
        new TreeMap<>(contactos)
            .forEach((n, t) -> System.out.println(n + " → " + t));
    }

    static void eliminar() {
        System.out.print("Nombre a eliminar: ");
        String nombre = sc.nextLine().trim();
        boolean eliminado = contactos.remove(nombre) != null;
        System.out.println(eliminado ? "Eliminado." : "No encontrado.");
    }
}
```

### Extensión sugerida — Agrupar por categoría

```java
// HashMap dentro de HashMap para categorías
HashMap<String, ArrayList<String>> porCategoria = new HashMap<>();

// Agregar un contacto a una categoría
String cat = "Trabajo";
porCategoria.putIfAbsent(cat, new ArrayList<>());
porCategoria.get(cat).add("Ana — 8110001234");

// Listar por categoría
porCategoria.forEach((categoria, lista) -> {
    System.out.println("== " + categoria + " ==");
    lista.forEach(c -> System.out.println("  " + c));
});
```

---

# DOMINGO — Repaso Completo sin Ayuda

> El esfuerzo de recordar SIN ver el código es lo que crea memoria duradera. Si te trabas, anota exactamente dónde y vuelve a resolverlo.

## Lista de verificación — Java

- [ ] Puedo crear un `ArrayList` y hacer CRUD completo sin ver apuntes.
- [ ] Puedo explicar la diferencia entre `ArrayList`, `HashSet` y `HashMap`.
- [ ] Puedo resolver el problema de frecuencias con `HashMap` en menos de 8 minutos.
- [ ] Puedo eliminar duplicados de una lista usando `HashSet` (versión O(n)).
- [ ] Puedo resolver Two Sum con `HashMap` en menos de 10 minutos.
- [ ] La agenda de contactos corre sin errores.

## Lista de verificación — SQL

- [ ] Puedo escribir un `INNER JOIN` correcto entre dos tablas sin ver apuntes.
- [ ] Sé cuándo usar `LEFT JOIN` vs `INNER JOIN` y puedo explicarlo.
- [ ] Puedo encontrar registros sin pareja con `LEFT JOIN ... WHERE x IS NULL`.
- [ ] Puedo combinar `JOIN` con `GROUP BY`, `HAVING` y `ORDER BY`.

## Ejercicios propuestos para el domingo

### Java

1. Dado un String, devuelve el carácter que más se repite.
2. Dada una lista de enteros, devuelve `true` si contiene duplicados.
3. Dado un array de Strings, agrupa las palabras que son anagramas entre sí.
4. Implementa una función que dado un HashMap de notas `{alumno → calificación}`, retorne los alumnos con calificación mayor al promedio.

### SQL

Tablas: `productos(id, nombre, categoria, precio)`, `ventas(id, producto_id, cantidad, fecha)`

1. Lista de productos que nunca han sido vendidos.
2. Categoría con mayor ingreso total (precio × cantidad).
3. Top 3 productos más vendidos en el último mes.
4. Promedio de precio por categoría, solo categorías con más de 5 productos.

---

## Métricas de la semana 2

| Métrica | Meta | Tu resultado |
|---|---|---|
| Ejercicios Java resueltos | 15 o más | |
| Consultas SQL resueltas | 10 o más | |
| Psicométricos realizados | 1 sesión completa (30 min) | |
| Horas reales cumplidas | 14+ hrs L–V + 6 fin de semana | |
| Errores cometidos y aprendidos | Anotar al menos 3 | |
| Proyecto Agenda: ¿corre sin errores? | Sí / No | |

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

> **La semana que viene:** POO · Streams básicos · GROUP BY · HAVING  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

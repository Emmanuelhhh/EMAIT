Tema Central:
Arrays + Strings + SQL Básico
Duración: 1 semana   |   Fase 1 – Fundamentos Sólidos




PROGRAMA INTENSIVO
Java Backend Developer
SEMANA 1 — Guía de Estudio Completa
Arrays · Strings · Loops · Métodos · SQL Básico


 
Estructura de la Semana
Esta guía cubre los 7 días de la Semana 1 con teoría detallada, ejemplos de código, ejercicios resueltos y ejercicios de práctica propios. Cada sección incluye el objetivo del día y las métricas que debes cumplir.

Día	Tema Java	Tema SQL / Extra
Lunes	Arrays: recorrer, máximo, mínimo, sumar	SELECT, WHERE, ORDER BY
Martes	Strings: reverse, palíndromos, contar chars	LIKE, IN, BETWEEN
Miércoles	Loops: for, while, nested loops, patrones	Psicométricos — 30 min
Jueves	Métodos: parámetros, retorno, modularización	COUNT, AVG, SUM, MIN, MAX
Viernes	Simulación: 3 ejercicios Java + 3 SQL (tiempo limitado)	Revisión y corrección propia
Sábado	Proyecto mini: menú en consola + CRUD en memoria	—
Domingo	Repaso completo — rehacer ejercicios difíciles SIN ayuda	—

 
LUNES — Arrays
Objetivo del día: dominar la estructura de datos más fundamental en Java. Los arrays son la base de casi cualquier algoritmo técnico que te pedirán en entrevistas.

1. ¿Qué es un Array?
Un array (arreglo) es una estructura de datos que almacena una colección de elementos del mismo tipo en posiciones de memoria contiguas. Cada elemento tiene un índice numérico que inicia en 0.

⚠️  Error frecuente en entrevistas
Regla de oro: si tienes 5 elementos, los índices van de 0 a 4. Intentar acceder al índice 5 lanza una ArrayIndexOutOfBoundsException, error muy común en entrevistas.

Declaración e inicialización
// Forma 1: declarar y luego asignar
int[] numeros = new int[5];
numeros[0] = 10;
numeros[1] = 20;

// Forma 2: declarar e inicializar al mismo tiempo
int[] numeros = {10, 20, 30, 40, 50};

// Forma 3: usando new con valores
int[] numeros = new int[]{10, 20, 30, 40, 50};

// Arrays de otros tipos
String[] nombres = {"Ana", "Luis", "María"};
double[] precios = {9.99, 14.50, 7.25};

Recorrer un array
int[] nums = {5, 3, 8, 1, 9, 2};

// Forma 1: for clásico (acceso al índice)
for (int i = 0; i < nums.length; i++) {
    System.out.println("Índice " + i + ": " + nums[i]);
}

// Forma 2: for-each (más legible, sin índice)
for (int n : nums) {
    System.out.println(n);
}

Buscar el máximo y el mínimo
public static int maximo(int[] arr) {
    int max = arr[0];          // Asumimos que el primero es el mayor
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];      // Actualizamos si encontramos uno mayor
        }
    }
    return max;
}

public static int minimo(int[] arr) {
    int min = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    return min;
}

// Uso:
int[] nums = {5, 3, 8, 1, 9, 2};
System.out.println("Máximo: " + maximo(nums));  // 9
System.out.println("Mínimo: " + minimo(nums));  // 1

Sumar elementos de un array
public static int sumar(int[] arr) {
    int suma = 0;
    for (int n : arr) {
        suma += n;
    }
    return suma;
}

public static double promedio(int[] arr) {
    return (double) sumar(arr) / arr.length;
}

int[] nums = {5, 3, 8, 1, 9, 2};
System.out.println("Suma: " + sumar(nums));        // 28
System.out.println("Promedio: " + promedio(nums));  // 4.666...

Ejercicios Resueltos — Arrays
Ejercicio 1: Encontrar el número mayor
Dado un array de enteros, devuelve el valor más grande.
public class EjArrays {
    public static int encontrarMayor(int[] arr) {
        if (arr == null || arr.length == 0) {
            throw new IllegalArgumentException("Array vacío");
        }
        int mayor = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > mayor) mayor = arr[i];
        }
        return mayor;
    }

    public static void main(String[] args) {
        int[] prueba = {4, 7, 2, 9, 1, 5};
        System.out.println(encontrarMayor(prueba)); // 9
    }
}

Ejercicio 2: Invertir un array
Dado un array, devuelve o imprime sus elementos en orden inverso sin usar colecciones auxiliares grandes.
public static int[] invertir(int[] arr) {
    int izq = 0;
    int der = arr.length - 1;
    while (izq < der) {
        // Intercambiamos los extremos
        int temp = arr[izq];
        arr[izq] = arr[der];
        arr[der] = temp;
        izq++;
        der--;
    }
    return arr;
}

// Prueba:
int[] datos = {1, 2, 3, 4, 5};
int[] resultado = invertir(datos);
// resultado = {5, 4, 3, 2, 1}

Ejercicio 3: Promedio de array
public static double calcularPromedio(int[] arr) {
    if (arr.length == 0) return 0;
    int suma = 0;
    for (int n : arr) suma += n;
    return (double) suma / arr.length;  // (double) evita división entera
}

SQL del Lunes — SELECT, WHERE, ORDER BY
Estos tres comandos forman la base de cualquier consulta. El 80% de las preguntas SQL en entrevistas se resuelven dominándolos bien.

SELECT — elegir columnas
-- Traer todas las columnas
SELECT * FROM empleados;

-- Traer columnas específicas
SELECT nombre, salario FROM empleados;

-- Con alias para renombrar columnas en el resultado
SELECT nombre AS 'Nombre Completo', salario AS 'Sueldo' FROM empleados;

WHERE — filtrar filas
-- Empleados con salario mayor a 10000
SELECT * FROM empleados WHERE salario > 10000;

-- Empleados del departamento 3
SELECT nombre, puesto FROM empleados WHERE departamento_id = 3;

-- Condiciones combinadas
SELECT * FROM empleados WHERE salario > 8000 AND activo = 1;
SELECT * FROM empleados WHERE puesto = 'Gerente' OR puesto = 'Director';

ORDER BY — ordenar resultados
-- Ordenar de menor a mayor (ASC por defecto)
SELECT nombre, salario FROM empleados ORDER BY salario ASC;

-- Ordenar de mayor a menor
SELECT nombre, salario FROM empleados ORDER BY salario DESC;

-- Ordenar por múltiples columnas
SELECT * FROM empleados ORDER BY departamento_id ASC, salario DESC;

🧠  Concepto clave para entrevistas
Orden lógico de ejecución SQL: FROM → WHERE → SELECT → ORDER BY. Aunque escribes SELECT primero, el motor ejecuta FROM primero. Esto explica por qué no puedes usar alias de SELECT dentro de WHERE.

 
MARTES — Strings
Los Strings son el tipo de dato más manipulado en aplicaciones reales. Las preguntas sobre Strings son también las más frecuentes en pruebas de lógica y en entrevistas de nivel junior/mid.

1. La clase String en Java
En Java, String es una clase, no un tipo primitivo. Esto significa que tiene métodos que puedes llamar directamente sobre el objeto.

⚠️  Concepto clave: inmutabilidad
Los Strings en Java son inmutables (immutable). Cada vez que 'modificas' un String, en realidad se crea uno nuevo en memoria. Por eso, para muchas concatenaciones es mejor usar StringBuilder.

Métodos esenciales de String
Método	¿Qué hace?	Ejemplo
length()	Retorna la longitud	"Java".length() → 4
charAt(i)	Char en posición i	"Java".charAt(0) → J
substring(a,b)	Subcadena de a a b-1	"Backend".substring(0,4) → Back
toLowerCase()	Todo en minúsculas	"JAVA".toLowerCase() → java
toUpperCase()	Todo en mayúsculas	"java".toUpperCase() → JAVA
trim()	Elimina espacios extremos	"  hola  ".trim() → hola
contains(str)	Verifica si contiene	"Java".contains("av") → true
replace(a,b)	Reemplaza ocurrencias	"Java".replace("a","o") → Jovo
split(regex)	Divide en array	"a,b,c".split(",") → ["a","b","c"]
equals(str)	Compara contenido	"Java".equals("Java") → true

Ejercicios Resueltos — Strings
Ejercicio 1: Invertir un String
public static String invertirString(String s) {
    StringBuilder sb = new StringBuilder();
    for (int i = s.length() - 1; i >= 0; i--) {
        sb.append(s.charAt(i));
    }
    return sb.toString();
}

// Alternativa con StringBuilder built-in:
public static String invertirString2(String s) {
    return new StringBuilder(s).reverse().toString();
}

invertirString("hola")  // → "aloh"

Ejercicio 2: Verificar palíndromo
Un palíndromo es una palabra que se lee igual de adelante hacia atrás. Ejemplos: "radar", "ala", "reconocer".
public static boolean esPalindromo(String s) {
    // Normalizar: minúsculas, sin espacios
    String limpio = s.toLowerCase().trim();
    int izq = 0;
    int der = limpio.length() - 1;
    while (izq < der) {
        if (limpio.charAt(izq) != limpio.charAt(der)) {
            return false;
        }
        izq++;
        der--;
    }
    return true;
}

esPalindromo("radar")    // → true
esPalindromo("Java")     // → false
esPalindromo("Reconocer") // → true

Ejercicio 3: Contar caracteres / frecuencia
// Contar cuántas veces aparece un carácter
public static int contarCaracter(String s, char c) {
    int count = 0;
    for (int i = 0; i < s.length(); i++) {
        if (s.charAt(i) == c) count++;
    }
    return count;
}

contarCaracter("programacion", 'a')  // → 2

// Contar todos los caracteres (mapa de frecuencias)
public static Map<Character, Integer> frecuencias(String s) {
    Map<Character, Integer> mapa = new HashMap<>();
    for (char c : s.toCharArray()) {
        mapa.put(c, mapa.getOrDefault(c, 0) + 1);
    }
    return mapa;
}

SQL del Martes — LIKE, IN, BETWEEN
LIKE — búsqueda por patrón
-- % representa cero o más caracteres
SELECT * FROM empleados WHERE nombre LIKE 'Ana%';     -- empieza con Ana
SELECT * FROM empleados WHERE nombre LIKE '%López';   -- termina con López
SELECT * FROM empleados WHERE email LIKE '%@gmail%';  -- contiene @gmail

-- _ representa exactamente UN carácter
SELECT * FROM productos WHERE codigo LIKE 'A_01';     -- A, un char, 01

IN — coincidencia con lista
-- Empleados de departamentos 1, 3 o 5
SELECT * FROM empleados WHERE departamento_id IN (1, 3, 5);

-- Equivale a:
SELECT * FROM empleados
WHERE departamento_id = 1 OR departamento_id = 3 OR departamento_id = 5;

-- NOT IN para excluir
SELECT * FROM empleados WHERE puesto NOT IN ('Pasante', 'Temporal');

BETWEEN — rango de valores
-- Salarios entre 8000 y 15000 (inclusive en ambos extremos)
SELECT nombre, salario FROM empleados
WHERE salario BETWEEN 8000 AND 15000;

-- Fechas en un rango
SELECT * FROM ventas
WHERE fecha_venta BETWEEN '2024-01-01' AND '2024-12-31';

-- NOT BETWEEN para excluir el rango
SELECT * FROM productos WHERE precio NOT BETWEEN 100 AND 500;

 
MIÉRCOLES — Loops y Psicométricos
Los loops (ciclos) son el motor de casi todo algoritmo. Dominarlos con rapidez y exactitud es lo que separa a un programador promedio de uno sólido en entrevistas.

1. El ciclo for
// Estructura: for(inicialización; condición; incremento)
for (int i = 0; i < 5; i++) {
    System.out.println(i);  // 0, 1, 2, 3, 4
}

// Iterar hacia atrás
for (int i = 5; i >= 1; i--) {
    System.out.print(i + " ");  // 5 4 3 2 1
}

// Incremento de 2 en 2
for (int i = 0; i <= 10; i += 2) {
    System.out.print(i + " ");  // 0 2 4 6 8 10
}

2. El ciclo while
// Mientras la condición sea verdadera
int n = 1;
while (n <= 5) {
    System.out.println(n);
    n++;
}

// do-while: ejecuta al menos una vez
int x = 0;
do {
    System.out.println("x = " + x);
    x++;
} while (x < 3);

3. Nested Loops (ciclos anidados)
Un ciclo dentro de otro. Son fundamentales para patrones, matrices y muchos algoritmos de entrevistas.
// Tabla de multiplicar del 1 al 3
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        System.out.print(i * j + "\t");
    }
    System.out.println();
}
// Salida:
// 1   2   3
// 2   4   6
// 3   6   9

Ejercicios Resueltos — Patrones con Loops
Pirámide de asteriscos
// Pirámide de n filas
public static void piramide(int n) {
    for (int i = 1; i <= n; i++) {
        // Espacios iniciales
        for (int s = i; s < n; s++) System.out.print(" ");
        // Asteriscos
        for (int a = 1; a <= (2 * i - 1); a++) System.out.print("*");
        System.out.println();
    }
}

// piramide(4):
//    *
//   ***
//  *****
// *******

Tabla de multiplicar
public static void tablaMultiplicar(int n) {
    System.out.println("Tabla del " + n + ":");
    for (int i = 1; i <= 10; i++) {
        System.out.printf("%d x %d = %d%n", n, i, n * i);
    }
}

Sección Psicométrica — 30 minutos
Los psicométricos evalúan velocidad y precisión mental, no conocimiento técnico. La clave es práctica diaria y no perder tiempo en preguntas que no sabes.

Tipo	Descripción	Estrategia
Series numéricas	Encuentra el patrón y el siguiente número	Calcula diferencias entre términos consecutivos
Razonamiento lógico	Verdadero/falso con premisas dadas	Lee todas las premisas antes de elegir
Atención a detalle	Comparar pares de datos, encontrar diferencias	Ve columna por columna, no renglon
Operaciones básicas	Velocidad en suma, resta, multiplicación	Practica mentalmente todos los días

✅  Plan de acción
Durante la semana dedica los 30 minutos del miércoles a resolver series: busca apps de psicométricos (Aptis, TestGorilla, practicas.com). Cronométrate. El objetivo no es acertar todo sino acertar rápido.

 
JUEVES — Métodos y SQL con Funciones de Agregación
Los métodos son la base de la programación modular. En entrevistas te pedirán que escribas métodos claros, con responsabilidad única y nombres descriptivos.

1. ¿Qué es un método?
Un método es un bloque de código reutilizable que realiza una tarea específica. Tiene: un tipo de retorno, un nombre, parámetros (opcional) y un cuerpo.
// Estructura general:
modificadorAcceso tipoRetorno nombreMetodo(Tipo param1, Tipo param2) {
    // cuerpo del método
    return valor;  // si el tipo de retorno no es void
}

// Ejemplo concreto:
public static int sumar(int a, int b) {
    return a + b;
}

// Método void (sin retorno)
public static void imprimirSaludo(String nombre) {
    System.out.println("Hola, " + nombre + "!");
}

2. Parámetros y retorno
// Método con múltiples parámetros
public static double calcularIMC(double peso, double altura) {
    return peso / (altura * altura);
}

// Llamada:
double imc = calcularIMC(70.5, 1.75);
System.out.println("IMC: " + imc);   // 23.02

// Retornar boolean
public static boolean esMayorDeEdad(int edad) {
    return edad >= 18;
}

3. Modularización — Principio de Responsabilidad Única
Cada método debe hacer UNA sola cosa. Si necesitas hacer más, crea otro método y llámalo desde el primero.
// MAL: un solo método que hace todo
public static void procesarVenta(double precio, int cantidad) {
    double subtotal = precio * cantidad;
    double iva = subtotal * 0.16;
    double total = subtotal + iva;
    System.out.println("Subtotal: " + subtotal);
    System.out.println("IVA: " + iva);
    System.out.println("Total: " + total);
}

// BIEN: responsabilidades separadas
public static double calcularSubtotal(double precio, int cantidad) {
    return precio * cantidad;
}

public static double calcularIVA(double subtotal) {
    return subtotal * 0.16;
}

public static void imprimirResumenVenta(double precio, int cantidad) {
    double sub = calcularSubtotal(precio, cantidad);
    double iva = calcularIVA(sub);
    System.out.printf("Subtotal: %.2f%nIVA: %.2f%nTotal: %.2f%n",
                       sub, iva, sub + iva);
}

SQL del Jueves — Funciones de Agregación
Las funciones de agregación calculan un valor a partir de múltiples filas. Son imprescindibles en cualquier entrevista SQL.

Función	¿Qué hace?	Ejemplo
COUNT(*)	Cuenta el total de filas	SELECT COUNT(*) FROM empleados
COUNT(col)	Cuenta filas donde col no es NULL	SELECT COUNT(email) FROM clientes
SUM(col)	Suma los valores de una columna	SELECT SUM(salario) FROM empleados
AVG(col)	Promedio de los valores	SELECT AVG(precio) FROM productos
MIN(col)	El valor mínimo	SELECT MIN(edad) FROM usuarios
MAX(col)	El valor máximo	SELECT MAX(salario) FROM empleados

Ejemplos combinados
-- Resumen estadístico de salarios
SELECT
    COUNT(*)          AS total_empleados,
    SUM(salario)       AS gasto_total,
    AVG(salario)       AS salario_promedio,
    MIN(salario)       AS salario_minimo,
    MAX(salario)       AS salario_maximo
FROM empleados;

-- Agregar WHERE antes del GROUP BY
SELECT COUNT(*) AS empleados_activos
FROM empleados
WHERE activo = 1;

 
VIERNES — Simulación (Tiempo Limitado)
El objetivo del viernes es entrenarte para la presión del tiempo real. Pon un cronómetro. Intenta resolver cada ejercicio en máximo 15 minutos. Si no puedes, pasa al siguiente y regresa.

🎯  Regla de simulación
Regla del viernes: NO consultes apuntes ni Google durante los primeros 15 minutos de cada ejercicio. El cerebro necesita esforzarse solo para aprender a recuperar información bajo presión.

Ejercicios Java — Tiempo Limitado
Problema 1: Verificar si un número es primo
Un número primo solo es divisible entre 1 y él mismo. Escribe un método que reciba un entero y retorne true si es primo.
// SOLUCIÓN (no la leas hasta intentarlo):
public static boolean esPrimo(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

esPrimo(7)   // → true
esPrimo(10)  // → false
esPrimo(97)  // → true

Problema 2: Contar vocales en un String
public static int contarVocales(String s) {
    int count = 0;
    String vocales = "aeiouAEIOU";
    for (char c : s.toCharArray()) {
        if (vocales.indexOf(c) != -1) count++;
    }
    return count;
}

contarVocales("Programacion")  // → 5

Problema 3: FizzBuzz (clásico de entrevistas)
Imprime números del 1 al 100. Para múltiplos de 3 imprime Fizz, de 5 imprime Buzz, de ambos imprime FizzBuzz.
public static void fizzBuzz(int hasta) {
    for (int i = 1; i <= hasta; i++) {
        if (i % 15 == 0) {
            System.out.println("FizzBuzz");
        } else if (i % 3 == 0) {
            System.out.println("Fizz");
        } else if (i % 5 == 0) {
            System.out.println("Buzz");
        } else {
            System.out.println(i);
        }
    }
}

Consultas SQL — Tiempo Limitado
Resuelve las siguientes consultas con la tabla: empleados(id, nombre, puesto, salario, departamento_id, fecha_ingreso)

Consulta 1: Los 5 empleados mejor pagados
SELECT nombre, salario
FROM empleados
ORDER BY salario DESC
LIMIT 5;

Consulta 2: Promedio salarial por departamento
SELECT departamento_id,
       COUNT(*)       AS total,
       AVG(salario)   AS promedio
FROM empleados
GROUP BY departamento_id
ORDER BY promedio DESC;

Consulta 3: Empleados contratados en 2023
SELECT nombre, fecha_ingreso
FROM empleados
WHERE fecha_ingreso BETWEEN '2023-01-01' AND '2023-12-31'
ORDER BY fecha_ingreso ASC;

 
SÁBADO — Proyecto Mini: Menú en Consola + CRUD
Hoy integras todo lo de la semana en un proyecto funcional. No tiene que ser perfecto. Tiene que correr y cubrir los puntos indicados.

Requisitos del proyecto
•	Menú interactivo en consola (Scanner para leer input)
•	Operaciones CRUD: Crear, Leer, Actualizar, Eliminar
•	Datos almacenados en memoria (ArrayList)
•	Al menos una validación de entrada
•	Métodos bien definidos con responsabilidad única

Código base — CRUD de Empleados en memoria
import java.util.ArrayList;
import java.util.Scanner;

public class MenuCRUD {

    // Clase interna para representar un Empleado
    static class Empleado {
        int id;
        String nombre;
        double salario;

        Empleado(int id, String nombre, double salario) {
            this.id = id;
            this.nombre = nombre;
            this.salario = salario;
        }

        public String toString() {
            return String.format("[%d] %s — $%.2f", id, nombre, salario);
        }
    }

    static ArrayList<Empleado> empleados = new ArrayList<>();
    static int contadorId = 1;
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        int opcion;
        do {
            mostrarMenu();
            opcion = Integer.parseInt(sc.nextLine());
            switch (opcion) {
                case 1 -> crearEmpleado();
                case 2 -> listarEmpleados();
                case 3 -> actualizarEmpleado();
                case 4 -> eliminarEmpleado();
                case 0 -> System.out.println("Hasta luego.");
                default -> System.out.println("Opción inválida.");
            }
        } while (opcion != 0);
    }

    static void mostrarMenu() {
        System.out.println("\n=== GESTIÓN DE EMPLEADOS ===");
        System.out.println("1. Agregar empleado");
        System.out.println("2. Listar empleados");
        System.out.println("3. Actualizar salario");
        System.out.println("4. Eliminar empleado");
        System.out.println("0. Salir");
        System.out.print("Opción: ");
    }

    static void crearEmpleado() {
        System.out.print("Nombre: ");
        String nombre = sc.nextLine();
        System.out.print("Salario: ");
        double salario = Double.parseDouble(sc.nextLine());
        empleados.add(new Empleado(contadorId++, nombre, salario));
        System.out.println("Empleado agregado.");
    }

    static void listarEmpleados() {
        if (empleados.isEmpty()) {
            System.out.println("No hay empleados registrados.");
            return;
        }
        empleados.forEach(System.out::println);
    }

    static void actualizarEmpleado() {
        System.out.print("ID a actualizar: ");
        int id = Integer.parseInt(sc.nextLine());
        for (Empleado e : empleados) {
            if (e.id == id) {
                System.out.print("Nuevo salario: ");
                e.salario = Double.parseDouble(sc.nextLine());
                System.out.println("Actualizado.");
                return;
            }
        }
        System.out.println("ID no encontrado.");
    }

    static void eliminarEmpleado() {
        System.out.print("ID a eliminar: ");
        int id = Integer.parseInt(sc.nextLine());
        boolean eliminado = empleados.removeIf(e -> e.id == id);
        System.out.println(eliminado ? "Eliminado." : "No encontrado.");
    }
}

✅  Objetivo y extensiones sugeridas
Objetivo del sábado: que el programa corra sin errores. Después, extiéndelo: agrega búsqueda por nombre, ordena por salario, o agrega un campo de departamento. Cada mejora te da práctica real.

 
DOMINGO — Repaso Completo
El domingo no introduces nada nuevo. Es el día más importante de la semana desde el punto de vista del aprendizaje: la recuperación espaciada consolida lo que aprendiste.

🧠  Principio de recuperación activa
Regla del domingo: resuelve los ejercicios marcados como difíciles SIN ver tus apuntes. Si no puedes, anota exactamente dónde te trabaste y resuélvelo una vez más. El esfuerzo de recordar es lo que crea memoria duradera.

Lista de repaso — qué verificar
1.	Puedo escribir un método que busca el máximo de un array sin ver el código.
2.	Puedo invertir un String de dos formas diferentes.
3.	Puedo verificar si una palabra es palíndromo.
4.	Puedo construir una pirámide de asteriscos con nested loops.
5.	Puedo escribir una consulta SQL con WHERE, ORDER BY y funciones de agregación.
6.	Puedo crear un CRUD básico en consola con ArrayList.

Ejercicios de repaso propuestos
Java
•	Dado un array, devuelve los n elementos más grandes.
•	Dado un String, cuenta cuántas palabras tiene (separadas por espacio).
•	Escribe un método que calcule el factorial de n de forma iterativa.
•	Genera los primeros n números de la sucesión de Fibonacci.

SQL — tabla: ventas(id, cliente_id, producto, monto, fecha)
•	¿Cuántas ventas hubo en total?
•	¿Cuál fue el monto total vendido por producto?
•	¿Cuál fue el cliente que más gastó?
•	Lista las ventas del mes de marzo de 2024, ordenadas por monto descendente.

 
Métricas — Registro Semanal
Al final de la semana completa esta tabla con honestidad. No es para juzgarte: es para que tomes decisiones informadas sobre en qué mejorar.

Métrica	Meta sugerida	Tu resultado
Ejercicios Java resueltos	15 o más	
Consultas SQL resueltas	10 o más	
Psicométricos realizados	1 sesión completa	
Horas reales cumplidas	14+ hrs (L–V) + 6 fin de semana	
Errores cometidos aprendidos	Anota al menos 3	
Proyecto CRUD: ¿corrió sin errores?	Sí / No	

Errores de la semana — anótalos aquí
Escribe con tus palabras qué salió mal y cómo lo resolviste. Esto es lo que más acelera el aprendizaje.

Error 1: 
Error 2: 
Error 3: 
Error 4: 
Error 5: 


La semana que viene: Collections + JOINs + Lógica numérica
"¿Cumplí el bloque hoy? Sí o no." — Esa es la única pregunta.

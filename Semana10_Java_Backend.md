# Semana 10 — Algoritmos · Sorting · Searching · Recursión · Complejidad O(n)

> **Fase 3 — Entrevistas y Consolidación** · Programa Intensivo Java Backend Developer  
> Tema central: **Complejidad · Sorting · Búsqueda Binaria · Recursión · Problemas LeetCode Easy**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Complejidad O(n): notación Big O, análisis de código | Pensar en escala |
| Martes | Sorting: Bubble, Selection, Insertion, Merge Sort | Implementar y comparar |
| Miércoles | Searching: búsqueda lineal y binaria | Patrones de dos punteros |
| Jueves | Recursión: bases, Fibonacci, factorial, backtracking | Pensar recursivamente |
| Viernes | Simulación: 6 problemas cronometrados tipo LeetCode | Prueba técnica real |
| Sábado | Proyecto: implementar una mini librería de algoritmos | Integración total |
| Domingo | Repaso + estrategia para pruebas técnicas | Plan de ataque |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Calcular la complejidad de un algoritmo antes de escribirlo.
- Implementar los algoritmos de sorting más comunes de memoria.
- Resolver búsqueda binaria sin errores de índice.
- Convertir un problema iterativo en recursivo y viceversa.
- Resolver problemas de nivel LeetCode Easy en menos de 15 minutos.
- Comunicar tu proceso de pensamiento mientras resuelves.

---

# LUNES — Complejidad O(n): Notación Big O

## ¿Qué es la notación Big O?

Big O describe cómo **crece el tiempo de ejecución o el uso de memoria** de un algoritmo en función del tamaño de la entrada `n`. No mide el tiempo exacto — mide la tendencia de crecimiento.

```
¿Por qué importa?
  - Con n=10:    O(n²) = 100 ops,    O(n log n) = 33 ops
  - Con n=1000:  O(n²) = 1,000,000,  O(n log n) = 10,000
  - Con n=1M:    O(n²) = 1 billón,   O(n log n) = 20 millones

La diferencia entre O(n²) y O(n log n) puede ser
la diferencia entre 1ms y 16 minutos.
```

---

## Complejidades de mejor a peor

| Notación | Nombre | Ejemplo |
|---|---|---|
| O(1) | Constante | Acceso a array por índice, HashMap.get() |
| O(log n) | Logarítmica | Búsqueda binaria |
| O(n) | Lineal | Recorrer un array |
| O(n log n) | Linealítmica | Merge Sort, Arrays.sort() |
| O(n²) | Cuadrática | Bubble Sort, nested loops |
| O(2ⁿ) | Exponencial | Fibonacci recursivo sin memoización |
| O(n!) | Factorial | Permutaciones de n elementos |

```
Visualización para n = 8:

O(1)      = 1
O(log 8)  = 3
O(8)      = 8
O(8 log8) = 24
O(8²)     = 64
O(2⁸)     = 256
O(8!)     = 40,320
```

---

## Reglas para calcular Big O

### Regla 1: elimina constantes

```java
// Este algoritmo hace 3n operaciones
for (int i = 0; i < n; i++) { /* op 1 */ }
for (int i = 0; i < n; i++) { /* op 2 */ }
for (int i = 0; i < n; i++) { /* op 3 */ }
// → O(3n) → O(n)  (las constantes no importan)
```

### Regla 2: conserva el término dominante

```java
// Este algoritmo hace n² + n operaciones
for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) { /* n² ops */ }
}
for (int i = 0; i < n; i++) { /* n ops */ }
// → O(n² + n) → O(n²)  (n² domina a n)
```

### Regla 3: loops anidados = multiplicación

```java
// Un loop dentro de otro → O(n × n) = O(n²)
for (int i = 0; i < n; i++) {          // n veces
    for (int j = 0; j < n; j++) {      // n veces
        System.out.println(i + j);
    }
}

// Loops independientes → O(n + m) o O(2n) = O(n)
for (int i = 0; i < n; i++) { }        // n veces
for (int i = 0; i < n; i++) { }        // n veces
// → O(n)
```

### Regla 4: recursión

```java
// Cada llamada recursiva divide el problema a la mitad → O(log n)
int busquedaBinaria(int[] arr, int target, int izq, int der) {
    if (izq > der) return -1;
    int mid = (izq + der) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return busquedaBinaria(arr, target, mid+1, der);
    return busquedaBinaria(arr, target, izq, mid-1);
}

// Cada llamada recursiva genera 2 llamadas → O(2ⁿ)
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);  // 2 llamadas por nivel
}
```

---

## Complejidad espacial

```java
// O(1) espacio — solo variables escalares
int suma(int[] arr) {
    int total = 0;
    for (int n : arr) total += n;
    return total;
}

// O(n) espacio — crea una estructura del tamaño de la entrada
int[] copiar(int[] arr) {
    int[] copia = new int[arr.length];   // n elementos
    for (int i = 0; i < arr.length; i++) copia[i] = arr[i];
    return copia;
}

// O(n) espacio — pila de recursión de profundidad n
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n-1);           // n llamadas en la pila
}
```

---

## Analizar complejidad de código real

```java
// ¿Cuál es la complejidad de este método?
public boolean contieneDuplicados(int[] arr) {
    for (int i = 0; i < arr.length; i++) {         // O(n)
        for (int j = i + 1; j < arr.length; j++) {  // O(n)
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
// → O(n²) tiempo, O(1) espacio

// Versión optimizada:
public boolean contieneDuplicadosOptimo(int[] arr) {
    Set<Integer> vistos = new HashSet<>();          // O(n) espacio
    for (int n : arr) {                             // O(n) tiempo
        if (!vistos.add(n)) return true;            // add() O(1) amortizado
    }
    return false;
}
// → O(n) tiempo, O(n) espacio
// Intercambiamos espacio por velocidad — tradeoff clásico
```

---

# MARTES — Algoritmos de Sorting

## Por qué aprender sorting si Java ya tiene Arrays.sort()

En entrevistas técnicas te pedirán implementar o modificar algoritmos de ordenamiento para evaluar si entiendes **cómo y por qué** funcionan. `Arrays.sort()` usa Timsort (O(n log n)) internamente — pero necesitas saber qué está pasando debajo.

---

## Bubble Sort — O(n²)

```java
// Idea: en cada pasada, "burbujea" el elemento mayor hacia el final
public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        boolean intercambio = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // intercambiar
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                intercambio = true;
            }
        }
        // Optimización: si no hubo intercambios, ya está ordenado
        if (!intercambio) break;
    }
}

// Tiempo: O(n²) promedio y peor caso, O(n) mejor caso (ya ordenado)
// Espacio: O(1)
// Estable: Sí (no cambia el orden de elementos iguales)
// Úsalo: nunca en producción, solo para entender el concepto
```

---

## Selection Sort — O(n²)

```java
// Idea: en cada pasada, encuentra el mínimo y lo pone en su lugar
public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int idxMin = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[idxMin]) {
                idxMin = j;
            }
        }
        // Intercambiar el mínimo con la posición actual
        int temp = arr[idxMin];
        arr[idxMin] = arr[i];
        arr[i] = temp;
    }
}

// Tiempo: O(n²) siempre
// Espacio: O(1)
// Estable: No
// Ventaja sobre Bubble: hace n-1 intercambios (Bubble puede hacer más)
```

---

## Insertion Sort — O(n²) / O(n)

```java
// Idea: construye el array ordenado de izquierda a derecha,
// insertando cada elemento en su posición correcta
public static void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int clave = arr[i];
        int j = i - 1;
        // Mover elementos mayores que 'clave' una posición a la derecha
        while (j >= 0 && arr[j] > clave) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = clave;
    }
}

// Tiempo: O(n²) peor caso, O(n) mejor caso (casi ordenado)
// Espacio: O(1)
// Estable: Sí
// Úsalo: arrays pequeños (<20 elementos) o casi ordenados
// Java lo usa internamente para sub-arrays pequeños en Timsort
```

---

## Merge Sort — O(n log n)

```java
// Idea: divide el array en mitades, ordena cada mitad,
// luego fusiona las mitades ordenadas (divide y vencerás)
public static void mergeSort(int[] arr, int izq, int der) {
    if (izq >= der) return;   // caso base: un solo elemento

    int mid = izq + (der - izq) / 2;   // evita overflow vs (izq+der)/2

    mergeSort(arr, izq, mid);      // ordenar mitad izquierda
    mergeSort(arr, mid + 1, der);  // ordenar mitad derecha
    merge(arr, izq, mid, der);     // fusionar
}

private static void merge(int[] arr, int izq, int mid, int der) {
    // Crear arrays temporales
    int n1 = mid - izq + 1;
    int n2 = der - mid;
    int[] L = new int[n1];
    int[] R = new int[n2];

    System.arraycopy(arr, izq,     L, 0, n1);
    System.arraycopy(arr, mid + 1, R, 0, n2);

    int i = 0, j = 0, k = izq;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else               arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

// Uso:
int[] arr = {5, 2, 8, 1, 9, 3};
mergeSort(arr, 0, arr.length - 1);
// arr = {1, 2, 3, 5, 8, 9}

// Tiempo: O(n log n) siempre
// Espacio: O(n) — necesita arrays auxiliares
// Estable: Sí
// Úsalo: cuando necesitas estabilidad y rendimiento garantizado
```

---

## Comparativa de algoritmos de sorting

| Algoritmo | Mejor | Promedio | Peor | Espacio | Estable |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| `Arrays.sort()` | O(n) | O(n log n) | O(n log n) | O(n) | ✅ |

---

# MIÉRCOLES — Searching: Lineal y Binaria

## Búsqueda Lineal — O(n)

```java
// Recorre el array elemento por elemento
public static int busquedaLineal(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;   // no encontrado
}

// Con predicado (más flexible)
public static <T> int buscarPor(T[] arr, java.util.function.Predicate<T> condicion) {
    for (int i = 0; i < arr.length; i++) {
        if (condicion.test(arr[i])) return i;
    }
    return -1;
}

// Tiempo: O(n), Espacio: O(1)
// Funciona en arrays desordenados
```

---

## Búsqueda Binaria — O(log n)

```java
// REQUISITO: el array debe estar ORDENADO
// Idea: en cada paso elimina la mitad del espacio de búsqueda

public static int busquedaBinaria(int[] arr, int target) {
    int izq = 0;
    int der = arr.length - 1;

    while (izq <= der) {
        int mid = izq + (der - izq) / 2;   // evita overflow

        if (arr[mid] == target) return mid;
        if (arr[mid] < target)  izq = mid + 1;   // buscar en mitad derecha
        else                    der = mid - 1;   // buscar en mitad izquierda
    }
    return -1;
}

// arr = {1, 3, 5, 7, 9, 11, 13}
// busquedaBinaria(arr, 7)
// izq=0, der=6, mid=3 → arr[3]=7 → encontrado en índice 3

// Tiempo: O(log n), Espacio: O(1)
// Con n=1,000,000: máximo 20 iteraciones
```

---

## Variantes de búsqueda binaria — las más pedidas en entrevistas

```java
// Variante 1: primer elemento mayor o igual (lower bound)
public static int lowerBound(int[] arr, int target) {
    int izq = 0, der = arr.length;
    while (izq < der) {
        int mid = izq + (der - izq) / 2;
        if (arr[mid] < target) izq = mid + 1;
        else                   der = mid;
    }
    return izq;   // índice del primer elemento >= target
}

// Variante 2: último elemento menor o igual (upper bound)
public static int upperBound(int[] arr, int target) {
    int izq = 0, der = arr.length;
    while (izq < der) {
        int mid = izq + (der - izq) / 2;
        if (arr[mid] <= target) izq = mid + 1;
        else                    der = mid;
    }
    return izq - 1;   // índice del último elemento <= target
}

// Variante 3: buscar en array rotado
// arr = {4, 5, 6, 7, 0, 1, 2} (rotado en índice 4)
public static int buscarEnRotado(int[] arr, int target) {
    int izq = 0, der = arr.length - 1;
    while (izq <= der) {
        int mid = izq + (der - izq) / 2;
        if (arr[mid] == target) return mid;

        // Determinar cuál mitad está ordenada
        if (arr[izq] <= arr[mid]) {
            // mitad izquierda ordenada
            if (target >= arr[izq] && target < arr[mid])
                der = mid - 1;
            else
                izq = mid + 1;
        } else {
            // mitad derecha ordenada
            if (target > arr[mid] && target <= arr[der])
                izq = mid + 1;
            else
                der = mid - 1;
        }
    }
    return -1;
}
```

---

## Técnica de dos punteros — O(n)

```java
// Patrón fundamental para arrays: dos punteros que se mueven hacia el centro
// Reemplaza muchos O(n²) por O(n)

// Ejemplo: dos sumas en array ordenado
public static int[] dosSumas(int[] arr, int objetivo) {
    int izq = 0, der = arr.length - 1;
    while (izq < der) {
        int suma = arr[izq] + arr[der];
        if (suma == objetivo) return new int[]{izq, der};
        if (suma < objetivo)  izq++;   // necesitamos más
        else                  der--;   // necesitamos menos
    }
    return new int[]{};
}

// Ejemplo: verificar palíndromo con dos punteros
public static boolean esPalindromo(String s) {
    int izq = 0, der = s.length() - 1;
    while (izq < der) {
        if (s.charAt(izq) != s.charAt(der)) return false;
        izq++;
        der--;
    }
    return true;
}

// Ejemplo: mover ceros al final (sin cambiar orden de no-ceros)
public static void moverCeros(int[] arr) {
    int escritura = 0;
    for (int lectura = 0; lectura < arr.length; lectura++) {
        if (arr[lectura] != 0) {
            arr[escritura++] = arr[lectura];
        }
    }
    while (escritura < arr.length) arr[escritura++] = 0;
}
// {0,1,0,3,12} → {1,3,12,0,0}
```

---

# JUEVES — Recursión

## ¿Qué es la recursión?

Una función es recursiva cuando se llama a sí misma con un problema más pequeño hasta llegar a un **caso base** que no requiere más recursión.

```
Toda función recursiva necesita:
1. Caso base:     cuándo parar (sin esto → StackOverflowError)
2. Caso recursivo: llamarse con un problema reducido
3. Progreso:      cada llamada debe acercarse al caso base
```

---

## Factorial — el ejemplo clásico

```java
// Iterativo
public static long factorialIterativo(int n) {
    long resultado = 1;
    for (int i = 2; i <= n; i++) resultado *= i;
    return resultado;
}

// Recursivo
public static long factorialRecursivo(int n) {
    if (n <= 1) return 1;          // caso base
    return n * factorialRecursivo(n - 1);  // caso recursivo
}

// Traza para n=4:
// factorial(4) = 4 * factorial(3)
//                    = 3 * factorial(2)
//                         = 2 * factorial(1)
//                              = 1  ← caso base
//                         = 2 * 1 = 2
//                    = 3 * 2 = 6
//              = 4 * 6 = 24

// Tiempo: O(n), Espacio: O(n) — pila de n llamadas
```

---

## Fibonacci — con y sin memoización

```java
// Recursivo puro — O(2ⁿ) — LENTO
public static int fibLento(int n) {
    if (n <= 1) return n;
    return fibLento(n - 1) + fibLento(n - 2);
}
// fib(50) tarda varios segundos

// Con memoización — O(n)
public static int fibMemo(int n, Map<Integer, Integer> memo) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);  // ya calculado

    int resultado = fibMemo(n-1, memo) + fibMemo(n-2, memo);
    memo.put(n, resultado);
    return resultado;
}
// fib(50) con memo: instantáneo

// Iterativo — O(n) tiempo, O(1) espacio
public static long fibIterativo(int n) {
    if (n <= 1) return n;
    long prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        long next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}
```

---

## Suma de array recursiva y búsqueda binaria recursiva

```java
// Suma recursiva
public static int sumaRec(int[] arr, int idx) {
    if (idx == arr.length) return 0;          // caso base
    return arr[idx] + sumaRec(arr, idx + 1);  // caso recursivo
}

// Búsqueda binaria recursiva
public static int binRecursivo(int[] arr, int target, int izq, int der) {
    if (izq > der) return -1;   // caso base: no encontrado

    int mid = izq + (der - izq) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target)
        return binRecursivo(arr, target, mid + 1, der);
    return binRecursivo(arr, target, izq, mid - 1);
}
```

---

## Potencia rápida — O(log n)

```java
// Calcular base^exp eficientemente
public static long potencia(long base, int exp) {
    if (exp == 0) return 1;               // caso base
    if (exp % 2 == 0) {
        long mitad = potencia(base, exp / 2);
        return mitad * mitad;             // base^n = (base^n/2)²
    }
    return base * potencia(base, exp - 1); // exp impar
}

// potencia(2, 10):
// = potencia(2, 5) * potencia(2, 5)
// = (2 * potencia(2, 4)) * ...
// → O(log n) en lugar de O(n)
```

---

## Backtracking — explorar todas las posibilidades

```java
// Generar todas las permutaciones de un array
public static void permutaciones(int[] arr, int inicio) {
    if (inicio == arr.length - 1) {
        System.out.println(Arrays.toString(arr));
        return;
    }
    for (int i = inicio; i < arr.length; i++) {
        // intercambiar
        int temp = arr[inicio]; arr[inicio] = arr[i]; arr[i] = temp;
        // explorar
        permutaciones(arr, inicio + 1);
        // deshacer (backtrack)
        temp = arr[inicio]; arr[inicio] = arr[i]; arr[i] = temp;
    }
}

// permutaciones(new int[]{1,2,3}, 0)
// → [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,2,1] [3,1,2]

// Generar todos los subconjuntos de un array
public static void subconjuntos(int[] arr, int idx, List<Integer> actual) {
    if (idx == arr.length) {
        System.out.println(actual);
        return;
    }
    // No incluir arr[idx]
    subconjuntos(arr, idx + 1, actual);
    // Incluir arr[idx]
    actual.add(arr[idx]);
    subconjuntos(arr, idx + 1, actual);
    actual.remove(actual.size() - 1);   // backtrack
}
```

---

# VIERNES — Simulación: 6 Problemas Cronometrados

> Regla: 15 minutos por problema. Sin buscar en Google. Escribe el proceso en voz alta.  
> Antes de codificar: **1) entiende el problema, 2) explica tu approach, 3) codifica, 4) prueba con ejemplos.**

---

## Problema 1: Two Sum (O(n))

**Enunciado:** dado un array de enteros `nums` y un entero `target`, retorna los índices de los dos números que suman `target`. Cada input tiene exactamente una solución.

```java
// Approach: HashMap para O(n) en lugar de O(n²)
public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> mapa = new HashMap<>();   // valor → índice
    for (int i = 0; i < nums.length; i++) {
        int complemento = target - nums[i];
        if (mapa.containsKey(complemento)) {
            return new int[]{mapa.get(complemento), i};
        }
        mapa.put(nums[i], i);
    }
    return new int[]{};
}

// twoSum([2,7,11,15], 9) → [0,1]  (2+7=9)
// twoSum([3,2,4], 6)    → [1,2]  (2+4=6)
// Tiempo: O(n), Espacio: O(n)
```

---

## Problema 2: Número de palíndromo (O(n))

**Enunciado:** dado un entero `x`, retorna `true` si es palíndromo.

```java
public static boolean isPalindrome(int x) {
    if (x < 0) return false;   // negativos nunca son palíndromos

    String s = String.valueOf(x);
    int izq = 0, der = s.length() - 1;
    while (izq < der) {
        if (s.charAt(izq) != s.charAt(der)) return false;
        izq++; der--;
    }
    return true;
}

// Alternativa sin convertir a String:
public static boolean isPalindromeNum(int x) {
    if (x < 0 || (x % 10 == 0 && x != 0)) return false;
    int revertido = 0;
    while (x > revertido) {
        revertido = revertido * 10 + x % 10;
        x /= 10;
    }
    return x == revertido || x == revertido / 10;
}

// isPalindrome(121) → true
// isPalindrome(-121)→ false
// isPalindrome(10)  → false
```

---

## Problema 3: Máximo en subarray contiguo — Kadane's Algorithm (O(n))

**Enunciado:** dado un array de enteros, encuentra el subarray contiguo con la mayor suma.

```java
public static int maxSubArray(int[] nums) {
    int maxActual = nums[0];
    int maxGlobal = nums[0];

    for (int i = 1; i < nums.length; i++) {
        // ¿Conviene extender el subarray anterior o empezar uno nuevo?
        maxActual = Math.max(nums[i], maxActual + nums[i]);
        maxGlobal = Math.max(maxGlobal, maxActual);
    }
    return maxGlobal;
}

// maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) → 6
// Subarray: [4,-1,2,1] = 6
// Tiempo: O(n), Espacio: O(1)
```

---

## Problema 4: Invertir una lista enlazada (O(n))

**Enunciado:** dado el head de una lista enlazada, invierte la lista y retorna el nuevo head.

```java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

// Iterativo
public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;

    while (curr != null) {
        ListNode siguiente = curr.next;  // guardar referencia
        curr.next = prev;                // invertir enlace
        prev = curr;                     // avanzar prev
        curr = siguiente;                // avanzar curr
    }
    return prev;   // prev es el nuevo head
}

// Recursivo
public static ListNode reverseListRec(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode nuevoHead = reverseListRec(head.next);
    head.next.next = head;
    head.next = null;
    return nuevoHead;
}

// 1→2→3→4→5 → 5→4→3→2→1
// Tiempo: O(n), Espacio: O(1) iterativo, O(n) recursivo
```

---

## Problema 5: Validar paréntesis (O(n))

**Enunciado:** dado un string con `()[]{}`, determina si los paréntesis están correctamente cerrados.

```java
public static boolean isValid(String s) {
    Deque<Character> pila = new ArrayDeque<>();

    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') {
            pila.push(c);
        } else {
            if (pila.isEmpty()) return false;
            char tope = pila.pop();
            if (c == ')' && tope != '(') return false;
            if (c == ']' && tope != '[') return false;
            if (c == '}' && tope != '{') return false;
        }
    }
    return pila.isEmpty();
}

// isValid("()")     → true
// isValid("()[]{}")→ true
// isValid("(]")     → false
// isValid("([)]")   → false
// Tiempo: O(n), Espacio: O(n)
```

---

## Problema 6: Números faltantes en rango (O(n))

**Enunciado:** dado un array de `n` enteros en el rango `[1, n]`, algunos números aparecen dos veces y uno falta. Encuentra el número que falta.

```java
// Opción 1: suma esperada vs suma real
public static int missingNumber(int[] nums) {
    int n = nums.length;
    int sumaEsperada = n * (n + 1) / 2;   // 1+2+...+n = n(n+1)/2
    int sumaReal = 0;
    for (int num : nums) sumaReal += num;
    return sumaEsperada - sumaReal;
}

// Opción 2: XOR (no hay overflow)
public static int missingNumberXOR(int[] nums) {
    int resultado = nums.length;
    for (int i = 0; i < nums.length; i++) {
        resultado ^= i ^ nums[i];   // XOR se cancela para los que aparecen
    }
    return resultado;
}

// missingNumber([3,0,1]) → 2
// missingNumber([9,6,4,2,3,5,7,0,1]) → 8
// Tiempo: O(n), Espacio: O(1)
```

---

# SÁBADO — Proyecto: Mini Librería de Algoritmos

## Especificación

Crear una clase `AlgoritmosLib` con todos los algoritmos de la semana, más una clase `AlgoritmosBenchmark` que mida y compare sus tiempos con arrays de diferentes tamaños.

```java
import java.util.*;
import java.util.function.*;

public class AlgoritmosLib {

    // ── Sorting ──────────────────────────────────────────
    public static void bubbleSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            boolean swap = false;
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j+1]) {
                    int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
                    swap = true;
                }
            }
            if (!swap) break;
        }
    }

    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) arr[j+1] = arr[j--];
            arr[j+1] = key;
        }
    }

    public static void mergeSort(int[] arr, int l, int r) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }

    private static void merge(int[] arr, int l, int m, int r) {
        int[] L = Arrays.copyOfRange(arr, l, m+1);
        int[] R = Arrays.copyOfRange(arr, m+1, r+1);
        int i=0, j=0, k=l;
        while (i<L.length && j<R.length)
            arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
        while (i<L.length) arr[k++] = L[i++];
        while (j<R.length) arr[k++] = R[j++];
    }

    // ── Searching ────────────────────────────────────────
    public static int busquedaLineal(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++)
            if (arr[i] == target) return i;
        return -1;
    }

    public static int busquedaBinaria(int[] arr, int target) {
        int izq = 0, der = arr.length - 1;
        while (izq <= der) {
            int mid = izq + (der - izq) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) izq = mid + 1;
            else der = mid - 1;
        }
        return -1;
    }

    // ── Recursión ────────────────────────────────────────
    public static long factorial(int n) {
        return n <= 1 ? 1 : n * factorial(n - 1);
    }

    public static long fibMemo(int n, Map<Integer, Long> memo) {
        if (n <= 1) return n;
        return memo.computeIfAbsent(n,
            k -> fibMemo(k-1, memo) + fibMemo(k-2, memo));
    }

    // ── Problemas ────────────────────────────────────────
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }

    public static int maxSubArray(int[] nums) {
        int cur = nums[0], max = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            max = Math.max(max, cur);
        }
        return max;
    }
}

// ── Benchmark ────────────────────────────────────────────
class AlgoritmosBenchmark {

    static long medir(Runnable tarea) {
        long inicio = System.nanoTime();
        tarea.run();
        return (System.nanoTime() - inicio) / 1_000_000;   // ms
    }

    static int[] generarAleatorio(int n) {
        Random rnd = new Random();
        return rnd.ints(n, 0, n * 10).toArray();
    }

    public static void main(String[] args) {
        int[] tamaños = {100, 1_000, 10_000, 100_000};

        System.out.printf("%-10s %-15s %-15s %-15s%n",
            "n", "Bubble O(n²)", "Insertion O(n²)", "Merge O(nlogn)");
        System.out.println("─".repeat(60));

        for (int n : tamaños) {
            int[] base = generarAleatorio(n);

            long tBubble = medir(() -> {
                int[] copia = base.clone();
                if (n <= 10_000) AlgoritmosLib.bubbleSort(copia);
            });

            long tInsert = medir(() -> {
                int[] copia = base.clone();
                AlgoritmosLib.insertionSort(copia);
            });

            long tMerge = medir(() -> {
                int[] copia = base.clone();
                AlgoritmosLib.mergeSort(copia, 0, copia.length - 1);
            });

            System.out.printf("%-10d %-15s %-15d %-15d%n",
                n,
                n <= 10_000 ? tBubble + "ms" : "muy lento",
                tInsert,
                tMerge);
        }
    }
}
```

---

# DOMINGO — Repaso + Estrategia para Pruebas Técnicas

## Lista de verificación

- [ ] Puedo calcular la complejidad de cualquier función antes de escribirla.
- [ ] Puedo implementar Merge Sort sin ver el código.
- [ ] Puedo implementar búsqueda binaria sin errores de índice.
- [ ] Puedo convertir un problema O(n²) a O(n) con HashMap o dos punteros.
- [ ] Puedo resolver los 6 problemas del viernes en menos de 15 min cada uno.
- [ ] Sé cuándo usar recursión vs iteración.
- [ ] Entiendo qué es la memoización y por qué mejora Fibonacci.

---

## Estrategia para pruebas técnicas

### Antes de escribir una línea de código:

```
1. LEER despacio — asegúrate de entender el problema completo.
   Pregunta: ¿el array puede estar vacío? ¿los valores pueden ser negativos?

2. EJEMPLOS — escribe 2-3 casos de prueba a mano, incluyendo edge cases:
   - Array vacío []
   - Array de un elemento [5]
   - Array ya ordenado
   - Todos los elementos iguales

3. APPROACH — explica en voz alta ANTES de codificar:
   "Voy a usar un HashMap para O(n) porque necesito buscar el complemento..."

4. COMPLEJIDAD — estima O(n) antes de codificar:
   "Este approach es O(n) tiempo y O(n) espacio, ¿hay algo mejor?"

5. CÓDIGO — escribe limpio desde el inicio, no optimices después.

6. TEST — corre tus casos de prueba mentalmente o en papel.
```

---

### Patrones que resuelven el 80% de los problemas Easy

```
1. HashMap / HashSet
   → Conteo, frecuencias, "¿existe?", Two Sum, anagramas

2. Dos punteros
   → Arrays ordenados, palíndromos, mover elementos, suma de dos

3. Ventana deslizante
   → Subarray/substring de tamaño fijo o variable

4. Pila (Stack)
   → Paréntesis válidos, siguiente mayor elemento, histogramas

5. Búsqueda binaria
   → Cualquier cosa en array ordenado, "encuentra el mínimo que..."

6. BFS/DFS (para grafos/árboles — semana 10+)
   → Caminos, conectividad, niveles

7. Greedy
   → Problema de monedas, intervalos, maximizar con decisión local
```

---

### Plantilla mental para cualquier problema

```
Tipo de entrada   → ¿Array? ¿String? ¿Número? ¿Lista enlazada?
¿Está ordenado?   → ¿Puedo usar búsqueda binaria?
¿Necesito buscar? → ¿Puedo usar HashMap/HashSet para O(1)?
¿Dos colecciones? → ¿Necesito merge o intersection?
¿Orden importa?   → ¿Stack? ¿Queue?
¿Subproblemas?    → ¿Recursión? ¿Memoización?
```

---

## Métricas de la semana 10

| Métrica | Meta | Tu resultado |
|---|---|---|
| Problemas resueltos sin ayuda | 6 o más | |
| Merge Sort implementado de memoria | Sí / No | |
| Búsqueda binaria sin bug de índice | Sí / No | |
| Complejidad calculada antes de codificar | Siempre | |
| Benchmark del proyecto: tiempos correctos | Sí / No | |
| Horas reales cumplidas | 14+ L-V + 6 fin de semana | |

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

## Problemas extra para seguir practicando

Estos son LeetCode Easy/Medium — resuélvelos por tu cuenta:

| # | Problema | Patrón |
|---|---|---|
| 1 | Climbing Stairs | Fibonacci / DP |
| 2 | Best Time to Buy and Sell Stock | Ventana deslizante |
| 3 | Contains Duplicate | HashSet |
| 4 | Product of Array Except Self | Prefijos y sufijos |
| 5 | Maximum Depth of Binary Tree | DFS recursivo |
| 6 | Merge Two Sorted Lists | Dos punteros |
| 7 | Linked List Cycle | Tortuga y liebre |
| 8 | Reverse Linked List | Iterativo / recursivo |
| 9 | First Bad Version | Búsqueda binaria |
| 10 | Majority Element | Boyer-Moore Voting |

---

> **La semana que viene — Semana 11:** Arquitectura Backend · Microservicios · Resiliencia · Colas · Caché · Transacciones distribuidas  
> *Ya tienes algoritmos. La semana que viene aprendes a pensar en sistemas, no solo en código.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

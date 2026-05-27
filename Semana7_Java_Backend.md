# Semana 7 — Concurrencia · Threads · ExecutorService · CompletableFuture

> **Fase 2 — Nivel Profesional** · Programa Intensivo Java Backend Developer  
> Tema central: **Threads · Sincronización · ExecutorService · CompletableFuture · Concurrencia en APIs**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Threads: ciclo de vida, crear y ejecutar | Fundamentos de concurrencia |
| Martes | Sincronización: race conditions, synchronized, volatile | Código thread-safe |
| Miércoles | ExecutorService y thread pools | Gestión eficiente de hilos |
| Jueves | CompletableFuture: asincronía real | Programación reactiva básica |
| Viernes | Simulación cronometrada: concurrencia aplicada | Prueba técnica real |
| Sábado | Proyecto: procesador de tareas concurrente | Integración total |
| Domingo | Repaso completo + preguntas de entrevista | Verificación sin código |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Crear y controlar Threads manualmente.
- Identificar y corregir race conditions.
- Usar `ExecutorService` en lugar de crear Threads a mano.
- Elegir el thread pool correcto según el caso.
- Encadenar operaciones asíncronas con `CompletableFuture`.
- Explicar concurrencia en una entrevista con ejemplos concretos.

---

# LUNES — Threads: Ciclo de Vida y Creación

## ¿Qué es un Thread?

Un **Thread** (hilo) es la unidad mínima de ejecución dentro de un proceso. Un programa Java siempre tiene al menos un hilo: el hilo principal (`main`). La concurrencia permite ejecutar múltiples hilos al mismo tiempo, aprovechando los núcleos del procesador.

```
Proceso Java
├── Thread main          ← el que arranca con main()
├── Thread GC            ← garbage collector (automático)
└── Threads creados por ti
    ├── Thread-1
    ├── Thread-2
    └── Thread-3
```

---

## Ciclo de vida de un Thread

```
NEW          → RUNNABLE     → RUNNING    → TERMINATED
(creado)       (listo)        (ejecutando)  (terminó)
                  ↑               ↓
                  └─── BLOCKED/WAITING/TIMED_WAITING
                       (esperando lock, sleep, join, etc.)
```

---

## Formas de crear un Thread

### Forma 1: extender Thread

```java
public class MiThread extends Thread {

    private final String nombre;

    public MiThread(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public void run() {
        // Este código corre en el hilo nuevo
        for (int i = 1; i <= 5; i++) {
            System.out.println(nombre + " → iteración " + i);
            try {
                Thread.sleep(200);   // pausa 200 ms
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.out.println(nombre + " interrumpido.");
                return;
            }
        }
    }
}

// Uso:
MiThread t1 = new MiThread("Hilo-A");
MiThread t2 = new MiThread("Hilo-B");

t1.start();   // start() lanza el hilo — NUNCA llames run() directamente
t2.start();

// La salida será intercalada porque ambos corren en paralelo:
// Hilo-A → iteración 1
// Hilo-B → iteración 1
// Hilo-A → iteración 2
// ...
```

> **Error clásico:** llamar `t1.run()` en lugar de `t1.start()`. `run()` ejecuta el código en el hilo actual (sin concurrencia). `start()` crea el nuevo hilo y ejecuta `run()` dentro de él.

---

### Forma 2: implementar Runnable (preferida)

```java
// Runnable separa la tarea del hilo — más flexible
Runnable tarea = () -> {
    for (int i = 1; i <= 3; i++) {
        System.out.println(Thread.currentThread().getName()
                           + " → " + i);
        try { Thread.sleep(100); }
        catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
};

Thread t1 = new Thread(tarea, "Worker-1");
Thread t2 = new Thread(tarea, "Worker-2");

t1.start();
t2.start();
```

---

### Forma 3: Callable — cuando necesitas retornar un valor

```java
import java.util.concurrent.*;

Callable<Integer> calculo = () -> {
    Thread.sleep(500);   // simula trabajo
    return 42;
};

FutureTask<Integer> tarea = new FutureTask<>(calculo);
Thread hilo = new Thread(tarea);
hilo.start();

// get() bloquea hasta que el hilo termine y retorna el resultado
Integer resultado = tarea.get();
System.out.println("Resultado: " + resultado);   // 42
```

---

## Métodos importantes de Thread

```java
Thread t = new Thread(() -> System.out.println("corriendo"));

t.start();               // lanza el hilo
t.join();                // espera a que termine
t.join(2000);            // espera máximo 2 segundos
t.interrupt();           // solicita interrupción (no lo mata)
t.isAlive();             // true si el hilo está corriendo
t.getName();             // nombre del hilo
t.setName("MiHilo");
t.getPriority();         // 1-10, default 5
t.setDaemon(true);       // hilo daemon: termina cuando el main termina

Thread.sleep(1000);      // pausa el hilo actual 1 segundo
Thread.currentThread();  // referencia al hilo actual
Thread.yield();          // sugiere al scheduler ceder el procesador
```

---

## join() — esperar que un hilo termine

```java
Thread descarga = new Thread(() -> {
    System.out.println("Descargando archivo...");
    try { Thread.sleep(2000); } catch (InterruptedException e) {}
    System.out.println("Descarga completa.");
});

Thread procesado = new Thread(() -> {
    System.out.println("Procesando archivo...");
});

descarga.start();
descarga.join();      // espera a que descarga termine antes de continuar
procesado.start();    // solo inicia después de la descarga

// Sin join() ambos correrían en paralelo y procesado podría iniciar antes
```

---

# MARTES — Sincronización y Race Conditions

## ¿Qué es una Race Condition?

Una race condition ocurre cuando dos o más hilos acceden y modifican datos compartidos al mismo tiempo, produciendo resultados incorrectos e impredecibles.

```java
// PROBLEMA: race condition clásica
public class ContadorInseguro {
    private int contador = 0;

    public void incrementar() {
        contador++;   // NO es atómica: es leer + sumar + escribir
    }

    public int getContador() { return contador; }
}

// Prueba:
ContadorInseguro c = new ContadorInseguro();
Thread t1 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) c.incrementar();
});
Thread t2 = new Thread(() -> {
    for (int i = 0; i < 10000; i++) c.incrementar();
});

t1.start(); t2.start();
t1.join();  t2.join();

System.out.println(c.getContador());
// Esperado: 20000
// Real: algo entre 10000 y 20000 — impredecible
```

---

## synchronized — el mecanismo básico

```java
// Solución 1: método sincronizado
public class ContadorSeguro {
    private int contador = 0;

    // Solo un hilo puede ejecutar este método a la vez
    public synchronized void incrementar() {
        contador++;
    }

    public synchronized int getContador() {
        return contador;
    }
}

// Solución 2: bloque sincronizado (más granular)
public class ContadorSeguro2 {
    private int contador = 0;
    private final Object lock = new Object();

    public void incrementar() {
        synchronized (lock) {     // solo bloquea la sección crítica
            contador++;
        }
        // código no crítico aquí no bloquea a otros hilos
    }
}
```

---

## volatile — visibilidad entre hilos

```java
// Sin volatile: los hilos pueden ver valores desactualizados
// porque cada hilo tiene su caché local del valor
public class Bandera {
    // volatile garantiza que todos los hilos ven el valor actualizado
    private volatile boolean corriendo = true;

    public void detener() {
        corriendo = false;   // visible inmediatamente para todos los hilos
    }

    public void ejecutar() {
        while (corriendo) {
            // hacer trabajo...
        }
        System.out.println("Detenido.");
    }
}
```

> **volatile vs synchronized:** `volatile` garantiza visibilidad (todos ven el último valor). `synchronized` garantiza visibilidad + atomicidad (operaciones compuestas son indivisibles). Para `contador++` necesitas `synchronized` o `AtomicInteger`, no `volatile`.

---

## AtomicInteger — operaciones atómicas sin synchronized

```java
import java.util.concurrent.atomic.*;

public class ContadorAtomico {
    private AtomicInteger contador = new AtomicInteger(0);

    public void incrementar()          { contador.incrementAndGet(); }
    public void decrementar()          { contador.decrementAndGet(); }
    public int  getContador()          { return contador.get(); }
    public void agregar(int n)         { contador.addAndGet(n); }
    public boolean cambiarSi(int esperado, int nuevo) {
        return contador.compareAndSet(esperado, nuevo);
    }
}

// AtomicLong, AtomicBoolean, AtomicReference también disponibles
```

---

## Deadlock — cómo identificarlo y evitarlo

```java
// DEADLOCK: dos hilos esperándose mutuamente
Object lockA = new Object();
Object lockB = new Object();

Thread hilo1 = new Thread(() -> {
    synchronized (lockA) {
        System.out.println("Hilo1 tiene lockA, espera lockB");
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        synchronized (lockB) {          // espera que Hilo2 suelte lockB
            System.out.println("Hilo1 tiene ambos locks");
        }
    }
});

Thread hilo2 = new Thread(() -> {
    synchronized (lockB) {             // hilo2 toma lockB primero
        System.out.println("Hilo2 tiene lockB, espera lockA");
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        synchronized (lockA) {          // espera que Hilo1 suelte lockA
            System.out.println("Hilo2 tiene ambos locks");
        }
    }
});

// SOLUCIÓN: siempre adquirir los locks en el mismo orden
Thread hilo1Fixed = new Thread(() -> {
    synchronized (lockA) {
        synchronized (lockB) { /* trabajo */ }
    }
});
Thread hilo2Fixed = new Thread(() -> {
    synchronized (lockA) {    // mismo orden que hilo1Fixed
        synchronized (lockB) { /* trabajo */ }
    }
});
```

---

## Collections thread-safe

```java
import java.util.concurrent.*;

// ConcurrentHashMap — HashMap thread-safe de alto rendimiento
ConcurrentHashMap<String, Integer> mapa = new ConcurrentHashMap<>();
mapa.put("clave", 1);
mapa.computeIfAbsent("clave2", k -> 0);
mapa.merge("clave", 1, Integer::sum);   // atómico: leer + sumar + guardar

// CopyOnWriteArrayList — ArrayList thread-safe (bueno para muchas lecturas)
CopyOnWriteArrayList<String> lista = new CopyOnWriteArrayList<>();
lista.add("elemento");

// LinkedBlockingQueue — cola thread-safe (productor-consumidor)
BlockingQueue<String> cola = new LinkedBlockingQueue<>(100);
cola.put("tarea");              // bloquea si la cola está llena
String tarea = cola.take();     // bloquea si la cola está vacía

// Collections.synchronizedList — envolver una lista existente
List<String> listaSync = Collections.synchronizedList(new ArrayList<>());
```

---

# MIÉRCOLES — ExecutorService y Thread Pools

## ¿Por qué no crear Threads manualmente?

```
Problema con new Thread():
- Crear un Thread es costoso (memoria, tiempo del OS)
- Sin límite: 1000 peticiones = 1000 threads = OutOfMemoryError
- No hay reutilización: cada Thread muere al terminar su tarea

Solución: Thread Pool
- Pool de N threads preexistentes
- Las tareas se encolan y los threads las van tomando
- Reutilización: el thread no muere, espera la siguiente tarea
- Control: número máximo de threads configurable
```

---

## Tipos de ExecutorService

```java
import java.util.concurrent.*;

// 1. Fixed Thread Pool — N threads fijos
// Usa cuando sabes cuánta carga concurrent quieres manejar
ExecutorService fixed = Executors.newFixedThreadPool(4);
// → máximo 4 threads activos, las demás tareas se encolan

// 2. Cached Thread Pool — crece según demanda
// Usa para tareas cortas y ráfagas de trabajo variable
ExecutorService cached = Executors.newCachedThreadPool();
// → crea threads según necesidad, los reutiliza si están libres
// → threads inactivos >60s se eliminan

// 3. Single Thread Executor — un solo thread
// Usa para garantizar ejecución secuencial
ExecutorService single = Executors.newSingleThreadExecutor();
// → todas las tareas corren en orden, una a la vez

// 4. Scheduled Thread Pool — con delay o periódico
ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(2);
// → para tareas que corren cada X tiempo

// SIEMPRE cerrar el executor cuando ya no se necesite
executor.shutdown();               // espera que terminen las tareas en curso
executor.shutdownNow();            // intenta cancelar las tareas en curso
executor.awaitTermination(30, TimeUnit.SECONDS);
```

---

## submit() vs execute()

```java
ExecutorService executor = Executors.newFixedThreadPool(3);

// execute() — para Runnable, sin retorno
executor.execute(() -> System.out.println("Tarea sin retorno"));

// submit() — para Runnable o Callable, retorna Future
Future<String> futuro = executor.submit(() -> {
    Thread.sleep(1000);
    return "Resultado de la tarea";
});

// Future.get() bloquea hasta que la tarea termine
String resultado = futuro.get();              // bloquea indefinidamente
String resultado2 = futuro.get(5, TimeUnit.SECONDS);  // timeout de 5s

// Verificar estado del Future
boolean terminó = futuro.isDone();
boolean cancelado = futuro.isCancelled();
futuro.cancel(true);   // solicitar cancelación
```

---

## Ejecutar múltiples tareas

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

List<Callable<Integer>> tareas = new ArrayList<>();
for (int i = 1; i <= 10; i++) {
    final int num = i;
    tareas.add(() -> {
        Thread.sleep(100);
        return num * num;
    });
}

// invokeAll — ejecuta todas y espera que terminen
List<Future<Integer>> resultados = executor.invokeAll(tareas);
for (Future<Integer> f : resultados) {
    System.out.println(f.get());   // 1, 4, 9, 16...
}

// invokeAny — retorna el resultado del primero que termine
Integer primerResultado = executor.invokeAny(tareas);
System.out.println("Primero en terminar: " + primerResultado);

executor.shutdown();
```

---

## ScheduledExecutorService — tareas periódicas

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

// Ejecutar una vez después de 3 segundos
scheduler.schedule(
    () -> System.out.println("Tarea retrasada"),
    3, TimeUnit.SECONDS
);

// Ejecutar cada 5 segundos (con delay fijo entre fin y siguiente inicio)
scheduler.scheduleWithFixedDelay(
    () -> System.out.println("Heartbeat: " + System.currentTimeMillis()),
    0,    // delay inicial
    5,    // delay entre ejecuciones
    TimeUnit.SECONDS
);

// Ejecutar cada 5 segundos (con período fijo desde el inicio)
scheduler.scheduleAtFixedRate(
    () -> System.out.println("Reporte: " + System.currentTimeMillis()),
    0,    // delay inicial
    5,    // período
    TimeUnit.SECONDS
);
```

---

# JUEVES — CompletableFuture

## ¿Qué es CompletableFuture?

`CompletableFuture` es la herramienta de Java para **programación asíncrona no bloqueante**. A diferencia de `Future`, no necesita bloquear el hilo con `get()` — puedes encadenar operaciones que se ejecutan cuando el resultado está listo.

```
Future<T>:           tarea → bloquear con get() → resultado
CompletableFuture<T>: tarea → cuando termine, hacer esto → cuando termine, hacer esto otro
```

---

## Crear CompletableFuture

```java
import java.util.concurrent.*;

// supplyAsync — tarea que retorna valor (en el common pool por defecto)
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
    try { Thread.sleep(1000); } catch (InterruptedException e) {}
    return "resultado";
});

// Con executor propio
ExecutorService executor = Executors.newFixedThreadPool(4);
CompletableFuture<String> cf2 = CompletableFuture.supplyAsync(
    () -> "resultado",
    executor
);

// runAsync — tarea sin retorno
CompletableFuture<Void> cf3 = CompletableFuture.runAsync(
    () -> System.out.println("sin retorno")
);

// Completado manualmente
CompletableFuture<String> manual = new CompletableFuture<>();
manual.complete("valor manual");
manual.completeExceptionally(new RuntimeException("falló"));
```

---

## Encadenar operaciones — thenApply, thenAccept, thenRun

```java
CompletableFuture<String> pipeline = CompletableFuture
    .supplyAsync(() -> {
        System.out.println("Paso 1: obteniendo datos...");
        return "datos crudos";
    })
    .thenApply(datos -> {
        // thenApply: transforma el resultado (retorna nuevo valor)
        System.out.println("Paso 2: procesando " + datos);
        return datos.toUpperCase();
    })
    .thenApply(datos -> {
        System.out.println("Paso 3: formateando " + datos);
        return "Resultado final: " + datos;
    });

// thenAccept: consume el resultado (retorna Void)
pipeline.thenAccept(resultado ->
    System.out.println("Paso 4: " + resultado)
);

// thenRun: ejecuta algo sin usar el resultado
pipeline.thenRun(() ->
    System.out.println("Pipeline completado.")
);

// Obtener el resultado (bloquea si no terminó)
String valor = pipeline.get();
```

---

## Combinar múltiples CompletableFutures

```java
// thenCombine — combinar dos futuros independientes
CompletableFuture<String> nombreCF = CompletableFuture.supplyAsync(
    () -> obtenerNombreDeUsuario(1L)
);
CompletableFuture<Double> saldoCF = CompletableFuture.supplyAsync(
    () -> obtenerSaldoDeCuenta(1L)
);

CompletableFuture<String> resumen = nombreCF.thenCombine(
    saldoCF,
    (nombre, saldo) -> nombre + " tiene $" + saldo
);

System.out.println(resumen.get());
// Ambas tareas corren en paralelo — más rápido que secuencial

// allOf — esperar que TODOS terminen
CompletableFuture<Void> todos = CompletableFuture.allOf(
    nombreCF, saldoCF
);
todos.join();   // join() es como get() pero sin checked exception

// anyOf — retorna cuando el PRIMERO termina
CompletableFuture<Object> primero = CompletableFuture.anyOf(
    nombreCF, saldoCF
);
Object resultado = primero.get();
```

---

## Manejo de errores en CompletableFuture

```java
CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> {
        if (Math.random() > 0.5)
            throw new RuntimeException("Fallo aleatorio");
        return "éxito";
    })
    .exceptionally(ex -> {
        // exceptionally: maneja la excepción y retorna valor de reemplazo
        System.out.println("Error capturado: " + ex.getMessage());
        return "valor por defecto";
    })
    .handle((resultado, ex) -> {
        // handle: siempre se ejecuta (con o sin error)
        if (ex != null) return "manejado: " + ex.getMessage();
        return "procesado: " + resultado;
    })
    .whenComplete((resultado, ex) -> {
        // whenComplete: side-effect final (no transforma el resultado)
        System.out.println("Terminado. Resultado: " + resultado);
        if (ex != null) System.out.println("Con error: " + ex);
    });
```

---

## CompletableFuture en una API REST

```java
// service/ReporteService.java — consultas en paralelo
@Service
public class ReporteService {

    private final EmpleadoRepository  empRepo;
    private final DepartamentoRepository deptRepo;

    public ReporteService(EmpleadoRepository empRepo,
                          DepartamentoRepository deptRepo) {
        this.empRepo  = empRepo;
        this.deptRepo = deptRepo;
    }

    public ReporteDTO generarReporte() throws Exception {
        // Lanzar ambas consultas en paralelo
        CompletableFuture<Long> totalEmpleados = CompletableFuture
            .supplyAsync(() -> empRepo.count());

        CompletableFuture<Double> promedioSalario = CompletableFuture
            .supplyAsync(() -> empRepo.findAll().stream()
                .mapToDouble(Empleado::getSalario)
                .average().orElse(0));

        CompletableFuture<Long> totalDeptos = CompletableFuture
            .supplyAsync(() -> deptRepo.count());

        // Esperar que las tres terminen
        CompletableFuture.allOf(totalEmpleados, promedioSalario, totalDeptos)
            .join();

        return new ReporteDTO(
            totalEmpleados.get(),
            promedioSalario.get(),
            totalDeptos.get()
        );
        // Tiempo total ≈ max(t1, t2, t3) en lugar de t1+t2+t3
    }
}
```

---

## thenCompose — encadenar futuros dependientes

```java
// thenCompose: cuando el segundo futuro DEPENDE del resultado del primero
// (evita CompletableFuture<CompletableFuture<T>>)

CompletableFuture<String> flujo = CompletableFuture
    .supplyAsync(() -> buscarIdUsuario("emmanuel@empresa.com"))
    .thenCompose(id ->
        CompletableFuture.supplyAsync(() -> cargarPerfil(id))
    )
    .thenCompose(perfil ->
        CompletableFuture.supplyAsync(() -> cargarPermisos(perfil))
    );

// thenApply vs thenCompose:
// thenApply:   entrada T → retorna U       (transforma)
// thenCompose: entrada T → retorna CF<U>   (encadena futuros)
```

---

# VIERNES — Simulación Cronometrada

> Sin apuntes. Cronómetro: 60 minutos.

## Ejercicio 1: Contador thread-safe con estadísticas

Implementa un `ContadorEstadisticas` thread-safe que lleve: conteo de incrementos, valor actual, máximo alcanzado y mínimo alcanzado. Pruébalo con 5 threads que hagan 1000 operaciones cada uno.

```java
import java.util.concurrent.atomic.*;

public class ContadorEstadisticas {

    private final AtomicInteger valor    = new AtomicInteger(0);
    private final AtomicInteger total    = new AtomicInteger(0);
    private final AtomicInteger maximo   = new AtomicInteger(Integer.MIN_VALUE);
    private final AtomicInteger minimo   = new AtomicInteger(Integer.MAX_VALUE);

    public void incrementar(int cantidad) {
        int nuevo = valor.addAndGet(cantidad);
        total.incrementAndGet();

        // CAS loop para actualizar máximo atómicamente
        int max;
        do { max = maximo.get(); } while (nuevo > max
            && !maximo.compareAndSet(max, nuevo));

        int min;
        do { min = minimo.get(); } while (nuevo < min
            && !minimo.compareAndSet(min, nuevo));
    }

    public void imprimir() {
        System.out.printf(
            "Valor: %d | Operaciones: %d | Máx: %d | Mín: %d%n",
            valor.get(), total.get(), maximo.get(), minimo.get()
        );
    }
}

// Prueba:
public static void main(String[] args) throws InterruptedException {
    ContadorEstadisticas contador = new ContadorEstadisticas();
    ExecutorService exec = Executors.newFixedThreadPool(5);

    for (int t = 0; t < 5; t++) {
        exec.submit(() -> {
            for (int i = 0; i < 1000; i++) {
                contador.incrementar(1);
            }
        });
    }

    exec.shutdown();
    exec.awaitTermination(10, TimeUnit.SECONDS);
    contador.imprimir();
    // Valor: 5000 | Operaciones: 5000
}
```

---

## Ejercicio 2: Productor-Consumidor con BlockingQueue

```java
import java.util.concurrent.*;

public class ProductorConsumidor {

    static BlockingQueue<Integer> cola = new LinkedBlockingQueue<>(10);
    static AtomicBoolean          produciendo = new AtomicBoolean(true);

    static Runnable productor = () -> {
        try {
            for (int i = 1; i <= 20; i++) {
                cola.put(i);   // bloquea si la cola está llena
                System.out.println("Producido: " + i
                    + " | Cola: " + cola.size());
                Thread.sleep(50);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            produciendo.set(false);
        }
    };

    static Runnable consumidor = () -> {
        try {
            while (produciendo.get() || !cola.isEmpty()) {
                Integer item = cola.poll(500, TimeUnit.MILLISECONDS);
                if (item != null) {
                    System.out.println("  Consumido: " + item);
                    Thread.sleep(100);
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    };

    public static void main(String[] args) throws InterruptedException {
        ExecutorService exec = Executors.newFixedThreadPool(3);
        exec.submit(productor);
        exec.submit(consumidor);
        exec.submit(consumidor);   // dos consumidores

        exec.shutdown();
        exec.awaitTermination(30, TimeUnit.SECONDS);
    }
}
```

---

## Ejercicio 3: Pipeline asíncrono con CompletableFuture

```java
// Simular: buscar usuario → cargar pedidos → calcular total → enviar notificación
public static CompletableFuture<String> procesarPedido(Long usuarioId) {
    return CompletableFuture
        .supplyAsync(() -> {
            // Paso 1: buscar usuario (simula llamada a BD)
            System.out.println("[1] Buscando usuario " + usuarioId);
            sleep(200);
            return "Usuario_" + usuarioId;
        })
        .thenCompose(usuario ->
            CompletableFuture.supplyAsync(() -> {
                // Paso 2: cargar pedidos
                System.out.println("[2] Cargando pedidos de " + usuario);
                sleep(300);
                return usuario + " | pedidos: 5";
            })
        )
        .thenApply(info -> {
            // Paso 3: calcular total
            System.out.println("[3] Calculando total: " + info);
            sleep(100);
            return info + " | total: $1250";
        })
        .thenApply(resumen -> {
            // Paso 4: preparar notificación
            System.out.println("[4] Notificando: " + resumen);
            return "OK: " + resumen;
        })
        .exceptionally(ex -> "ERROR: " + ex.getMessage());
}

private static void sleep(long ms) {
    try { Thread.sleep(ms); } catch (InterruptedException e) {}
}

// main
long inicio = System.currentTimeMillis();
CompletableFuture<String> resultado = procesarPedido(42L);
System.out.println("Resultado: " + resultado.get());
System.out.println("Tiempo: " + (System.currentTimeMillis() - inicio) + "ms");
```

---

# SÁBADO — Proyecto: Procesador de Tareas Concurrente

## Especificación

Sistema que simula el procesamiento de reportes en background:

- Cola de tareas representadas como `Reporte(id, tipo, datos)`.
- Un `ReporteService` que procesa cada reporte de forma asíncrona.
- Un `ReporteDashboard` que muestra estadísticas en tiempo real.
- Soporte para cancelar tareas pendientes.
- Manejo de errores: tareas fallidas se reintentan una vez.

## Código base

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.*;

// ── Modelo ────────────────────────────────────────────
enum TipoReporte { VENTAS, INVENTARIO, NOMINA, FINANCIERO }
enum EstadoReporte { PENDIENTE, PROCESANDO, COMPLETADO, FALLIDO }

class Reporte {
    private static final AtomicInteger contador = new AtomicInteger(0);

    private final int          id;
    private final TipoReporte  tipo;
    private volatile EstadoReporte estado;
    private volatile String    resultado;

    public Reporte(TipoReporte tipo) {
        this.id     = contador.incrementAndGet();
        this.tipo   = tipo;
        this.estado = EstadoReporte.PENDIENTE;
    }

    public int           getId()        { return id; }
    public TipoReporte   getTipo()      { return tipo; }
    public EstadoReporte getEstado()    { return estado; }
    public String        getResultado() { return resultado; }

    public void setEstado(EstadoReporte e)   { this.estado = e; }
    public void setResultado(String r)       { this.resultado = r; }

    @Override
    public String toString() {
        return String.format("Reporte#%d [%s] → %s", id, tipo, estado);
    }
}

// ── Estadísticas ──────────────────────────────────────
class EstadisticasProcesamiento {
    final AtomicInteger completados = new AtomicInteger(0);
    final AtomicInteger fallidos    = new AtomicInteger(0);
    final AtomicInteger reintentados = new AtomicInteger(0);
    final AtomicLong    tiempoTotal  = new AtomicLong(0);

    void registrarExito(long tiempoMs) {
        completados.incrementAndGet();
        tiempoTotal.addAndGet(tiempoMs);
    }

    void registrarFallo()    { fallidos.incrementAndGet(); }
    void registrarReintento(){ reintentados.incrementAndGet(); }

    double promedioMs() {
        int c = completados.get();
        return c == 0 ? 0 : (double) tiempoTotal.get() / c;
    }

    void imprimir() {
        System.out.println("─".repeat(50));
        System.out.println("📊 ESTADÍSTICAS DE PROCESAMIENTO");
        System.out.println("  Completados : " + completados.get());
        System.out.println("  Fallidos    : " + fallidos.get());
        System.out.println("  Reintentados: " + reintentados.get());
        System.out.printf ("  Promedio    : %.1f ms%n", promedioMs());
        System.out.println("─".repeat(50));
    }
}

// ── Servicio de procesamiento ─────────────────────────
class ReporteService {

    private final ExecutorService       executor;
    private final ConcurrentHashMap<Integer, Future<?>> tareaActivas;
    private final EstadisticasProcesamiento stats;

    public ReporteService(int threads) {
        this.executor     = Executors.newFixedThreadPool(threads);
        this.tareaActivas = new ConcurrentHashMap<>();
        this.stats        = new EstadisticasProcesamiento();
    }

    public void enviar(Reporte reporte) {
        Future<?> tarea = executor.submit(() -> procesar(reporte));
        tareaActivas.put(reporte.getId(), tarea);
    }

    private void procesar(Reporte reporte) {
        procesarConReintento(reporte, false);
    }

    private void procesarConReintento(Reporte reporte, boolean esReintento) {
        reporte.setEstado(EstadoReporte.PROCESANDO);
        long inicio = System.currentTimeMillis();

        try {
            System.out.printf("▶ Procesando %s%s%n",
                reporte, esReintento ? " [REINTENTO]" : "");

            // Simular trabajo
            Thread.sleep(500 + (long)(Math.random() * 1000));

            // Simular fallo 20% del tiempo (solo en primer intento)
            if (!esReintento && Math.random() < 0.2) {
                throw new RuntimeException("Error simulado en " + reporte.getTipo());
            }

            reporte.setResultado("Procesado correctamente");
            reporte.setEstado(EstadoReporte.COMPLETADO);
            stats.registrarExito(System.currentTimeMillis() - inicio);
            System.out.println("✅ Completado: " + reporte);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            reporte.setEstado(EstadoReporte.FALLIDO);

        } catch (Exception e) {
            if (!esReintento) {
                System.out.println("⚠ Fallo en " + reporte + " — reintentando...");
                stats.registrarReintento();
                procesarConReintento(reporte, true);
            } else {
                reporte.setEstado(EstadoReporte.FALLIDO);
                reporte.setResultado("Falló: " + e.getMessage());
                stats.registrarFallo();
                System.out.println("❌ Fallido definitivamente: " + reporte);
            }
        } finally {
            tareaActivas.remove(reporte.getId());
        }
    }

    public boolean cancelar(int id) {
        Future<?> tarea = tareaActivas.get(id);
        if (tarea != null && !tarea.isDone()) {
            return tarea.cancel(true);
        }
        return false;
    }

    public void imprimirEstadisticas() { stats.imprimir(); }

    public void cerrar() throws InterruptedException {
        executor.shutdown();
        if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
            executor.shutdownNow();
        }
    }
}

// ── Main ──────────────────────────────────────────────
public class ProcesadorReportes {

    public static void main(String[] args) throws InterruptedException {
        ReporteService servicio = new ReporteService(3);

        // Enviar 10 reportes
        List<Reporte> reportes = new ArrayList<>();
        TipoReporte[] tipos = TipoReporte.values();
        for (int i = 0; i < 10; i++) {
            Reporte r = new Reporte(tipos[i % tipos.length]);
            reportes.add(r);
            servicio.enviar(r);
            Thread.sleep(100);
        }

        // Esperar que terminen
        servicio.cerrar();
        servicio.imprimirEstadisticas();

        // Resumen final
        System.out.println("\n📋 RESUMEN DE REPORTES:");
        reportes.forEach(r ->
            System.out.printf("  %s → %s%n", r, r.getResultado()));
    }
}
```

---

# DOMINGO — Repaso + Preguntas de Entrevista

## Lista de verificación

- [ ] Entiendo la diferencia entre `run()` y `start()` en un Thread.
- [ ] Puedo explicar qué es una race condition con un ejemplo.
- [ ] Sé cuándo usar `synchronized`, `volatile` y `AtomicInteger`.
- [ ] Entiendo la diferencia entre los 4 tipos de thread pool y cuándo usar cada uno.
- [ ] Sé la diferencia entre `Future` y `CompletableFuture`.
- [ ] Puedo encadenar operaciones con `thenApply`, `thenCompose` y `thenCombine`.
- [ ] Entiendo cómo manejar errores con `exceptionally` y `handle`.
- [ ] El proyecto del sábado corre sin errores y las estadísticas son correctas.

---

## Resumen visual: ¿qué usar cuándo?

| Situación | Herramienta |
|---|---|
| Tarea simple sin retorno | `new Thread(runnable).start()` |
| Tarea que retorna valor | `ExecutorService.submit(callable)` |
| Múltiples tareas en paralelo | `ExecutorService + invokeAll()` |
| Tareas periódicas | `ScheduledExecutorService` |
| Operación asíncrona encadenada | `CompletableFuture.supplyAsync()` |
| Combinar dos resultados independientes | `thenCombine()` |
| Encadenar resultados dependientes | `thenCompose()` |
| Esperar que todos terminen | `CompletableFuture.allOf()` |
| Tomar el primero que termina | `CompletableFuture.anyOf()` |
| Contador thread-safe | `AtomicInteger` |
| Mapa thread-safe | `ConcurrentHashMap` |
| Cola thread-safe | `LinkedBlockingQueue` |

---

## Preguntas de entrevista frecuentes — Semana 7

**1. ¿Cuál es la diferencia entre `Thread.sleep()` y `Object.wait()`?**  
`sleep()` pausa el hilo por un tiempo determinado sin liberar ningún lock. `wait()` libera el lock del objeto y espera hasta que otro hilo llame `notify()` o `notifyAll()`. `wait()` se usa dentro de bloques `synchronized`.

**2. ¿Qué es un deadlock y cómo lo evitas?**  
Un deadlock ocurre cuando dos o más hilos se bloquean mutuamente esperando locks que el otro tiene. Se evita adquiriendo los locks siempre en el mismo orden, usando `tryLock()` con timeout, o diseñando para evitar la necesidad de múltiples locks simultáneos.

**3. ¿Cuántos threads debería tener un thread pool?**  
Depende del tipo de trabajo. Para tareas CPU-intensivas: `N_CORES + 1` (o `N_CORES`). Para tareas I/O-intensivas (BD, red): puede ser mayor — una fórmula común es `N_CORES × (1 + tiempo_espera / tiempo_cpu)`.

**4. ¿Cuál es la diferencia entre `Future` y `CompletableFuture`?**  
`Future` es básico: solo puedes bloquear con `get()`, no puedes encadenar operaciones ni manejar errores de forma fluida. `CompletableFuture` es no bloqueante: puedes encadenar transformaciones, combinar múltiples futuros y manejar errores, todo sin bloquear el hilo.

**5. ¿Qué hace `volatile` y para qué NO sirve?**  
`volatile` garantiza visibilidad: todos los hilos ven el valor más reciente de la variable. No garantiza atomicidad. `contador++` con `volatile` sigue siendo una race condition porque es una operación de tres pasos (leer, sumar, escribir). Para eso necesitas `AtomicInteger` o `synchronized`.

**6. ¿Qué es el `ForkJoinPool` y cuándo lo usarías?**  
Es el pool usado internamente por `CompletableFuture` y streams paralelos. Usa work-stealing: hilos sin trabajo roban tareas de otros. Ideal para tareas recursivas divide-y-vencerás. Para la mayoría de casos de negocio, usar un `ExecutorService` dedicado es más predecible.

**7. ¿Cómo manejarías timeouts en operaciones asíncronas?**  
Con `CompletableFuture` puedes usar `orTimeout(5, TimeUnit.SECONDS)` (Java 9+) o `completeOnTimeout(defaultValue, 5, TimeUnit.SECONDS)`. Con `Future.get(5, TimeUnit.SECONDS)` lanza `TimeoutException` si no termina a tiempo.

---

## Métricas de la semana 7

| Métrica | Meta | Tu resultado |
|---|---|---|
| Ejercicios de concurrencia resueltos | 5 o más | |
| Race condition identificada y corregida | Sí / No | |
| Proyecto procesador de tareas: corre sin errores | Sí / No | |
| CompletableFuture encadenado funciona | Sí / No | |
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

> **La semana que viene — Semana 8:** SQL Avanzado · Window Functions · Índices · Optimización · Execution Plans  
> *Tu código ya es concurrente. Ahora tu base de datos también debe serlo.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

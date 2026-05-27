# Semana 5 — APIs REST · Spring Boot · JPA

> **Fase 2 — Nivel Profesional** · Programa Intensivo Java Backend Developer  
> Tema central: **Controllers · Services · Repositories · Entidades · Relaciones JPA**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Fundamentos REST + Spring Boot + primera API | Teoría + setup + primer endpoint |
| Martes | Capas: Controller → Service → Repository | Arquitectura en 3 capas |
| Miércoles | JPA: entidades, anotaciones, operaciones básicas | Persistencia con base de datos |
| Jueves | Relaciones JPA: OneToMany, ManyToOne, ManyToMany | Relaciones entre tablas |
| Viernes | Simulación cronometrada: CRUD completo | Prueba técnica real |
| Sábado | Proyecto: API REST de gestión de empleados completa | Integración total |
| Domingo | Repaso completo + pruebas con Postman | Verificación sin código |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Explicar qué es REST y por qué se usa.
- Construir una API con Spring Boot desde cero.
- Separar responsabilidades en Controller, Service y Repository.
- Persistir datos en base de datos con JPA/Hibernate.
- Modelar relaciones entre entidades.
- Probar todos los endpoints con Postman.

---

# LUNES — Fundamentos REST y Spring Boot

## ¿Qué es REST?

REST (Representational State Transfer) es un **estilo arquitectónico** para diseñar APIs que usan HTTP como protocolo de comunicación. Una API REST expone **recursos** (datos) mediante URLs y opera sobre ellos con los **verbos HTTP**.

```
Recurso: Empleado
URL base: /api/empleados

GET    /api/empleados          → listar todos
GET    /api/empleados/{id}     → obtener uno
POST   /api/empleados          → crear nuevo
PUT    /api/empleados/{id}     → actualizar completo
PATCH  /api/empleados/{id}     → actualizar parcial
DELETE /api/empleados/{id}     → eliminar
```

---

## Códigos de respuesta HTTP — los que debes memorizar

| Código | Significado | Cuándo usarlo |
|---|---|---|
| `200 OK` | Éxito general | GET, PUT, PATCH exitosos |
| `201 Created` | Recurso creado | POST exitoso |
| `204 No Content` | Éxito sin cuerpo | DELETE exitoso |
| `400 Bad Request` | Datos inválidos del cliente | Validación fallida |
| `401 Unauthorized` | No autenticado | Sin token o token inválido |
| `403 Forbidden` | Autenticado pero sin permiso | Rol insuficiente |
| `404 Not Found` | Recurso no existe | ID inexistente |
| `409 Conflict` | Conflicto de estado | Duplicado, email ya existe |
| `500 Internal Server Error` | Error del servidor | Exception no manejada |

---

## Configurar un proyecto Spring Boot

### Dependencias en `pom.xml`

```xml
<dependencies>

    <!-- Web: para crear controllers REST -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- JPA: para persistencia con base de datos -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- H2: base de datos en memoria (para desarrollo y pruebas) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Validation: para @NotNull, @Size, @Email, etc. -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

</dependencies>
```

### `application.properties`

```properties
# Nombre de la app
spring.application.name=empleados-api

# H2 en memoria (desarrollo)
spring.datasource.url=jdbc:h2:mem:empleadosdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Consola H2 (útil para ver los datos durante desarrollo)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

---

## Primer controller — Hola Mundo REST

```java
package com.empresa.api.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController                    // @Controller + @ResponseBody
@RequestMapping("/api")            // prefijo de todas las rutas
public class HolaController {

    @GetMapping("/hola")
    public ResponseEntity<String> hola() {
        return ResponseEntity.ok("¡Hola desde Spring Boot!");
    }

    @GetMapping("/hola/{nombre}")
    public ResponseEntity<String> holaNombre(@PathVariable String nombre) {
        return ResponseEntity.ok("¡Hola, " + nombre + "!");
    }

    @GetMapping("/suma")
    public ResponseEntity<Integer> suma(
            @RequestParam int a,
            @RequestParam int b) {
        return ResponseEntity.ok(a + b);
    }
}
```

```
Probar en Postman o navegador:
GET http://localhost:8080/api/hola             → "¡Hola desde Spring Boot!"
GET http://localhost:8080/api/hola/Emmanuel    → "¡Hola, Emmanuel!"
GET http://localhost:8080/api/suma?a=10&b=5   → 15
```

---

## Anotaciones clave de Spring MVC

```java
@RestController     // marca la clase como controller que retorna JSON
@RequestMapping     // mapea rutas a nivel de clase
@GetMapping         // HTTP GET
@PostMapping        // HTTP POST
@PutMapping         // HTTP PUT
@DeleteMapping      // HTTP DELETE
@PatchMapping       // HTTP PATCH

@PathVariable       // extrae variable de la URL: /empleados/{id}
@RequestParam       // extrae parámetro de query: ?nombre=Ana
@RequestBody        // deserializa el JSON del body en un objeto Java
```

---

# MARTES — Arquitectura en 3 Capas

## ¿Por qué separar en capas?

Cada capa tiene **una sola responsabilidad**. Cambiar la base de datos no afecta al controller. Cambiar la lógica de negocio no afecta a la base de datos. El código se vuelve testeable, mantenible y escalable.

```
Flujo de una petición:

Cliente (Postman/Browser)
        ↓  HTTP Request
   ┌────────────┐
   │ Controller │  ← recibe la petición, valida el formato, retorna respuesta HTTP
   └─────┬──────┘
         ↓  llama a
   ┌─────────────┐
   │   Service   │  ← lógica de negocio, validaciones, transformaciones
   └─────┬───────┘
         ↓  llama a
   ┌──────────────┐
   │  Repository  │  ← acceso a base de datos (CRUD)
   └─────┬────────┘
         ↓
   ┌──────────┐
   │    BD    │
   └──────────┘
```

---

## Estructura de paquetes

```
src/main/java/com/empresa/api/
├── EmpleadosApiApplication.java     ← clase main
├── controller/
│   └── EmpleadoController.java
├── service/
│   ├── EmpleadoService.java         ← interfaz
│   └── EmpleadoServiceImpl.java     ← implementación
├── repository/
│   └── EmpleadoRepository.java
├── model/
│   └── Empleado.java                ← entidad JPA
├── dto/
│   ├── EmpleadoRequestDTO.java      ← lo que recibe la API
│   └── EmpleadoResponseDTO.java     ← lo que retorna la API
└── exception/
    ├── GlobalExceptionHandler.java
    └── ResourceNotFoundException.java
```

---

## DTO — Data Transfer Object

Los DTOs separan el modelo interno (entidad JPA) de lo que expones hacia afuera. Nunca expongas tu entidad directamente — puede tener campos sensibles o relaciones circulares.

```java
// Lo que RECIBE la API (del cliente)
public class EmpleadoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Email(message = "Email inválido")
    @NotBlank(message = "El email es obligatorio")
    private String email;

    @Positive(message = "El salario debe ser positivo")
    private double salario;

    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;

    // Getters y setters
    public String getNombre()      { return nombre; }
    public String getEmail()       { return email; }
    public double getSalario()     { return salario; }
    public String getDepartamento(){ return departamento; }

    public void setNombre(String n)      { this.nombre = n; }
    public void setEmail(String e)       { this.email = e; }
    public void setSalario(double s)     { this.salario = s; }
    public void setDepartamento(String d){ this.departamento = d; }
}

// Lo que RETORNA la API (al cliente)
public class EmpleadoResponseDTO {
    private Long   id;
    private String nombre;
    private String email;
    private double salario;
    private String departamento;

    // Constructor
    public EmpleadoResponseDTO(Long id, String nombre, String email,
                                double salario, String departamento) {
        this.id           = id;
        this.nombre       = nombre;
        this.email        = email;
        this.salario      = salario;
        this.departamento = departamento;
    }

    // Getters
    public Long   getId()           { return id; }
    public String getNombre()       { return nombre; }
    public String getEmail()        { return email; }
    public double getSalario()      { return salario; }
    public String getDepartamento() { return departamento; }
}
```

---

## Excepción de recurso no encontrado

```java
// exception/ResourceNotFoundException.java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String recurso, Long id) {
        super(recurso + " no encontrado con id: " + id);
    }
}
```

---

## Manejador global de excepciones

```java
// exception/GlobalExceptionHandler.java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Maneja errores de validación (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo   = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            errores.put(campo, mensaje);
        });
        return ResponseEntity.badRequest().body(errores);
    }

    // Maneja recurso no encontrado
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", ex.getMessage()));
    }

    // Maneja cualquier otra excepción
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Error interno: " + ex.getMessage()));
    }
}
```

---

# MIÉRCOLES — JPA: Entidades y Repositorios

## ¿Qué es JPA?

JPA (Java Persistence API) es la especificación estándar de Java para mapear objetos Java a tablas de base de datos. Hibernate es la implementación más usada. Spring Data JPA agrega una capa encima que reduce el código a casi cero.

```
Java Object  ←→  JPA/Hibernate  ←→  Base de Datos
Empleado     ←→  @Entity         ←→  tabla empleados
campo id     ←→  @Id             ←→  columna id (PRIMARY KEY)
campo nombre ←→  @Column         ←→  columna nombre
```

---

## Entidad JPA completa

```java
// model/Empleado.java
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "empleados")
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @NotBlank
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    @Email
    private String email;

    @Column(nullable = false)
    @Positive
    private double salario;

    @Column(nullable = false, length = 80)
    private String departamento;

    // Constructor vacío — requerido por JPA
    public Empleado() {}

    // Constructor completo
    public Empleado(String nombre, String email,
                    double salario, String departamento) {
        this.nombre       = nombre;
        this.email        = email;
        this.salario      = salario;
        this.departamento = departamento;
    }

    // Getters y Setters
    public Long   getId()           { return id; }
    public String getNombre()       { return nombre; }
    public String getEmail()        { return email; }
    public double getSalario()      { return salario; }
    public String getDepartamento() { return departamento; }

    public void setId(Long id)               { this.id = id; }
    public void setNombre(String nombre)     { this.nombre = nombre; }
    public void setEmail(String email)       { this.email = email; }
    public void setSalario(double salario)   { this.salario = salario; }
    public void setDepartamento(String dep)  { this.departamento = dep; }
}
```

---

## Repository — acceso a base de datos

```java
// repository/EmpleadoRepository.java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    // Spring Data genera el SQL automáticamente por el nombre del método
    Optional<Empleado> findByEmail(String email);
    List<Empleado>     findByDepartamento(String departamento);
    List<Empleado>     findBySalarioGreaterThan(double salario);
    boolean            existsByEmail(String email);

    // JPQL — consulta en Java (sobre entidades, no tablas)
    @Query("SELECT e FROM Empleado e WHERE e.salario > :salario " +
           "ORDER BY e.salario DESC")
    List<Empleado> findTopEarners(double salario);

    // SQL nativo — cuando necesitas features específicos de la BD
    @Query(value = "SELECT * FROM empleados WHERE departamento = :dept " +
                   "ORDER BY salario DESC LIMIT :top",
           nativeQuery = true)
    List<Empleado> findTopByDepartamento(String dept, int top);
}
```

> **Spring Data JPA magic:** `findByNombreContaining`, `findByDepartamentoAndSalarioGreaterThan`, `countByDepartamento`... Solo escribes el nombre del método siguiendo la convención y Spring genera el SQL.

---

## Service — lógica de negocio

```java
// service/EmpleadoService.java
import java.util.List;

public interface EmpleadoService {
    List<EmpleadoResponseDTO> listarTodos();
    EmpleadoResponseDTO       obtenerPorId(Long id);
    EmpleadoResponseDTO       crear(EmpleadoRequestDTO dto);
    EmpleadoResponseDTO       actualizar(Long id, EmpleadoRequestDTO dto);
    void                      eliminar(Long id);
}
```

```java
// service/EmpleadoServiceImpl.java
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpleadoServiceImpl implements EmpleadoService {

    private final EmpleadoRepository repo;

    // Inyección por constructor (mejor práctica)
    public EmpleadoServiceImpl(EmpleadoRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<EmpleadoResponseDTO> listarTodos() {
        return repo.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public EmpleadoResponseDTO obtenerPorId(Long id) {
        Empleado emp = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", id));
        return toDTO(emp);
    }

    @Override
    public EmpleadoResponseDTO crear(EmpleadoRequestDTO dto) {
        if (repo.existsByEmail(dto.getEmail()))
            throw new RuntimeException("Email ya registrado: " + dto.getEmail());

        Empleado nuevo = new Empleado(
            dto.getNombre(), dto.getEmail(),
            dto.getSalario(), dto.getDepartamento()
        );
        return toDTO(repo.save(nuevo));
    }

    @Override
    public EmpleadoResponseDTO actualizar(Long id, EmpleadoRequestDTO dto) {
        Empleado emp = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Empleado", id));

        emp.setNombre(dto.getNombre());
        emp.setSalario(dto.getSalario());
        emp.setDepartamento(dto.getDepartamento());
        // No actualizamos email para evitar duplicados

        return toDTO(repo.save(emp));
    }

    @Override
    public void eliminar(Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Empleado", id);
        repo.deleteById(id);
    }

    // Método privado de mapeo Entidad → DTO
    private EmpleadoResponseDTO toDTO(Empleado e) {
        return new EmpleadoResponseDTO(
            e.getId(), e.getNombre(), e.getEmail(),
            e.getSalario(), e.getDepartamento()
        );
    }
}
```

---

## Controller — capa HTTP

```java
// controller/EmpleadoController.java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoService service;

    public EmpleadoController(EmpleadoService service) {
        this.service = service;
    }

    // GET /api/empleados
    @GetMapping
    public ResponseEntity<List<EmpleadoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // GET /api/empleados/{id}
    @GetMapping("/{id}")
    public ResponseEntity<EmpleadoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // POST /api/empleados
    @PostMapping
    public ResponseEntity<EmpleadoResponseDTO> crear(
            @Valid @RequestBody EmpleadoRequestDTO dto) {
        EmpleadoResponseDTO creado = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // PUT /api/empleados/{id}
    @PutMapping("/{id}")
    public ResponseEntity<EmpleadoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EmpleadoRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }

    // DELETE /api/empleados/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

# JUEVES — Relaciones JPA

## OneToMany / ManyToOne

Un departamento tiene muchos empleados. Un empleado pertenece a un departamento.

```java
// model/Departamento.java
@Entity
@Table(name = "departamentos")
public class Departamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    // Un departamento tiene muchos empleados
    // mappedBy indica que Empleado es el "dueño" de la relación
    @OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL,
               fetch = FetchType.LAZY)
    private List<Empleado> empleados = new ArrayList<>();

    // Constructor vacío + getters + setters
    public Departamento() {}
    public Departamento(String nombre) { this.nombre = nombre; }

    public Long   getId()                        { return id; }
    public String getNombre()                    { return nombre; }
    public List<Empleado> getEmpleados()         { return empleados; }
    public void setNombre(String nombre)         { this.nombre = nombre; }
    public void setEmpleados(List<Empleado> emp) { this.empleados = emp; }
}
```

```java
// Actualizar Empleado para la relación ManyToOne
@Entity
@Table(name = "empleados")
public class Empleado {

    // ... campos anteriores ...

    // Muchos empleados pertenecen a un departamento
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    public Departamento getDepartamento() { return departamento; }
    public void setDepartamento(Departamento dep) { this.departamento = dep; }
}
```

---

## ManyToMany

Un empleado puede estar en varios proyectos. Un proyecto puede tener varios empleados.

```java
// model/Proyecto.java
@Entity
@Table(name = "proyectos")
public class Proyecto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private double presupuesto;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "empleado_proyecto",              // tabla intermedia
        joinColumns = @JoinColumn(name = "proyecto_id"),
        inverseJoinColumns = @JoinColumn(name = "empleado_id")
    )
    private List<Empleado> empleados = new ArrayList<>();

    // Constructor, getters, setters...
    public Proyecto() {}
    public Proyecto(String nombre, double presupuesto) {
        this.nombre = nombre;
        this.presupuesto = presupuesto;
    }

    public Long   getId()                         { return id; }
    public String getNombre()                     { return nombre; }
    public double getPresupuesto()                { return presupuesto; }
    public List<Empleado> getEmpleados()          { return empleados; }
    public void setNombre(String n)               { this.nombre = n; }
    public void setPresupuesto(double p)          { this.presupuesto = p; }
    public void setEmpleados(List<Empleado> emps) { this.empleados = emps; }
}
```

---

## Fetch types — LAZY vs EAGER

```java
// LAZY (recomendado): carga los datos relacionados solo cuando los accedes
@OneToMany(fetch = FetchType.LAZY)
// → Solo carga los empleados cuando llamas getDepartamento().getEmpleados()

// EAGER: carga los datos relacionados siempre, aunque no los necesites
@OneToMany(fetch = FetchType.EAGER)
// → Siempre carga todos los empleados al cargar el departamento
// → Puede causar problemas de rendimiento con muchos datos
```

> **Regla práctica:** usa siempre `LAZY` por defecto. Usa `EAGER` solo si siempre necesitas los datos relacionados en cada consulta.

---

## CascadeType — cuándo propagaroperaciones

```java
// CascadeType.ALL: todas las operaciones se propagan al hijo
@OneToMany(mappedBy = "departamento", cascade = CascadeType.ALL)
// → Si guardas un Departamento con empleados nuevos, los empleados también se guardan
// → Si eliminas el departamento, sus empleados también se eliminan

// CascadeType.PERSIST: solo propaga el save()
@OneToMany(mappedBy = "departamento", cascade = CascadeType.PERSIST)

// Más común en producción: ninguno, manejar manualmente
@OneToMany(mappedBy = "departamento")
```

---

## Repositorios con relaciones

```java
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    // Buscar empleados de un departamento específico
    List<Empleado> findByDepartamentoId(Long departamentoId);

    // Buscar empleados de un departamento por nombre
    List<Empleado> findByDepartamentoNombre(String nombreDepto);

    // Con JPQL y JOIN
    @Query("SELECT e FROM Empleado e JOIN e.departamento d " +
           "WHERE d.nombre = :depto AND e.salario > :salario")
    List<Empleado> findByDeptoAndSalario(String depto, double salario);
}
```

---

# VIERNES — Simulación CRUD Completo

> Construye este CRUD desde cero sin ver los apuntes. Tiempo: 60 minutos.

## Especificación: API de Productos

```
Entidad: Producto
Campos:  id (auto), nombre, descripcion, precio, stock, categoria

Endpoints requeridos:
GET    /api/productos              → lista todos
GET    /api/productos/{id}         → uno por id
GET    /api/productos/categoria/{cat} → filtrar por categoría
POST   /api/productos              → crear (validar precio > 0, stock >= 0)
PUT    /api/productos/{id}         → actualizar completo
PATCH  /api/productos/{id}/stock   → actualizar solo el stock
DELETE /api/productos/{id}         → eliminar
GET    /api/productos/bajo-stock   → productos con stock < 5
```

## Solución completa

### Entidad

```java
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false)
    @Positive(message = "El precio debe ser positivo")
    private double precio;

    @Column(nullable = false)
    @Min(value = 0, message = "El stock no puede ser negativo")
    private int stock;

    @Column(nullable = false, length = 80)
    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    public Producto() {}
    public Producto(String nombre, String descripcion,
                    double precio, int stock, String categoria) {
        this.nombre      = nombre;
        this.descripcion = descripcion;
        this.precio      = precio;
        this.stock       = stock;
        this.categoria   = categoria;
    }

    public Long   getId()          { return id; }
    public String getNombre()      { return nombre; }
    public String getDescripcion() { return descripcion; }
    public double getPrecio()      { return precio; }
    public int    getStock()       { return stock; }
    public String getCategoria()   { return categoria; }

    public void setId(Long id)              { this.id = id; }
    public void setNombre(String n)         { this.nombre = n; }
    public void setDescripcion(String d)    { this.descripcion = d; }
    public void setPrecio(double p)         { this.precio = p; }
    public void setStock(int s)             { this.stock = s; }
    public void setCategoria(String c)      { this.categoria = c; }
}
```

### Repository

```java
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoria(String categoria);
    List<Producto> findByStockLessThan(int stock);
    boolean        existsByNombre(String nombre);
}
```

### Service

```java
@Service
public class ProductoService {

    private final ProductoRepository repo;

    public ProductoService(ProductoRepository repo) { this.repo = repo; }

    public List<Producto> listarTodos()                     { return repo.findAll(); }
    public List<Producto> porCategoria(String cat)          { return repo.findByCategoria(cat); }
    public List<Producto> bajosDeStock()                    { return repo.findByStockLessThan(5); }

    public Producto obtenerPorId(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    public Producto crear(Producto p) {
        if (repo.existsByNombre(p.getNombre()))
            throw new RuntimeException("Ya existe un producto con ese nombre.");
        return repo.save(p);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto existente = obtenerPorId(id);
        existente.setNombre(datos.getNombre());
        existente.setDescripcion(datos.getDescripcion());
        existente.setPrecio(datos.getPrecio());
        existente.setStock(datos.getStock());
        existente.setCategoria(datos.getCategoria());
        return repo.save(existente);
    }

    public Producto actualizarStock(Long id, int nuevoStock) {
        if (nuevoStock < 0)
            throw new IllegalArgumentException("Stock no puede ser negativo.");
        Producto p = obtenerPorId(id);
        p.setStock(nuevoStock);
        return repo.save(p);
    }

    public void eliminar(Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Producto", id);
        repo.deleteById(id);
    }
}
```

### Controller

```java
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @GetMapping("/categoria/{cat}")
    public ResponseEntity<List<Producto>> porCategoria(@PathVariable String cat) {
        return ResponseEntity.ok(service.porCategoria(cat));
    }

    @GetMapping("/bajo-stock")
    public ResponseEntity<List<Producto>> bajoStock() {
        return ResponseEntity.ok(service.bajosDeStock());
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@Valid @RequestBody Producto p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(
            @PathVariable Long id, @Valid @RequestBody Producto p) {
        return ResponseEntity.ok(service.actualizar(id, p));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Producto> actualizarStock(
            @PathVariable Long id,
            @RequestParam int stock) {
        return ResponseEntity.ok(service.actualizarStock(id, stock));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

# SÁBADO — Proyecto: API de Gestión de Empleados

## Especificación completa

```
Entidades:
  Departamento  (id, nombre, ciudad)
  Empleado      (id, nombre, email, salario, departamento → ManyToOne)

Endpoints Departamento:
  GET    /api/departamentos
  GET    /api/departamentos/{id}
  GET    /api/departamentos/{id}/empleados
  POST   /api/departamentos
  DELETE /api/departamentos/{id}

Endpoints Empleado:
  GET    /api/empleados
  GET    /api/empleados/{id}
  GET    /api/empleados/departamento/{deptoId}
  POST   /api/empleados
  PUT    /api/empleados/{id}
  DELETE /api/empleados/{id}
  GET    /api/empleados/top-salarios          → top 5 mejor pagados
  GET    /api/empleados/resumen               → total, promedio, max, min
```

## Respuesta de resumen salarial

```java
// DTO para el resumen
public class ResumenSalarialDTO {
    private long   totalEmpleados;
    private double promedioSalario;
    private double salarioMaximo;
    private double salarioMinimo;
    private double totalNomina;

    public ResumenSalarialDTO(long total, double promedio,
                               double max, double min, double nomina) {
        this.totalEmpleados  = total;
        this.promedioSalario = promedio;
        this.salarioMaximo   = max;
        this.salarioMinimo   = min;
        this.totalNomina     = nomina;
    }

    // Getters
    public long   getTotalEmpleados()  { return totalEmpleados; }
    public double getPromedioSalario() { return promedioSalario; }
    public double getSalarioMaximo()   { return salarioMaximo; }
    public double getSalarioMinimo()   { return salarioMinimo; }
    public double getTotalNomina()     { return totalNomina; }
}
```

```java
// En el Service:
public ResumenSalarialDTO obtenerResumen() {
    List<Empleado> todos = repo.findAll();
    if (todos.isEmpty())
        return new ResumenSalarialDTO(0, 0, 0, 0, 0);

    DoubleSummaryStatistics stats = todos.stream()
        .mapToDouble(Empleado::getSalario)
        .summaryStatistics();

    return new ResumenSalarialDTO(
        stats.getCount(),
        stats.getAverage(),
        stats.getMax(),
        stats.getMin(),
        stats.getSum()
    );
}
```

---

# DOMINGO — Repaso + Pruebas con Postman

## Lista de verificación

- [ ] Entiendo la diferencia entre @Controller y @RestController.
- [ ] Sé para qué sirve cada capa: Controller, Service, Repository.
- [ ] Puedo crear una entidad JPA con las anotaciones correctas.
- [ ] Entiendo la diferencia entre LAZY y EAGER.
- [ ] Sé cuándo usar CascadeType.ALL y cuándo no.
- [ ] Puedo agregar métodos de búsqueda en el Repository por convención de nombres.
- [ ] Sé la diferencia entre @PathVariable, @RequestParam y @RequestBody.
- [ ] El proyecto del sábado responde correctamente a todos los endpoints.

## Colección de pruebas Postman — Semana 5

```
### Listar todos
GET http://localhost:8080/api/empleados

### Obtener por ID
GET http://localhost:8080/api/empleados/1

### Crear empleado
POST http://localhost:8080/api/empleados
Content-Type: application/json

{
  "nombre": "Emmanuel Hernández",
  "email": "emmanuel@empresa.com",
  "salario": 18000,
  "departamento": "Backend"
}

### Actualizar
PUT http://localhost:8080/api/empleados/1
Content-Type: application/json

{
  "nombre": "Emmanuel H.",
  "email": "emmanuel@empresa.com",
  "salario": 20000,
  "departamento": "Backend Senior"
}

### Eliminar
DELETE http://localhost:8080/api/empleados/1

### ID inexistente — debe retornar 404
GET http://localhost:8080/api/empleados/999

### Datos inválidos — debe retornar 400
POST http://localhost:8080/api/empleados
Content-Type: application/json

{
  "nombre": "",
  "email": "no-es-email",
  "salario": -500
}
```

---

## Métricas de la semana 5

| Métrica | Meta | Tu resultado |
|---|---|---|
| Endpoints implementados | 10 o más | |
| Errores HTTP correctos retornados | 400, 404, 201, 204 | |
| Validaciones con @Valid funcionando | Sí / No | |
| Proyecto sábado: todos los endpoints responden | Sí / No | |
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

## Preguntas de entrevista frecuentes — Semana 5

1. **¿Qué diferencia hay entre @Component, @Service y @Repository?**  
   Son lo mismo funcionalmente (todas registran un bean en el contexto de Spring), pero comunican intención: `@Service` para lógica de negocio, `@Repository` para acceso a datos (además agrega traducción de excepciones JPA), `@Component` para beans genéricos.

2. **¿Qué es la inyección de dependencias?**  
   Es el patrón donde el framework crea y provee los objetos que una clase necesita en lugar de que la clase los cree ella misma. Spring lo hace automáticamente con `@Autowired` o mediante constructores.

3. **¿Por qué usar inyección por constructor en lugar de @Autowired en el campo?**  
   La inyección por constructor hace las dependencias explícitas, facilita el testing (puedes pasar mocks), y marca el campo como `final` (inmutable).

4. **¿Qué es JPA y qué es Hibernate?**  
   JPA es la especificación (interfaz), Hibernate es la implementación. Spring Boot usa Hibernate como proveedor JPA por defecto.

5. **¿Cuándo usarías `@Query` en lugar de los métodos por convención?**  
   Cuando la consulta es compleja, involucra múltiples joins, o los métodos por convención generarían un nombre demasiado largo y difícil de leer.

---

> **La semana que viene — Semana 6:** JWT · Spring Security · Autenticación · Autorización · Roles  
> *Tu API ahora tiene endpoints. La semana que viene tendrán seguridad.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

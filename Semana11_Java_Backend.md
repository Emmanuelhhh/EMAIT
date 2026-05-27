# Semana 11 — Arquitectura Backend
## Fase 3 · Nivel Senior

---

## Lunes — Microservicios: Principios y Descomposición

### ¿Qué es una arquitectura de microservicios?
Una arquitectura de microservicios divide una aplicación en **servicios pequeños, independientes y desplegables** que se comunican a través de APIs bien definidas. Cada servicio es responsable de un dominio de negocio específico.

### Comparación Monolito vs Microservicios

| Aspecto | Monolito | Microservicios |
|---|---|---|
| Despliegue | Una sola unidad | Independiente por servicio |
| Escalado | Escala todo | Escala lo necesario |
| Tecnología | Una sola stack | Polyglot (cada servicio elige) |
| Fallos | Un fallo puede tumbar todo | Fallos aislados |
| Complejidad | Simple al inicio | Distribuida por diseño |
| Equipo | Cualquier tamaño | Ideal: regla de las 2 pizzas |

### Principios clave (IDEALS)

**I** — Interface segregation (APIs pequeñas y cohesivas)
**D** — Deployability (desplegable de forma independiente)
**E** — Event-driven (comunicación asíncrona cuando sea posible)
**A** — Availability over consistency (CAP theorem)
**L** — Loose coupling (acoplamiento mínimo entre servicios)
**S** — Single responsibility (un servicio, un bounded context)

### Estrategias de descomposición

#### 1. Por capacidad de negocio (Business Capability)
```
E-Commerce:
├── Servicio de Usuarios       → gestiona cuentas, autenticación
├── Servicio de Catálogo       → productos, categorías, precios
├── Servicio de Pedidos        → carrito, checkout, estados
├── Servicio de Pagos          → procesamiento, reembolsos
├── Servicio de Inventario     → stock, reservas
└── Servicio de Notificaciones → emails, SMS, push
```

#### 2. Por Bounded Context (Domain-Driven Design)
Cada microservicio corresponde a un **Bounded Context** del dominio:
- Cada contexto tiene su propio modelo de dominio
- Los contextos se comunican a través de interfaces bien definidas
- Evita el modelo de datos compartido

#### 3. Por subdominio
- **Core Domain**: diferenciador del negocio (máxima inversión)
- **Supporting Domain**: necesario pero no diferenciador
- **Generic Domain**: commodity (usar soluciones de terceros)

### Patrones de comunicación

#### Síncrona: REST / gRPC
```java
@Service
public class PedidoService {

    private final RestTemplate restTemplate;
    private final String inventarioUrl;

    public PedidoService(RestTemplate restTemplate,
                         @Value("${inventario.service.url}") String inventarioUrl) {
        this.restTemplate = restTemplate;
        this.inventarioUrl = inventarioUrl;
    }

    public boolean verificarStock(Long productoId, int cantidad) {
        String url = inventarioUrl + "/api/stock/" + productoId;
        StockResponse response = restTemplate.getForObject(url, StockResponse.class);
        return response != null && response.getDisponible() >= cantidad;
    }
}
```

#### Asíncrona: Eventos de dominio
```java
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {
        Pedido pedido = new Pedido(request);
        pedidoRepository.save(pedido);

        eventPublisher.publishEvent(new PedidoCreadoEvent(
            pedido.getId(),
            pedido.getUsuarioId(),
            pedido.getTotal(),
            Instant.now()
        ));

        return pedido;
    }
}

@Component
public class NotificacionListener {

    @EventListener
    public void onPedidoCreado(PedidoCreadoEvent event) {
        emailService.enviarConfirmacion(event.getUsuarioId(), event.getPedidoId());
    }
}
```

### API Gateway
El API Gateway es el **punto de entrada único** para todos los clientes:

```
Cliente → API Gateway → Servicio de Usuarios
                     → Servicio de Catálogo
                     → Servicio de Pedidos
```

Responsabilidades:
- Autenticación y autorización (JWT validation)
- Rate limiting y throttling
- Load balancing
- SSL termination
- Request/Response transformation
- Logging y métricas centralizadas

### Service Discovery
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    hostname: ${spring.application.name}
    prefer-ip-address: true

spring:
  application:
    name: servicio-pedidos
```

---

## Martes — CQRS y Event Sourcing

### CQRS (Command Query Responsibility Segregation)

**Principio**: Separar las operaciones de **escritura** (Commands) de las de **lectura** (Queries) usando modelos diferentes.

```
┌─────────────┐     Commands      ┌──────────────┐
│   Cliente   │ ──────────────→   │ Write Model  │ → BD escritura
│             │                   │ (Dominio)    │
│             │     Queries       ├──────────────┤
│             │ ──────────────→   │  Read Model  │ → BD lectura
└─────────────┘                   │  (Proyecc.)  │
                                  └──────────────┘
                                        ↑
                                   Eventos sincronizan
```

### Implementación CQRS en Spring

```java
// ===== COMMANDS =====
public record CrearProductoCommand(
    String nombre, String descripcion,
    BigDecimal precio, int stock) {}

public record ActualizarPrecioCommand(UUID productoId, BigDecimal nuevoPrecio) {}

// ===== COMMAND HANDLER =====
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoCommandHandler {

    private final ProductoRepository productoRepository;
    private final EventPublisher eventPublisher;

    public UUID handle(CrearProductoCommand cmd) {
        Producto producto = new Producto(
            cmd.nombre(), cmd.descripcion(), cmd.precio(), cmd.stock());
        productoRepository.save(producto);

        eventPublisher.publish(new ProductoCreadoEvent(
            producto.getId(), cmd.nombre(), cmd.precio()));

        return producto.getId();
    }

    public void handle(ActualizarPrecioCommand cmd) {
        Producto producto = productoRepository.findById(cmd.productoId())
            .orElseThrow(() -> new ProductoNoEncontradoException(cmd.productoId()));

        BigDecimal precioAnterior = producto.getPrecio();
        producto.actualizarPrecio(cmd.nuevoPrecio());
        productoRepository.save(producto);

        eventPublisher.publish(new PrecioActualizadoEvent(
            cmd.productoId(), precioAnterior, cmd.nuevoPrecio()));
    }
}

// ===== QUERY HANDLER =====
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoQueryHandler {

    private final ProductoVistaRepository vistaRepository;

    public Page<ProductoVista> handle(BuscarProductosQuery query) {
        return vistaRepository.buscarConFiltros(
            query.categoria(), query.precioMin(), query.precioMax(),
            PageRequest.of(query.pagina(), query.tamano()));
    }
}
```

### Event Sourcing

En lugar de guardar el **estado actual**, guardamos todos los **eventos** que llevaron a ese estado.

```java
public class CuentaBancaria {

    private UUID id;
    private String titular;
    private BigDecimal saldo;
    private List<DomainEvent> cambiosPendientes = new ArrayList<>();

    public static CuentaBancaria reconstituir(List<DomainEvent> eventos) {
        CuentaBancaria cuenta = new CuentaBancaria();
        eventos.forEach(cuenta::apply);
        return cuenta;
    }

    public void depositar(BigDecimal monto, String descripcion) {
        if (monto.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Monto debe ser positivo");
        apply(new DepositoRealizadoEvent(this.id, monto, descripcion, Instant.now()));
    }

    public void retirar(BigDecimal monto, String descripcion) {
        if (monto.compareTo(this.saldo) > 0)
            throw new SaldoInsuficienteException(this.saldo, monto);
        apply(new RetiroRealizadoEvent(this.id, monto, descripcion, Instant.now()));
    }

    private void apply(DomainEvent evento) {
        if (evento instanceof CuentaCreadaEvent e) {
            this.id = e.cuentaId();
            this.titular = e.titular();
            this.saldo = BigDecimal.ZERO;
        } else if (evento instanceof DepositoRealizadoEvent e) {
            this.saldo = this.saldo.add(e.monto());
        } else if (evento instanceof RetiroRealizadoEvent e) {
            this.saldo = this.saldo.subtract(e.monto());
        }
        this.cambiosPendientes.add(evento);
    }
}
```

### Patrón Saga (transacciones distribuidas)

```java
@Service
@RequiredArgsConstructor
public class PedidoSagaOrquestador {

    public void iniciarSaga(PedidoCreadoEvent evento) {
        try {
            inventarioService.reservar(evento.getItems());
            procesarPago(evento);
        } catch (StockInsuficienteException e) {
            pedidoService.cancelar(evento.getPedidoId(), "Sin stock");
        }
    }

    private void procesarPago(PedidoCreadoEvent evento) {
        try {
            pagoService.procesar(evento.getPedidoId(), evento.getTotal());
            pedidoService.confirmar(evento.getPedidoId());
        } catch (PagoFallidoException e) {
            // Compensación: liberar inventario + cancelar pedido
            inventarioService.liberar(evento.getItems());
            pedidoService.cancelar(evento.getPedidoId(), "Pago fallido");
        }
    }
}
```

---

## Miércoles — API Design Avanzado

### Modelo de Richardson (niveles de madurez REST)

| Nivel | Descripción | Ejemplo |
|---|---|---|
| 0 | HTTP como transporte | POST /api con XML |
| 1 | Recursos | GET /pedidos/123 |
| 2 | Verbos HTTP correctos | PUT /pedidos/123 |
| 3 | HATEOAS | Links en respuesta |

### Endpoints bien diseñados

```java
GET    /api/v1/productos          // listar
POST   /api/v1/productos          // crear
GET    /api/v1/productos/{id}     // obtener uno
PUT    /api/v1/productos/{id}     // reemplazar
PATCH  /api/v1/productos/{id}     // actualización parcial
DELETE /api/v1/productos/{id}     // eliminar

// Relaciones
GET  /api/v1/pedidos/{id}/items
POST /api/v1/pedidos/{id}/items

// Filtros, paginación, ordenamiento
GET /api/v1/productos?categoria=electronica&precioMax=1000&page=0&size=20&sort=precio,asc
```

### Controlador REST profesional

```java
@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoCommandHandler commandHandler;
    private final ProductoQueryHandler queryHandler;

    @GetMapping
    public ResponseEntity<Page<ProductoResponse>> listar(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var query = new BuscarProductosQuery(categoria, precioMin, precioMax, page, size);
        return ResponseEntity.ok(queryHandler.handle(query));
    }

    @PostMapping
    public ResponseEntity<Map<String, UUID>> crear(
            @Valid @RequestBody CrearProductoRequest request) {

        UUID id = commandHandler.handle(request.toCommand());
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest().path("/{id}").buildAndExpand(id).toUri();
        return ResponseEntity.created(location).body(Map.of("id", id));
    }

    @PatchMapping("/{id}/precio")
    public ResponseEntity<Void> actualizarPrecio(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarPrecioRequest request) {

        commandHandler.handle(new ActualizarPrecioCommand(id, request.precio()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable UUID id) {
        commandHandler.eliminar(id);
    }
}
```

### Manejo global de errores

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ProductoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("PRODUCTO_NO_ENCONTRADO", ex.getMessage(), Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errores = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("VALIDACION_FALLIDA", errores.toString(), Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Error inesperado", ex);
        return ResponseEntity.internalServerError()
            .body(new ErrorResponse("ERROR_INTERNO", "Ocurrió un error inesperado", Instant.now()));
    }
}

public record ErrorResponse(String codigo, String mensaje, Instant timestamp) {}
```

### Validaciones con Bean Validation

```java
public record CrearProductoRequest(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 200)
    String nombre,

    @NotBlank
    String descripcion,

    @NotNull
    @DecimalMin(value = "0.01", message = "Precio debe ser mayor a 0")
    BigDecimal precio,

    @Min(value = 0, message = "Stock no puede ser negativo")
    int stock,

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3,20}$", message = "Solo letras mayúsculas")
    String categoria
) {}
```

---

## Jueves — Mensajería Asíncrona con Kafka

### Conceptos clave

```
Producer → Topic (Partitions) → Consumer Group
             ┌──────────────┐
             │  Partition 0 │ ← offset 0,1,2,...
             │  Partition 1 │ ← offset 0,1,2,...
             │  Partition 2 │ ← offset 0,1,2,...
             └──────────────┘
```

- **Topic**: canal de mensajes nombrado
- **Partition**: unidad de paralelismo y ordenamiento
- **Offset**: posición única de un mensaje en una partición
- **Consumer Group**: grupo que se reparte particiones
- **Retention**: mensajes persisten aunque sean consumidos

### Configuración Spring Kafka

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
    consumer:
      group-id: servicio-pedidos
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      auto-offset-reset: earliest
      enable-auto-commit: false
      properties:
        spring.json.trusted.packages: "com.empresa.eventos"
```

### Productor de eventos

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EventoKafkaPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.pedidos}")
    private String topicPedidos;

    public void publicarPedidoCreado(PedidoCreadoEvent evento) {
        String clave = evento.getPedidoId().toString();

        ProducerRecord<String, Object> record =
            new ProducerRecord<>(topicPedidos, clave, evento);

        record.headers().add("evento-tipo", "PEDIDO_CREADO".getBytes());
        record.headers().add("version", "1".getBytes());

        kafkaTemplate.send(record)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Error publicando evento {}: {}",
                        evento.getPedidoId(), ex.getMessage());
                } else {
                    log.info("Evento publicado: partition={}, offset={}",
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });
    }
}
```

### Consumidor con retry y DLQ

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class PedidoEventoConsumer {

    private final InventarioService inventarioService;

    @KafkaListener(
        topics = "${kafka.topics.pedidos}",
        groupId = "servicio-inventario",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumir(
            ConsumerRecord<String, PedidoCreadoEvent> record,
            Acknowledgment acknowledgment) {

        PedidoCreadoEvent evento = record.value();
        log.info("Procesando pedido: {} (offset: {})", evento.getPedidoId(), record.offset());

        try {
            if (!inventarioService.yaFueProcesado(evento.getPedidoId())) {
                inventarioService.reservarStock(evento.getItems());
                inventarioService.marcarComoProcesado(evento.getPedidoId());
            }
            acknowledgment.acknowledge();
        } catch (StockInsuficienteException e) {
            log.warn("Stock insuficiente para pedido {}", evento.getPedidoId());
            acknowledgment.acknowledge(); // Ack para no repetir
        } catch (Exception e) {
            log.error("Error procesando pedido {}", evento.getPedidoId(), e);
            throw e; // No ack → Kafka reintentará
        }
    }
}

@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
            kafkaListenerContainerFactory(
                    ConsumerFactory<String, Object> consumerFactory,
                    KafkaTemplate<String, Object> kafkaTemplate) {

        var factory = new ConcurrentKafkaListenerContainerFactory<String, Object>();
        factory.setConsumerFactory(consumerFactory);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);

        var backOff = new ExponentialBackOffWithMaxRetries(3);
        backOff.setInitialInterval(1000L);
        backOff.setMultiplier(2.0);

        var recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate,
            (r, ex) -> new TopicPartition(r.topic() + ".DLQ", r.partition()));

        factory.setCommonErrorHandler(new DefaultErrorHandler(recoverer, backOff));
        return factory;
    }
}
```

### Outbox Pattern (garantía de entrega)

```java
@Entity
@Table(name = "outbox_eventos")
public class OutboxEvento {
    @Id @GeneratedValue
    private UUID id;
    private String tipo;
    private String agregadoId;
    @Column(columnDefinition = "TEXT")
    private String payload;
    private Instant creadoEn;
    private boolean procesado;
}

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final OutboxRepository outboxRepository;

    public Pedido crearPedido(CrearPedidoRequest req) {
        Pedido pedido = pedidoRepository.save(new Pedido(req));

        // Guardar evento en la MISMA transacción
        outboxRepository.save(new OutboxEvento(
            "PEDIDO_CREADO", pedido.getId().toString(),
            serializar(new PedidoCreadoEvent(pedido))));

        return pedido;
    }
}

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxScheduler {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void publicarEventosPendientes() {
        outboxRepository.findByProcesadoFalse().forEach(evento -> {
            try {
                kafkaTemplate.send("pedidos", evento.getAgregadoId(),
                    evento.getPayload()).get();
                evento.setProcesado(true);
                outboxRepository.save(evento);
            } catch (Exception e) {
                log.error("Fallo publicando evento {}", evento.getId(), e);
            }
        });
    }
}
```

---

## Viernes — Resiliencia: Circuit Breaker y Patrones

### Estados del Circuit Breaker

```
CLOSED → llamadas pasan normalmente
   ↓ (supera umbral de fallos)
OPEN → llamadas se rechazan inmediatamente (fallback)
   ↓ (después del timeout de espera)
HALF_OPEN → permite pocas llamadas de prueba
   ↓ éxito → CLOSED | fallo → OPEN
```

### Resilience4j — Configuración

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventario-service:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 30s
        permitted-calls-in-half-open-state: 3
        slow-call-duration-threshold: 2s
        slow-call-rate-threshold: 80
  retry:
    instances:
      inventario-service:
        max-attempts: 3
        wait-duration: 500ms
        retry-exceptions:
          - java.io.IOException
          - java.net.SocketTimeoutException
  timelimiter:
    instances:
      inventario-service:
        timeout-duration: 3s
  ratelimiter:
    instances:
      api-externa:
        limit-for-period: 100
        limit-refresh-period: 1s
        timeout-duration: 250ms
  bulkhead:
    instances:
      inventario-service:
        max-concurrent-calls: 10
        max-wait-duration: 100ms
```

### Implementación con anotaciones

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class InventarioClient {

    private final RestTemplate restTemplate;

    @CircuitBreaker(name = "inventario-service", fallbackMethod = "fallbackStock")
    @Retry(name = "inventario-service")
    @TimeLimiter(name = "inventario-service")
    public CompletableFuture<StockResponse> consultarStock(Long productoId) {
        return CompletableFuture.supplyAsync(() -> {
            String url = inventarioUrl + "/api/stock/" + productoId;
            return restTemplate.getForObject(url, StockResponse.class);
        });
    }

    public CompletableFuture<StockResponse> fallbackStock(Long productoId, Exception ex) {
        log.warn("Circuito abierto para inventario (producto {}): {}",
            productoId, ex.getMessage());
        return CompletableFuture.completedFuture(
            StockResponse.sinDisponibilidad(productoId));
    }
}

@Service
public class ApiExternaClient {

    @RateLimiter(name = "api-externa", fallbackMethod = "fallbackApiExterna")
    public DatosExternos consultarApi(String parametro) {
        return httpClient.get(parametro);
    }

    public DatosExternos fallbackApiExterna(String parametro, RequestNotPermitted ex) {
        log.warn("Rate limit alcanzado para {}", parametro);
        return DatosExternos.vacio();
    }
}
```

### Cache con Redis

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .withCacheConfiguration("productos", config.entryTtl(Duration.ofMinutes(5)))
            .withCacheConfiguration("usuarios",  config.entryTtl(Duration.ofHours(1)))
            .build();
    }
}

@Service
@RequiredArgsConstructor
public class ProductoService {

    @Cacheable(value = "productos", key = "#id")
    public ProductoResponse obtener(UUID id) {
        return productoRepository.findById(id)
            .map(ProductoResponse::from)
            .orElseThrow(() -> new ProductoNoEncontradoException(id));
    }

    @CacheEvict(value = "productos", key = "#id")
    public void actualizar(UUID id, ActualizarProductoRequest req) { /* ... */ }

    @CachePut(value = "productos", key = "#result.id")
    public ProductoResponse crear(CrearProductoRequest req) {
        Producto p = productoRepository.save(new Producto(req));
        return ProductoResponse.from(p);
    }
}
```

---

## Sábado — Observabilidad: Logs, Métricas y Trazas

### Los tres pilares

```
Observabilidad
├── Logs      → ¿Qué pasó?   (eventos discretos con contexto)
├── Métricas  → ¿Cuánto?     (datos numéricos en el tiempo)
└── Trazas    → ¿Por dónde?  (flujo de una request distribuida)
```

### Logging estructurado

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    public Pedido crearPedido(CrearPedidoRequest req, UUID userId) {
        MDC.put("userId", userId.toString());
        MDC.put("operacion", "crear-pedido");
        long start = System.currentTimeMillis();

        try {
            log.info("Iniciando creación de pedido para usuario {}, items={}",
                userId, req.getItems().size());

            Pedido pedido = procesarPedido(req);

            log.info("Pedido creado: pedidoId={}, total={}, durationMs={}",
                pedido.getId(), pedido.getTotal(), System.currentTimeMillis() - start);

            return pedido;
        } catch (Exception e) {
            log.error("Error creando pedido para usuario {}: {}", userId, e.getMessage(), e);
            throw e;
        } finally {
            MDC.clear();
        }
    }
}
```

### Métricas con Micrometer

```java
@Service
@RequiredArgsConstructor
public class PedidoMetrics {

    private final MeterRegistry meterRegistry;

    @PostConstruct
    public void inicializar() {
        Counter.builder("pedidos.creados.total")
            .description("Total de pedidos creados")
            .tag("servicio", "pedidos")
            .register(meterRegistry);

        DistributionSummary.builder("pedidos.monto")
            .description("Distribución de montos")
            .baseUnit("soles")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(meterRegistry);
    }

    public void registrarPedidoCreado(BigDecimal monto) {
        meterRegistry.counter("pedidos.creados.total").increment();
        meterRegistry.summary("pedidos.monto").record(monto.doubleValue());
    }

    public Pedido procesarConMetrica(Supplier<Pedido> supplier) {
        return Timer.builder("pedidos.procesamiento.duracion")
            .description("Duración del procesamiento")
            .publishPercentileHistogram()
            .register(meterRegistry)
            .record(supplier);
    }
}
```

### Distributed Tracing (Spring Boot 3)

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

```java
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final Tracer tracer;

    public Pedido crearPedido(CrearPedidoRequest req) {
        Span span = tracer.nextSpan().name("validar-inventario").start();
        try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
            span.tag("pedido.items", String.valueOf(req.getItems().size()));
            validarInventario(req.getItems());
            span.event("inventario-validado");
        } finally {
            span.end();
        }
        return procesarPedido(req);
    }
}
```

### Health Checks personalizados

```java
@Component
public class BaseDatosHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            conn.prepareStatement("SELECT 1").execute();
            return Health.up()
                .withDetail("database", "PostgreSQL")
                .withDetail("status", "conectado")
                .build();
        } catch (Exception e) {
            return Health.down().withDetail("error", e.getMessage()).build();
        }
    }
}

@Component
public class KafkaHealthIndicator implements HealthIndicator {

    private final KafkaAdmin kafkaAdmin;

    @Override
    public Health health() {
        try {
            kafkaAdmin.describeTopics("pedidos");
            return Health.up().withDetail("kafka", "conectado").build();
        } catch (Exception e) {
            return Health.down().withDetail("kafka", e.getMessage()).build();
        }
    }
}
```

---

## Domingo — Proyecto: Sistema de Pedidos Distribuido

### Arquitectura del proyecto

```
ArquitecturaDemo/
├── api-gateway/              ← Spring Cloud Gateway
├── servicio-usuarios/        ← Autenticación JWT
├── servicio-catalogo/        ← Productos y categorías
├── servicio-pedidos/         ← Core del negocio (CQRS)
├── servicio-inventario/      ← Stock y reservas
├── servicio-notificaciones/  ← Emails y notificaciones
├── infraestructura/
│   ├── docker-compose.yml
│   ├── kafka/
│   └── prometheus/
└── shared-lib/               ← DTOs y eventos compartidos
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pedidos_db
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'

  prometheus:
    image: prom/prometheus:v2.47.0
    ports:
      - "9090:9090"
    volumes:
      - ./infraestructura/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
```

### Checklist production-ready

```
✅ FUNCIONALIDAD
   □ Endpoints documentados con OpenAPI/Swagger
   □ Validaciones de entrada en todos los controladores
   □ Manejo global de excepciones con códigos de error

✅ RESILIENCIA
   □ Circuit Breakers en todas las llamadas externas
   □ Timeouts configurados (no llamadas sin límite)
   □ Retry con backoff exponencial
   □ Fallbacks implementados y probados
   □ DLQ para mensajes Kafka fallidos
   □ Outbox Pattern para garantía de entrega

✅ OBSERVABILIDAD
   □ Logs estructurados (JSON) con traceId/spanId
   □ Métricas de negocio (pedidos/min, latencia p95, tasa error)
   □ Health checks en /actuator/health
   □ Alertas en Grafana para métricas críticas

✅ SEGURIDAD
   □ JWT validado en API Gateway
   □ Mínimo privilegio en base de datos
   □ Secretos en variables de entorno
   □ HTTPS en producción
   □ Rate limiting en endpoints públicos

✅ DATOS
   □ Migraciones con Flyway/Liquibase
   □ Índices en columnas de búsqueda frecuente
   □ Transacciones con rollback apropiado
   □ Backup y recovery plan

✅ DESPLIEGUE
   □ Dockerfile con multi-stage build
   □ Health check en Docker/K8s
   □ Configuración por variables de entorno
   □ Graceful shutdown implementado
```

### Preguntas de entrevista — Arquitectura

**P: ¿Cómo garantizas que un evento publicado a Kafka llega siempre?**
R: Con el **Outbox Pattern**: guardo el evento en la misma transacción de BD y un scheduler lo publica a Kafka. Si Kafka falla, el scheduler reintenta. Además configuro `acks=all` e idempotencia en el productor para evitar duplicados.

**P: ¿Cuándo usarías CQRS?**
R: Cuando los patrones de lectura y escritura divergen: lecturas complejas con joins que penalizan las escrituras, o necesidad de escalar lecturas independientemente. El coste es mayor complejidad y eventual consistency en el read model.

**P: ¿Cuál es la diferencia entre Circuit Breaker y Retry?**
R: **Retry** intenta la misma operación de nuevo esperando éxito temporal. **Circuit Breaker** deja de intentarlo cuando detecta un patrón de fallos, protegiendo al servicio caído de sobrecarga adicional. Se usan juntos: Retry primero, Circuit Breaker como salvaguarda.

**P: ¿Cómo manejas transacciones en microservicios?**
R: No comparto transacciones entre servicios. Uso el patrón **Saga**: coreografía (eventos) u orquestación (orchestrator) con compensating transactions para deshacer pasos anteriores ante un fallo.

**P: ¿Qué es el Bulkhead pattern?**
R: Aísla recursos (threads, conexiones) entre distintas dependencias. Si el servicio A se satura, no consume los recursos del servicio B. Es como las mamparas de un barco: si una sección se inunda, las demás permanecen seguras.

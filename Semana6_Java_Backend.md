# Semana 6 — JWT · Spring Security · Autenticación · Autorización

> **Fase 2 — Nivel Profesional** · Programa Intensivo Java Backend Developer  
> Tema central: **Spring Security · JWT · Filtros · Roles · Refresh Tokens**

---

## Estructura de la semana

| Día | Tema | Enfoque |
|---|---|---|
| Lunes | Fundamentos de seguridad + Spring Security básico | Conceptos + configuración inicial |
| Martes | JWT: generación, firma y validación | Tokens desde cero |
| Miércoles | Filtro JWT + integración con Spring Security | Pipeline de autenticación |
| Jueves | Autorización por roles + endpoints protegidos | @PreAuthorize, ROLE_ |
| Viernes | Simulación: API segura completa | Prueba técnica real |
| Sábado | Proyecto: sistema de auth completo con refresh token | Integración total |
| Domingo | Repaso + pruebas con Postman + preguntas de entrevista | Verificación |

---

## Objetivo de la semana

Al terminar esta semana debes poder:

- Explicar el flujo completo de autenticación con JWT.
- Configurar Spring Security para proteger endpoints.
- Generar, firmar y validar tokens JWT.
- Implementar un filtro que intercepte cada petición y valide el token.
- Diferenciar roles y restringir acceso por ellos.
- Implementar refresh tokens para renovar sesiones.

---

# LUNES — Fundamentos de Seguridad y Spring Security

## Conceptos clave: Autenticación vs Autorización

```
Autenticación: ¿Quién eres?
  → Verificar identidad: usuario + contraseña → token

Autorización: ¿Qué puedes hacer?
  → Verificar permisos: ¿tiene el rol para acceder a este endpoint?

Flujo completo:
  1. Cliente envía credenciales (POST /auth/login)
  2. Servidor valida y retorna JWT
  3. Cliente guarda el token
  4. En cada petición, cliente envía: Authorization: Bearer <token>
  5. Servidor valida el token y permite o rechaza
```

---

## ¿Qué es JWT?

JWT (JSON Web Token) es un estándar para transmitir información de forma segura entre partes como un objeto JSON firmado digitalmente.

```
Estructura: header.payload.signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    ← header  (Base64)
.
eyJzdWIiOiJhbmFAZW1wcmVzYS5jb20iLCJyb2xlIjoiVVNFUiIsImV4cCI6MTcwMDAwMH0
                                          ← payload (Base64)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                                          ← signature (HMAC-SHA256)
```

```json
// Header decodificado
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload decodificado
{
  "sub": "ana@empresa.com",
  "nombre": "Ana García",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700086400
}
```

> **Importante:** el payload es solo Base64, **no está cifrado**. Cualquiera puede leerlo. La seguridad viene de la **firma** — nadie puede modificar el token sin invalidarlo porque no tienen la clave secreta.

---

## Dependencias en `pom.xml`

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT — librería jjwt -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

---

## `application.properties` — configuración de seguridad

```properties
# Clave secreta para firmar JWT (mínimo 256 bits = 32 caracteres)
# En producción: usar variables de entorno, nunca hardcodear
app.jwt.secret=mi-clave-secreta-super-segura-de-al-menos-32-caracteres-ok
app.jwt.expiration=86400000
# 86400000 ms = 24 horas

app.jwt.refresh-expiration=604800000
# 604800000 ms = 7 días
```

---

## Estructura de paquetes

```
src/main/java/com/empresa/api/
├── security/
│   ├── JwtService.java              ← generar y validar tokens
│   ├── JwtAuthFilter.java           ← filtro que intercepta cada petición
│   ├── SecurityConfig.java          ← configuración principal
│   └── UserDetailsServiceImpl.java  ← cargar usuario desde BD
├── auth/
│   ├── AuthController.java          ← /auth/register, /auth/login
│   ├── AuthService.java
│   ├── LoginRequest.java            ← DTO
│   ├── RegisterRequest.java         ← DTO
│   └── AuthResponse.java            ← DTO
└── model/
    └── Usuario.java                 ← entidad con rol
```

---

## Entidad Usuario

```java
// model/Usuario.java
import jakarta.persistence.*;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;   // almacenado con BCrypt

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    public enum Rol { USER, ADMIN, MODERATOR }

    public Usuario() {}
    public Usuario(String nombre, String email, String password, Rol rol) {
        this.nombre   = nombre;
        this.email    = email;
        this.password = password;
        this.rol      = rol;
    }

    // ── UserDetails — Spring Security los necesita ──────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override public String  getUsername()            { return email; }
    @Override public String  getPassword()            { return password; }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return true; }

    // Getters y setters
    public Long   getId()      { return id; }
    public String getNombre()  { return nombre; }
    public String getEmail()   { return email; }
    public Rol    getRol()     { return rol; }

    public void setId(Long id)            { this.id = id; }
    public void setNombre(String nombre)  { this.nombre = nombre; }
    public void setEmail(String email)    { this.email = email; }
    public void setPassword(String pass)  { this.password = pass; }
    public void setRol(Rol rol)           { this.rol = rol; }
}
```

---

# MARTES — JWT: Generación, Firma y Validación

## JwtService — el corazón del sistema

```java
// security/JwtService.java
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private long expiration;

    // ── Generar token ───────────────────────────────────
    public String generarToken(UserDetails userDetails) {
        return generarToken(new HashMap<>(), userDetails);
    }

    public String generarToken(Map<String, Object> claims,
                                UserDetails userDetails) {
        return Jwts.builder()
            .claims(claims)
            .subject(userDetails.getUsername())       // email
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact();
    }

    // ── Validar token ───────────────────────────────────
    public boolean esTokenValido(String token, UserDetails userDetails) {
        final String username = extraerUsername(token);
        return username.equals(userDetails.getUsername())
            && !estaExpirado(token);
    }

    // ── Extraer datos del token ─────────────────────────
    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    public <T> T extraerClaim(String token,
                               Function<Claims, T> claimsResolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return claimsResolver.apply(claims);
    }

    // ── Internos ────────────────────────────────────────
    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private boolean estaExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

---

## DTOs de autenticación

```java
// auth/RegisterRequest.java
public class RegisterRequest {
    private String nombre;
    private String email;
    private String password;
    private String rol;   // "USER", "ADMIN"

    // Getters y setters
    public String getNombre()   { return nombre; }
    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public String getRol()      { return rol; }

    public void setNombre(String n)   { this.nombre = n; }
    public void setEmail(String e)    { this.email = e; }
    public void setPassword(String p) { this.password = p; }
    public void setRol(String r)      { this.rol = r; }
}

// auth/LoginRequest.java
public class LoginRequest {
    private String email;
    private String password;

    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public void setEmail(String e)    { this.email = e; }
    public void setPassword(String p) { this.password = p; }
}

// auth/AuthResponse.java
public class AuthResponse {
    private String token;
    private String tipo = "Bearer";
    private String email;
    private String rol;

    public AuthResponse(String token, String email, String rol) {
        this.token = token;
        this.email = email;
        this.rol   = rol;
    }

    public String getToken() { return token; }
    public String getTipo()  { return tipo; }
    public String getEmail() { return email; }
    public String getRol()   { return rol; }
}
```

---

## Repository de Usuario

```java
// repository/UsuarioRepository.java
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean           existsByEmail(String email);
}
```

---

## UserDetailsServiceImpl

```java
// security/UserDetailsServiceImpl.java
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository repo;

    public UserDetailsServiceImpl(UsuarioRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {
        return repo.findByEmail(email)
            .orElseThrow(() ->
                new UsernameNotFoundException("Usuario no encontrado: " + email));
    }
}
```

---

# MIÉRCOLES — Filtro JWT y Configuración de Seguridad

## JwtAuthFilter — intercepta cada petición

```java
// security/JwtAuthFilter.java
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService            jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthFilter(JwtService jwtService,
                         UserDetailsServiceImpl userDetailsService) {
        this.jwtService         = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Extraer el header Authorization
        final String authHeader = request.getHeader("Authorization");

        // 2. Si no hay token o no empieza con Bearer, continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer el token (quitar "Bearer ")
        final String jwt      = authHeader.substring(7);
        final String username = jwtService.extraerUsername(jwt);

        // 4. Si tenemos username y aún no está autenticado en el contexto
        if (username != null &&
            SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

            // 5. Validar token
            if (jwtService.esTokenValido(jwt, userDetails)) {

                // 6. Crear objeto de autenticación y registrarlo en el contexto
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                authToken.setDetails(
                    new WebAuthenticationDetailsSource()
                        .buildDetails(request)
                );
                SecurityContextHolder.getContext()
                    .setAuthentication(authToken);
            }
        }

        // 7. Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
```

---

## SecurityConfig — configuración principal

```java
// security/SecurityConfig.java
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.*;
import org.springframework.security.config.annotation.web.builders.*;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity    // habilita @PreAuthorize en los controllers
public class SecurityConfig {

    private final JwtAuthFilter            jwtAuthFilter;
    private final UserDetailsServiceImpl   userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter    = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF (no necesario con JWT stateless)
            .csrf(csrf -> csrf.disable())

            // Definir qué rutas son públicas y cuáles requieren auth
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()      // login y registro: público
                .requestMatchers("/h2-console/**").permitAll() // consola H2: público
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()                 // todo lo demás: requiere token
            )

            // Stateless: no guardar sesión en servidor (JWT lo maneja)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Configurar el proveedor de autenticación
            .authenticationProvider(authenticationProvider())

            // Agregar nuestro filtro JWT ANTES del filtro estándar de usuario/contraseña
            .addFilterBefore(jwtAuthFilter,
                             UsernamePasswordAuthenticationFilter.class)

            // Permitir frames para la consola H2
            .headers(headers -> headers.frameOptions(
                frame -> frame.sameOrigin()
            ));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

# JUEVES — Servicio y Controller de Autenticación + Roles

## AuthService

```java
// auth/AuthService.java
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository      usuarioRepo;
    private final PasswordEncoder        passwordEncoder;
    private final JwtService             jwtService;
    private final AuthenticationManager  authManager;

    public AuthService(UsuarioRepository usuarioRepo,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authManager) {
        this.usuarioRepo     = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService      = jwtService;
        this.authManager     = authManager;
    }

    // ── Registro ────────────────────────────────────────
    public AuthResponse registrar(RegisterRequest req) {
        if (usuarioRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email ya registrado: " + req.getEmail());

        Usuario.Rol rol = req.getRol() != null
            ? Usuario.Rol.valueOf(req.getRol().toUpperCase())
            : Usuario.Rol.USER;

        Usuario usuario = new Usuario(
            req.getNombre(),
            req.getEmail(),
            passwordEncoder.encode(req.getPassword()),  // hashear contraseña
            rol
        );

        usuarioRepo.save(usuario);

        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, usuario.getEmail(), rol.name());
    }

    // ── Login ───────────────────────────────────────────
    public AuthResponse login(LoginRequest req) {
        // AuthenticationManager verifica email + password automáticamente
        // Lanza BadCredentialsException si son incorrectos
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                req.getEmail(),
                req.getPassword()
            )
        );

        Usuario usuario = usuarioRepo.findByEmail(req.getEmail())
            .orElseThrow(() ->
                new RuntimeException("Usuario no encontrado"));

        String token = jwtService.generarToken(usuario);
        return new AuthResponse(
            token, usuario.getEmail(), usuario.getRol().name()
        );
    }
}
```

---

## AuthController

```java
// auth/AuthController.java
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registrar(
            @RequestBody RegisterRequest req) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(authService.registrar(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
```

---

## Autorización por Roles con @PreAuthorize

```java
// controller/AdminController.java
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProtectedController {

    private final UsuarioRepository usuarioRepo;

    public ProtectedController(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    // Solo ADMIN puede ver todos los usuarios
    @GetMapping("/admin/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepo.findAll());
    }

    // USER y ADMIN pueden acceder a su propio perfil
    @GetMapping("/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> perfil(
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok("Bienvenido: " + auth.getName());
    }

    // Solo ADMIN o MODERATOR
    @DeleteMapping("/admin/usuarios/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Verificar rol programáticamente dentro del método
    @GetMapping("/reporte")
    public ResponseEntity<String> reporte(
            org.springframework.security.core.Authentication auth) {
        boolean esAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (esAdmin) {
            return ResponseEntity.ok("Reporte completo para ADMIN");
        }
        return ResponseEntity.ok("Reporte básico para USER");
    }
}
```

---

## Expresiones @PreAuthorize más usadas

```java
@PreAuthorize("isAuthenticated()")              // cualquier usuario autenticado
@PreAuthorize("isAnonymous()")                   // solo no autenticados
@PreAuthorize("hasRole('ADMIN')")               // solo ADMIN
@PreAuthorize("hasAnyRole('ADMIN','MODERATOR')") // ADMIN o MODERATOR
@PreAuthorize("hasAuthority('ROLE_ADMIN')")     // equivalente a hasRole
@PreAuthorize("#id == authentication.principal.id") // solo el propio recurso
@PreAuthorize("authentication.name == #email")      // por email
```

---

# VIERNES — Simulación: API Segura Completa

> Sin apuntes. Cronómetro. Objetivo: 60 minutos para el flujo completo.

## Ejercicio: Proteger la API de Empleados de la Semana 5

Requisitos:
- `POST /auth/register` y `POST /auth/login` → públicos.
- `GET /api/empleados` → cualquier usuario autenticado.
- `POST /api/empleados` → solo `ADMIN`.
- `PUT /api/empleados/{id}` → solo `ADMIN`.
- `DELETE /api/empleados/{id}` → solo `ADMIN`.
- El token debe incluir el nombre y el rol en el payload.

### Token con claims adicionales

```java
// En AuthService, al generar el token pasar claims extra:
public AuthResponse login(LoginRequest req) {
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
    );

    Usuario usuario = usuarioRepo.findByEmail(req.getEmail())
        .orElseThrow();

    // Claims adicionales en el payload del token
    Map<String, Object> claims = new HashMap<>();
    claims.put("nombre", usuario.getNombre());
    claims.put("rol",    usuario.getRol().name());

    String token = jwtService.generarToken(claims, usuario);
    return new AuthResponse(token, usuario.getEmail(), usuario.getRol().name());
}
```

### EmpleadoController actualizado con seguridad

```java
@RestController
@RequestMapping("/api/empleados")
public class EmpleadoController {

    private final EmpleadoService service;

    public EmpleadoController(EmpleadoService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EmpleadoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmpleadoResponseDTO> obtenerPorId(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmpleadoResponseDTO> crear(
            @Valid @RequestBody EmpleadoRequestDTO dto) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmpleadoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EmpleadoRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

# SÁBADO — Proyecto: Sistema de Auth Completo con Refresh Token

## ¿Qué es un Refresh Token?

El access token JWT dura poco tiempo (15 min – 24 hrs) por seguridad. El refresh token dura más (7 días) y sirve únicamente para obtener un nuevo access token sin pedir contraseña de nuevo.

```
Flujo con Refresh Token:

1. Login → access token (24 hrs) + refresh token (7 días)
2. Cliente usa access token en cada petición
3. Access token expira → cliente envía refresh token
4. Servidor valida refresh token → emite nuevo access token
5. Refresh token expira → el usuario debe hacer login de nuevo
```

---

## Entidad RefreshToken

```java
// model/RefreshToken.java
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiracion;

    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id")
    private Usuario usuario;

    public RefreshToken() {}

    public Long    getId()          { return id; }
    public String  getToken()       { return token; }
    public Instant getExpiracion()  { return expiracion; }
    public Usuario getUsuario()     { return usuario; }

    public void setToken(String t)          { this.token = t; }
    public void setExpiracion(Instant exp)  { this.expiracion = exp; }
    public void setUsuario(Usuario u)       { this.usuario = u; }
}
```

---

## RefreshTokenService

```java
// security/RefreshTokenService.java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
public class RefreshTokenService {

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;   // en ms

    private final RefreshTokenRepository refreshRepo;
    private final UsuarioRepository      usuarioRepo;

    public RefreshTokenService(RefreshTokenRepository refreshRepo,
                                UsuarioRepository usuarioRepo) {
        this.refreshRepo = refreshRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public RefreshToken crear(String email) {
        Usuario usuario = usuarioRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Eliminar refresh token anterior si existe
        refreshRepo.findByUsuario(usuario)
            .ifPresent(refreshRepo::delete);

        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiracion(Instant.now().plusMillis(refreshExpiration));
        rt.setUsuario(usuario);

        return refreshRepo.save(rt);
    }

    public RefreshToken validar(String token) {
        RefreshToken rt = refreshRepo.findByToken(token)
            .orElseThrow(() ->
                new RuntimeException("Refresh token no encontrado"));

        if (rt.getExpiracion().isBefore(Instant.now())) {
            refreshRepo.delete(rt);
            throw new RuntimeException("Refresh token expirado. Inicia sesión nuevamente.");
        }

        return rt;
    }

    public void revocar(String email) {
        usuarioRepo.findByEmail(email)
            .flatMap(refreshRepo::findByUsuario)
            .ifPresent(refreshRepo::delete);
    }
}
```

---

## Repository de RefreshToken

```java
// repository/RefreshTokenRepository.java
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUsuario(Usuario usuario);
}
```

---

## AuthService actualizado con Refresh Token

```java
// Agregar al AuthService:

private final RefreshTokenService refreshTokenService;

// En login():
public AuthResponse login(LoginRequest req) {
    authManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            req.getEmail(), req.getPassword())
    );

    Usuario usuario = usuarioRepo.findByEmail(req.getEmail()).orElseThrow();

    String accessToken  = jwtService.generarToken(usuario);
    RefreshToken rt     = refreshTokenService.crear(req.getEmail());

    return new AuthResponse(accessToken, rt.getToken(),
                            usuario.getEmail(), usuario.getRol().name());
}

// Nuevo método: renovar access token
public AuthResponse refresh(String refreshToken) {
    RefreshToken rt = refreshTokenService.validar(refreshToken);
    String nuevoToken = jwtService.generarToken(rt.getUsuario());
    return new AuthResponse(nuevoToken, refreshToken,
                            rt.getUsuario().getEmail(),
                            rt.getUsuario().getRol().name());
}

// Nuevo método: logout
public void logout(String email) {
    refreshTokenService.revocar(email);
}
```

---

## AuthController actualizado

```java
// Agregar al AuthController:

@PostMapping("/refresh")
public ResponseEntity<AuthResponse> refresh(
        @RequestBody Map<String, String> body) {
    String refreshToken = body.get("refreshToken");
    return ResponseEntity.ok(authService.refresh(refreshToken));
}

@PostMapping("/logout")
public ResponseEntity<Void> logout(
        org.springframework.security.core.Authentication auth) {
    authService.logout(auth.getName());
    return ResponseEntity.noContent().build();
}
```

---

## AuthResponse actualizado

```java
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tipo  = "Bearer";
    private String email;
    private String rol;

    public AuthResponse(String accessToken, String refreshToken,
                        String email, String rol) {
        this.accessToken  = accessToken;
        this.refreshToken = refreshToken;
        this.email        = email;
        this.rol          = rol;
    }

    public String getAccessToken()  { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public String getTipo()         { return tipo; }
    public String getEmail()        { return email; }
    public String getRol()          { return rol; }
}
```

---

# DOMINGO — Repaso + Postman + Preguntas de Entrevista

## Lista de verificación

- [ ] Entiendo la diferencia entre autenticación y autorización.
- [ ] Sé qué contiene cada parte de un JWT (header, payload, signature).
- [ ] Puedo explicar por qué el payload no es seguro para datos sensibles.
- [ ] Sé cómo funciona el filtro JWT paso a paso.
- [ ] Entiendo por qué se usa `SessionCreationPolicy.STATELESS`.
- [ ] Puedo proteger endpoints con `@PreAuthorize` y roles.
- [ ] Entiendo el flujo de refresh token y para qué sirve.
- [ ] Todos los endpoints del proyecto responden correctamente.

---

## Colección completa de pruebas Postman

```
### 1. Registro de usuario normal
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "nombre": "Emmanuel Hernández",
  "email": "emmanuel@empresa.com",
  "password": "password123",
  "rol": "USER"
}

### 2. Registro de administrador
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "nombre": "Admin Principal",
  "email": "admin@empresa.com",
  "password": "admin123",
  "rol": "ADMIN"
}

### 3. Login
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "emmanuel@empresa.com",
  "password": "password123"
}
→ Guarda el accessToken y refreshToken de la respuesta

### 4. Acceder a endpoint protegido (con token)
GET http://localhost:8080/api/empleados
Authorization: Bearer <accessToken>

### 5. Acceder sin token → debe retornar 403
GET http://localhost:8080/api/empleados

### 6. USER intenta crear empleado → debe retornar 403
POST http://localhost:8080/api/empleados
Authorization: Bearer <token_de_USER>
Content-Type: application/json

{ "nombre": "Test", "email": "test@test.com", "salario": 5000, "departamento": "IT" }

### 7. ADMIN crea empleado → debe retornar 201
POST http://localhost:8080/api/empleados
Authorization: Bearer <token_de_ADMIN>
Content-Type: application/json

{ "nombre": "Nuevo Empleado", "email": "nuevo@empresa.com", "salario": 12000, "departamento": "Dev" }

### 8. Renovar token con refresh token
POST http://localhost:8080/auth/refresh
Content-Type: application/json

{ "refreshToken": "<refreshToken>" }

### 9. Logout
POST http://localhost:8080/auth/logout
Authorization: Bearer <accessToken>
```

---

## Preguntas de entrevista frecuentes — Semana 6

**1. ¿Qué es JWT y cuáles son sus partes?**
JWT es un token compacto y autocontenido para transmitir información. Tiene tres partes: header (algoritmo y tipo), payload (claims: datos del usuario) y signature (firma HMAC con la clave secreta). La firma garantiza que nadie modificó el token.

**2. ¿Por qué JWT es stateless?**
El servidor no guarda ningún estado de sesión. Toda la información necesaria para autenticar está dentro del propio token. El servidor solo valida la firma y la fecha de expiración.

**3. ¿Cuál es la diferencia entre access token y refresh token?**
El access token es de corta duración (minutos u horas) y se envía en cada petición. El refresh token es de larga duración (días) y sirve únicamente para obtener un nuevo access token sin pedir contraseña.

**4. ¿Qué pasa si alguien roba un JWT?**
El atacante puede usarlo hasta que expire. Por eso los access tokens deben durar poco. Se pueden agregar medidas como: token en lista negra al hacer logout, rotación de refresh tokens, y vincular el token a la IP o User-Agent.

**5. ¿Qué hace `OncePerRequestFilter`?**
Garantiza que el filtro se ejecute exactamente una vez por petición HTTP, evitando procesarlo múltiples veces en cadenas de filtros o forwards internos.

**6. ¿Por qué BCrypt para las contraseñas?**
BCrypt es una función de hash lenta e irreversible con salt incorporado. Es lenta intencionalmente para dificultar ataques de fuerza bruta. Nunca se debe guardar la contraseña en texto plano ni usar MD5/SHA1.

**7. ¿Qué hace `@EnableMethodSecurity`?**
Habilita la seguridad a nivel de método, permitiendo usar anotaciones como `@PreAuthorize`, `@PostAuthorize` y `@Secured` directamente en los métodos de los controllers o services.

---

## Métricas de la semana 6

| Métrica | Meta | Tu resultado |
|---|---|---|
| Flujo registro + login funcionando | Sí / No | |
| Endpoints protegidos con roles | Sí / No | |
| Refresh token implementado | Sí / No | |
| Pruebas Postman: todos los casos cubiertos | Sí / No | |
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

> **La semana que viene — Semana 7:** Concurrencia · Threads · ExecutorService · CompletableFuture  
> *Tu API ya tiene seguridad. Ahora aprende a hacerla eficiente bajo carga.*  
> *"¿Cumplí el bloque hoy? Sí o No." — La única pregunta que importa.*

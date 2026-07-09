# SIGEDU — Frontend

SIGEDU es el diario mural digital y portal escolar del Colegio Bernardo O'Higgins, Coquimbo.

Frontend construido con React, **conectado a los 10 microservicios reales del backend**
(Spring Boot + MySQL) a través del proxy de desarrollo de Vite.

## Stack

- React 19 + Vite
- React Router DOM 7
- React Hook Form (formularios)
- React Toastify (notificaciones)
- React Icons
- Recharts (gráficos de promedios)
- Sass (estilos)

## Cómo correr el proyecto

Requiere el **backend corriendo** (repositorio SIGEDU-Backend):

```bash
# 1. Backend (en SIGEDU-Backend, con Docker Desktop abierto)
docker compose up --build

# 2. Frontend
npm install
npm run dev
```

Luego abre `http://localhost:5173`.

El proxy de Vite (`vite.config.js` + `.env.development`) reenvía las rutas `/api/**`
al microservicio dueño de cada prefijo (identidad :8080, reuniones :8082, academica :8083,
calendario :8084, convivencia :8085, geografia :8086, gestionacademica :8087,
matricula :8088, mensajeria :8089, notas :8090), evitando CORS.

## Cuentas de prueba (backend real)

El login es por **RUN sin dígito verificador**. En una instalación nueva solo existe el
admin (lo crea el backend automáticamente); las demás cuentas se crean usando la app.

| Rol | RUN | Contraseña |
|---|---|---|
| Directivo/Admin | 12345678 | admin123 |
| Docente | 11111111 | docente123 |
| Estudiante | 22222222 | estudiante123 |
| Apoderado | 33333333 | apoderado123 |

Los botones de autocompletado están colapsados bajo "Acceso de desarrollo" en el login.

## Servicios conectados al backend real

`authService`, `usuarioService`, `notaService`, `mensajeriaService`, `hojaVidaService`
(convivencia), `nivelService`, `matriculaService` y `reunionService` consumen las APIs
reales vía `httpClient.js` (fetch + JWT automático), adaptando los campos del backend
a la forma que usan las páginas (patrón Adapter).

**Siguen en mock** (no existe microservicio backend para ese dominio):
`asistenciaService`, `pagoService`, `alertaService` y `configuracionService`
(usan `src/mock/db.js` en localStorage; queda comentado en cada archivo).
El mock también sirve de respaldo del login si el backend está caído.

## Estructura

```
src/
  components/   Navbar, Footer, Modal, PrivateRoute, Notificaciones, UI compartida
  context/      AuthContext (sesión, rol y token JWT)
  hooks/        useAuth
  mock/         Datos simulados (solo servicios sin backend + respaldo de login)
  pages/        Home, Nosotros, Login, Notas, Asistencia, HojaVida, Mensajeria,
                Admin, AdminConfiguracion, AdminGrados, AdminPagos, AdminAsignacion,
                AdminMatriculas, Reuniones, Reportes, MiPerfil
  services/     httpClient (fetch + JWT), authService, usuarioService, notaService,
                mensajeriaService, hojaVidaService, nivelService, matriculaService,
                reunionService + servicios mock (asistencia, pagos, alertas, configuración)
  styles/       variables, mixins, reset, tipografía y estilos por módulo
```

## Funcionalidades destacadas

- Acceso diferenciado por rol (rutas protegidas con `PrivateRoute`).
- Gestión de usuarios con validación de RUT chileno y jerarquía apoderado→estudiante (backend).
- Registro y consulta de notas con fecha real y promedios por asignatura.
- Matrícula de estudiantes en cursos reales (`/admin/matriculas`).
- Reuniones generales, citaciones a apoderados y calendario escolar (`/admin/reuniones`).
- Mensajería con estado leído/no-leído persistido en MySQL.
- Hoja de vida con anotaciones positivas/negativas (convivencia).

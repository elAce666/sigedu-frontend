# SIGEDU — Frontend

SIGEDU es el diario mural digital y portal escolar del Colegio Bernardo O'Higgins, Coquimbo.

Frontend base construido siguiendo la guía entregada por el profesor (proyecto "Karma"),
adaptado a las necesidades de la comunidad educativa del colegio.

## Stack

- React 19 + Vite
- React Router DOM 7
- React Hook Form (formularios)
- React Toastify (notificaciones)
- React Icons
- Recharts (gráficos de promedios)
- Sass (estilos)

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Luego abre `http://localhost:5173`.

## Datos de prueba (no hay backend conectado aún)

El frontend funciona de forma autónoma usando datos simulados guardados en `localStorage`
(ver `src/mock/db.js`). Los servicios en `src/services/*.js` están escritos para que, cuando
el backend real (microservicios S0–S9 del diagrama de arquitectura) esté disponible, solo haya
que reemplazar su contenido por llamadas axios, sin rehacer las pantallas.

| Rol | Correo | Contraseña |
|---|---|---|
| Directivo/Admin | admin@sigedu.cl | admin123 |
| Docente | mgonzalez@sigedu.cl | docente123 |
| Apoderado | prodriguez@gmail.com | apoderado123 |
| Estudiante | jrodriguez@sigedu.cl | estudiante123 |

## Estructura

```
src/
  components/   Navbar, Footer, Modal, PrivateRoute, UI compartida
  context/      AuthContext (sesión y rol)
  hooks/        useAuth
  mock/         "Base de datos" simulada (localStorage)
  pages/        Home, Nosotros, Login, Notas, Asistencia, HojaVida, Mensajeria, Admin, MiPerfil
  services/     authService, usuarioService, notaService, asistenciaService,
                mensajeriaService, hojaVidaService
  styles/       variables, mixins, reset, tipografía y estilos por módulo
```

## Próximos pasos sugeridos

1. Conectar `services/*.js` al backend real (API Gateway).
2. Reemplazar las imágenes de fondo por material propio del colegio.
3. Agregar gestión de matrícula y calendario de reuniones (microservicios restantes del MER).

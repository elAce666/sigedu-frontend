import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// =============================================================
// Proxy de desarrollo hacia los microservicios SIGEDU.
// El frontend llama rutas relativas /api/** y el dev-server las
// reenvía al microservicio dueño de cada prefijo, evitando CORS
// sin tocar la configuración del backend.
// Los targets se leen de .env.development (VITE_API_*).
// =============================================================
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const IDENTIDAD = env.VITE_API_IDENTIDAD || 'http://localhost:8080'
  const REUNIONES = env.VITE_API_REUNIONES || 'http://localhost:8082'
  const ACADEMICA = env.VITE_API_ACADEMICA || 'http://localhost:8083'
  const CALENDARIO = env.VITE_API_CALENDARIO || 'http://localhost:8084'
  const CONVIVENCIA = env.VITE_API_CONVIVENCIA || 'http://localhost:8085'
  const GEOGRAFIA = env.VITE_API_GEOGRAFIA || 'http://localhost:8086'
  const GESTION_ACADEMICA = env.VITE_API_GESTION_ACADEMICA || 'http://localhost:8087'
  const MATRICULA = env.VITE_API_MATRICULA || 'http://localhost:8088'
  const MENSAJERIA = env.VITE_API_MENSAJERIA || 'http://localhost:8089'
  const NOTAS = env.VITE_API_NOTAS || 'http://localhost:8090'

  const proxy = {
    // identidad (8080)
    '^/api/(auth|usuarios|roles)': { target: IDENTIDAD, changeOrigin: true },
    // academica (8083)
    '/api/academica': { target: ACADEMICA, changeOrigin: true },
    // gestionacademica (8087)
    '^/api/(asignatura|bitacora|objetivos)': { target: GESTION_ACADEMICA, changeOrigin: true },
    // calendario (8084)
    '/api/calendario': { target: CALENDARIO, changeOrigin: true },
    // convivencia (8085)
    '/api/convivencia': { target: CONVIVENCIA, changeOrigin: true },
    // geografia (8086)
    '^/api/(paises|regiones|ciudades|comunas|direcciones)': { target: GEOGRAFIA, changeOrigin: true },
    // matricula (8088)
    '^/api/(matricula|antecedentemedico|antecedenteapoderado|antecedenteacademico)': { target: MATRICULA, changeOrigin: true },
    // mensajeria (8089)
    '/api/mensajeria': { target: MENSAJERIA, changeOrigin: true },
    // notas (8090)
    '/api/notas': { target: NOTAS, changeOrigin: true },
    // reuniones (8082)
    '^/api/(acuerdos|reuniones)': { target: REUNIONES, changeOrigin: true },
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy,
    },
  }
})

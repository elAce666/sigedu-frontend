// =============================================================
// CLIENTE API SIMULADO - services/apiClient.js
// =============================================================
// Mientras no exista un backend real conectado, este modulo
// imita la forma en que axios responde: toda funcion devuelve
// una Promise que resuelve { data }, con una pequena latencia
// artificial para que loading states se vean realistas.
//
// El dia de manana, cuando el equipo conecte el API Gateway real
// (ver diagrama de arquitectura, S0..S9), basta reemplazar el
// contenido de cada funcion en services/*.js por llamadas a un
// axios real - las paginas que consumen estos services NO
// necesitan cambiar, porque siguen recibiendo { data }.
// =============================================================

const LATENCY = 350

export function resolveData(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), LATENCY)
  })
}

export function rejectError(message, status = 400) {
  return new Promise((_, reject) => {
    setTimeout(() => reject({ response: { status, data: { error: message } } }), LATENCY)
  })
}

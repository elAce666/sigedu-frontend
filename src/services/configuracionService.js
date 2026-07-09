// =============================================================
// SERVICIO DE CONFIGURACION — services/configuracionService.js
// =============================================================
// Conectado al microservicio real academica (8083):
//   GET/POST /api/academica/configuraciones
//   PUT/DELETE /api/academica/configuraciones/{id}
// =============================================================
import http from './httpClient'

export const getConfiguraciones = async () => {
  const res = await http.get('/api/academica/configuraciones')
  return { data: res.data || [] }
}

export const crearConfiguracion = async (data) => {
  const res = await http.post('/api/academica/configuraciones', {
    clave: data.clave,
    valor: data.valor,
    descripcion: data.descripcion || '',
  })
  return { data: res.data }
}

export const actualizarConfiguracion = async (id, data) => {
  const res = await http.put(`/api/academica/configuraciones/${id}`, {
    clave: data.clave,
    valor: data.valor,
    descripcion: data.descripcion || '',
  })
  return { data: res.data }
}

export const eliminarConfiguracion = async (id) => {
  await http.delete(`/api/academica/configuraciones/${id}`)
  return { data: { ok: true } }
}

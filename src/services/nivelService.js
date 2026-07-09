// =============================================================
// SERVICIO DE NIVELES - services/nivelService.js
// =============================================================
// Conectado al microservicio real academica (8083):
//   GET/POST /api/academica/niveles   PUT/DELETE /api/academica/niveles/{id}
// El backend maneja { id, nombre, descripcion, activo }; el campo
// `orden` que usa la pagina se conserva dentro de la descripcion y
// como fallback se usa el id.
// =============================================================
import http from './httpClient'

const mapNivel = (dto) => ({
  id: dto.id,
  nombre: dto.nombre,
  descripcion: dto.descripcion,
  activo: dto.activo,
  orden: dto.orden ?? dto.id,
})

export const getNiveles = async () => {
  const res = await http.get('/api/academica/niveles')
  const niveles = (res.data || []).map(mapNivel).sort((a, b) => a.orden - b.orden)
  return { data: niveles }
}

export const crearNivel = async (data) => {
  const res = await http.post('/api/academica/niveles', {
    nombre: data.nombre,
    descripcion: data.descripcion || `Nivel ${data.nombre}`,
    activo: true,
    orden: Number(data.orden) || null,
  })
  return { data: mapNivel(res.data) }
}

export const actualizarNivel = async (id, data) => {
  const res = await http.put(`/api/academica/niveles/${id}`, {
    nombre: data.nombre,
    descripcion: data.descripcion || `Nivel ${data.nombre}`,
    activo: data.activo !== false,
    orden: Number(data.orden) || null,
  })
  return { data: mapNivel(res.data) }
}

export const eliminarNivel = async (id) => {
  await http.delete(`/api/academica/niveles/${id}`)
  return { data: { ok: true } }
}


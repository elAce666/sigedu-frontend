// =============================================================
// BASE DE DATOS MOCK — mock/db.js
// =============================================================
// SIGEDU todavía no tiene backend conectado. Esta "base de datos"
// vive en localStorage y simula lo que vendría de la API real
// (microservicios S0..S9 del diagrama de arquitectura).
//
// Cuando el backend esté listo, solo hay que reemplazar las
// funciones de services/*.js para que llamen a axios en vez de
// a este archivo — el resto de la app (páginas, componentes) no
// debería cambiar porque consume los services, no este mock.
//
// Usuarios de prueba (4 perfiles del PDF SIGEDU):
//   ADMIN       admin@sigedu.cl       / admin123
//   DOCENTE     mgonzalez@sigedu.cl   / docente123
//   APODERADO   prodriguez@gmail.com  / apoderado123
//   ESTUDIANTE  jrodriguez@sigedu.cl  / estudiante123
// =============================================================

const DB_KEY = 'sigedu_mock_db_v1'

const SEED = {
  roles: [
    { codigo: 'ESTUDIANTE', nombre: 'Estudiante' },
    { codigo: 'APODERADO', nombre: 'Apoderado' },
    { codigo: 'DOCENTE', nombre: 'Docente' },
    { codigo: 'ADMIN', nombre: 'Administrador' },
  ],

  usuarios: [
    { run: '11111111-1', rol: 'ADMIN', nombre: 'Francisca Soto', cargo: 'Directora Académica',
      email: 'admin@sigedu.cl', password: 'admin123' },
    { run: '22222222-2', rol: 'DOCENTE', nombre: 'Marcela González', especialidad: 'Matemática',
      email: 'mgonzalez@sigedu.cl', password: 'docente123', cursoJefatura: '7° Básico A' },
    { run: '33333333-3', rol: 'DOCENTE', nombre: 'Felipe Araya', especialidad: 'Lenguaje',
      email: 'faraya@sigedu.cl', password: 'docente123', cursoJefatura: null },
    { run: '44444444-4', rol: 'APODERADO', nombre: 'Patricia Rodríguez', parentesco: 'Madre',
      email: 'prodriguez@gmail.com', password: 'apoderado123', pupilosRun: ['55555555-5'] },
    { run: '55555555-5', rol: 'ESTUDIANTE', nombre: 'Joaquín Rodríguez', curso: '7° Básico A',
      email: 'jrodriguez@sigedu.cl', password: 'estudiante123', apoderadoRun: '44444444-4' },
    { run: '66666666-6', rol: 'ESTUDIANTE', nombre: 'Valentina Muñoz', curso: '7° Básico A',
      email: 'vmunoz@sigedu.cl', password: 'estudiante123', apoderadoRun: '44444444-4' },
  ],

  cursos: [
    { id: 1, nombre: '7° Básico A', nivel: '7° Básico', sala: 'Sala 12', docenteJefeRun: '22222222-2' },
    { id: 2, nombre: '8° Básico B', nivel: '8° Básico', sala: 'Sala 15', docenteJefeRun: '33333333-3' },
  ],

  configuraciones: [
    { id: 1, clave: 'nombreColegio', valor: "Colegio Bernardo O'Higgins", descripcion: 'Nombre institucional mostrado en la interfaz' },
    { id: 2, clave: 'anoAcademicoActivo', valor: '2026', descripcion: 'Año académico vigente' },
    { id: 3, clave: 'periodoEscolar', valor: 'Primer Semestre', descripcion: 'Periodo escolar activo' },
  ],

  niveles: [
    { id: 1, nombre: '1° Básico', orden: 1 },
    { id: 2, nombre: '2° Básico', orden: 2 },
    { id: 3, nombre: '3° Básico', orden: 3 },
    { id: 4, nombre: '4° Básico', orden: 4 },
    { id: 5, nombre: '5° Básico', orden: 5 },
    { id: 6, nombre: '6° Básico', orden: 6 },
    { id: 7, nombre: '7° Básico', orden: 7 },
    { id: 8, nombre: '8° Básico', orden: 8 },
    { id: 9, nombre: '1° Medio', orden: 9 },
    { id: 10, nombre: '2° Medio', orden: 10 },
    { id: 11, nombre: '3° Medio', orden: 11 },
    { id: 12, nombre: '4° Medio', orden: 12 },
  ],

  asignaturas: [
    { id: 1, nombre: 'Matemática', docenteRun: '22222222-2', cursoId: 1 },
    { id: 2, nombre: 'Lenguaje y Comunicación', docenteRun: '33333333-3', cursoId: 1 },
    { id: 3, nombre: 'Ciencias Naturales', docenteRun: '22222222-2', cursoId: 1 },
    { id: 4, nombre: 'Historia', docenteRun: '33333333-3', cursoId: 1 },
  ],

  notas: [
    { id: 1, estudianteRun: '55555555-5', asignaturaId: 1, valor: 6.2, fecha: '2026-04-12', descripcion: 'Prueba Unidad 1' },
    { id: 2, estudianteRun: '55555555-5', asignaturaId: 1, valor: 5.5, fecha: '2026-05-03', descripcion: 'Guía evaluada' },
    { id: 3, estudianteRun: '55555555-5', asignaturaId: 2, valor: 4.8, fecha: '2026-04-20', descripcion: 'Ensayo argumentativo' },
    { id: 4, estudianteRun: '55555555-5', asignaturaId: 3, valor: 6.8, fecha: '2026-05-10', descripcion: 'Informe de laboratorio' },
    { id: 5, estudianteRun: '66666666-6', asignaturaId: 1, valor: 5.9, fecha: '2026-04-12', descripcion: 'Prueba Unidad 1' },
    { id: 6, estudianteRun: '66666666-6', asignaturaId: 2, valor: 6.5, fecha: '2026-04-20', descripcion: 'Ensayo argumentativo' },
  ],

  asistencia: [
    { id: 1, estudianteRun: '55555555-5', fecha: '2026-06-16', estado: 'presente' },
    { id: 2, estudianteRun: '55555555-5', fecha: '2026-06-17', estado: 'presente' },
    { id: 3, estudianteRun: '55555555-5', fecha: '2026-06-18', estado: 'ausente', justificada: false },
    { id: 4, estudianteRun: '55555555-5', fecha: '2026-06-19', estado: 'atrasado' },
    { id: 5, estudianteRun: '55555555-5', fecha: '2026-06-20', estado: 'presente' },
    { id: 6, estudianteRun: '66666666-6', fecha: '2026-06-16', estado: 'presente' },
    { id: 7, estudianteRun: '66666666-6', fecha: '2026-06-17', estado: 'ausente', justificada: true },
    { id: 8, estudianteRun: '66666666-6', fecha: '2026-06-18', estado: 'presente' },
  ],

  mensajes: [
    { id: 1, emisorRun: '22222222-2', receptorRun: '44444444-4', asunto: 'Reunión de apoderados',
      contenido: 'Estimada Sra. Patricia, le recuerdo la reunión de apoderados del curso 7°A el próximo viernes a las 18:30 hrs en Sala 12.',
      fecha: '2026-06-15T10:30:00', leido: true },
    { id: 2, emisorRun: '44444444-4', receptorRun: '22222222-2', asunto: 'RE: Reunión de apoderados',
      contenido: 'Muchas gracias por avisar, profesora. Asistiré sin problemas.',
      fecha: '2026-06-15T14:00:00', leido: true },
    { id: 3, emisorRun: '22222222-2', receptorRun: '44444444-4', asunto: 'Atraso recurrente',
      contenido: 'Quería comentarle que Joaquín ha llegado atrasado dos veces esta semana. ¿Podemos coordinar para revisar la situación?',
      fecha: '2026-06-19T09:15:00', leido: false },
    { id: 4, emisorRun: '11111111-1', receptorRun: '44444444-4', asunto: '[Comunicado] Cierre de semestre',
      contenido: 'Estimada comunidad SIGEDU: les recordamos que el cierre del primer semestre académico será el 10 de julio. Las actas finales estarán disponibles en el portal.',
      fecha: '2026-06-20T08:00:00', leido: false },
  ],

  pagos: [
    { id: 1, estudianteRun: '55555555-5', tipo: 'matricula', monto: 180000, fecha: '2026-03-10', estado: 'pagado', anoAcademico: 2026 },
    { id: 2, estudianteRun: '55555555-5', tipo: 'mensualidad', monto: 65000, fecha: '2026-06-05', estado: 'pendiente', anoAcademico: 2026 },
    { id: 3, estudianteRun: '66666666-6', tipo: 'mensualidad', monto: 65000, fecha: '2026-06-05', estado: 'atrasado', anoAcademico: 2026 },
  ],

  hojaVida: [
    { id: 1, estudianteRun: '55555555-5', tipo: 'positiva', detalle: 'Destacada participación y ayuda a compañeros en clase de Ciencias.',
      autorRun: '22222222-2', fecha: '2026-05-02' },
    { id: 2, estudianteRun: '55555555-5', tipo: 'negativa', detalle: 'No trajo materiales solicitados para la actividad de Lenguaje.',
      autorRun: '33333333-3', fecha: '2026-05-14' },
    { id: 3, estudianteRun: '55555555-5', tipo: 'negativa', detalle: 'Conversaciones reiteradas durante la clase, pese a llamados de atención.',
      autorRun: '22222222-2', fecha: '2026-06-18' },
    { id: 4, estudianteRun: '66666666-6', tipo: 'positiva', detalle: 'Excelente disposición en actividad solidaria del curso.',
      autorRun: '33333333-3', fecha: '2026-06-05' },
  ],

  alertas: [
    { id: 1, apoderadoRun: '44444444-4', estudianteRun: '55555555-5', tipo: 'nota_baja', titulo: 'Nota inferior a 4.0',
      mensaje: 'Joaquín Rodríguez obtuvo una nota inferior a 4.0 en Matemática.', leida: false,
      fecha: '2026-06-20T09:00:00', origen: 'nota', referenciaId: 99 },
  ],
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupted storage */ }
  localStorage.setItem(DB_KEY, JSON.stringify(SEED))
  return structuredClone(SEED)
}

function save(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function getDB() {
  return load()
}

export function setDB(db) {
  save(db)
}

export function resetDB() {
  localStorage.removeItem(DB_KEY)
  return load()
}

export function nextId(collection) {
  return collection.length ? Math.max(...collection.map((c) => c.id)) + 1 : 1
}

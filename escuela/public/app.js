
const formulario = document.getElementById("form-alumno");
const tablaAlumnos = document.getElementById("tabla-alumnos");
const totalAlumnos = document.getElementById("total-alumnos");
const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("btn-guardar");
const botonCancelar = document.getElementById("btn-cancelar");
const botonRecargar = document.getElementById("btn-recargar");
const campoBusqueda = document.getElementById("buscar");
const mensaje = document.getElementById("mensaje");

// Adaptar la API para la ruta donde se publique la aplicación.
const rutaActual = window.location.pathname;
const rutaBase = rutaActual.endsWith("/")
  ? rutaActual
  : rutaActual.slice(0, rutaActual.lastIndexOf("/") + 1);

const API_BASE = `${rutaBase.replace(/\/$/, "")}/api/alumnos`;

const campos = {
  matricula: document.getElementById("matricula"),
  nombre: document.getElementById("nombre"),
  carrera: document.getElementById("carrera"),
  cuatrimestre: document.getElementById("cuatrimestre"),
  grupo: document.getElementById("grupo"),
  estado: document.getElementById("estado")
};

let alumnos = [];
let matriculaEditando = null;

// Mostrar mensajes de éxito o error.
function mostrarMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = "mensaje";

  if (tipo) {
    mensaje.classList.add(tipo);
  }
}

// Consultar la API y procesar la respuesta.
async function solicitarAPI(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      resultado.mensaje || `Error HTTP ${respuesta.status}`
    );
  }

  return resultado;
}

// Crear celdas sin interpretar los datos como HTML.
function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

// Mostrar los alumnos en la única tabla.
function renderizarAlumnos() {
  const busqueda = campoBusqueda.value.trim().toLowerCase();

  const filtrados = alumnos.filter((alumno) => {
    return [
      alumno.matricula,
      alumno.nombre,
      alumno.carrera,
      alumno.cuatrimestre,
      alumno.grupo,
      alumno.estado
    ].some((valor) =>
      String(valor ?? "").toLowerCase().includes(busqueda)
    );
  });

  totalAlumnos.textContent = alumnos.length;
  tablaAlumnos.replaceChildren();

  if (filtrados.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 7;
    celda.className = "tabla-vacia";
    celda.textContent = alumnos.length === 0
      ? "Todavía no hay alumnos registrados."
      : "No se encontraron alumnos.";

    fila.appendChild(celda);
    tablaAlumnos.appendChild(fila);
    return;
  }

  filtrados.forEach((alumno) => {
    const fila = document.createElement("tr");

    fila.appendChild(crearCelda(alumno.matricula));
    fila.appendChild(crearCelda(alumno.nombre));
    fila.appendChild(crearCelda(alumno.carrera));
    fila.appendChild(crearCelda(alumno.cuatrimestre));
    fila.appendChild(crearCelda(alumno.grupo));

    // Etiqueta visual para el estado del alumno.
    const celdaEstado = document.createElement("td");
    const etiquetaEstado = document.createElement("span");

    etiquetaEstado.className =
      alumno.estado === "Activo"
        ? "estado-etiqueta"
        : "estado-etiqueta estado-inactivo";

    etiquetaEstado.textContent = alumno.estado;
    celdaEstado.appendChild(etiquetaEstado);
    fila.appendChild(celdaEstado);

    // Acciones de edición y eliminación.
    const celdaAcciones = document.createElement("td");
    const acciones = document.createElement("div");

    acciones.className = "acciones-tabla";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "boton boton-editar";
    botonEditar.textContent = "Editar";

    botonEditar.addEventListener("click", () => {
      prepararEdicion(alumno.matricula);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton boton-eliminar";
    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener("click", () => {
      eliminarAlumno(alumno.matricula);
    });

    acciones.append(botonEditar, botonEliminar);
    celdaAcciones.appendChild(acciones);
    fila.appendChild(celdaAcciones);

    tablaAlumnos.appendChild(fila);
  });
}

// Consultar los alumnos guardados en MongoDB.
async function cargarAlumnos() {
  botonRecargar.disabled = true;
  botonRecargar.textContent = "Cargando...";

  try {
    alumnos = await solicitarAPI(API_BASE);
    renderizarAlumnos();
  } catch (error) {
    console.error("Error al consultar alumnos:", error);

    mostrarMensaje(
      `No se pudieron cargar los alumnos: ${error.message}`,
      "error"
    );
  } finally {
    botonRecargar.disabled = false;
    botonRecargar.textContent = "Actualizar lista";
  }
}

// Preparar el formulario para editar un alumno.
function prepararEdicion(matricula) {
  const alumno = alumnos.find(
    (item) => item.matricula === matricula
  );

  if (!alumno) {
    mostrarMensaje("No se encontró el alumno.", "error");
    return;
  }

  matriculaEditando = alumno.matricula;

  campos.matricula.value = alumno.matricula;
  campos.nombre.value = alumno.nombre;
  campos.carrera.value = alumno.carrera;
  campos.cuatrimestre.value = alumno.cuatrimestre;
  campos.grupo.value = alumno.grupo;
  campos.estado.value = alumno.estado;

  // La matrícula identifica al alumno y no se modifica.
  campos.matricula.disabled = true;

  tituloFormulario.textContent = "Editar alumno";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;

  mostrarMensaje(
    "Modifica los datos del alumno y guarda los cambios."
  );

  formulario.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  campos.nombre.focus();
}

// Restablecer el formulario.
function cancelarEdicion() {
  matriculaEditando = null;
  formulario.reset();

  campos.matricula.disabled = false;
  campos.estado.value = "Activo";

  tituloFormulario.textContent = "Registrar alumno";
  botonGuardar.textContent = "Registrar alumno";
  botonCancelar.hidden = true;

  mostrarMensaje("");
}

// Registrar un alumno o actualizar sus datos.
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  botonGuardar.disabled = true;

  try {
    const datos = {
      nombre: campos.nombre.value.trim(),
      carrera: campos.carrera.value.trim(),
      cuatrimestre: campos.cuatrimestre.value,
      grupo: campos.grupo.value.trim(),
      estado: campos.estado.value
    };

    let url;
    let opciones;

    if (matriculaEditando !== null) {
      // UPDATE: actualizar un alumno existente.
      url = `${API_BASE}/${encodeURIComponent(matriculaEditando)}`;

      opciones = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      };
    } else {
      // CREATE: registrar un alumno nuevo.
      url = API_BASE;

      opciones = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matricula: campos.matricula.value.trim(),
          ...datos
        })
      };
    }

    const resultado = await solicitarAPI(url, opciones);

    cancelarEdicion();

    mostrarMensaje(
      resultado.mensaje || "Operación realizada correctamente.",
      "exito"
    );

    await cargarAlumnos();
  } catch (error) {
    console.error("Error al guardar alumno:", error);
    mostrarMensaje(error.message, "error");
  } finally {
    botonGuardar.disabled = false;
  }
});

// Eliminar un alumno después de solicitar confirmación.
async function eliminarAlumno(matricula) {
  const alumno = alumnos.find(
    (item) => item.matricula === matricula
  );

  if (!alumno) {
    mostrarMensaje("No se encontró el alumno.", "error");
    return;
  }

  const confirmado = window.confirm(
    `¿Deseas eliminar a ${alumno.nombre} (${matricula})?`
  );

  if (!confirmado) {
    return;
  }

  try {
    const resultado = await solicitarAPI(
      `${API_BASE}/${encodeURIComponent(matricula)}`,
      {
        method: "DELETE"
      }
    );

    if (matriculaEditando === matricula) {
      cancelarEdicion();
    }

    mostrarMensaje(
      resultado.mensaje || "Alumno eliminado correctamente.",
      "exito"
    );

    await cargarAlumnos();
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    mostrarMensaje(error.message, "error");
  }
}

// Buscar alumnos mientras se escribe.
campoBusqueda.addEventListener("input", renderizarAlumnos);

// Actualizar la tabla.
botonRecargar.addEventListener("click", cargarAlumnos);

// Cancelar una edición.
botonCancelar.addEventListener("click", cancelarEdicion);

// Cargar los alumnos al abrir la página.
cargarAlumnos();

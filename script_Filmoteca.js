// ============================================================
//  FILMOTECA — App Funcional PWA (Offline) - Solo Título y Género Obligatorios
// ============================================================

let peliculas = [];
let filtroTexto = "";
let filtroGenero = "todos";
let ordenActual = "titulo";

const formulario = document.getElementById("formPelicula");
const inputTitulo = document.getElementById("inputTitulo");
const inputDirector = document.getElementById("inputDirector");
const inputAnio = document.getElementById("inputAnio");
const selectGeneroForm = document.getElementById("selectGeneroForm");
const inputPuntuacion = document.getElementById("inputPuntuacion");
const formError = document.getElementById("formError");

const inputBusqueda = document.getElementById("inputBusqueda");
const selectFiltroGenero = document.getElementById("selectFiltroGenero");
const resultadosBusqueda = document.getElementById("resultadosBusqueda");

const contenedorColeccion = document.getElementById("coleccion");
const estadoVacio = document.getElementById("estadoVacio");

const totalPeliculasEl = document.getElementById("totalPeliculas");
const totalVistasEl = document.getElementById("totalVistas");
const totalPendientesEl = document.getElementById("totalPendientes");
const puntuacionMediaEl = document.getElementById("puntuacionMedia");
const generoFrecuenteEl = document.getElementById("generoFrecuente");

const botonesOrdenar = document.querySelectorAll(".btn-ordenar");

function guardarDatos() {
    localStorage.setItem('filmoteca_datos', JSON.stringify(peliculas));
}

function cargarDatos() {
    const datosGuardados = localStorage.getItem('filmoteca_datos');
    if (datosGuardados) {
        peliculas = JSON.parse(datosGuardados);
    } else {
        peliculas = [];
    }
}

function esDuplicada(titulo, anio) {
    if (!anio || anio === "—") return false; // Si no hay año, no comprobamos duplicados por año
    return peliculas.some(
        (p) => p.titulo.toLowerCase() === titulo.toLowerCase() && p.anio === anio
    );
}

function validarPelicula(titulo, genero, anio, puntuacion) {
    const errores = [];
    if (titulo.trim() === "") errores.push("El título es obligatorio");
    if (genero.trim() === "") errores.push("Debes seleccionar un género");
    
    // El año solo se valida si el usuario ha escrito algo
    if (anio !== "" && !isNaN(anio)) {
        if (anio < 1888 || anio > new Date().getFullYear()) {
            errores.push("El año no es válido");
        }
    }
    
    // La puntuación solo se valida si el usuario ha escrito algo
    if (puntuacion !== "" && !isNaN(puntuacion)) {
        if (puntuacion < 1 || puntuacion > 10) {
            errores.push("La puntuación debe ser un número entre 1 y 10");
        }
    }
    
    if (titulo.trim() !== "" && anio !== "" && !isNaN(anio)) {
        if (esDuplicada(titulo.trim(), parseInt(anio, 10))) {
            errores.push("La película ya está registrada con este mismo año");
        }
    }
    return { valido: errores.length === 0, errores };
}

function clasePuntuacion(puntuacion) {
    if (puntuacion >= 7) return "puntuacion-alta";
    if (puntuacion >= 5) return "puntuacion-media";
    return "puntuacion-baja";
}

function crearEstrellas(puntuacion) {
    if (puntuacion === 0) return '<span class="vacia">Sin nota</span>';
    let redondeada = Math.round(puntuacion);
    let estrellas = "";
    for (let i = 1; i <= 10; i++) {
        estrellas += i <= redondeada ? '<span class="llena">★</span>' : '<span class="vacia">☆</span>';
    }
    return estrellas;
}

function crearTarjeta(pelicula) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta " + clasePuntuacion(pelicula.puntuacion || 0);
    if (pelicula.vista) tarjeta.classList.add("vista");

    const header = document.createElement("div");
    header.className = "tarjeta-header";
    const tituloEl = document.createElement("h3");
    tituloEl.className = "tarjeta-titulo";
    tituloEl.textContent = pelicula.titulo;
    const generoEl = document.createElement("span");
    generoEl.className = "tarjeta-genero";
    generoEl.textContent = pelicula.genero;
    header.appendChild(tituloEl);
    header.appendChild(generoEl);
    tarjeta.appendChild(header);

    const directorEl = document.createElement("p");
    directorEl.className = "tarjeta-director";
    directorEl.textContent = pelicula.director;
    tarjeta.appendChild(directorEl);

    const anioEl = document.createElement("p");
    anioEl.className = "tarjeta-anio";
    anioEl.textContent = pelicula.anio;
    tarjeta.appendChild(anioEl);

    const estrellasEl = document.createElement("div");
    estrellasEl.className = "tarjeta-estrellas";
    estrellasEl.innerHTML = crearEstrellas(pelicula.puntuacion);
    
    if (pelicula.puntuacion > 0) {
        const puntuacionEl = document.createElement("span");
        puntuacionEl.className = "tarjeta-puntuacion";
        puntuacionEl.textContent = pelicula.puntuacion;
        estrellasEl.appendChild(puntuacionEl);
    }
    tarjeta.appendChild(estrellasEl);

    const badgeVista = document.createElement("span");
    badgeVista.className = "badge-vista";
    badgeVista.textContent = "VISTA";
    tarjeta.appendChild(badgeVista);

    const overlay = document.createElement("div");
    overlay.className = "tarjeta-overlay";
    const overlayDirector = document.createElement("p");
    overlayDirector.className = "overlay-director";
    overlayDirector.textContent = pelicula.director;
    const overlayAnio = document.createElement("p");
    overlayAnio.className = "overlay-anio";
    overlayAnio.textContent = pelicula.anio;
    const overlayPunt = document.createElement("p");
    overlayPunt.className = "overlay-punt";
    overlayPunt.textContent = pelicula.puntuacion > 0 ? pelicula.puntuacion : "—";
    overlay.appendChild(overlayDirector);
    overlay.appendChild(overlayAnio);
    overlay.appendChild(overlayPunt);
    tarjeta.appendChild(overlay);

    const divAcciones = document.createElement("div");
    divAcciones.className = "tarjeta-acciones";

    const btnVista = document.createElement("button");
    btnVista.className = "btn-vista";
    btnVista.textContent = pelicula.vista ? "Marcar Pendiente" : "Marcar Vista";
    btnVista.addEventListener("click", function () {
        pelicula.vista = !pelicula.vista;
        guardarDatos();
        renderizarTodo();
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function () {
        if (confirm(`¿Seguro que quieres eliminar la película "${pelicula.titulo}"?`)) {
            const indice = peliculas.indexOf(pelicula);
            if (indice > -1) {
                peliculas.splice(indice, 1);
                guardarDatos();
                renderizarTodo();
            }
        }
    });

    divAcciones.appendChild(btnVista);
    divAcciones.appendChild(btnEliminar);
    tarjeta.appendChild(divAcciones);

    return tarjeta;
}

function obtenerPeliculasFiltradas() {
    let resultado = [...peliculas];
    if (filtroTexto.trim() !== "") {
        resultado = resultado.filter((p) =>
            p.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            p.director.toLowerCase().includes(filtroTexto.toLowerCase())
        );
    }
    if (filtroGenero !== "todos") {
        resultado = resultado.filter((p) => p.genero === filtroGenero);
    }
    return resultado;
}

function ordenarPeliculas(lista) {
    const copia = [...lista];
    switch (ordenActual) {
        case "titulo":
            copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
        case "anio":
            copia.sort((a, b) => {
                const anioA = typeof a.anio === 'number' ? a.anio : 0;
                const anioB = typeof b.anio === 'number' ? b.anio : 0;
                return anioB - anioA;
            });
            break;
        case "puntuacion":
            copia.sort((a, b) => b.puntuacion - a.puntuacion);
            break;
    }
    return copia;
}

function actualizarSelectGeneros() {
    selectFiltroGenero.innerHTML = '<option value="todos">Todos los géneros</option>';
    const generosUnicos = [...new Set(peliculas.map((p) => p.genero))].sort();
    generosUnicos.forEach((g) => {
        const opcion = document.createElement("option");
        opcion.value = g;
        opcion.textContent = g;
        selectFiltroGenero.appendChild(opcion);
    });
    selectFiltroGenero.value = filtroGenero;
}

function renderizarColeccion() {
    contenedorColeccion.innerHTML = "";
    let listaParaMostrar = ordenarPeliculas(obtenerPeliculasFiltradas());

    listaParaMostrar.forEach(function (p) {
        contenedorColeccion.appendChild(crearTarjeta(p));
    });

    if (peliculas.length === 0) {
        estadoVacio.classList.remove("oculto");
    } else {
        estadoVacio.classList.add("oculto");
    }

    if (filtroTexto !== "" || filtroGenero !== "todos") {
        resultadosBusqueda.textContent = `${listaParaMostrar.length} de ${peliculas.length}`;
    } else {
        resultadosBusqueda.textContent = "";
    }
}

function actualizarEstadisticasDOM() {
    totalPeliculasEl.textContent = peliculas.length;
    totalVistasEl.textContent = peliculas.filter((p) => p.vista).length;
    totalPendientesEl.textContent = peliculas.filter((p) => !p.vista).length;

    const peliculasConNota = peliculas.filter(p => p.puntuacion > 0);
    if (peliculasConNota.length > 0) {
        const suma = peliculasConNota.reduce((acc, p) => acc + p.puntuacion, 0);
        puntuacionMediaEl.textContent = (suma / peliculasConNota.length).toFixed(1);
    } else {
        puntuacionMediaEl.textContent = "—";
    }

    if (peliculas.length > 0) {
        const conteo = {};
        peliculas.forEach((p) => { conteo[p.genero] = (conteo[p.genero] || 0) + 1; });
        let max = 0;
        let topGenero = "";
        Object.keys(conteo).sort().forEach((g) => {
            if (conteo[g] > max) {
                max = conteo[g];
                topGenero = g;
            }
        });
        generoFrecuenteEl.textContent = topGenero;
    } else {
        generoFrecuenteEl.textContent = "—";
    }
}

function renderizarTodo() {
    renderizarColeccion();
    actualizarEstadisticasDOM();
    actualizarSelectGeneros();
}

function manejarAgregarPelicula(e) {
    e.preventDefault();
    formError.textContent = "";

    const titulo = inputTitulo.value;
    const director = inputDirector.value;
    const anioRaw = inputAnio.value;
    const genero = selectGeneroForm.value;
    const puntuacionRaw = inputPuntuacion.value;

    const validacion = validarPelicula(titulo, genero, anioRaw, puntuacionRaw);
    if (!validacion.valido) {
        formError.textContent = validacion.errores.join(" · ");
        return;
    }

    const nuevaPelicula = {
        titulo: titulo.trim(),
        director: director.trim() !== "" ? director.trim() : "—",
        anio: anioRaw !== "" ? parseInt(anioRaw, 10) : "—",
        genero: genero,
        puntuacion: puntuacionRaw !== "" ? parseFloat(puntuacionRaw) : 0,
        vista: false,
    };

    peliculas.push(nuevaPelicula);
    guardarDatos();
    formulario.reset();
    inputTitulo.focus();
    renderizarTodo();
}

function manejarBusqueda(e) {
    filtroTexto = e.target.value;
    renderizarTodo();
}

function manejarFiltroGenero(e) {
    filtroGenero = e.target.value;
    renderizarTodo();
}

function manejarOrdenar(e) {
    ordenActual = e.target.dataset.orden;
    botonesOrdenar.forEach((btn) => btn.classList.remove("activo"));
    e.target.classList.add("activo");
    renderizarTodo();
}

function manejarTeclaEnter(e) {
    if (e.key === "Enter" && document.activeElement !== inputBusqueda) {
        e.preventDefault();
        formulario.requestSubmit();
    }
}

function configurarEventos() {
    formulario.addEventListener("submit", manejarAgregarPelicula);
    inputBusqueda.addEventListener("input", manejarBusqueda);
    selectFiltroGenero.addEventListener("change", manejarFiltroGenero);
    botonesOrdenar.forEach((btn) => btn.addEventListener("click", manejarOrdenar));
    window.addEventListener("keydown", manejarTeclaEnter);
}

function inicializar() {
    cargarDatos();
    configurarEventos();
    renderizarTodo();
    inputTitulo.focus();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('PWA lista para offline.'))
                .catch(err => console.log('Error PWA:', err));
        });
    }
}

inicializar();
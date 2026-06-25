const rutas = {
    home: "vistas/home.html",
    videojuegos: "vistas/videojuegos.html",
    consolas: "vistas/consolas.html",
    perifericos: "vistas/perifericos.html",
    checkout: "vistas/checkout.html",
    pedidos: "vistas/pedidos.html",
    perfil: "vistas/perfil.html",
    producto: "vistas/producto.html",
};

/**
 * Paginación genérica reutilizable para cualquier catálogo.
 * @param {string}   containerId  - Selector CSS del contenedor (#paginacionVideojuegos, etc.)
 * @param {Array}    lista        - Lista COMPLETA de productos (ya filtrada)
 * @param {number}   pagina       - Página actualmente visible (empieza en 1)
 * @param {number}   porPagina    - Cuántos items se muestran por página
 * @param {Function} onChange     - Función que recibe la nueva página cuando el usuario hace clic
 */
function crearPaginacion(containerId, lista, pagina, porPagina, onChange) {
    // 1. Buscamos en el HTML el contenedor donde se van a dibujar los botones (ej: #paginacionVideojuegos)
    const container = document.querySelector(containerId);
    if (!container) return; // Si no existe en la vista actual, nos salimos para no dar error

    // 2. Calculamos el total de páginas necesarias.
    // Ej: 12 productos / 8 por página = 1.5 -> Math.ceil redondea hacia arriba = 2 páginas.
    const totalPaginas = Math.ceil(lista.length / porPagina);

    // 3. Si todos los productos caben en una sola página, vaciamos el contenedor y no mostramos botones
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }

    // 4. Construimos los botones numerados (1, 2, 3...)
    // Array.from({ length: totalPaginas }) crea un array vacío del tamaño necesario.
    // map() lo recorre y crea un botón de HTML por cada número. Si el número coincide con la página actual, le pone la clase 'pag-active' para pintarlo de otro color.
    const botones = Array.from({ length: totalPaginas }, (_, i) => i + 1)
        .map(n => `<button class="pag-btn ${n == pagina ? 'pag-active' : ''}" data-pag="${n}">${n}</button>`)
        .join(''); // join('') une todos los botones en un solo texto HTML

    // 5. Inyectamos todo el HTML en el contenedor: Botón "Anterior" (<), los números, y Botón "Siguiente" (>)
    // Si estamos en la página 1, desactivamos el botón "Anterior" (disabled)
    // Si estamos en la última página, desactivamos el botón "Siguiente" (disabled)
    container.innerHTML = `
        <button class="pag-btn pag-prev" ${pagina == 1 ? 'disabled' : ''}>&#8249;</button>
        ${botones}
        <button class="pag-btn pag-next" ${pagina == totalPaginas ? 'disabled' : ''}>&#8250;</button>
    `;

    // 6. Asignamos los eventos (lo que pasa cuando haces clic en los botones)
    // Botón "Anterior": llama a la función onChange restándole 1 a la página actual
    container.querySelector('.pag-prev').onclick = () => onChange(pagina - 1);

    // Botón "Siguiente": llama a la función onChange sumándole 1 a la página actual
    container.querySelector('.pag-next').onclick = () => onChange(pagina + 1);

    // Botones numerados: buscamos todos (querySelectorAll), los recorremos y a cada uno le ponemos su evento para ir a esa página exacta
    container.querySelectorAll('[data-pag]').forEach(btn =>
        btn.onclick = () => onChange(parseInt(btn.dataset.pag))
    );
}


async function cargarVista(nombre, pushHistory = true, id = null) {
    const contenido = document.querySelector("#contenido-principal");

    try {
        const res = await fetch(rutas[nombre], { cache: 'no-store' });
        if (!res.ok) throw new Error("Vista no encontrada");
        const html = await res.text(); // coge el html de la vista seleccionada
        contenido.innerHTML = html; // lo pone en el contenedor principal

        // Siempre volver al inicio de la página al cambiar de vista
        window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
        contenido.innerHTML = "<p style='color:red;text-align:center;padding:40px;'>No se pudo cargar la sección.</p>";
        return;
    }

    // Añadir entrada al historial del navegador (solo si no venimos del botón atrás)
    if (pushHistory) {
        // Si hay ID (p.ej. producto), lo incluimos en la URL: #producto?id=15
        const hash = id ? `#${nombre}?id=${id}` : `#${nombre}`;
        history.pushState({ vista: nombre, id: id }, '', hash);
    }

    // Cerrar el dropdown de perfil si está abierto
    document.querySelector('#perfilDropdown')?.classList.remove('active');

    // Cerrar el drawer del carrito si está abierto
    document.querySelector('#cartDrawer')?.classList.remove('active');
    document.querySelector('#cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';

    // Marcar enlace activo
    document.querySelectorAll(".nav-link").forEach(function (e) {
        e.classList.toggle("active", e.dataset.vista == nombre);
    });

    // Llamar la función de inicio de cada vista
    if (nombre == "home") initHome();
    else if (nombre == "videojuegos") initVideojuegos();
    else if (nombre == "consolas") initConsolas();
    else if (nombre == "perifericos") initPerifericos();
    else if (nombre == "checkout") initCheckout();
    else if (nombre == "pedidos") initPedidos();
    else if (nombre == "perfil") initPerfil();
    else if (nombre == "producto") initProducto();
}

// ======= INICIO: Botón atrás/adelante del navegador =======
// Escucha el evento popstate que se dispara cuando el usuario pulsa ← o → en el navegador
window.addEventListener('popstate', function (e) {
    const vista = e.state?.vista || 'home';
    const id = e.state?.id || null;
    cargarVista(vista, false, id); // false → no volver a hacer pushState
});
// ======= FIN: Botón atrás/adelante del navegador =======

// Escuchar los clicks del nav
document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        cargarVista(link.dataset.vista);
    });
});

// Cargar la vista por defecto al entrar
cargarVista("home");

// Boton Mis Pedidos del dropdown de perfil
document.querySelector('#btnMisPedidos')?.addEventListener('click', function (event) {
    event.stopPropagation();
    cargarVista('pedidos');
});

// Boton Mi Perfil del dropdown de perfil
document.querySelector('#btnMiPerfil')?.addEventListener('click', function (event) {
    event.stopPropagation();
    cargarVista('perfil');
});

// Logo del header → vuelve a la página principal
document.querySelector('#logoHome')?.addEventListener('click', function () {
    cargarVista('home');
});

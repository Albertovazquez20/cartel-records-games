// ============== VIDEOJUEGOS.JS ==============
// Rutas relativas a index.php (raíz del proyecto)

// Calcular BASE_URL a partir de la URL real del navegador (ignora el #hash)
if (!window.BASE_URL) {
    window.BASE_URL = window.location.pathname.replace(/\/[^/]*$/, '/');
}

// Guardamos todos los productos para filtrar sin volver a llamar a la BD
let todosLosVideojuegos = [];
let listaFiltradaVJ = [];
let paginaActualVJ = 1;
const POR_PAGINA_VJ = 6;
const esAdmin = window.SESION.esAdmin;

// ── Crear tarjeta a partir del template ──────────────────────────────────────
function crearTarjetaVideojuego(producto) {
    const template = document.querySelector("#template-tarjeta");
    const clon = template.content.cloneNode(true);

    clon.querySelector(".videojuego-image img").src = "img/" + producto.imagen;
    clon.querySelector(".videojuego-image img").alt = producto.nombre;
    clon.querySelector(".stock-badge").textContent = producto.plataforma;
    clon.querySelector(".videojuego-titulo").textContent = producto.nombre;
    clon.querySelector(".videojuego-plataforma").textContent = producto.plataforma;
    clon.querySelector(".videojuego-precio").textContent = parseFloat(producto.precio).toFixed(2) + " €";
    clon.querySelector(".videojuego-card").dataset.id = producto.id_producto;

    const btnAnadir = clon.querySelector(".btn-anadir");
    btnAnadir.dataset.id = producto.id_producto;
    btnAnadir.dataset.nombre = producto.nombre;
    btnAnadir.dataset.precio = producto.precio;
    btnAnadir.dataset.imagen = producto.imagen;
    btnAnadir.addEventListener('click', () =>
        añadirAlCarrito(btnAnadir.dataset.id, btnAnadir.dataset.nombre, btnAnadir.dataset.precio, btnAnadir.dataset.imagen)
    );

    clon.querySelector(".btn-ver-mas").dataset.id = producto.id_producto;
    clon.querySelector(".btn-ver-mas").addEventListener('click', () => {
        // Guarda el producto y la vista de origen para poder volver
        window._productoOrigen = 'videojuegos';
        cargarVista('producto', true, producto.id_producto);
    });

    // ── Sin stock: desactiva el botón y marca la tarjeta
    if (parseInt(producto.stock) <= 0) {
        const card = clon.querySelector(".videojuego-card");
        card.classList.add('sin-stock');
        const btnAnadir = clon.querySelector('.btn-anadir');
        btnAnadir.disabled = true;
        btnAnadir.innerHTML = '🚫 Sin stock';
        const badge = document.createElement('span');
        badge.className = 'sin-stock-badge';
        badge.textContent = 'Sin stock';
        clon.querySelector('.videojuego-info').appendChild(badge);
    }

    // ── Botones de admin ──────────────────────────────────────────────────────
    if (esAdmin) {
        const adminBotones = clon.querySelector(".admin-botones");
        adminBotones.style.display = 'flex';

        adminBotones.querySelector(".btn-admin-editar").addEventListener('click', () =>
            abrirModalAdmin(producto)
        );

        adminBotones.querySelector(".btn-admin-eliminar").addEventListener('click', () =>
            eliminarProductoAdmin(producto.id_producto, producto.nombre)
        );
    }

    return clon;
}

// ── Pintar una lista de productos en el grid ─────────────────────────────────
function renderizarVideojuegos(lista) {
    listaFiltradaVJ = lista;
    const grid = document.querySelector("#videojuegosGrid");
    grid.innerHTML = "";

    // Tarjeta "Añadir producto" solo para admin
    if (esAdmin) {
        const tplAdd = document.querySelector("#template-admin-add");
        const cardAdd = tplAdd.content.cloneNode(true).querySelector(".admin-add-card");
        cardAdd.addEventListener('click', () => abrirModalAdmin(null));
        grid.appendChild(cardAdd);
    }

    if (lista.length == 0) {
        grid.innerHTML += '<p style="color:rgba(236, 17, 17, 0.5);text-align:center;padding:40px;grid-column:1/-1;">No se encontraron videojuegos.</p>';
        crearPaginacion('#paginacionVideojuegos', [], 1, POR_PAGINA_VJ, () => { });
        return;
    }

    // Cortamos el array: solo los productos de la página actual
    const inicio = (paginaActualVJ - 1) * POR_PAGINA_VJ;
    lista.slice(inicio, inicio + POR_PAGINA_VJ).forEach(p => grid.appendChild(crearTarjetaVideojuego(p)));

    // Función compartida (router.js): genera los botones de paginación
    crearPaginacion('#paginacionVideojuegos', lista, paginaActualVJ, POR_PAGINA_VJ, (nuevaPag) => {
        paginaActualVJ = nuevaPag;
        renderizarVideojuegos(listaFiltradaVJ);
        document.querySelector('#videojuegosGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ── Leer los filtros activos y volver a pintar ───────────────────────────────
function aplicarFiltrosVideojuegos() {
    paginaActualVJ = 1; // ← reset al filtrar
    const genero = (document.querySelector("#genero")?.value || "").toLowerCase();
    const plataforma = (document.querySelector("#plataforma")?.value || "").toLowerCase();
    const buscar = (document.querySelector("#buscar")?.value || "").toLowerCase().trim();
    const ordenar = document.querySelector("#ordenar")?.value || "";

    let filtrados = todosLosVideojuegos.filter(function (p) {

        // ¿Pasa el filtro de GÉNERO?
        let okGenero;
        if (genero == "") {
            okGenero = true;  // no hay filtro → pasa siempre
        } else {
            okGenero = (p.genero || "").toLowerCase().includes(genero);
        }

        // ¿Pasa el filtro de PLATAFORMA?
        let okPlataforma;
        if (plataforma == "") {
            okPlataforma = true;  // no hay filtro → pasa siempre
        } else {
            okPlataforma = (p.plataforma || "").toLowerCase().includes(plataforma);
        }

        // ¿Pasa el filtro de BÚSQUEDA? (busca en nombre Y en plataforma)
        let okBuscar;
        if (buscar == "") {
            okBuscar = true;
        } else {
            okBuscar = (p.nombre || "").toLowerCase().includes(buscar)
                || (p.plataforma || "").toLowerCase().includes(buscar);
        }

        // El producto solo pasa si cumple los 3 filtros a la vez
        return okGenero && okPlataforma && okBuscar;
    });

    if (ordenar == "precio-asc") filtrados.sort((a, b) => a.precio - b.precio);
    if (ordenar == "precio-desc") filtrados.sort((a, b) => b.precio - a.precio);
    if (ordenar == "nombre") filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    renderizarVideojuegos(filtrados);
}

// ── ADMIN: abrir modal (null = nuevo, objeto = editar) ───────────────────────
function abrirModalAdmin(producto) {
    const overlay = document.querySelector('#adminModalOverlay');
    const titulo = document.querySelector('#adminModalTitulo');
    const form = document.querySelector('#formAdminProducto');
    const msg = document.querySelector('#adminMsg');

    form.reset();
    msg.textContent = '';

    if (producto) {
        // Modo editar
        titulo.textContent = '✏️ Editar producto';
        document.querySelector('#adminProductoId').value = producto.id_producto;
        document.querySelector('#adminNombre').value = producto.nombre;
        document.querySelector('#adminPrecio').value = producto.precio;
        const catSelect = document.querySelector('#adminCategoria');
        catSelect.value = producto.categoria;
        if (!catSelect.value) catSelect.value = 'Videojuegos'; // fallback si no coincide
        document.querySelector('#adminPlataforma').value = producto.plataforma;
        document.querySelector('#adminMarca').value = producto.marca || '';
        document.querySelector('#adminGenero').value = producto.genero || '';
        document.querySelector('#adminStock').value = producto.stock;
        document.querySelector('#adminDescripcion').value = producto.descripcion || '';
        document.querySelector('#adminImagenActual').value = producto.imagen;
        document.querySelector('#adminImagenInfo').textContent = 'Imagen actual: ' + producto.imagen;
        document.querySelector('#adminEsNovedad').checked = producto.es_novedad == 1;
    } else {
        // Modo nuevo
        titulo.textContent = '➕ Nuevo producto';
        document.querySelector('#adminProductoId').value = 0;
        document.querySelector('#adminImagenActual').value = '';
        document.querySelector('#adminImagenInfo').textContent = '';
        document.querySelector('#adminCategoria').value = 'Videojuegos';
    }

    overlay.style.display = 'flex';
}

function cerrarModalAdmin() {
    document.querySelector('#adminModalOverlay').style.display = 'none';
}

// ── ADMIN: guardar producto (nuevo o editado) ─────────────────────────────────
async function guardarProductoAdmin(e) {
    e.preventDefault();
    const btn = document.querySelector('#btnAdminGuardar');
    const msg = document.querySelector('#adminMsg');

    btn.disabled = true;
    btn.textContent = '⏳ Guardando…';
    msg.textContent = '';

    try {
        const formData = new FormData(document.querySelector('#formAdminProducto'));
        const res = await fetch(window.BASE_URL + 'api/admin/productos.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.error) {
            msg.textContent = '❌ ' + data.error;
            msg.style.color = '#f87171';
        } else {
            msg.textContent = '✅ Producto guardado correctamente.';
            msg.style.color = '#6ee7b7';
            // Recargar la lista
            const response = await fetch(window.BASE_URL + "api/videojuegos.php", { cache: "no-store" });
            todosLosVideojuegos = await response.json();
            setTimeout(() => {
                cerrarModalAdmin();
                renderizarVideojuegos(todosLosVideojuegos);
                if (typeof initConsolas === 'function') initConsolas();
                if (typeof initPerifericos === 'function') initPerifericos();
            }, 800);
        }
    } catch (err) {
        msg.textContent = '❌ Error de conexión.';
        msg.style.color = '#f87171';
    }

    btn.disabled = false;
    btn.textContent = '💾 Guardar producto';
}

// ── ADMIN: eliminar producto ──────────────────────────────────────────────────
async function eliminarProductoAdmin(id, nombre) {
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) return;

    try {
        const res = await fetch(window.BASE_URL + 'api/admin/productos.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id_producto=' + id
        });

        // Leer como texto primero para detectar errores PHP
        const rawText = await res.text();
        console.log('Respuesta eliminar (raw):', rawText);

        let data = {};
        try { data = JSON.parse(rawText); } catch (_) {
            alert('❌ Respuesta inesperada del servidor:\n' + rawText.substring(0, 300));
            return;
        }

        if (!res.ok || data.error) {
            alert('❌ ' + (data.error || 'Error al eliminar.'));
            return;
        }

        // Eliminar del array local y volver a página 1 para evitar páginas vacías
        todosLosVideojuegos = todosLosVideojuegos.filter(p => p.id_producto != id);
        paginaActualVJ = 1;
        renderizarVideojuegos(todosLosVideojuegos);

    } catch (err) {
        console.error('Error al eliminar:', err);
        alert('❌ Error: ' + err.message);
    }
}

// ── Carga inicial + enganche de filtros ──────────────────────────────────────
async function initVideojuegos() {
    const grid = document.querySelector("#videojuegosGrid");

    try {
        const response = await fetch(window.BASE_URL + "api/videojuegos.php", { cache: "no-store" });
        todosLosVideojuegos = await response.json();

        renderizarVideojuegos(todosLosVideojuegos);

        document.querySelector("#genero")?.addEventListener("change", aplicarFiltrosVideojuegos);
        document.querySelector("#plataforma")?.addEventListener("change", aplicarFiltrosVideojuegos);
        document.querySelector("#ordenar")?.addEventListener("change", aplicarFiltrosVideojuegos);
        document.querySelector("#buscar")?.addEventListener("input", aplicarFiltrosVideojuegos);

        // Eventos del modal admin
        document.querySelector('#adminModalClose')?.addEventListener('click', cerrarModalAdmin);
        document.querySelector('#adminModalOverlay')?.addEventListener('click', function (e) {
            if (e.target == this) cerrarModalAdmin();
        });
        document.querySelector('#formAdminProducto')?.addEventListener('submit', guardarProductoAdmin);

        // ── Toggle filtros móvil
        document.querySelector('#btnToggleFiltrosMobile')?.addEventListener('click', function () {
            const filtros = document.querySelector('.filtros-container');
            if (!filtros) return;
            const visible = filtros.classList.toggle('filtros-visible');
            this.classList.toggle('activo', visible);
            this.innerHTML = visible
                ? '<span>✕</span> Cerrar filtros'
                : '<span>🔍</span> Filtrar y Ordenar';
        });


    } catch (error) {
        console.error("❌ Error:", error);
        grid.innerHTML = "<p style='color: red;'>Error de conexión</p>";
    }
}
// ============== CONSOLAS.JS ==============
// Rutas relativas a index.php (raíz del proyecto)

// Guardamos todas las consolas para filtrar sin volver a llamar a la BD
let todasLasConsolas = [];
let listaFiltradaC = [];
let paginaActualC = 1;
const POR_PAGINA_C = 6;

// ── Crear tarjeta a partir del template ──────────────────────────────────────
function crearTarjetaConsola(producto) {
    const template = document.querySelector("#template-tarjeta");
    const clon = template.content.cloneNode(true);

    clon.querySelector(".consola-image img").src = "img/" + producto.imagen;
    clon.querySelector(".consola-image img").alt = producto.nombre;
    clon.querySelector(".stock-badge").textContent = producto.plataforma;
    clon.querySelector(".consola-titulo").textContent = producto.nombre;
    clon.querySelector(".consola-specs").textContent = producto.marca ? "🏷️ " + producto.marca : "";
    clon.querySelector(".consola-precio").textContent = parseFloat(producto.precio).toFixed(2) + " €";
    clon.querySelector(".consola-card").dataset.id = producto.id_producto;

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
        window._productoOrigen = 'consolas';
        cargarVista('producto', true, producto.id_producto);
    });

    // ── Sin stock: desactiva el botón y marca la tarjeta
    if (parseInt(producto.stock) <= 0) {
        const card = clon.querySelector(".consola-card");
        card.classList.add('sin-stock');
        const btnAnadir = clon.querySelector('.btn-anadir');
        btnAnadir.disabled = true;
        btnAnadir.innerHTML = '🚫 Sin stock';
        const badge = document.createElement('span');
        badge.className = 'sin-stock-badge';
        badge.textContent = 'Sin stock';
        clon.querySelector('.consola-info').appendChild(badge);
    }

    // ── Botones de admin
    if (esAdmin) {
        const adminBotones = clon.querySelector(".admin-botones");
        adminBotones.style.display = 'flex';
        adminBotones.querySelector(".btn-admin-editar").addEventListener('click', () => abrirModalAdmin(producto));
        adminBotones.querySelector(".btn-admin-eliminar").addEventListener('click', () => eliminarProductoAdminConsolas(producto.id_producto, producto.nombre));
    }

    return clon;
}

// ── Pintar lista de consolas en el grid ──────────────────────────────────────
function renderizarConsolas(lista) {
    listaFiltradaC = lista;
    const grid = document.querySelector("#consolasGrid");
    grid.innerHTML = "";

    if (esAdmin) {
        const tplAdd = document.querySelector("#template-admin-add");
        const cardAdd = tplAdd.content.cloneNode(true).querySelector(".admin-add-card");
        cardAdd.addEventListener('click', () => abrirModalAdmin(null));
        grid.appendChild(cardAdd);
    }

    if (lista.length == 0) {
        grid.innerHTML += '<p style="color:rgba(236, 17, 17, 0.5);text-align:center;padding:40px;grid-column:1/-1;">No se encontraron consolas.</p>';
        crearPaginacion('#paginacionConsolas', [], 1, POR_PAGINA_C, () => { });
        return;
    }
    // Cortamos el array: solo los productos de la página actual
    const inicio = (paginaActualC - 1) * POR_PAGINA_C;
    lista.slice(inicio, inicio + POR_PAGINA_C).forEach(p => grid.appendChild(crearTarjetaConsola(p)));

    // Función compartida (router.js): genera los botones de paginación
    crearPaginacion('#paginacionConsolas', lista, paginaActualC, POR_PAGINA_C, (nuevaPag) => {
        paginaActualC = nuevaPag;
        renderizarConsolas(listaFiltradaC);
        document.querySelector('#consolasGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ── Leer filtros y volver a pintar ───────────────────────────────────────────
function aplicarFiltrosConsolas() {
    paginaActualC = 1;
    const marca = (document.querySelector("#marca")?.value || "").toLowerCase();
    const buscar = (document.querySelector("#buscar")?.value || "").toLowerCase().trim();
    const ordenar = document.querySelector("#ordenar")?.value || "";

    let filtrados = todasLasConsolas.filter(function (p) {

        // ¿Pasa el filtro de MARCA (filtra por plataforma en la BD)?
        let okMarca;
        if (marca == "") {
            okMarca = true;  // no hay filtro → pasa siempre
        } else {
            okMarca = (p.plataforma || "").toLowerCase().includes(marca);
        }

        // ¿Pasa el filtro de BÚSQUEDA? (busca en nombre Y en plataforma)
        let okBuscar;
        if (buscar == "") {
            okBuscar = true;
        } else {
            okBuscar = (p.nombre || "").toLowerCase().includes(buscar)
                || (p.plataforma || "").toLowerCase().includes(buscar);
        }

        // El producto solo pasa si cumple los 2 filtros a la vez
        return okMarca && okBuscar;
    });

    // Ordenar
    if (ordenar == "precio-asc") filtrados.sort((a, b) => a.precio - b.precio);
    if (ordenar == "precio-desc") filtrados.sort((a, b) => b.precio - a.precio);
    if (ordenar == "nombre") filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    renderizarConsolas(filtrados);
}

// ── ADMIN: abrir modal ────────────────────────────────────────────────────────
function abrirModalAdmin(producto) {
    const overlay = document.querySelector('#adminModalOverlay');
    document.querySelector('#formAdminProducto').reset();
    document.querySelector('#adminMsg').textContent = '';
    if (producto) {
        document.querySelector('#adminModalTitulo').textContent = '✏️ Editar producto';
        document.querySelector('#adminProductoId').value = producto.id_producto;
        document.querySelector('#adminNombre').value = producto.nombre;
        document.querySelector('#adminPrecio').value = producto.precio;
        const catSelect = document.querySelector('#adminCategoria');
        catSelect.value = producto.categoria;
        if (!catSelect.value) catSelect.value = 'Consolas'; // fallback si no coincide
        document.querySelector('#adminPlataforma').value = producto.plataforma;
        document.querySelector('#adminMarca').value = producto.marca || '';
        document.querySelector('#adminGenero').value = producto.genero || '';
        document.querySelector('#adminStock').value = producto.stock;
        document.querySelector('#adminDescripcion').value = producto.descripcion || '';
        document.querySelector('#adminImagenActual').value = producto.imagen;
        document.querySelector('#adminImagenInfo').textContent = 'Imagen actual: ' + producto.imagen;
        document.querySelector('#adminEsNovedad').checked = producto.es_novedad == 1;
    } else {
        document.querySelector('#adminModalTitulo').textContent = '➕ Nuevo producto';
        document.querySelector('#adminProductoId').value = 0;
        document.querySelector('#adminImagenActual').value = '';
        document.querySelector('#adminImagenInfo').textContent = '';
        document.querySelector('#adminCategoria').value = 'Consolas';
    }
    overlay.style.display = 'flex';
}

function cerrarModalAdmin() {
    document.querySelector('#adminModalOverlay').style.display = 'none';
}

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
            const response = await fetch(window.BASE_URL + "api/consolas.php", { cache: "no-store" });
            todasLasConsolas = await response.json();
            setTimeout(() => { cerrarModalAdmin(); renderizarConsolas(todasLasConsolas); if (typeof initVideojuegos === 'function') initVideojuegos(); if (typeof initPerifericos === 'function') initPerifericos(); }, 800);
        }
    } catch { msg.textContent = '❌ Error de conexión.'; msg.style.color = '#f87171'; }
    btn.disabled = false;
    btn.textContent = '💾 Guardar producto';
}

async function eliminarProductoAdminConsolas(id, nombre) {
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) return;
    try {
        const res = await fetch(window.BASE_URL + 'api/admin/productos.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id_producto=' + id
        });
        const rawText = await res.text();
        console.log('Respuesta eliminar consolas (raw):', rawText);
        let data = {};
        try { data = JSON.parse(rawText); } catch (_) {
            alert('❌ Respuesta inesperada:\n' + rawText.substring(0, 300));
            return;
        }
        if (!res.ok || data.error) { alert('❌ ' + (data.error || 'Error al eliminar.')); return; }
        todasLasConsolas = todasLasConsolas.filter(p => p.id_producto != id);
        renderizarConsolas(todasLasConsolas);
    } catch (err) { console.error('Error al eliminar:', err); alert('❌ Error: ' + err.message); }
}

// ── Carga inicial + enganche de filtros ──────────────────────────────────────
async function initConsolas() {
    const grid = document.querySelector("#consolasGrid");
    try {
        const response = await fetch(window.BASE_URL + "api/consolas.php", { cache: "no-store" });
        todasLasConsolas = await response.json();
        renderizarConsolas(todasLasConsolas);
        document.querySelector("#marca")?.addEventListener("change", aplicarFiltrosConsolas);
        document.querySelector("#ordenar")?.addEventListener("change", aplicarFiltrosConsolas);
        document.querySelector("#buscar")?.addEventListener("input", aplicarFiltrosConsolas);
        document.querySelector('#adminModalClose')?.addEventListener('click', cerrarModalAdmin);
        document.querySelector('#adminModalOverlay')?.addEventListener('click', function (e) { if (e.target == this) cerrarModalAdmin(); });
        document.querySelector('#formAdminProducto')?.addEventListener('submit', guardarProductoAdmin);
        // ── Toggle filtros móvil
        document.querySelector('#btnToggleFiltrosMobile')?.addEventListener('click', function () {
            const filtros = document.querySelector('.filtros-container');
            if (!filtros) return;
            const visible = filtros.classList.toggle('filtros-visible');
            this.classList.toggle('activo', visible);
            this.innerHTML = visible ? '<span>✕</span> Cerrar filtros' : '<span>🔍</span> Filtrar y Ordenar';
        });
    } catch (error) {
        console.error("❌ Error:", error);
        grid.innerHTML = "<p style='color: red;'>Error de conexión</p>";
    }
}
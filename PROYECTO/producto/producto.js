// ============== PRODUCTO.JS ==============
// Lógica de la vista de producto individual

// ── Renderizar descripción (reutiliza la lógica del modal) ──────────────────
function renderizarDescripcionProducto(rawDesc, contenedor) {
    if (!rawDesc || rawDesc == 'Sin descripción disponible.') {
        contenedor.textContent = 'Sin descripción disponible.';
        return;
    }

    let html = '';

    if (rawDesc.includes('||')) {
        // CASO 1: texto || specs
        const partes = rawDesc.split('||');
        const textoDesc = partes[0].trim();
        const specsRaw = partes[1].trim();

        if (textoDesc) {
            html += `<p class="modal-section-title">📄 Descripción</p>`;
            html += `<p class="modal-desc-texto">${textoDesc}</p>`;
        }
        if (specsRaw) {
            html += `<p class="modal-section-title">🔧 Especificaciones</p>`;
            const specs = specsRaw.split('|').map(s => s.trim()).filter(s => s.length > 0);
            html += '<ul class="modal-specs-list">';
            specs.forEach(spec => { // recorremos las especificaciones
                const sep = spec.indexOf(':'); // encontramos el separador : en la especificación
                if (sep != -1) { // si encuentra el separador : en la especificación
                    const clave = spec.substring(0, sep).trim();
                    const valor = spec.substring(sep + 1).trim();
                    html += `<li><span class="spec-key">${clave}</span><span class="spec-val">${valor}</span></li>`;
                } else { // si no encuentra el separador : en la especificación
                    html += `<li><span class="spec-val">${spec}</span></li>`;
                }
            });
            html += '</ul>';
        }

    } else if (rawDesc.includes('|')) {
        // CASO 2: solo specs
        html += `<p class="modal-section-title">🔧 Especificaciones</p>`;
        const specs = rawDesc.split('|').map(s => s.trim()).filter(s => s.length > 0);
        html += '<ul class="modal-specs-list">';
        specs.forEach(spec => {
            const sep = spec.indexOf(':');
            if (sep != -1) {
                const clave = spec.substring(0, sep).trim();
                const valor = spec.substring(sep + 1).trim();
                html += `<li><span class="spec-key">${clave}</span><span class="spec-val">${valor}</span></li>`;
            } else {
                html += `<li><span class="spec-val">${spec}</span></li>`;
            }
        });
        html += '</ul>';

    } else {
        // CASO 3: texto plano
        html += `<p class="modal-desc-texto">${rawDesc}</p>`;
    }

    contenedor.innerHTML = html;
}

// ── Cargar y mostrar reseñas de la página de producto ──────────────────────
async function cargarResenasPagina(id_producto) {
    try {
        const res = await fetch(`api/valoraciones.php?id_producto=${id_producto}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Rating resumen
        const mediaNum = parseFloat(data.media) || 0;
        document.querySelector('#prod-estrellas-resumen').innerHTML = renderStars(mediaNum);
        document.querySelector('#prod-nota-resumen').textContent = mediaNum > 0 ? mediaNum.toFixed(1) : '—';
        document.querySelector('#prod-total-resumen').textContent =
            data.total == 0 ? 'Sin valoraciones' :
                data.total == 1 ? '1 valoración' : `${data.total} valoraciones`;

        // También actualizar el rating de la columna izquierda
        document.querySelector('#prod-estrellas').innerHTML = renderStars(mediaNum);
        document.querySelector('#prod-nota-num').textContent = mediaNum > 0 ? mediaNum.toFixed(1) : '';
        document.querySelector('#prod-nota-total').textContent =
            data.total > 0 ? (data.total == 1 ? '1 valoración' : `${data.total} valoraciones`) : 'Sin valoraciones';

        // Lista de reseñas
        const lista = document.querySelector('#prod-resenas-lista');
        if (data.resenas.length == 0) {
            lista.innerHTML = `<div class="resenas-empty"><span>💬</span>Todavía no hay reseñas. ¡Sé el primero!</div>`;
        } else {
            lista.innerHTML = '';
            data.resenas.forEach(r => {
                const card = document.createElement('div');
                card.className = 'resena-card';
                card.innerHTML = `
                    <div class="resena-header">
                        <span class="resena-autor">${escHtml(r.nombre_usuario)}</span>
                        <div class="resena-meta">
                            <div class="resena-stars">${renderStars(r.puntuacion)}</div>
                            <span class="resena-fecha">${formatearFecha(r.fecha_valoracion)}</span>
                        </div>
                    </div>
                    ${r.comentarios ? `<p class="resena-comentario">${escHtml(r.comentarios)}</p>` : ''}`;
                lista.appendChild(card);
            });
        }

        // Mostrar formulario o avisos
        const formEl = document.querySelector('#prod-form-resena');
        const yaEl = document.querySelector('#prod-ya-valorado');
        const loginEl = document.querySelector('#prod-login-notice');
        const noCompraEl = document.querySelector('#prod-no-compra');

        if (!data.sesion) {
            loginEl.style.display = 'block';
        } else if (!data.ha_comprado) {
            noCompraEl.style.display = 'flex';
        } else if (data.ya_valoro) {
            yaEl.style.display = 'flex';
        } else {
            formEl.style.display = 'block';
        }

        document.querySelector('#prod-resenas').style.display = 'block';

    } catch (err) {
        console.error('❌ Error cargando reseñas de producto:', err);
    }
}

// ── Enviar valoración desde la página de producto ───────────────────────────
async function enviarValoracionPagina(e) {
    e.preventDefault();
    if (!window._productoActual) return;

    const puntuacion = parseInt(document.querySelector('.prod-star-picker input[type=radio]:checked')?.value || '0');
    const comentarios = document.querySelector('#prod-comentario').value.trim();
    const btnEnviar = document.querySelector('#prod-btn-resena');
    const msgEl = document.querySelector('#prod-resena-msg');

    if (puntuacion < 1 || puntuacion > 5) {
        msgEl.textContent = '⚠️ Por favor selecciona una puntuación de 1 a 5 estrellas.';
        msgEl.className = 'resena-msg err';
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Animar el star-picker para llamar la atención
        const picker = document.querySelector('.prod-star-picker');
        if (picker) {
            picker.style.animation = 'shake 0.4s ease';
            setTimeout(() => picker.style.animation = '', 400);
        }
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = '⏳ Enviando…';

    try {
        const formData = new FormData();
        formData.append('id_producto', window._productoActual.id_producto);
        formData.append('puntuacion', puntuacion);
        formData.append('comentarios', comentarios);

        const res = await fetch('api/valoraciones.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok || data.error) {
            msgEl.textContent = '❌ ' + (data.error || 'Error al enviar.');
            msgEl.className = 'resena-msg err';
        } else {
            msgEl.textContent = '✅ ¡Gracias! Tu reseña ha sido publicada.';
            msgEl.className = 'resena-msg ok';
            setTimeout(() => {
                document.querySelector('#prod-form-resena').style.display = 'none';
                document.querySelector('#prod-ya-valorado').style.display = 'flex';
                cargarResenasPagina(window._productoActual.id_producto);
            }, 1200);
        }
    } catch {
        msgEl.textContent = '❌ Error de conexión.';
        msgEl.className = 'resena-msg err';
    }

    btnEnviar.disabled = false;
    btnEnviar.textContent = '⭐ Publicar reseña';
}

// ── Inicialización de la vista de producto ──────────────────────────────────
async function initProducto() {
    const loading = document.querySelector('#prod-loading');
    const main = document.querySelector('#prod-main');

    // Leer el ID del producto desde la URL: #producto?id=15
    const hash = window.location.hash;           // "#producto?id=15"
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const id = parseInt(params.get('id')) || 0;

    if (!id) {
        loading.innerHTML = '<p style="color:#f87171;text-align:center;padding:40px;">No se pudo cargar el producto.</p>';
        return;
    }

    // Pedir los datos del producto al servidor por su ID
    let producto;
    try {
        const res = await fetch(`api/producto.php?id=${id}`);
        producto = await res.json();
        if (producto.error) throw new Error(producto.error);
    } catch {
        loading.innerHTML = '<p style="color:#f87171;text-align:center;padding:40px;">Producto no encontrado.</p>';
        return;
    }

    // Guardar referencia global para el formulario de valoración
    window._productoActual = producto;

    // Ocultar loading y mostrar contenido
    loading.style.display = 'none';
    main.style.display = 'grid';

    // Rellenar imagen
    const img = document.querySelector('#prod-img');
    img.src = 'img/' + producto.imagen;
    img.alt = producto.nombre;

    // Breadcrumb
    document.querySelector('#prod-bread-cat').textContent = producto.categoria || 'Productos';
    document.querySelector('#prod-bread-nombre').textContent = producto.nombre;

    // Nombre y precio
    document.querySelector('#prod-nombre').textContent = producto.nombre;
    document.querySelector('#prod-precio').textContent = parseFloat(producto.precio).toFixed(2) + ' €';

    // Badges
    const badgesEl = document.querySelector('#prod-badges');
    badgesEl.innerHTML = '';
    if (producto.plataforma) badgesEl.innerHTML += `<span class="prod-badge plat">${producto.plataforma}</span>`;
    if (producto.categoria) badgesEl.innerHTML += `<span class="prod-badge cat">${producto.categoria}</span>`;
    if (producto.marca) badgesEl.innerHTML += `<span class="prod-badge marca">🏷️ ${producto.marca}</span>`;
    if (producto.genero) badgesEl.innerHTML += `<span class="prod-badge genero">🎮 ${producto.genero}</span>`;

    // Stock
    const stockEl = document.querySelector('#prod-stock');
    const stock = parseInt(producto.stock);
    if (stock <= 0) {
        stockEl.innerHTML = '<span class="prod-stock sin-stock">🚫 Agotado</span>';
    } else if (stock <= 5) {
        stockEl.innerHTML = `<span class="prod-stock poco-stock">⚠️ Últimas unidades — solo ${stock} disponibles</span>`;
    } else {
        stockEl.innerHTML = `<span class="prod-stock en-stock">✅ En stock — ${stock} unidades</span>`;
    }

    // Descripción / Specs
    const descWrap = document.querySelector('#prod-desc-wrap');
    renderizarDescripcionProducto(producto.descripcion, descWrap);

    // Botón carrito
    const btnCarrito = document.querySelector('#prod-btn-carrito');
    if (stock <= 0) {
        btnCarrito.disabled = true;
        btnCarrito.textContent = '🚫 Sin stock';
    } else {
        btnCarrito.addEventListener('click', () => {
            añadirAlCarrito(producto.id_producto, producto.nombre, producto.precio, producto.imagen);
            btnCarrito.textContent = '✅ Añadido';
            setTimeout(() => { btnCarrito.innerHTML = '🛒 Añadir al carrito'; }, 1500);
        });
    }

    // Botón volver
    document.querySelector('#btnVolverProducto')?.addEventListener('click', () => {
        // Vuelve a la vista de origen (videojuegos, consolas, etc.)
        const origen = window._productoOrigen || 'videojuegos';
        cargarVista(origen);
    });

    // Cargar reseñas
    await cargarResenasPagina(producto.id_producto);

    // Formulario de reseña
    document.querySelector('#prod-form-resena-form')?.addEventListener('submit', enviarValoracionPagina);
}

// ============== VALORACIONES.JS ==============
// Modal de producto + carga y envío de reseñas

// ── Helper: renderizar N estrellas llenas/vacías ──────────────────────────────
function renderStars(puntuacion, total = 5) {
    let html = '';
    for (let i = 1; i <= total; i++) {
        if (i <= Math.floor(puntuacion)) {
            html += '<span class="star-icon filled">★</span>';
        } else if (i == Math.ceil(puntuacion) && puntuacion % 1 >= 0.5) {
            html += '<span class="star-icon half">★</span>';
        } else {
            html += '<span class="star-icon">★</span>';
        }
    }
    return html;
}

// ── Formatear fecha ───────────────────────────────────────────────────────────
function formatearFecha(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Objeto del producto activo en el modal ────────────────────────────────────
let _productoModal = null;

// ── Abrir modal ───────────────────────────────────────────────────────────────
function abrirModalProducto(producto) {
    _productoModal = producto;

    const overlay = document.querySelector('#modalProductoOverlay');
    const nombre = document.querySelector('#modalNombre');
    const img = document.querySelector('#modalImg');
    const precio = document.querySelector('#modalPrecio');
    const plat = document.querySelector('#modalPlataforma');
    const cat = document.querySelector('#modalCategoria');
    const desc = document.querySelector('#modalDescripcion');
    const btnCarr = document.querySelector('#modalBtnCarrito');

    nombre.textContent = producto.nombre;
    img.src = 'img/' + producto.imagen;
    img.alt = producto.nombre;
    precio.textContent = parseFloat(producto.precio).toFixed(2) + ' €';
    plat.textContent = producto.plataforma || '';
    cat.textContent = producto.categoria || '';

    // Marca (solo se muestra si tiene valor)
    const marca = document.querySelector('#modalMarca');
    if (producto.marca) {
        marca.textContent = '🏷️ ' + producto.marca;
        marca.style.display = 'inline-block';
    } else {
        marca.style.display = 'none';
    }

    // Género (solo se muestra si tiene valor)
    const genero = document.querySelector('#modalGenero');
    if (producto.genero) {
        genero.textContent = '🎮 ' + producto.genero;
        genero.style.display = 'inline-block';
    } else {
        genero.style.display = 'none';
    }

    // Stock: verde si hay stock, amarillo si quedan pocas, rojo si agotado
    const stockRow = document.querySelector('#modalStockRow');
    const stock = parseInt(producto.stock);
    if (stock <= 0) {
        stockRow.innerHTML = '<span class="modal-stock sin-stock">🚫 Agotado</span>';
    } else if (stock <= 5) {
        stockRow.innerHTML = `<span class="modal-stock poco-stock">⚠️ Últimas unidades — solo ${stock} disponibles</span>`;
    } else {
        stockRow.innerHTML = `<span class="modal-stock en-stock">✅ En stock — ${stock} unidades</span>`;
    }

    // CASOS:
    // 1. "Texto || CPU: x | GPU: y"  → descripción + lista de specs
    // 2. "CPU: x | GPU: y"           → solo lista de specs
    // 3. "Texto normal"              → solo párrafo de texto
    const rawDesc = producto.descripcion || 'Sin descripción disponible.';

    if (rawDesc.includes('||')) {
        // CASO 1: tiene descripción + specs separadas por '||'
        const partes = rawDesc.split('||');
        const textoDesc = partes[0].trim();   // parte izquierda → texto descriptivo
        const specsRaw  = partes[1].trim();   // parte derecha  → specs separadas por '|'

        let html = '';

        // Párrafo de descripción con su cabecera (si tiene texto)
        if (textoDesc) {
            html += `<p class="modal-section-title">📄 Descripción</p>`;
            html += `<p class="modal-desc-texto">${textoDesc}</p>`;
        }

        // Cabecera + lista de especificaciones
        if (specsRaw) {
            html += `<p class="modal-section-title">🔧 Especificaciones</p>`;

            // split('|') → divide en array | .map(trim) → quita espacios | .filter() → elimina vacíos
            const specs = specsRaw.split('|').map(s => s.trim()).filter(s => s.length > 0);
            html += '<ul class="modal-specs-list">';
            specs.forEach(spec => {
                // indexOf(':') busca la posición del ':' en la spec
                // Si devuelve -1 → no hay ':' | Si devuelve otro número → sí hay ':'
                const separador = spec.indexOf(':');
                if (separador != -1) {
                    // CASO NORMAL: "CPU: AMD Ryzen" → separa en clave (morado) y valor (blanco)
                    const clave = spec.substring(0, separador).trim();
                    const valor = spec.substring(separador + 1).trim();
                    html += `<li><span class="spec-key">${clave}</span><span class="spec-val">${valor}</span></li>`;
                } else {
                    // CASO DEFENSIVO: spec sin ':' → muestra el texto entero como valor (evita que pete)
                    html += `<li><span class="spec-val">${spec}</span></li>`;
                }
            });
            html += '</ul>';
        }

        desc.innerHTML = html;

    } else if (rawDesc.includes('|')) {
        // CASO 2: solo specs (sin descripción de texto)
        // split('|') → divide el texto en array usando '|' como separador
        // .map(trim)  → quita espacios al inicio/final de cada elemento
        // .filter()   → elimina elementos vacíos (p.ej. si hay '||' doble o '|' al final)
        const specs = rawDesc.split('|').map(s => s.trim()).filter(s => s.length > 0);

        // Cabecera de especificaciones (siempre visible cuando hay specs)
        let html = '<p class="modal-section-title">🔧 Especificaciones</p>';
        html += '<ul class="modal-specs-list">';
        specs.forEach(spec => {
            // Si tiene formato "Clave: Valor" → separar para resaltar la clave
            const separador = spec.indexOf(':');
            if (separador != -1) {
                const clave = spec.substring(0, separador).trim();
                const valor = spec.substring(separador + 1).trim();
                html += `<li><span class="spec-key">${clave}</span><span class="spec-val">${valor}</span></li>`;
            } else {
                html += `<li><span class="spec-val">${spec}</span></li>`;
            }
        });
        html += '</ul>';
        desc.innerHTML = html;


    } else {
        // CASO 3: texto normal sin specs
        desc.textContent = rawDesc;
    }


    // Header: nombre truncado
    document.querySelector('#modalHeaderNombre').textContent = producto.nombre;

    // Botón carrito
    btnCarr.dataset.id = producto.id_producto;
    btnCarr.dataset.nombre = producto.nombre;
    btnCarr.dataset.precio = producto.precio;
    btnCarr.dataset.imagen = producto.imagen;

    // Limpiar estado previo
    document.querySelector('#resenasLista').innerHTML =
        '<div class="modal-loading"><div class="modal-spinner"></div> Cargando reseñas…</div>';
    document.querySelector('#modalEstrellaMedia').innerHTML = '';
    document.querySelector('#modalNotaNum').textContent = '';
    document.querySelector('#modalNotaTotal').textContent = '';
    document.querySelector('#modalFormResena').style.display = 'none';
    document.querySelector('#modalYaValorado').style.display = 'none';
    document.querySelector('#modalLoginNotice').style.display = 'none';
    document.querySelector('#modalNoCompra').style.display = 'none';
    document.querySelector('#resenaMsg').className = 'resena-msg';
    document.querySelector('#resenaMsg').textContent = '';
    document.querySelector('#resenaComentario').value = '';
    // Limpiar radio buttons
    document.querySelectorAll('.star-picker input[type=radio]').forEach(r => r.checked = false);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    cargarValoraciones(producto.id_producto);
}

// ── Cerrar modal ──────────────────────────────────────────────────────────────
function cerrarModalProducto() {
    const overlay = document.querySelector('#modalProductoOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    _productoModal = null;
}

// ── Cargar valoraciones desde la API ─────────────────────────────────────────
async function cargarValoraciones(id_producto) {
    try {
        const res = await fetch(`api/valoraciones.php?id_producto=${id_producto}`, { cache: 'no-store' });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // --- Estadísticas globales ---
        const mediaNum = parseFloat(data.media) || 0;
        document.querySelector('#modalEstrellaMedia').innerHTML = renderStars(mediaNum); //devuelve estrellas en HTML
        document.querySelector('#modalNotaNum').textContent = mediaNum > 0 ? mediaNum.toFixed(1) : '—';
        document.querySelector('#modalNotaTotal').textContent =
            data.total == 0 ? 'Sin valoraciones' :
                data.total == 1 ? '1 valoración' : `${data.total} valoraciones`;

        // --- Lista de reseñas ---
        const lista = document.querySelector('#resenasLista');
        if (data.resenas.length == 0) {
            lista.innerHTML = `
                <div class="resenas-empty">
                    <span>💬</span>
                    Todavía no hay reseñas. ¡Sé el primero en valorar este producto!
                </div>`;
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
                    ${r.comentarios
                        ? `<p class="resena-comentario">${escHtml(r.comentarios)}</p>`
                        : ''}`;
                lista.appendChild(card);
            });
        }

        // --- Formulario o mensaje según sesión / compra / ya valoró ---
        const formEl = document.querySelector('#modalFormResena');
        const yaEl = document.querySelector('#modalYaValorado');
        const loginEl = document.querySelector('#modalLoginNotice');
        const noCompraEl = document.querySelector('#modalNoCompra');

        if (!data.sesion) {
            // Sin sesión
            loginEl.style.display = 'block';
        } else if (!data.ha_comprado) {
            // Logueado pero no ha comprado este producto
            noCompraEl.style.display = 'flex';
        } else if (data.ya_valoro) {
            // Comprado y ya valorado
            yaEl.style.display = 'flex';
        } else {
            // Comprado y sin valorar → mostrar formulario
            formEl.style.display = 'block';
        }

    } catch (err) {
        document.querySelector('#resenasLista').innerHTML =
            `<p style="color:#f87171;text-align:center;padding:20px;">Error al cargar las reseñas.</p>`;
        console.error('❌ valoraciones:', err);
    }
}

// ── Enviar valoración ─────────────────────────────────────────────────────────
async function enviarValoracion(e) {
    e.preventDefault();
    if (!_productoModal) return;

    const puntuacion = parseInt(document.querySelector('.star-picker input[type=radio]:checked')?.value || '0');
    const comentarios = document.querySelector('#resenaComentario').value.trim();
    const btnEnviar = document.querySelector('#btnEnviarResena');
    const msgEl = document.querySelector('#resenaMsg');

    if (puntuacion < 1 || puntuacion > 5) {
        msgEl.textContent = '⚠️ Por favor selecciona una puntuación de 1 a 5 estrellas.';
        msgEl.className = 'resena-msg err';
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.textContent = '⏳ Enviando…';
    msgEl.className = 'resena-msg';

    try {
        const formData = new FormData();
        formData.append('id_producto', _productoModal.id_producto);
        formData.append('puntuacion', puntuacion);
        formData.append('comentarios', comentarios);

        const res = await fetch('api/valoraciones.php', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (!res.ok || data.error) {
            msgEl.textContent = '❌ ' + (data.error || 'Error al enviar.');
            msgEl.className = 'resena-msg err';
            btnEnviar.disabled = false;
            btnEnviar.textContent = '⭐ Publicar reseña';
            return;
        }

        // Éxito
        msgEl.textContent = '✅ ¡Gracias! Tu reseña ha sido publicada.';
        msgEl.className = 'resena-msg ok';

        // Ocultar formulario y recargar la lista
        setTimeout(() => {
            document.querySelector('#modalFormResena').style.display = 'none';
            document.querySelector('#modalYaValorado').style.display = 'flex';
            cargarValoraciones(_productoModal.id_producto);
        }, 1200);

    } catch (err) {
        msgEl.textContent = '❌ Error de conexión.';
        msgEl.className = 'resena-msg err';
        btnEnviar.disabled = false;
        btnEnviar.textContent = '⭐ Publicar reseña';
    }
}

// ── Escape HTML ───────────────────────────────────────────────────────────────
function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ── Inicialización: enganchar eventos del modal ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar con botón X
    document.querySelector('#modalCloseBtn')?.addEventListener('click', cerrarModalProducto);

    // Cerrar al hacer clic en el overlay (fuera del modal)
    document.querySelector('#modalProductoOverlay')?.addEventListener('click', function (e) {
        if (e.target == this) cerrarModalProducto();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => {
        if (e.key == 'Escape') cerrarModalProducto();
    });

    // Botón "Añadir al carrito" dentro del modal
    document.querySelector('#modalBtnCarrito')?.addEventListener('click', function () {
        añadirAlCarrito(this.dataset.id, this.dataset.nombre, this.dataset.precio, this.dataset.imagen);
        // Feedback visual
        this.textContent = '✅ Añadido';
        setTimeout(() => { this.innerHTML = '🛒 Añadir al carrito'; }, 1500);
    });

    // Formulario de reseña
    document.querySelector('#formResena')?.addEventListener('submit', enviarValoracion);
});

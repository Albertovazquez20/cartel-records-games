// ============== HOME.JS ==============
// Rutas relativas a index.php (raíz del proyecto)
// api/home.php   →  api/ sin ../
// img/xxx.jpg    →  img/ sin ../
//
// SECCIONES DE ESTE ARCHIVO:
// ─────────────────────────────────────────────────
// 1. NOVEDADES (carrusel superior)
//    crearSlide()       → crea cada slide del carrusel con un producto
//    iniciarCarrusel()  → controla la animación y los dots del carrusel
//
// 2. MÁS VENDIDOS (grid de tarjetas)
//    crearCard()        → crea cada tarjeta de producto más vendido
//
// 3. PRÓXIMOS LANZAMIENTOS (cinema / slider cinematográfico)
//    renderCinema()     → genera los slides desde la BD (dinámico)
//    iniciarCinema()    → controla la animación del cinema
//
// 4. RESERVAS (botón "Reservar Ahora" en cada slide del cinema)
//    Dentro de initHome() → evento click en .btn-premiere
//    Llama a api/reservas.php (POST) para guardar la reserva en la BD
//
// Todo se ejecuta desde initHome() que hace el fetch a api/home.php
// ─────────────────────────────────────────────────

const BADGES = ['🔥 Nuevo', '💣 Trending', '⚽ Bestseller'];

const CATEGORIAS_ICONO = {
    'Videojuegos': '🎮', 'Videojuego': '🎮',
    'Consolas': '🕹️', 'Consola': '🕹️',
    'Accesorios': '🎧', 'Accesorio': '🎧',
};

// ============== CARRUSEL ==============
function crearSlide(producto, index) {
    const template = document.querySelector('#template-slide');
    const clon = template.content.cloneNode(true);

    clon.querySelector('.foto-novedad').src = 'img/' + producto.imagen;
    clon.querySelector('.foto-novedad').alt = producto.nombre;
    clon.querySelector('.badge-nuevo').textContent = BADGES[index % BADGES.length];
    clon.querySelector('.texto-novedad-titulo').textContent = producto.nombre;
    clon.querySelector('.plataforma-badge').textContent = producto.plataforma;
    clon.querySelector('.descripcion').textContent = producto.descripcion;
    clon.querySelector('.precio').textContent = parseFloat(producto.precio).toFixed(2) + ' €';
    const btn = clon.querySelector('.btn-comprar');
    btn.dataset.id = producto.id_producto;
    btn.dataset.nombre = producto.nombre;
    btn.dataset.precio = producto.precio;
    btn.dataset.imagen = producto.imagen;
    btn.addEventListener('click', () =>
        añadirAlCarrito(btn.dataset.id, btn.dataset.nombre, btn.dataset.precio, btn.dataset.imagen)
    );

    if (index == 0) clon.querySelector('.slide').classList.add('active');

    // Botón "Ver más" → navega a la ficha del producto
    clon.querySelector('.btn-ver-mas-slide').addEventListener('click', () => {
        window._productoOrigen = 'home';
        cargarVista('producto', true, producto.id_producto);
    });

    return clon;
}

function iniciarCarrusel(slides) {
    if (slides.length == 0) return null;

    let actual = 0;
    let timer = null;

    // Generar dots dinámicamente según el número de slides
    const navEl = document.querySelector('#carruselNav');
    if (navEl) {
        navEl.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'carrusel-dot' + (i === 0 ? ' active' : '');
            navEl.appendChild(dot);
        });
    }
    const dots = document.querySelectorAll('.carrusel-dot');

    function mostrar(nuevoIndex) {
        const nuevo = ((nuevoIndex % slides.length) + slides.length) % slides.length;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[nuevo].classList.add('active');
        dots[nuevo]?.classList.add('active');
        actual = nuevo;
    }

    function reiniciarTimer() {
        clearInterval(timer);
        timer = setInterval(() => mostrar(actual + 1), 5000);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { mostrar(i); reiniciarTimer(); }));
    reiniciarTimer();

    return {
        siguiente: () => { mostrar(actual + 1); reiniciarTimer(); },
        anterior: () => { mostrar(actual - 1); reiniciarTimer(); }
    };
}

// ============== CINEMA DINÁMICO (PRÓXIMOS LANZAMIENTOS) ==============
// Genera los slides del cinema a partir de los datos de la BD
function renderCinema(proximos) {
    // Buscamos el contenedor donde irán las imágenes gigantes (slides)
    const slidesContainer = document.querySelector('#cinemaSlides');
    // Buscamos el contenedor donde irán los puntitos de navegación de abajo
    const navContainer = document.querySelector('#cinemaNav');
    // Buscamos la plantilla oculta en el HTML que define cómo es un slide
    const tpl = document.querySelector('#template-cinema-slide');

    // Si falta algún contenedor o no hay próximos juegos en la BD, nos salimos
    if (!slidesContainer || !tpl || !proximos || proximos.length == 0) return;

    // Recorremos cada juego que ha llegado de la base de datos
    proximos.forEach((juego, index) => {
        // 1. Clonar el template (crear una copia de la estructura HTML vacía)
        const slide = tpl.content.cloneNode(true).querySelector('.cinema-slide');

        // Elegimos la imagen del juego (si existe 'imagen_juego', si no 'imagen')
        const imagenJuego = juego.imagen_juego || juego.imagen || '';
        const imgEl = slide.querySelector('.cinema-img'); // Buscamos la etiqueta <img>
        imgEl.alt = juego.nombre; // Le ponemos el texto alternativo
        imgEl.src = 'img/' + imagenJuego; // Le asignamos la ruta de la imagen

        // Asignar la misma imagen al ::before del fondo para hacer el efecto borroso chulo (backdrop)
        slide.querySelector('.slide-backdrop').style.setProperty('--bg-img', `url('img/${imagenJuego}')`);

        // Escribimos el nombre del juego en el título del slide
        slide.querySelector('.premiere-title').textContent = juego.nombre;
        // Escribimos la fecha de estreno (por ejemplo: "27 Septiembre 2026")
        slide.querySelector('.date-value').textContent = juego.texto_fecha || juego.fecha_estreno;

        // Si la base de datos trae un enlace a un trailer, se lo ponemos al botón de "Ver Trailer"
        if (juego.url_trailer) {
            slide.querySelector('.premiere-badge').href = juego.url_trailer;
        }

        // Guardamos la fecha exacta del estreno (ISO) en el HTML para que el cronómetro sepa calcularlo
        slide.querySelector('.premiere-countdown').dataset.date = juego.fecha_estreno + 'T00:00:00';

        // Guardamos los datos técnicos en el botón "Reservar Ahora" para cuando el usuario pinche en él
        const btnReserva = slide.querySelector('.btn-premiere');
        btnReserva.dataset.juego = juego.nombre; // Guardamos el nombre
        btnReserva.dataset.imagen = juego.imagen_juego || juego.imagen || ''; // Guardamos la foto
        btnReserva.dataset.estreno = juego.fecha_estreno; // Guardamos la fecha
        btnReserva.dataset.precio = juego.precio || 0; // Guardamos el precio (o 0 si no tiene)
        btnReserva.dataset.idLanzamiento = juego.id; // FK → proximos_lanzamientos (ID para la BD)

        // Botones de admin en cada slide
        if (window.SESION?.esAdmin) {
            const adminWrap = document.createElement('div');
            adminWrap.className = 'cinema-admin-btns';
            adminWrap.innerHTML = `
                <button class="btn-cinema-editar" title="Editar">✏️ Editar</button>
                <button class="btn-cinema-eliminar" title="Eliminar">🗑️ Eliminar</button>
            `;
            adminWrap.querySelector('.btn-cinema-editar').addEventListener('click', () => abrirModalEditarLanzamiento(juego));
            adminWrap.querySelector('.btn-cinema-eliminar').addEventListener('click', () => eliminarLanzamiento(juego.id, juego.nombre));
            slide.appendChild(adminWrap);
        }

        slidesContainer.appendChild(slide);

        // 2. Crear un dot de navegación por cada slide
        const dot = document.createElement('span');
        dot.className = 'cinema-dot' + (index == 0 ? ' active' : '');
        navContainer.appendChild(dot);
    });

    // Ajustar anchos dinámicamente según el número real de slides
    const total = proximos.length;
    slidesContainer.style.width = (total * 100) + '%';
    slidesContainer.querySelectorAll('.cinema-slide').forEach(s => {
        s.style.width = (100 / total) + '%';
    });
}

// ============== CINEMA (ANÍMACION) ==============
function iniciarCinema() {
    const contenedor = document.querySelector('.cinema-slides');
    const dots = Array.from(document.querySelectorAll('.cinema-dot'));
    const total = document.querySelectorAll('.cinema-slide').length;
    if (!contenedor || total == 0) return;

    let actual = 0;
    let timer = null;

    function mostrarCinema(nuevoIndex) {
        const nuevo = ((nuevoIndex % total) + total) % total;
        // Mover el contenedor con translateX (igual que hacía el @keyframes)
        contenedor.style.transform = `translateX(-${nuevo * (100 / total)}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[nuevo]?.classList.add('active');
        actual = nuevo;
    }

    function reiniciarTimer() {
        clearInterval(timer);
        timer = setInterval(() => mostrarCinema(actual + 1), 6000);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { mostrarCinema(i); reiniciarTimer(); }));
    document.querySelector('#cinemaPrev')?.addEventListener('click', () => { mostrarCinema(actual - 1); reiniciarTimer(); });
    document.querySelector('#cinemaNext')?.addEventListener('click', () => { mostrarCinema(actual + 1); reiniciarTimer(); });

    mostrarCinema(0);
    reiniciarTimer();
}

function crearCard(producto, ranking) {
    const template = document.querySelector('#template-card');
    const clon = template.content.cloneNode(true);

    const icono = CATEGORIAS_ICONO[producto.categoria] || '🎮';

    clon.querySelector('.card-image-vertical img').src = 'img/' + producto.imagen;
    clon.querySelector('.card-image-vertical img').alt = producto.nombre;
    clon.querySelector('.ranking-badge-vertical').textContent = '#' + ranking;
    clon.querySelector('.game-category').textContent = icono + ' ' + producto.categoria;
    clon.querySelector('h3').textContent = producto.nombre;
    clon.querySelector('.game-description').textContent = producto.descripcion || '';
    clon.querySelector('.platform-tag').textContent = producto.plataforma;
    clon.querySelector('.current-price-vertical').textContent = parseFloat(producto.precio).toFixed(2) + ' €';
    const btnCart = clon.querySelector('.btn-add-cart');
    btnCart.dataset.id = producto.id_producto;
    btnCart.dataset.nombre = producto.nombre;
    btnCart.dataset.precio = producto.precio;
    btnCart.dataset.imagen = producto.imagen;
    btnCart.addEventListener('click', () =>
        añadirAlCarrito(btnCart.dataset.id, btnCart.dataset.nombre, btnCart.dataset.precio, btnCart.dataset.imagen)
    );

    // Botón Ver más → navega a la vista de producto
    clon.querySelector('.btn-ver-mas-home').addEventListener('click', () => {
        window._productoOrigen = 'home';
        cargarVista('producto', true, producto.id_producto);
    });

    // Vista rápida: abre la imagen en una pestaña nueva
    clon.querySelector('.quick-view').addEventListener('click', () => {
        window.open('img/' + producto.imagen, '_blank');
    });

    return clon;
}

// ============== CARGAR DATOS DE LA API ==============
async function initHome() {
    try {
        // Hacemos una petición al backend (PHP) para traer todos los datos de la portada
        const response = await fetch('api/home.php', { cache: 'no-store' });
        // Convertimos la respuesta cruda del servidor en un objeto JSON manejable en JavaScript
        const data = await response.json();

        // Si el servidor ha devuelto un error explícito, lo imprimimos en la consola y cortamos aquí
        if (data.error) {
            console.error('❌ Error API:', data.error);
            return;
        }

        // --- SECCIÓN 1: NOVEDADES (El carrusel superior) ---
        const carruselContainer = document.querySelector('#carruselContainer');
        // Por cada producto marcado como novedad, creamos un HTML (crearSlide) y lo metemos al contenedor
        data.novedades.forEach((prod, i) => {
            carruselContainer.appendChild(crearSlide(prod, i));
        });
        // Arrancamos la animación automática (pasándole la lista de elementos recién creados)
        const nav = iniciarCarrusel(Array.from(carruselContainer.querySelectorAll('.slide')));

        // Si se han creado flechas manuales para navegar (izquierda/derecha), les asignamos eventos
        if (nav) {
            document.querySelector('#carruselPrev')?.addEventListener('click', nav.anterior);
            document.querySelector('#carruselNext')?.addEventListener('click', nav.siguiente);
        }

        // --- SECCIÓN 2: MÁS VENDIDOS ---
        const grid = document.querySelector('#masVendidosGrid');
        // Recorremos la lista de productos más vendidos y los pintamos uno a uno
        data.masVendidos.forEach((prod, i) => {
            grid.appendChild(crearCard(prod, i + 1)); // El i+1 es para poner el ranking (#1, #2...)
        });

        // --- SECCIÓN 3: PRÓXIMOS LANZAMIENTOS (Cinema) ---
        // Generamos los bloques HTML (los pósters grandes)
        renderCinema(data.proximosLanzamientos);
        // Empezamos la animación de desplazamiento de izquierda a derecha (el slide)
        iniciarCinema();

        // Countdowns: se ejecutan después de renderCinema() porque los elementos
        // .premiere-countdown los genera renderCinema() dinámicamente
        function updateCountdown(el) {
            const diff = new Date(el.dataset.date).getTime() - Date.now();
            if (diff > 0) {
                el.querySelector('.days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
                el.querySelector('.hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
                el.querySelector('.minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
                el.querySelector('.seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
            }
        }
        const countdowns = document.querySelectorAll('.premiere-countdown');
        countdowns.forEach(updateCountdown);
        setInterval(() => countdowns.forEach(updateCountdown), 1000);

        // Botones de reserva → abren el modal en vez de reservar directamente
        document.querySelectorAll('.btn-premiere').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!window.SESION?.id) {
                    alert('⚠️ Debes iniciar sesión para reservar un juego.');
                    return;
                }
                abrirModalReserva({
                    juego: this.dataset.juego,
                    imagen: this.dataset.imagen,
                    estreno: this.dataset.estreno,
                    precio: this.dataset.precio,
                    idLanzamiento: this.dataset.idLanzamiento  // FK
                });
            });
        });

        initModalReserva();
        initAdminLanzamientos();

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// ============== MODAL DE RESERVA ==============
async function abrirModalReserva({ juego, imagen, estreno, precio, idLanzamiento }) {
    const modal = document.querySelector('#modalReserva');

    // Rellenar cabecera del modal
    const img = document.querySelector('#modalReservaImg');
    img.src = 'img/' + imagen;
    img.alt = juego;
    document.querySelector('#modalReservaTitulo').textContent = juego;
    document.querySelector('#modalReservaFecha').textContent = '📅 Estreno: ' + estreno;
    document.querySelector('#modalReservaPrecio').textContent = parseFloat(precio || 0).toFixed(2) + ' €';
    document.querySelector('#mPrecioBtn').textContent = parseFloat(precio || 0).toFixed(2) + ' €';

    // Campos ocultos
    document.querySelector('#mNombreJuego').value = juego;
    document.querySelector('#mImagenJuego').value = imagen;
    document.querySelector('#mFechaEstreno').value = estreno;
    document.querySelector('#mPrecio').value = precio || 0;
    document.querySelector('#mIdLanzamiento').value = idLanzamiento || '';  // FK

    // Limpiar error previo
    const mError = document.querySelector('#mError');
    mError.style.display = 'none';
    mError.textContent = '';

    // Cargar direcciones guardadas del usuario
    const listaDirs = document.querySelector('#mDireccionesSaved');
    listaDirs.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">Cargando direcciones…</p>';
    try {
        const res = await fetch('api/direcciones.php');
        const dirs = await res.json();

        if (!dirs.length) {
            listaDirs.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;">No tienes direcciones guardadas. Usa el formulario de abajo.</p>';
        } else {
            listaDirs.innerHTML = dirs.map((d, i) => `
                <label class="modal-dir-option">
                    <input type="radio" name="id_direccion_existente" value="${d.id_direccion}" ${i == 0 ? 'checked' : ''}>
                    <span>${d.calle}, ${d.ciudad} — ${d.codigo_postal}</span>
                </label>
            `).join('');
        }
    } catch {
        listaDirs.innerHTML = '<p style="color:#f87171;font-size:0.85rem;">Error al cargar direcciones.</p>';
    }

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalReserva() {
    document.querySelector('#modalReserva').style.display = 'none';
    document.body.style.overflow = '';
}

// ============== EVENTOS DEL MODAL ==============
// Se llama desde initHome() cuando home.html ya está en el DOM
function initModalReserva() {

    // Cerrar con la X
    document.querySelector('#btnCerrarModalReserva')?.addEventListener('click', cerrarModalReserva);

    // Cerrar al hacer click en el fondo oscuro
    document.querySelector('#modalReserva')?.addEventListener('click', e => {
        if (e.target.id == 'modalReserva') cerrarModalReserva();
    });

    // Mostrar/ocultar campos de pago según método seleccionado
    const selectPago = document.querySelector('#selectMetodoPago');
    const datosTarjeta = document.querySelector('#datosTarjeta');
    const datosPaypal = document.querySelector('#datosPaypal');

    function actualizarCamposPago() {
        const val = selectPago?.value;
        if (datosTarjeta) datosTarjeta.style.display = (val == 'Tarjeta') ? 'block' : 'none';
        if (datosPaypal) datosPaypal.style.display = (val == 'PayPal') ? 'block' : 'none';
    }
    selectPago?.addEventListener('change', actualizarCamposPago);
    actualizarCamposPago(); // estado inicial

    // Formato automático número de tarjeta: grupos de 4
    document.querySelector('#numTarjeta')?.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });

    // Formato automático caducidad MM/AA
    document.querySelector('#caducidadTarjeta')?.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
        this.value = v;
    });

    // Envío del formulario de reserva
    document.querySelector('#formReserva')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const form = document.querySelector('#formReserva');
        const mError = document.querySelector('#mError');
        const btnConf = form.querySelector('.modal-btn-confirmar');

        btnConf.disabled = true;
        btnConf.textContent = '⏳ Procesando...';
        mError.style.display = 'none';

        try {
            const formData = new FormData(form);

            // Validar que hay dirección
            const radioDir = form.querySelector('input[name="id_direccion_existente"]:checked');
            const calleVal = form.querySelector('input[name="calle"]')?.value.trim();

            if (!radioDir && !calleVal) {
                mError.textContent = '⚠️ Debes seleccionar o añadir una dirección de envío.';
                mError.style.display = 'block';
                btnConf.disabled = false;
                btnConf.innerHTML = '✅ Confirmar reserva — <span id="mPrecioBtn">' + document.querySelector('#mPrecio').value + ' €</span>';
                return;
            }

            if (radioDir) {
                formData.set('id_direccion_existente', radioDir.value);
            }

            const res = await fetch('api/reservas.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.error) {
                mError.textContent = '❌ ' + data.error;
                mError.style.display = 'block';
                btnConf.disabled = false;
                btnConf.innerHTML = '✅ Confirmar reserva — <span id="mPrecioBtn">' + document.querySelector('#mPrecio').value + ' €</span>';
            } else if (data.info) {
                cerrarModalReserva();
                alert('ℹ️ ' + data.info);
            } else {
                cerrarModalReserva();
                alert('🎉 ' + data.message);
                // Marcar el botón del slide como reservado
                document.querySelectorAll('.btn-premiere').forEach(btn => {
                    if (btn.dataset.juego == document.querySelector('#mNombreJuego').value) {
                        btn.textContent = '✅ ¡Reservado!';
                        btn.disabled = true;
                    }
                });
            }
        } catch {
            mError.textContent = '❌ Error de conexión.';
            mError.style.display = 'block';
            btnConf.disabled = false;
        }
    });
}

// ============== ADMIN: PROXIMOS LANZAMIENTOS ==============

function initAdminLanzamientos() {
    if (!window.SESION?.esAdmin) return;
    const btnAdd = document.querySelector('#btnAdminAddLanzamiento');
    const btnRes = document.querySelector('#btnAdminVerReservas');
    if (btnAdd) btnAdd.style.display = 'flex';
    if (btnRes) btnRes.style.display = 'flex';
    btnAdd?.addEventListener('click', () => abrirModalNuevoLanzamiento());
    btnRes?.addEventListener('click', () => abrirModalReservasAdmin());
    document.querySelector('#btnCerrarModalLanzamiento')?.addEventListener('click', cerrarModalLanzamiento);
    document.querySelector('#btnCerrarModalReservas')?.addEventListener('click', () => { document.querySelector('#modalAdminReservas').style.display = 'none'; });
    document.querySelector('#modalAdminLanzamiento')?.addEventListener('click', e => { if (e.target.id == 'modalAdminLanzamiento') cerrarModalLanzamiento(); });
    document.querySelector('#modalAdminReservas')?.addEventListener('click', e => { if (e.target.id == 'modalAdminReservas') document.querySelector('#modalAdminReservas').style.display = 'none'; });
    document.querySelector('#formAdminLanzamiento')?.addEventListener('submit', guardarLanzamiento);
}

function abrirModalNuevoLanzamiento() {
    document.querySelector('#modalLanzamientoTitulo').textContent = 'Nuevo Lanzamiento';
    document.querySelector('#adminLanzId').value = '0';
    document.querySelector('#adminLanzNombre').value = '';
    document.querySelector('#adminLanzFecha').value = '';
    document.querySelector('#adminLanzTextoFecha').value = '';
    document.querySelector('#adminLanzPrecio').value = '';
    document.querySelector('#adminLanzTrailer').value = '';
    document.querySelector('#adminLanzImagenActual').value = '';
    document.querySelector('#adminLanzImagenNombre').textContent = '';
    document.querySelector('#adminLanzError').style.display = 'none';
    document.querySelector('#modalAdminLanzamiento').style.display = 'flex';
}

function abrirModalEditarLanzamiento(juego) {
    document.querySelector('#modalLanzamientoTitulo').textContent = 'Editar Lanzamiento';
    document.querySelector('#adminLanzId').value = juego.id;
    document.querySelector('#adminLanzNombre').value = juego.nombre;
    document.querySelector('#adminLanzFecha').value = juego.fecha_estreno;
    document.querySelector('#adminLanzTextoFecha').value = juego.texto_fecha || '';
    document.querySelector('#adminLanzPrecio').value = juego.precio;
    document.querySelector('#adminLanzTrailer').value = juego.url_trailer || '';
    document.querySelector('#adminLanzImagenActual').value = juego.imagen || '';
    document.querySelector('#adminLanzImagenNombre').textContent = juego.imagen ? ('Imagen actual: ' + juego.imagen) : '';
    document.querySelector('#adminLanzError').style.display = 'none';
    document.querySelector('#modalAdminLanzamiento').style.display = 'flex';
}

function cerrarModalLanzamiento() {
    document.querySelector('#modalAdminLanzamiento').style.display = 'none';
}

async function guardarLanzamiento(e) {
    e.preventDefault();
    const btn = document.querySelector('#btnSubmitLanzamiento');
    const errEl = document.querySelector('#adminLanzError');
    btn.disabled = true; btn.textContent = 'Guardando...';
    errEl.style.display = 'none';
    try {
        const formData = new FormData(document.querySelector('#formAdminLanzamiento'));
        const res = await fetch('api/admin/proximos.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.error) { errEl.textContent = data.error; errEl.style.display = 'block'; }
        else { cerrarModalLanzamiento(); cargarVista('home', false); }
    } catch { errEl.textContent = 'Error de conexion.'; errEl.style.display = 'block'; }
    finally { btn.disabled = false; btn.textContent = 'Guardar'; }
}

async function eliminarLanzamiento(id, nombre) {
    if (!confirm('Eliminar "' + nombre + '" y todas sus reservas?')) return;
    try {
        const res = await fetch('api/admin/proximos.php', { method: 'DELETE', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'id=' + id });
        const data = await res.json();
        if (data.ok) cargarVista('home', false);
        else alert(data.error || 'Error al eliminar.');
    } catch { alert('Error de conexion.'); }
}

async function abrirModalReservasAdmin() {
    const modal = document.querySelector('#modalAdminReservas');
    const lista = document.querySelector('#adminReservasList');
    modal.style.display = 'flex';
    lista.innerHTML = '<p style="color:#94a3b8;">Cargando...</p>';
    try {
        const res = await fetch('api/admin/proximos.php?reservas=1');
        const reservas = await res.json();
        if (!reservas.length) { lista.innerHTML = '<p style="color:#94a3b8;text-align:center;">No hay reservas.</p>'; return; }
        lista.innerHTML = reservas.map(r => '<div class="admin-reserva-item"><div class="admin-reserva-info"><strong>' + r.nombre_juego + '</strong><span class="admin-reserva-user">Usuario: ' + r.nombre_usuario + ' &lt;' + r.email + '&gt;</span><span class="admin-reserva-fecha">Estreno: ' + r.fecha_estreno + ' | Reservado: ' + r.fecha_reserva.slice(0, 10) + '</span></div><button class="btn-cancelar-reserva" data-id="' + r.id_reserva + '">Cancelar</button></div>').join('');
        lista.querySelectorAll('.btn-cancelar-reserva').forEach(btn => {
            btn.addEventListener('click', async () => {
                const motivo = prompt('Motivo de cancelación (se mostrará al usuario):');
                if (motivo === null) return; // canceló el prompt
                const motivoFinal = motivo.trim() || 'Cancelada por el administrador.';
                const r2 = await fetch('api/admin/proximos.php', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'id_reserva=' + btn.dataset.id + '&motivo=' + encodeURIComponent(motivoFinal)
                });
                const d = await r2.json();
                if (d.ok) {
                    const item = btn.closest('.admin-reserva-item');
                    item.style.opacity = '0.4';
                    item.style.pointerEvents = 'none';
                    btn.textContent = '✅ Cancelada';
                } else alert(d.error || 'Error.');
            });
        });
    } catch { lista.innerHTML = '<p style="color:#f87171;">Error al cargar reservas.</p>'; }
}

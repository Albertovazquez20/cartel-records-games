<?php session_start(); ?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartel Records Games</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="responsive.css">
    <!-- CSS de cada sección (siempre cargados como en el miniproyecto) -->
    <link rel="stylesheet" href="home/home.css">
    <link rel="stylesheet" href="videojuegos/videojuegos.css">
    <link rel="stylesheet" href="consolas/consolas.css">
    <link rel="stylesheet" href="perifericos/perifericos.css">
    <link rel="stylesheet" href="checkout/checkout.css">
    <link rel="stylesheet" href="valoraciones/valoraciones.css">
    <link rel="stylesheet" href="pedidos/pedidos.css">
    <link rel="stylesheet" href="perfil/perfil.css">
    <link rel="stylesheet" href="admin/admin.css">
    <link rel="stylesheet" href="producto/producto.css">
</head>

<body>
    <!-- Datos de sesión disponibles para todo el JS del SPA -->
    <script>
        window.SESION = {
            id: <?php echo json_encode($_SESSION['id_usuario'] ?? null); ?>,
            nombre: <?php echo json_encode($_SESSION['nombre_usuario'] ?? null); ?>,
            rol: <?php echo json_encode($_SESSION['rol'] ?? null); ?>,
            esAdmin: <?php echo json_encode(($_SESSION['rol'] ?? '') === 'admin'); ?>
        };
        // Ruta base del proyecto (sin hash), usada en todos los fetch para evitar
        // errores de ruta relativa cuando la URL contiene #fragmento
        window.BASE_URL = <?php echo json_encode(rtrim(dirname($_SERVER['PHP_SELF']), '/') . '/'); ?>;
    </script>

    <!-- Overlay oscuro para menú móvil -->
    <div class="menu-overlay" id="menuOverlay"></div>

    <!-- Menú móvil desplegable -->
    <div class="menu-mobile" id="menuMobile">
        <nav>
            <a href="#" class="nav-link" data-vista="home">Inicio</a>
            <a href="#" class="nav-link" data-vista="videojuegos">Videojuegos</a>
            <a href="#" class="nav-link" data-vista="consolas">Consolas</a>
            <a href="#" class="nav-link" data-vista="perifericos">Periféricos</a>
        </nav>
    </div>

    <!-- Header fijo del SPA -->
    <header>
        <div class="logo">
            <div class="logo-content">
                <img class="imgmando" id="logoHome" src="img/mandologo.png" alt="logo" style="cursor:pointer;">
                <div>
                    <h1>CARTEL RECORDS GAMES</h1>
                    <span class="logo-subtitle">Tienda de Videojuegos</span>
                </div>
                <div class="header-quick-nav">
                    <a href="#" class="quick-nav-pill" data-seccion="novedades-section">🆕 Novedades</a>
                    <a href="#" class="quick-nav-pill" data-seccion="mas-vendidos-section">🏆 Más Vendidos</a>
                    <a href="#" class="quick-nav-pill" data-seccion="proximos-section">🎥 Reservas</a>
                </div>
            </div>
        </div>

        <!-- Navegación SPA con data-vista (igual que en el miniproyecto) -->
        <nav>
            <a href="#" class="nav-link active" data-vista="home">Inicio</a>
            <a href="#" class="nav-link" data-vista="videojuegos">Videojuegos</a>
            <a href="#" class="nav-link" data-vista="consolas">Consolas</a>
            <a href="#" class="nav-link" data-vista="perifericos">Periféricos</a>
        </nav>

        <div class="icons">
            <div class="icon-item info-dropdown-container" id="infoToggle">
                <img src="img/info.png" alt="info">
                <span>Info</span>
                <div class="info-dropdown" id="infoDropdown">
                    <div class="info-dropdown-header"><span>📍</span> Contáctanos</div>
                    <div class="info-dropdown-section">
                        <div class="info-item"><span class="info-icon">📧</span><span>contacto@cartelrecords.com</span>
                        </div>
                        <div class="info-item"><span class="info-icon">📞</span><span>+34 123 456 789</span></div>
                        <div class="info-item"><span class="info-icon">🕐</span><span>Lun-Vie: 9:00 - 20:00</span></div>
                    </div>
                    <div class="info-dropdown-header"><span>🌐</span> Síguenos</div>
                    <div class="info-social-icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener" class="info-social"
                            title="Facebook">📘</a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener" class="info-social"
                            title="Instagram">📷</a>
                        <a href="https://www.x.com" target="_blank" rel="noopener" class="info-social"
                            title="Twitter/X">✖️</a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener" class="info-social"
                            title="YouTube">▶️</a>
                        <a href="https://discord.com" target="_blank" rel="noopener" class="info-social"
                            title="Discord">💬</a>
                    </div>
                </div>
            </div>

            <?php if (!isset($_SESSION['nombre_usuario'])): ?>
                <a href="log-in/log-in.php" class="icon-item">
                    <img src="img/login.png" alt="login">
                    <span>Login</span>
                </a>
            <?php else: ?>
                <div class="icon-item info-dropdown-container" id="perfilToggle">
                    <img src="img/login.png" alt="usuario">
                    <span><?php echo htmlspecialchars($_SESSION['nombre_usuario']); ?></span>
                    <div class="info-dropdown" id="perfilDropdown">
                        <div class="info-dropdown-header"><span>👤</span> Mi cuenta</div>
                        <div class="info-dropdown-section">
                            <div class="info-item">
                                <span class="info-icon">👤</span>
                                <span><?php echo htmlspecialchars($_SESSION['nombre_usuario']); ?></span>
                            </div>
                        </div>
                        <div class="info-dropdown-section">
                            <div class="info-item" id="btnMiPerfil" style="cursor:pointer;">
                                <span class="info-icon">✏️</span>
                                <span>Mi perfil</span>
                            </div>
                        </div>
                        <div class="info-dropdown-section">
                            <div class="info-item" id="btnMisPedidos" style="cursor:pointer;">
                                <span class="info-icon">📦</span>
                                <span>Mis pedidos</span>
                            </div>
                        </div>
                        <div class="info-dropdown-section">
                            <a href="log-in/logout.php" class="info-item" style="text-decoration:none; color:inherit;" onclick="localStorage.removeItem('carrito');">
                                <span class="info-icon">🚪</span>
                                <span>Cerrar sesión</span>
                            </a>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <div class="icon-item" id="cartToggle">
                <img src="img/carrito.png" alt="carrito">
                <span>Carrito</span>
                <span class="cart-badge" id="cartBadge">0</span>
            </div>

            <div class="menu-hamburguesa" id="menuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </header>

    <!-- Overlay y drawer del carrito -->
    <div class="cart-overlay" id="cartOverlay"></div>
    <div class="cart-drawer" id="cartDrawer">
        <div class="cart-header">
            <h3>🛒 Mi Carrito</h3>
            <button class="cart-close" id="cartClose">✕</button>
        </div>
        <div class="cart-content">
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                <p>Tu carrito está vacío</p>
                <span class="cart-empty-subtitle">¡Añade productos para comenzar!</span>
            </div>
            <div class="cart-items" id="cartItems"></div>
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span class="cart-total-price">0.00 €</span>
            </div>
            <div class="cart-buttons">
                <button class="btn-vaciar">🗑️ Vaciar</button>
                <button class="btn-comprar-cart">💳 Comprar</button>
            </div>
        </div>
    </div>

    <!-- Template para items del carrito -->
    <template id="template-cart-item">
        <div class="cart-item" data-id="">
            <img class="cart-item-img" src="" alt="">
            <div class="cart-item-info">
                <p class="cart-item-nombre"></p>
                <p class="cart-item-precio"></p>
            </div>
            <div class="cart-item-controles">
                <button class="cart-qty-btn menos">−</button>
                <span class="cart-item-cantidad">1</span>
                <button class="cart-qty-btn mas">+</button>
            </div>
            <button class="cart-item-eliminar" title="Eliminar">🗑️</button>
        </div>
    </template>


    <!-- router.js inyecta aquí el contenido de cada vista -->
    <main id="contenido-principal"></main>

    <!-- ===================== MODAL DE PRODUCTO + VALORACIONES ===================== -->
    <div class="modal-overlay" id="modalProductoOverlay">
        <div class="modal-producto" role="dialog" aria-modal="true" aria-labelledby="modalHeaderNombre">

            <!-- Cabecera sticky -->
            <div class="modal-header">
                <h2 id="modalHeaderNombre"></h2>
                <button class="modal-close-btn" id="modalCloseBtn" title="Cerrar">✕</button>
            </div>

            <!-- Cuerpo: imagen + info -->
            <div class="modal-body">
                <!-- Columna izquierda: imagen + nota media + botón carrito -->
                <div class="modal-imagen-wrap">
                    <img id="modalImg" src="" alt="">
                    <div class="modal-rating-media">
                        <div class="modal-stars-display" id="modalEstrellaMedia"></div>
                        <span class="modal-nota-num" id="modalNotaNum"></span>
                        <span class="modal-nota-total" id="modalNotaTotal"></span>
                    </div>
                    <button class="modal-btn-carrito" id="modalBtnCarrito" data-id="" data-nombre="" data-precio=""
                        data-imagen="">
                        🛒 Añadir al carrito
                    </button>
                </div>

                <!-- Columna derecha: detalles del producto -->
                <div class="modal-info">
                    <!-- Badges: plataforma, categoría, marca, género -->
                    <div class="modal-badges-row">
                        <span class="modal-plataforma-badge" id="modalPlataforma"></span>
                        <span class="modal-categoria-badge" id="modalCategoria"></span>
                        <span class="modal-marca-badge" id="modalMarca"></span>
                        <span class="modal-genero-badge" id="modalGenero"></span>
                    </div>
                    <h3 class="modal-nombre-grande" id="modalNombre"></h3>
                    <p class="modal-precio-grande" id="modalPrecio"></p>
                    <!-- Indicador de stock -->
                    <div class="modal-stock-row" id="modalStockRow"></div>
                    <!-- Envío y garantía decorativos -->
                    <div class="modal-extras-row">
                        <span class="modal-extra-badge">🚚 Envío gratis +50€</span>
                        <span class="modal-extra-badge">🛡️ Garantía 2 años</span>
                        <span class="modal-extra-badge">↩️ Devolución 30 días</span>
                    </div>
                    <p class="modal-descripcion" id="modalDescripcion"></p>
                </div>
            </div>

            <!-- Sección de reseñas -->
            <div class="modal-resenas">
                <h3 class="modal-resenas-titulo">💬 Opiniones de clientes</h3>

                <!-- Lista de reseñas (se rellena desde JS) -->
                <div class="resenas-lista" id="resenasLista"></div>

                <!-- Formulario nueva reseña (visible solo si hay sesión y no ha valorado) -->
                <div id="modalFormResena" style="display:none;">
                    <p class="modal-form-titulo">⭐ Deja tu valoración</p>
                    <form id="formResena" novalidate>
                        <!-- Selector de estrellas (CSS puro, de derecha a izquierda) -->
                        <div class="star-picker" title="Selecciona una puntuación">
                            <input type="radio" id="s5" name="puntuacion" value="5">
                            <label for="s5" title="5 estrellas">★</label>
                            <input type="radio" id="s4" name="puntuacion" value="4">
                            <label for="s4" title="4 estrellas">★</label>
                            <input type="radio" id="s3" name="puntuacion" value="3">
                            <label for="s3" title="3 estrellas">★</label>
                            <input type="radio" id="s2" name="puntuacion" value="2">
                            <label for="s2" title="2 estrellas">★</label>
                            <input type="radio" id="s1" name="puntuacion" value="1">
                            <label for="s1" title="1 estrella">★</label>
                        </div>
                        <textarea id="resenaComentario" class="resena-textarea"
                            placeholder="Cuéntanos tu experiencia con este producto… (opcional)"
                            maxlength="1000"></textarea>
                        <button type="submit" class="btn-enviar-resena" id="btnEnviarResena">
                            ⭐ Publicar reseña
                        </button>
                        <div class="resena-msg" id="resenaMsg"></div>
                    </form>
                </div>

                <!-- Badge: ya valorado -->
                <div class="ya-valorado-badge" id="modalYaValorado" style="display:none;">
                    ✅ Ya has valorado este producto
                </div>

                <!-- Badge: no ha comprado -->
                <div class="no-compra-badge" id="modalNoCompra" style="display:none;">
                    🔒 Sólo los compradores pueden valorar este producto
                </div>

                <!-- Aviso sin sesión -->
                <div class="resena-login-notice" id="modalLoginNotice" style="display:none;">
                    <a href="log-in/log-in.php">Inicia sesión</a> para dejar tu valoración.
                </div>
            </div>

        </div>
    </div>
    <!-- ========================================================================= -->

    <!-- Footer fijo del SPA -->
    <footer class="footer-main">
        <div class="footer-social-bar">
            <a href="https://www.facebook.com" target="_blank" rel="noopener" class="social-icon"
                title="Facebook">📘</a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener" class="social-icon"
                title="Instagram">📷</a>
            <a href="https://www.x.com" target="_blank" rel="noopener" class="social-icon" title="Twitter/X">✖️</a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener" class="social-icon" title="YouTube">▶️</a>
            <a href="https://discord.com" target="_blank" rel="noopener" class="social-icon" title="Discord">💬</a>
        </div>
        <div class="footer-bottom">
            <p class="copyright">© 2025 Cartel Records Games. Todos los derechos reservados.</p>
            <div class="footer-legal-links">
                <a href="#">Términos y Condiciones</a>
                <span>|</span>
                <a href="#">Política de Privacidad</a>
                <span>|</span>
                <a href="#">Cookies</a>
                <span>|</span>
                <a href="#">Contacto</a>
            </div>
        </div>
    </footer>

    <script>
        // ========== MENÚ HAMBURGUESA ==========
        const menuToggle = document.getElementById('menuToggle');
        const menuMobile = document.getElementById('menuMobile');
        const menuOverlay = document.getElementById('menuOverlay');

        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            menuMobile.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuMobile.classList.contains('active') ? 'hidden' : 'auto';
        });

        menuOverlay.addEventListener('click', function () {
            menuToggle.classList.remove('active');
            menuMobile.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        document.querySelectorAll('.menu-mobile nav a').forEach(link => {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                menuMobile.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // ========== PILLS DE NAVEGACIÓN RÁPIDA (anclas del home) ==========
        document.querySelectorAll('.quick-nav-pill').forEach(pill => {
            pill.addEventListener('click', function (e) {
                e.preventDefault();
                const seccionId = this.dataset.seccion;
                const el = document.querySelector(`#${seccionId}`);
                if (el) {
                    // scrollIntoView desplaza la página hasta el elemento de forma animada
                    // behavior:'smooth' → scroll suave en vez de salto brusco
                    // block:'start'    → el elemento queda alineado en la parte superior de la pantalla
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    // Si no está en home, navegar primero a home y luego hacer scroll
                    document.querySelector('.nav-link[data-vista="home"]')?.click();
                    setTimeout(() => {
                        // Se espera 400ms para que el HTML del home se cargue antes de hacer scroll
                        document.querySelector(`#${seccionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 400);
                }
            });
        });


        // ========== FUNCIÓN COMPARTIDA: cerrar todos los paneles ==========
        function cerrarDropdowns() {
            infoDropdown.classList.remove('active');
            if (perfilDropdown) perfilDropdown.classList.remove('active');
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // ========== INFO DROPDOWN ==========
        const infoToggle = document.getElementById('infoToggle');
        const infoDropdown = document.getElementById('infoDropdown');

        infoToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const abierto = infoDropdown.classList.contains('active');
            cerrarDropdowns();
            if (!abierto) infoDropdown.classList.add('active');
        });

        // ========== PERFIL DROPDOWN ==========
        const perfilToggle = document.getElementById('perfilToggle');
        const perfilDropdown = document.getElementById('perfilDropdown');

        if (perfilToggle) {
            perfilToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                const abierto = perfilDropdown.classList.contains('active');
                cerrarDropdowns();
                if (!abierto) perfilDropdown.classList.add('active');
            });
        }

        // ========== CARRITO ==========
        const cartToggle = document.getElementById('cartToggle');
        const cartDrawer = document.getElementById('cartDrawer');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartClose = document.getElementById('cartClose');

        cartToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            cerrarDropdowns();
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        cartClose.addEventListener('click', function () {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        cartOverlay.addEventListener('click', function () {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // Ajustar padding-top del body según la altura real del header
        // y posiciona la barra quick-nav justo pegada debajo del header
        function ajustarPaddingHeader() {
            const headerH = document.querySelector('header').offsetHeight;
            const quickNav = document.querySelector('.header-quick-nav');
            document.body.style.paddingTop = headerH + 'px';

            // En móvil: mover la barra quick-nav para que quede pegada al header sin hueco
            if (window.innerWidth <= 1024 && quickNav) {
                quickNav.style.top = headerH + 'px';
                // Añadir el alto de la barra quick-nav al padding del body
                const quickNavH = quickNav.offsetHeight;
                document.body.style.paddingTop = (headerH + quickNavH) + 'px';
            } else if (quickNav) {
                // Desktop: resetear posición para que fluya con el header
                quickNav.style.top = '';
            }
        }
        ajustarPaddingHeader();
        window.addEventListener('resize', ajustarPaddingHeader);
    </script>

    <script src="carrito/carrito.js"></script>
    <!-- JS de cada sección -->
    <script src="home/home.js"></script>
    <script src="videojuegos/videojuegos.js"></script>
    <script src="consolas/consolas.js"></script>
    <script src="perifericos/perifericos.js"></script>
    <script src="checkout/checkout.js"></script>
    <script src="valoraciones/valoraciones.js"></script>
    <script src="pedidos/pedidos.js"></script>
    <script src="perfil/perfil.js"></script>
    <script src="producto/producto.js"></script>
    <!-- Router SPA -->
    <script src="router.js"></script>

</body>

</html>
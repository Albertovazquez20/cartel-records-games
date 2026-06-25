// ============== CHECKOUT.JS ==============

async function initCheckout() {

    // 1. Si el usuario no está logueado, redirigir al login
    if (!window.SESION?.id) {
        window.location.href = 'log-in/log-in.php';
        return;
    }

    // 2. Leer el carrito de localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length == 0) {
        cargarVista('home');
        return;
    }

    // 3. Pintar el resumen de items
    const resumenItems = document.querySelector('#resumenItems');
    carrito.forEach(item => {
        const div = document.createElement('div');
        div.className = 'resumen-item';
        div.innerHTML = `
            <img src="img/${item.imagen}" alt="${item.nombre}">
            <div class="resumen-item-info">
                <div class="resumen-item-nombre">${item.nombre}</div>
                <div class="resumen-item-meta">Cantidad: ${item.cantidad} × ${parseFloat(item.precio).toFixed(2)} €</div>
            </div>
            <div class="resumen-item-precio">${(item.precio * item.cantidad).toFixed(2)} €</div>
        `;
        resumenItems.appendChild(div);
    });

    // 4. Calcular y mostrar el total
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.querySelector('#resumenTotal').textContent = total.toFixed(2) + ' €';

    // 5. Gestionar selector de método de pago
    const metodoPagoSelect = document.querySelector('#metodoPago');
    const camposTarjeta = document.querySelector('#camposTarjeta');
    const avisoPaypal = document.querySelector('#avisoPaypal');
    const avisoContrarembolso = document.querySelector('#avisoContrarembolso');

    // Formatear número de tarjeta con espacios cada 4 dígitos
    document.querySelector('#numTarjeta')?.addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = val.replace(/(.{4})/g, '$1 ').trim();
    });

    // Formatear caducidad MM/AA
    document.querySelector('#caducidad')?.addEventListener('input', function () {
        let val = this.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
        this.value = val;
    });

    function actualizarMetodoPago() {
        const metodo = metodoPagoSelect.value;
        camposTarjeta.style.display = metodo == 'Tarjeta' ? 'block' : 'none';
        avisoPaypal.style.display = metodo == 'PayPal' ? 'block' : 'none';
        avisoContrarembolso.style.display = metodo == 'Contrarembolso' ? 'block' : 'none';
    }

    metodoPagoSelect.addEventListener('change', actualizarMetodoPago);
    actualizarMetodoPago(); // mostrar estado inicial

    // 6. Cargar direcciones guardadas del usuario
    let idDireccionSeleccionada = null;

    try {
        const resDirs = await fetch('api/direcciones.php', { cache: 'no-store' });
        const direcciones = await resDirs.json();

        if (direcciones.length > 0) {
            document.querySelector('#seccionDireccionesGuardadas').style.display = 'block';
            document.querySelector('#formCheckout').style.display = 'none';

            const lista = document.querySelector('#listaDirecciones');

            direcciones.forEach((dir, index) => {
                const card = document.createElement('div');
                card.className = 'direccion-card' + (index == 0 ? ' seleccionada' : '');
                card.dataset.id = dir.id_direccion;
                card.innerHTML = `
                    <div class="direccion-radio">${index == 0 ? '🔵' : '⚪'}</div>
                    <div class="direccion-info">
                        <div class="direccion-calle">${dir.calle}</div>
                        <div class="direccion-meta">${dir.ciudad}, ${dir.provincia} ${dir.codigo_postal} — ${dir.pais}</div>
                        <div class="direccion-meta">📞 ${dir.telefono_contacto || '—'}</div>
                    </div>
                `;

                card.addEventListener('click', function () {
                    document.querySelectorAll('.direccion-card').forEach(c => {
                        c.classList.remove('seleccionada');
                        c.querySelector('.direccion-radio').textContent = '⚪';
                    });
                    this.classList.add('seleccionada');
                    this.querySelector('.direccion-radio').textContent = '🔵';
                    idDireccionSeleccionada = parseInt(this.dataset.id);
                });

                lista.appendChild(card);
            });

            idDireccionSeleccionada = parseInt(direcciones[0].id_direccion);

            document.querySelector('#btnNuevaDireccion').addEventListener('click', () => {
                document.querySelector('#seccionDireccionesGuardadas').style.display = 'none';
                document.querySelector('#formCheckout').style.display = 'block';
                idDireccionSeleccionada = null;
            });
        }
    } catch (err) {
        console.error('❌ Error cargando direcciones:', err);
    }

    // 7. Botón confirmar pedido
    document.querySelector('#btnConfirmar').addEventListener('click', function () {

        // Validar campos solo si se usa nueva dirección
        if (!idDireccionSeleccionada) {
            const campos = ['calle', 'ciudad', 'provincia', 'codigo_postal', 'pais', 'telefono'];
            let valido = true;

            campos.forEach(id => {
                const input = document.querySelector(`#${id}`);
                if (!input?.value.trim()) {
                    input?.classList.add('input-error');
                    valido = false;
                } else {
                    input?.classList.remove('input-error');
                }
            });

            if (!valido) return;
        }

        enviarPedido(carrito, total, resumenItems, idDireccionSeleccionada);
    });
}

// ── Enviar pedido al API ──────────────────────────────────────────────────────
async function enviarPedido(carrito, total, resumenItems, idDireccionExistente) {
    const btnConfirmar = document.querySelector('#btnConfirmar');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = '⏳ Procesando…';

    const formData = new FormData();
    formData.append('carrito', JSON.stringify(carrito));
    formData.append('metodo_pago', document.querySelector('#metodoPago').value);

    if (idDireccionExistente) {
        formData.append('id_direccion_existente', idDireccionExistente);
    } else {
        formData.append('calle', document.querySelector('#calle').value.trim());
        formData.append('ciudad', document.querySelector('#ciudad').value.trim());
        formData.append('provincia', document.querySelector('#provincia').value.trim());
        formData.append('codigo_postal', document.querySelector('#codigo_postal').value.trim());
        formData.append('pais', document.querySelector('#pais').value.trim());
        formData.append('telefono_contacto', document.querySelector('#telefono').value.trim());
    }

    try {
        const res = await fetch('api/checkout.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.error) {
            alert('❌ ' + data.error);
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = '✅ Confirmar pedido';
        } else {
            vaciarCarrito();

            resumenItems.innerHTML = `
                <div style="text-align:center; padding: 32px 0;">
                    <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
                    <h3 style="color:#6ee7b7; margin-bottom:8px;">¡Pedido confirmado!</h3>
                    <p style="color:#94a3b8;">Nº de pedido: <strong style="color:#e2e8f0;">#${data.id_pedido}</strong></p>
                    <p style="color:#94a3b8; margin-top:8px;">Gracias por tu compra. Te enviaremos el pedido a tu dirección.</p>
                </div>
            `;
            document.querySelector('#resumenTotal').textContent = total.toFixed(2) + ' €';
            document.querySelector('#formCheckout').style.display = 'none';
            document.querySelector('#seccionDireccionesGuardadas').style.display = 'none';
            document.querySelector('.checkout-pago-panel').style.display = 'none';
        }

    } catch (err) {
        alert('❌ Error de conexión. Inténtalo de nuevo.');
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = '✅ Confirmar pedido';
        console.error('❌ checkout:', err);
    }
}

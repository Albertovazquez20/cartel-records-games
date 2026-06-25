// ============== PEDIDOS.JS ==============

//Convertir la fecha que viene de la BD (formato técnico) a un texto legible en español.
function formatearFechaPedido(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function initPedidos() {

    // Redirigir si no hay sesión
    if (!window.SESION?.id) {
        window.location.href = 'log-in/log-in.php';
        return;
    }

    const contenedor = document.querySelector('#pedidosContenedor');

    try {
        const res = await fetch('api/pedidos.php', { cache: 'no-store' });
        const data = await res.json();

        if (data.error) {
            contenedor.innerHTML = `<p style="color:#f87171;text-align:center;padding:40px;">${data.error}</p>`;
            return;
        }

        if (data.length == 0) {
            contenedor.innerHTML = `
                <div class="pedidos-empty">
                    <span>📦</span>
                    <p>Todavía no tienes pedidos.</p>
                </div>`;
        } else {
            contenedor.innerHTML = '';

            // Obtener los templates del DOM
            const tplPedido = document.querySelector('#tplPedido');
            const tplProducto = document.querySelector('#tplProducto');

            data.forEach(pedido => {
                // 1. Clonar el template de tarjeta de pedido
                const card = tplPedido.content.cloneNode(true).querySelector('.pedido-card');

                // 2. Rellenar los datos del pedido
                card.querySelector('.pedido-id').textContent =
                    `📦 Pedido #${pedido.id_pedido}`;

                card.querySelector('.pedido-fecha').textContent =
                    formatearFechaPedido(pedido.fecha_pedido);

                card.querySelector('.pedido-total').textContent =
                    `${parseFloat(pedido.total_pedido).toFixed(2)} €`;

                // Badge método de pago
                const iconosPago = { 'Tarjeta': '💳', 'PayPal': '🅿️', 'Contrarembolso': '📦' };
                const metodoBadge = card.querySelector('.pedido-metodo-pago');
                if (pedido.metodo_pago) {
                    const icono = iconosPago[pedido.metodo_pago] || '💳';
                    metodoBadge.textContent = `${icono} ${pedido.metodo_pago}`;
                }

                const direccionTexto = [pedido.calle, pedido.ciudad, pedido.provincia, pedido.pais]
                    .filter(Boolean).join(', ');
                card.querySelector('.pedido-direccion').textContent = `📍 ${direccionTexto}`;

                // 3. Rellenar los productos clonando tplProducto por cada uno
                const body = card.querySelector('.pedido-body');

                pedido.productos.forEach(p => {
                    const fila = tplProducto.content.cloneNode(true).querySelector('.pedido-producto');

                    fila.querySelector('.pedido-producto-img').src = `img/${p.imagen}`;
                    fila.querySelector('.pedido-producto-img').alt = p.nombre;
                    fila.querySelector('.pedido-producto-nombre').textContent = p.nombre;
                    fila.querySelector('.pedido-producto-meta').textContent =
                        `${p.cantidad_producto} × ${parseFloat(p.precio_unidad).toFixed(2)} €`;
                    fila.querySelector('.pedido-producto-subtotal').textContent =
                        `${parseFloat(p.subtotal).toFixed(2)} €`;

                    body.appendChild(fila);
                });

                // 4. Toggle para expandir/colapsar cada pedido
                card.querySelector('.pedido-header').addEventListener('click', () => {
                    card.classList.toggle('abierto');
                });

                contenedor.appendChild(card);
            });
        }


    } catch (error) {
        contenedor.innerHTML = `<p style="color:#f87171;text-align:center;padding:40px;">Error de conexión.</p>`;
        console.error('❌ pedidos:', error);
    }

    // ── Cargar reservas ───────────────────────────────────────────────────────
    await cargarReservas();
}

async function cargarReservas() {
    const contenedor = document.querySelector('#reservasContenedor');
    if (!contenedor) return;

    try {
        const res = await fetch('api/reservas.php', { cache: 'no-store' });
        const data = await res.json();

        if (data.error || data.length == 0) {
            contenedor.innerHTML = `
                <div class="pedidos-empty">
                    <span>🔔</span>
                    <p>No tienes reservas activas.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = '';
        const tpl = document.querySelector('#tplReserva');

        data.forEach(reserva => {
            const card = tpl.content.cloneNode(true).querySelector('.reserva-card');

            card.querySelector('.reserva-nombre').textContent = reserva.nombre_juego;

            // Fecha de estreno formateada
            if (reserva.fecha_estreno) {
                card.querySelector('.reserva-estreno').textContent =
                    '📅 Estreno: ' + formatearFechaPedido(reserva.fecha_estreno);
            }

            // Imagen del juego
            if (reserva.imagen_juego) {
                card.querySelector('.reserva-img').src = 'img/' + reserva.imagen_juego;
                card.querySelector('.reserva-img').alt = reserva.nombre_juego;
            } else {
                card.querySelector('.reserva-img').style.display = 'none';
            }

            card.querySelector('.reserva-fecha-reserva').textContent =
                '🗓️ Reservado el ' + formatearFechaPedido(reserva.fecha_reserva);

            // Si está cancelada por admin → gris + motivo, sin botón
            if (reserva.estado == 'cancelada') {
                card.classList.add('reserva-cancelada');
                card.querySelector('.btn-cancelar-reserva').style.display = 'none';
                card.querySelector('.reserva-estado').textContent = '❌ Cancelada';
                card.querySelector('.reserva-estado').style.cssText =
                    'background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.3);';
                const motivoDiv = card.querySelector('.reserva-cancelada-motivo');
                motivoDiv.style.display = 'block';
                motivoDiv.innerHTML = `<span>ℹ️ Esta reserva fue cancelada por el administrador:</span><em>${reserva.motivo_cancelacion || 'Sin motivo especificado.'}</em>`;
                contenedor.appendChild(card);
                return; // no añadir botón cancelar
            }

            // Botón cancelar reserva
            card.querySelector('.btn-cancelar-reserva').addEventListener('click', async () => {
                const pagoConDinero = reserva.metodo_pago == 'Tarjeta' || reserva.metodo_pago == 'PayPal';
                const confirmMsg = pagoConDinero
                    ? `¿Cancelar la reserva de "${reserva.nombre_juego}"?\n\nRecibirás el reembolso completo en tu ${reserva.metodo_pago} en un plazo de 3 a 5 días hábiles.`
                    : `¿Cancelar la reserva de "${reserva.nombre_juego}"?`;

                if (!confirm(confirmMsg)) return;
                try {
                    const r = await fetch('api/reservas.php?id=' + reserva.id_reserva, { method: 'DELETE' });
                    const d = await r.json();
                    if (d.ok) {
                        card.style.transition = 'opacity 0.3s';
                        card.style.opacity = '0';
                        setTimeout(() => { card.remove(); }, 300);
                        const okMsg = pagoConDinero
                            ? `✅ Reserva cancelada.\n\nEl reembolso llegará a tu ${reserva.metodo_pago} en 3-5 días hábiles.`
                            : `✅ Reserva de "${reserva.nombre_juego}" cancelada.`;
                        alert(okMsg);
                    } else {
                        alert('❌ ' + (d.error || 'No se pudo cancelar.'));
                    }
                } catch {
                    alert('❌ Error de conexión.');
                }
            });

            contenedor.appendChild(card);

        });


    } catch (error) {
        contenedor.innerHTML = `<p style="color:#f87171;text-align:center;padding:40px;">Error de conexión.</p>`;
        console.error('❌ reservas:', error);
    }
}

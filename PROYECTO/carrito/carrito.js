// ============== CARRITO.JS ==============
// Gestión del carrito de compras con localStorage

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ——— Persistencia ———
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ——— Operaciones sobre el array ———
function añadirAlCarrito(id, nombre, precio, imagen) {
    const existe = carrito.find(p => p.id == id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id, nombre, precio: parseFloat(precio), imagen, cantidad: 1 });
    }
    guardarCarrito();
    renderizarCarrito();
    actualizarBadge();
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(p => p.id == id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter(p => p.id != id);
    }
    guardarCarrito();
    renderizarCarrito();
    actualizarBadge();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => p.id != id);
    guardarCarrito();
    renderizarCarrito();
    actualizarBadge();
}

function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    actualizarBadge();
}

// ——— Render (clona el template por cada item) ———
function renderizarCarrito() {
    const container = document.querySelector('#cartItems');
    const emptyMsg = document.querySelector('.cart-empty');
    const template = document.querySelector('#template-cart-item');

    container.innerHTML = '';

    if (carrito.length == 0) {
        emptyMsg.style.display = 'flex';
        actualizarTotal();
        return;
    }

    emptyMsg.style.display = 'none';

    carrito.forEach(item => {
        const clon = template.content.cloneNode(true);
        const div = clon.querySelector('.cart-item');

        div.dataset.id = item.id;
        div.querySelector('.cart-item-img').src = 'img/' + item.imagen;
        div.querySelector('.cart-item-img').alt = item.nombre;
        div.querySelector('.cart-item-nombre').textContent = item.nombre;
        div.querySelector('.cart-item-precio').textContent =
            (item.precio * item.cantidad).toFixed(2) + ' €';
        div.querySelector('.cart-item-cantidad').textContent = item.cantidad;

        div.querySelector('.menos').addEventListener('click', () => cambiarCantidad(item.id, -1));
        div.querySelector('.mas').addEventListener('click', () => cambiarCantidad(item.id, +1));
        div.querySelector('.cart-item-eliminar').addEventListener('click', () => eliminarDelCarrito(item.id));

        container.appendChild(clon);
    });

    actualizarTotal();
}

// ——— Helpers ———
function actualizarTotal() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    document.querySelector('.cart-total-price').textContent = total.toFixed(2) + ' €';
}

function actualizarBadge() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = document.querySelector('#cartBadge');
    if (!badge) return;
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// ——— Inicialización al cargar la página ———
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
    actualizarBadge();
    document.querySelector('.btn-vaciar')?.addEventListener('click', vaciarCarrito);
    document.querySelector('.btn-comprar-cart')?.addEventListener('click', () => {
        if (carrito.length == 0) return;
        cargarVista('checkout');
    });
});

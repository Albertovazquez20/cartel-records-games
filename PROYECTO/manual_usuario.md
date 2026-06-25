# Manual de Usuario — Cartel Records Games

---

## Índice

1. [Acceso a la aplicación](#1-acceso-a-la-aplicación)
2. [Navegación general](#2-navegación-general)
3. [Registro e inicio de sesión](#3-registro-e-inicio-de-sesión)
4. [Catálogo de productos](#4-catálogo-de-productos)
5. [Ficha de producto](#5-ficha-de-producto)
6. [Carrito de compra](#6-carrito-de-compra)
7. [Proceso de compra (Checkout)](#7-proceso-de-compra-checkout)
8. [Mis pedidos](#8-mis-pedidos)
9. [Valoraciones y reseñas](#9-valoraciones-y-reseñas)
10. [Próximos lanzamientos y reservas](#10-próximos-lanzamientos-y-reservas)
11. [Mi perfil](#11-mi-perfil)
12. [Panel de administración](#12-panel-de-administración)

---

## 1. Acceso a la aplicación

Para acceder a la tienda, abre tu navegador e introduce la siguiente URL:

```
http://localhost/TFG_DAW_ULTIMO/PROYECTO_MODIFI/PROYECTO/PROYECTO/index.php
```

La página principal cargará directamente con la sección de **Novedades**.

---

## 2. Navegación general

### Menú principal (escritorio)

En la parte superior de la página encontrarás el **header** con los siguientes elementos:

| Elemento | Descripción |
|---|---|
| **Logo** (mando + nombre) | Lleva siempre a la página de inicio |
| **Inicio** | Página principal con Novedades, Más Vendidos y Reservas |
| **Videojuegos** | Catálogo de videojuegos |
| **Consolas** | Catálogo de consolas |
| **Periféricos** | Catálogo de accesorios |
| **Info** | Información sobre la tienda |
| **Login / Usuario** | Acceso a la cuenta o menú de usuario |
| **Carrito** 🛒 | Abre el panel lateral del carrito |

### Menú hamburguesa (móvil)

En pantallas pequeñas, el menú principal se oculta y aparece el botón **☰** en la esquina superior derecha. Púlsalo para desplegar el menú de navegación.

### Barra de navegación rápida (Home)

Debajo del header, en la página de inicio, hay una barra con accesos directos:

- **Novedades** — Salta a la sección de productos destacados
- **Más Vendidos** — Salta a la sección de productos más populares
- **Reservas** — Salta a la sección de próximos lanzamientos

---

## 3. Registro e inicio de sesión

### Iniciar sesión

1. Haz clic en **Login** en el header.
2. Introduce tu **nombre de usuario** y **contraseña**.
3. Opcionalmente, activa **Mostrar contraseña** para ver lo que escribes.
4. Pulsa **Entrar**.

Si los datos son correctos, serás redirigido a la tienda con tu sesión activa. El icono de usuario del header cambiará para mostrar tu nombre.

### Registrarse

1. Haz clic en **Login** en el header.
2. Haz clic en **¿No tienes cuenta? Regístrate**.
3. Rellena el formulario con:
   - Nombre de usuario
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Teléfono (opcional)
4. Pulsa **Crear cuenta**.

### Cerrar sesión

1. Haz clic en el icono de usuario en el header.
2. Selecciona **Cerrar sesión**.

---

## 4. Catálogo de productos

### Ver el catálogo

Accede a cualquiera de las tres secciones del menú: **Videojuegos**, **Consolas** o **Periféricos**.

Los productos se muestran en una cuadrícula de tarjetas. Cada tarjeta muestra:

- Imagen del producto
- Nombre
- Precio
- Valoración media (estrellas)
- Badge de plataforma (PS5, Xbox, etc.)
- Badge de stock disponible

### Filtrar productos

En la parte izquierda (escritorio) o dentro del menú hamburguesa (móvil) encontrarás los **filtros**:

| Filtro | Descripción |
|---|---|
| **Buscar** | Busca por nombre de producto |
| **Plataforma** | Filtra por PS5, Xbox, PC, Nintendo Switch, etc. |
| **Precio** | Ordena de mayor a menor precio o viceversa |
| **Nombre** | Ordena alfabéticamente |

Los filtros se aplican en tiempo real conforme escribes o seleccionas.

---

## 5. Ficha de producto

Al hacer clic en **Ver más** en cualquier tarjeta de producto, se abre la **página de detalle** del producto con:

- **Imagen** grande del producto
- **Nombre** y **precio**
- **Badges** de categoría, plataforma, marca y género
- **Stock** disponible
- **Valoración media** con estrellas y número de reseñas
- **Descripción completa**
- **Especificaciones técnicas** (si el producto las tiene)
- **Botón Añadir al carrito**
- **Sección de valoraciones** con reseñas de otros compradores

Para volver al catálogo, usa el botón **← Volver** o la navegación del menú.

---

## 6. Carrito de compra

### Añadir productos

- Pulsa el botón **Añadir** en cualquier tarjeta de producto del catálogo.
- O pulsa **Añadir al carrito** desde la ficha de producto.

El icono 🛒 del header mostrará un contador con el número de artículos.

### Ver el carrito

Haz clic en el icono 🛒 del header. Se abrirá un **panel lateral** por la derecha con:

- Lista de productos añadidos
- Cantidad de cada artículo (con botones **+** y **−**)
- Precio por unidad y subtotal
- Botón **×** para eliminar un artículo
- **Total** de la compra
- Botón **Finalizar compra**

### Modificar cantidades

Usa los botones **+** y **−** junto a cada producto para ajustar la cantidad. Si reduces a 0, el producto se elimina automáticamente.

### Vaciar el carrito

Elimina cada producto individualmente con el botón **×**, o finaliza la compra para vaciarlo automáticamente tras confirmar el pedido.

> ℹ️ El carrito se guarda en el navegador (`localStorage`), por lo que si cierras la página los productos seguirán ahí al volver.

---

## 7. Proceso de compra (Checkout)

> ⚠️ Es necesario estar **registrado e identificado** para poder realizar un pedido.

1. Abre el carrito y pulsa **Finalizar compra**.
2. Se mostrará el formulario de **dirección de envío**:
   - Calle y número
   - Ciudad
   - Provincia
   - País
   - Código postal
   - Teléfono de contacto
3. Revisa el **resumen del pedido** con los productos y el total.
4. Pulsa **Confirmar pedido**.

Si el pedido se procesa correctamente, verás un mensaje de confirmación y el carrito se vaciará.

---

## 8. Mis pedidos

Para consultar tu historial de pedidos:

1. Haz clic en el icono de usuario en el header.
2. Selecciona **Mis pedidos**.

Verás una lista con todos tus pedidos, mostrando:

- Número de pedido
- Fecha
- Total
- Productos incluidos
- Dirección de envío

---

## 9. Valoraciones y reseñas

> ⚠️ Solo puedes valorar un producto si lo has **comprado previamente**.

### Dejar una valoración

1. Accede a la **ficha de producto** (botón Ver más).
2. Desplázate hasta la sección **Valoraciones**.
3. Selecciona una puntuación del 1 al 5 haciendo clic en las estrellas ★.
4. Escribe un comentario (opcional).
5. Pulsa **Enviar valoración**.

Tu reseña aparecerá en la lista junto con tu nombre de usuario y la fecha.

### Ver valoraciones

En la ficha de cualquier producto puedes ver todas las reseñas de otros compradores, ordenadas por fecha. Cada reseña muestra el nombre del usuario, la puntuación y el comentario.

---

## 10. Próximos lanzamientos y reservas

En la sección de **Inicio**, desplázate hasta la parte inferior para ver los **Próximos Lanzamientos**: juegos que aún no están disponibles pero que puedes reservar.

Cada tarjeta muestra:

- Imagen y nombre del juego
- Fecha de lanzamiento
- Cuenta atrás en tiempo real
- Botón de tráiler (si está disponible)
- Botón **Reservar**

### Hacer una reserva

1. Haz clic en **Reservar** en el juego que te interese.
2. Debes estar **identificado** para poder reservar.
3. Confirma la reserva. Recibirás confirmación visual en pantalla.

### Ver tus reservas

1. Haz clic en el icono de usuario en el header.
2. Selecciona **Mis pedidos** — las reservas aparecen en una pestaña separada.

---

## 11. Mi perfil

Para acceder a tu perfil:

1. Haz clic en el icono de usuario en el header.
2. Selecciona **Mi perfil**.

Desde el perfil puedes:

- Ver y editar tu información personal (nombre, email, teléfono)
- Cambiar tu contraseña
- Consultar tus pedidos y reservas

---

## 12. Panel de administración

> ⚠️ Esta sección solo es accesible para usuarios con rol de **Administrador**.

### Acceder al panel

1. Inicia sesión con una cuenta de administrador.
2. Verás el enlace **Admin** en el menú principal del header.
3. Haz clic en él para acceder al panel.

### Gestión de productos

El panel muestra tres pestañas: **Videojuegos**, **Consolas** y **Periféricos**.

#### Añadir un producto nuevo

1. Haz clic en el botón **➕ Nuevo producto**.
2. Rellena el formulario modal con:
   - Nombre del producto
   - Precio
   - Categoría y plataforma
   - Marca y género
   - Stock disponible
   - Descripción
   - Imagen (subir archivo)
   - Checkbox **Mostrar en Novedades** (para que aparezca en la Home)
3. Pulsa **Guardar**.

#### Editar un producto existente

1. En la tabla de productos, haz clic en el botón **✏️ Editar** del producto que quieras modificar.
2. El formulario modal se abrirá con los datos actuales.
3. Modifica los campos necesarios.
4. Pulsa **Guardar**.

#### Eliminar un producto

1. En la tabla de productos, haz clic en el botón **🗑️ Eliminar**.
2. Confirma la acción en el diálogo de confirmación.

> ⚠️ La eliminación es permanente. El producto desaparecerá del catálogo inmediatamente.

#### Marcar un producto como Novedad

Al crear o editar un producto, activa el checkbox **Mostrar en Novedades**. El producto aparecerá en el carrusel de la página de inicio. Si no hay ningún producto marcado, el sistema mostrará automáticamente los últimos 3 productos añadidos.

---

## Credenciales de prueba

| Usuario (Login) | Email | Contraseña | Rol |
|---|---|---|---|
| Admin | admin@gmail.com | admin123 | Administrador |
| kiko | kikooo@gmail.com | 1234567890 | Usuario registrado |

---

*Manual de usuario — Cartel Records Games · Alberto Vázquez Rando · DAW 2025-2026*

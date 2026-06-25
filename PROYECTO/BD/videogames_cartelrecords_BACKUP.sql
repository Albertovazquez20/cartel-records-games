-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 30-05-2026 a las 00:40:32
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `videogames_cartelrecords`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_pedido`
--

CREATE TABLE `detalles_pedido` (
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad_producto` int(11) NOT NULL,
  `precio_unidad` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad_producto` * `precio_unidad`) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `detalles_pedido`
--

INSERT INTO `detalles_pedido` (`id_pedido`, `id_producto`, `cantidad_producto`, `precio_unidad`) VALUES
(1, 1, 1, 29.99),
(1, 5, 1, 69.99),
(2, 2, 1, 69.99),
(3, 2, 1, 69.99),
(3, 3, 1, 549.99),
(4, 6, 1, 89.99),
(5, 1, 1, 29.99),
(6, 5, 1, 69.99),
(7, 5, 1, 69.99),
(8, 1, 1, 29.99);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `id_direccion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `calle` varchar(200) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`id_direccion`, `id_usuario`, `calle`, `ciudad`, `provincia`, `pais`, `codigo_postal`, `telefono_contacto`) VALUES
(1, 1, 'Calle Sol 12', 'Madrid', 'Madrid', 'España', '28001', '612345678'),
(2, 2, 'Av. Libertad 55', 'Valencia', 'Valencia', 'España', '46001', '698112233'),
(3, 4, 'MAimona 6', 'LOS SANTOS DE MAIMONA', 'Extremadura', 'España', '06230', '626744671'),
(4, 4, 'MAimona 6', 'LOS SANTOS DE MAIMONA', 'Extremadura', 'España', '06230', '626744671'),
(5, 4, 'MAimona 6', 'LOS SANTOS DE MAIMONA', 'Extremadura', 'España', '06230', '626744671'),
(6, 5, 'MAimona 6', 'LOS SANTOS DE MAIMONA', 'Extremadura', 'España', '06230', '626744671');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_direccion` int(11) NOT NULL,
  `fecha_pedido` datetime DEFAULT current_timestamp(),
  `total_pedido` decimal(10,2) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT 'Tarjeta'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `id_usuario`, `id_direccion`, `fecha_pedido`, `total_pedido`, `metodo_pago`) VALUES
(1, 1, 1, '2025-11-21 20:11:40', 99.98, 'Tarjeta'),
(2, 2, 2, '2025-11-21 20:11:40', 69.99, 'Tarjeta'),
(3, 4, 3, '2026-04-12 19:13:31', 619.98, 'Tarjeta'),
(4, 4, 4, '2026-04-12 19:21:39', 89.99, 'Tarjeta'),
(5, 4, 5, '2026-04-12 19:34:36', 29.99, 'Tarjeta'),
(6, 5, 6, '2026-04-12 19:36:39', 69.99, 'Tarjeta'),
(7, 4, 5, '2026-04-18 14:43:34', 69.99, 'Contrarembolso'),
(8, 4, 5, '2026-04-22 22:04:21', 29.99, 'Contrarembolso');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `plataforma` varchar(100) DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `es_novedad` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `categoria`, `plataforma`, `marca`, `genero`, `imagen`, `precio`, `stock`, `es_novedad`) VALUES
(1, 'FC 26', 'EA Sports FC 26 es un videojuego de fútbol desarrollado por EA Vancouver y EA Romania, lanzado el 26 de septiembre de 2025. Este juego introduce varias innovaciones, como una revisión completa de la mecánica de regate, una inteligencia artificial mejorada para el posicionamiento de los jugadores y animaciones de portero más realistas. Además, presenta dos configuraciones de juego distintas: Competitivo, diseñado para Ultimate Team y Clubes, y Auténtico, orientado a la experiencia offline en Modo Carrera. El juego incluye más de 20,000 jugadores con licencia, más de 750 clubes y selecciones nacionales, y más de 35 ligas, incluyendo derechos exclusivos para competiciones de la UEFA y la Premier League. También introduce nuevos arquetipos inspirados en leyendas del deporte y eventos en vivo dinámicos. || Género: Deportes | Plataforma: PS5 / Xbox / PC | Jugadores: 1-4 local / Online | Idioma: Español | PEGI: 3 | Modos: Ultimate Team, Carrera, VOLTA, Pro Clubs | Online: Sí, multijugador online | Desarrollador: EA Sports', 'Videojuegos', 'PS5', 'EA Sports', 'Deportes', 'fc26.jpg', 29.99, 20, 1),
(2, 'Battlefield 6', 'Battlefield 6 es un videojuego de disparos en primera persona lanzado el 10 de octubre de 2025, ambientado en un conflicto entre una OTAN fragmentada y una empresa militar privada llamada Pax Armata.', 'Videojuegos', 'PS5', 'EA', 'Shooter', 'b6.jpg', 69.99, 15, 1),
(3, 'PlayStation 5', 'La consola de nueva generación de Sony con gráficos 4K y carga ultrarrápida. ||\r\nCPU: AMD Ryzen Zen 2 — 8 núcleos a 3.5 GHz | GPU: AMD RDNA 2 — 10.28 TFLOPS | RAM: 16 GB GDDR6 | Almacenamiento: SSD NVMe 825 GB | Resolución: hasta 8K | FPS: hasta 120 fps | Óptica: Blu-ray 4K UHD | Conectividad: WiFi 6, Bluetooth 5.1 | Puertos: USB-A x2, USB-C x1, HDMI 2.1', 'Consolas', 'PS5', 'Sony', '', 'PS5.jpg', 549.99, 10, 0),
(4, 'Call of duty Black Ops 7', 'Call of Duty: Black Ops 7 es un videojuego de disparos en primera persona desarrollado por Treyarch y Raven Software, lanzado el 14 de noviembre de 2025. Ambientado en el año 2035, sigue a un equipo de agentes liderados por David Mason en una historia de manipulación psicológica y tecnología avanzada. El juego incluye una campaña cooperativa, un modo multijugador con nuevos mapas y un modo zombis renovado. Los jugadores pueden enfrentarse a desafíos en diversas ubicaciones, desde Japón hasta la costa mediterránea, y disfrutar de una progresión de nivel global en todo el juego.', 'Videojuego', 'Xbox', 'Activision', 'Shooter', 'bo7.jpg', 59.99, 12, 1),
(5, 'Mando PS5 DualSense', 'Mando inalámbrico para PS5.', 'Accesorios', 'PS5', 'Sony', NULL, 'mandops5.avif\r\n', 69.99, 30, 0),
(6, 'Auriculares Gaming HyperX', 'Auriculares gaming con micrófono.', 'Accesorios', 'Multiplataforma', 'HyperX', NULL, 'A_hyperX.webp', 89.99, 25, 0),
(7, 'Xbox Serie X', 'CPU: AMD Zen 2 — 8 núcleos a 3.8 GHz | GPU: AMD RDNA 2 — 12 TFLOPS | RAM: 16 GB GDDR6 | Almacenamiento: SSD NVMe 1 TB | Resolución: hasta 8K | FPS: hasta 120 fps | Óptica: Blu-ray 4K UHD | Conectividad: WiFi 5, Bluetooth 5.0 | Puertos: USB-A x3, HDMI 2.1 | Retrocompatibilidad: Xbox One, 360 y Xbox original', 'Consolas', 'Xbox', 'Microsoft', '', 'prod_6a05a984dd241.jpeg', 599.99, 1, 0),
(8, 'Rainbow 6 Siege', 'Tom Clancy\'s Rainbow Six Siege es un juego de disparos táctico multijugador en primera persona (FPS) enfocado en el combate a corta distancia, la estrategia y la destrucción del entorno. Dos equipos de 5 jugadores se enfrentan en intensas rondas alternando roles de ataque y defensa', 'Videojuegos', 'PS5', 'Ubisoft', 'Shooter', 'prod_6a142e5e19423.jpg', 20.00, 1, 1),
(9, 'CyberPunk', 'Cyberpunk es un subgénero de la ciencia ficción que explora futuros distópicos y tecnológicos, guiado por la premisa de «alta tecnología y baja calidad de vida». Presenta sociedades hiperurbanas controladas por megacorporaciones, donde el individualismo, los implantes cibernéticos y la inteligencia artificial contrastan con la extrema desigualdad y la decadencia social', 'Videojuegos', 'PS5', 'CD Projekt RED', 'Mundo abierto', 'prod_6a1a0f129342a.jpg', 30.00, 2, 0),
(10, 'Call of duty Advanzed Warfare', 'Call of Duty: Advanced Warfare es un videojuego de disparos en primera persona desarrollado por Sledgehammer Games y publicado por Activision, lanzado originalmente el 4 de noviembre de 2014. Supuso una revolución en la franquicia al introducir mecánicas basadas en el movimiento vertical gracias al uso de exotrajes futuristas.', 'Videojuegos', 'PS5', 'Activision', 'Shooter', 'prod_6a1a110393888.jpg', 14.00, 1, 0),
(11, 'Red Dead Redemption 2', 'Red Dead Redemption 2 es un épico juego de acción y aventura ambientado en el salvaje oeste estadounidense en 1899. Narra la historia de Arthur Morgan y la banda de forajidos de Dutch van der Linde, quienes luchan por sobrevivir mientras el gobierno y la industrialización acaban con su estilo de vida', 'Videojuegos', 'PS4', 'Activision', 'Mundo Abierto', 'prod_6a1a153858008.jpg', 42.99, 1, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proximos_lanzamientos`
--

CREATE TABLE `proximos_lanzamientos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `imagen` varchar(200) NOT NULL,
  `fecha_estreno` date NOT NULL,
  `url_trailer` varchar(500) DEFAULT NULL,
  `texto_fecha` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proximos_lanzamientos`
--

INSERT INTO `proximos_lanzamientos` (`id`, `nombre`, `imagen`, `fecha_estreno`, `url_trailer`, `texto_fecha`, `precio`) VALUES
(2, 'DEATH STRANDING 2', 'prod_6a0b0a42c9123.webp', '2026-06-26', 'https://www.youtube.com/watch?v=u5y5cbJJyyg', '2025', 79.99),
(3, 'HOLLOW KNIGHT: SILKSONG', 'hollow.jpg', '2026-06-15', 'https://www.youtube.com/watch?v=pFAknD_9U7c', '2025', 39.99),
(4, 'GTA VI', 'prod_6a19d80753431.webp', '2026-11-19', 'https://www.youtube.com/watch?v=QdBZY2fkU-0', 'NOVIEMBRE 2026', 69.99),
(5, 'prueba', 'prod_6a19d861c63ce.jpg', '2026-07-30', 'https://www.youtube.com/watch?v=QdBZY2fkU-0', '', 77.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_lanzamiento` int(11) DEFAULT NULL,
  `nombre_juego` varchar(200) NOT NULL,
  `imagen_juego` varchar(200) DEFAULT NULL,
  `fecha_estreno` date DEFAULT NULL,
  `fecha_reserva` datetime DEFAULT current_timestamp(),
  `metodo_pago` varchar(30) DEFAULT 'Contrarembolso',
  `estado` enum('activa','cancelada') DEFAULT 'activa',
  `motivo_cancelacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `id_usuario`, `id_lanzamiento`, `nombre_juego`, `imagen_juego`, `fecha_estreno`, `fecha_reserva`, `metodo_pago`, `estado`, `motivo_cancelacion`) VALUES
(1, 4, NULL, 'GRAND THEFT AUTO VI', 'gta6.webp\r\n', '2026-10-25', '2026-05-05 14:08:05', 'Contrarembolso', 'cancelada', 'El lanzamiento fue eliminado por el administrador.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `contrasena` varchar(200) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('admin','cliente') DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `email`, `contrasena`, `telefono`, `rol`) VALUES
(1, 'Alberto', 'alberto@gmail.com', '1234', '612345678', 'cliente'),
(2, 'MariaGamer', 'maria@gmail.com', 'pass123', '698112233', 'cliente'),
(3, 'Admin', 'admin@gmail.com', '$2y$10$ac6Z0lWElb5X8x224J4S2.m9hfZaPrCEuMqBukuNXqCQA5ive7x3W', '600000000', 'admin'),
(4, 'kiko', 'kikooo@gmail.com', '$2y$10$Px2LcNCW0WqjnX19FxFecOsZJdAOfXiRQwCVBn2yyiYzTx5uBpDe.', NULL, 'cliente'),
(5, 'alfonso', 'alfonso@gmail.com', '$2y$10$YQejc9BuRtyHDYU910xY9uzrWYFghD6AtxBAKX0j.RvFJrLrTE5uG', NULL, 'cliente'),
(6, 'tester', 'tester@test.com', '$2y$10$8q/.Aud.dG0KEV1GjZmPROTqtrfrZZVu7K1xb6tWmWPCRT.633h/W', NULL, 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `valoraciones`
--

CREATE TABLE `valoraciones` (
  `id_valoracion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `puntuacion` int(11) DEFAULT NULL CHECK (`puntuacion` between 1 and 5),
  `comentarios` text DEFAULT NULL,
  `fecha_valoracion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `valoraciones`
--

INSERT INTO `valoraciones` (`id_valoracion`, `id_usuario`, `id_producto`, `puntuacion`, `comentarios`, `fecha_valoracion`) VALUES
(1, 1, 1, 5, 'Increíble, de los mejores juegos.', '2025-11-21 20:10:30'),
(2, 2, 2, 4, 'Muy bueno, aunque algo repetitivo.', '2025-11-21 20:10:30'),
(3, 4, 2, 5, 'Juego increible', '2026-04-12 19:20:22'),
(4, 4, 1, 5, 'JUegazo', '2026-04-12 19:35:40');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD PRIMARY KEY (`id_pedido`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_direccion` (`id_direccion`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `proximos_lanzamientos`
--
ALTER TABLE `proximos_lanzamientos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`),
  ADD UNIQUE KEY `uq_reserva` (`id_usuario`,`nombre_juego`),
  ADD UNIQUE KEY `uk_usuario_lanzamiento` (`id_usuario`,`id_lanzamiento`),
  ADD KEY `fk_reserva_lanzamiento` (`id_lanzamiento`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `valoraciones`
--
ALTER TABLE `valoraciones`
  ADD PRIMARY KEY (`id_valoracion`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_producto` (`id_producto`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `proximos_lanzamientos`
--
ALTER TABLE `proximos_lanzamientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `valoraciones`
--
ALTER TABLE `valoraciones`
  MODIFY `id_valoracion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_pedido`
--
ALTER TABLE `detalles_pedido`
  ADD CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_direccion`) REFERENCES `direcciones` (`id_direccion`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `fk_reserva_lanzamiento` FOREIGN KEY (`id_lanzamiento`) REFERENCES `proximos_lanzamientos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `valoraciones`
--
ALTER TABLE `valoraciones`
  ADD CONSTRAINT `valoraciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `valoraciones_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

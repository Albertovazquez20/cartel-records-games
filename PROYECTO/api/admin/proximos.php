<?php
// ==================== API ADMIN - PRÓXIMOS LANZAMIENTOS ====================
// GET    → lista todos los próximos lanzamientos
// POST   → añade o edita un próximo lanzamiento
// DELETE → elimina un próximo lanzamiento
// GET ?reservas=1 → lista todas las reservas de usuarios

session_start();
header('Content-Type: application/json');

if (($_SESSION['rol'] ?? '') !== 'admin') {
    echo json_encode(['error' => 'Acceso denegado.']);
    exit;
}

include('../../conexion/conexion.php');

try {
    // ── GET: listar próximos lanzamientos o reservas ──────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['reservas'])) {
            // Listar solo reservas activas con nombre de usuario
            $stmt = $conexion->query("
                SELECT r.id_reserva, r.nombre_juego, r.imagen_juego,
                       r.fecha_estreno, r.fecha_reserva,
                       u.nombre_usuario, u.email
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.estado = 'activa'
                ORDER BY r.fecha_reserva DESC
            ");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            // Listar próximos lanzamientos
            $stmt = $conexion->query("SELECT * FROM proximos_lanzamientos ORDER BY fecha_estreno ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        exit;
    }

    // ── DELETE: eliminar próximo lanzamiento o cancelar reserva ───────────────
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        parse_str(file_get_contents('php://input'), $datos);

        if (isset($datos['id_reserva'])) {
            $id     = intval($datos['id_reserva']);
            $motivo = trim($datos['motivo'] ?? 'Cancelada por el administrador.');
            if (!$id) { echo json_encode(['error' => 'ID inválido.']); exit; }
            $stmt = $conexion->prepare("
                UPDATE reservas
                SET estado = 'cancelada', motivo_cancelacion = :motivo
                WHERE id_reserva = :id
            ");
            $stmt->execute([':id' => $id, ':motivo' => $motivo]);
            echo json_encode(['ok' => true, 'msg' => 'Reserva cancelada.']);
            exit;
        }

        $id = intval($datos['id'] ?? 0);
        if (!$id) { echo json_encode(['error' => 'ID inválido.']); exit; }

        // Marcar reservas como canceladas (no borrar) para que el usuario vea el aviso
        $stmt = $conexion->prepare("
            UPDATE reservas
            SET estado = 'cancelada',
                motivo_cancelacion = 'El lanzamiento fue eliminado por el administrador.'
            WHERE id_lanzamiento = :id
        ");
        $stmt->execute([':id' => $id]);

        $stmt = $conexion->prepare("DELETE FROM proximos_lanzamientos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // ── POST: añadir o editar próximo lanzamiento ─────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $id          = intval($_POST['id'] ?? 0);
        $nombre      = trim($_POST['nombre'] ?? '');
        $fecha       = trim($_POST['fecha_estreno'] ?? '');
        $url_trailer = trim($_POST['url_trailer'] ?? '');
        $texto_fecha = trim($_POST['texto_fecha'] ?? '');
        $precio      = floatval($_POST['precio'] ?? 0);

        if (!$nombre || !$fecha) {
            echo json_encode(['error' => 'Nombre y fecha son obligatorios.']);
            exit;
        }

        // Gestión de imagen
        $imagen = trim($_POST['imagen_actual'] ?? '');
        if (!empty($_FILES['imagen']['name'])) {
            $ext      = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            $permitidas = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
            if (!in_array($ext, $permitidas)) {
                echo json_encode(['error' => 'Formato de imagen no permitido.']);
                exit;
            }
            $nombreImg = 'prod_' . uniqid() . '.' . $ext;
            $destino   = '../../img/' . $nombreImg;
            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $destino)) {
                echo json_encode(['error' => 'No se pudo subir la imagen.']);
                exit;
            }
            $imagen = $nombreImg;
        }

        if (!$imagen) {
            echo json_encode(['error' => 'La imagen es obligatoria para nuevos lanzamientos.']);
            exit;
        }

        if ($id) {
            // Editar existente
            $stmt = $conexion->prepare("
                UPDATE proximos_lanzamientos
                SET nombre = :nombre, imagen = :imagen, fecha_estreno = :fecha,
                    url_trailer = :trailer, texto_fecha = :texto, precio = :precio
                WHERE id = :id
            ");
            $stmt->execute([
                ':nombre'  => $nombre,
                ':imagen'  => $imagen,
                ':fecha'   => $fecha,
                ':trailer' => $url_trailer,
                ':texto'   => $texto_fecha,
                ':precio'  => $precio,
                ':id'      => $id,
            ]);
            echo json_encode(['ok' => true, 'msg' => 'Lanzamiento actualizado.']);
        } else {
            // Añadir nuevo
            $stmt = $conexion->prepare("
                INSERT INTO proximos_lanzamientos (nombre, imagen, fecha_estreno, url_trailer, texto_fecha, precio)
                VALUES (:nombre, :imagen, :fecha, :trailer, :texto, :precio)
            ");
            $stmt->execute([
                ':nombre'  => $nombre,
                ':imagen'  => $imagen,
                ':fecha'   => $fecha,
                ':trailer' => $url_trailer,
                ':texto'   => $texto_fecha,
                ':precio'  => $precio,
            ]);
            echo json_encode(['ok' => true, 'id' => $conexion->lastInsertId()]);
        }
        exit;
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

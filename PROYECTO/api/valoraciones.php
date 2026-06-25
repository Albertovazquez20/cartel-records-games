<?php
// ==================== API VALORACIONES ====================
// GET  ?id_producto=X  → reseñas + nota media + si el usuario ya valoró
// POST (JSON body)     → inserta una nueva valoración (requiere sesión)

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include('../conexion/conexion.php');

// ── GET: obtener valoraciones de un producto ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_producto = intval($_GET['id_producto'] ?? 0);

    try {
        // Reseñas con el nombre del usuario
        $stmt = $conexion->prepare("
            SELECT v.id_valoracion, v.puntuacion, v.comentarios, v.fecha_valoracion,
                   u.nombre_usuario
            FROM valoraciones v
            JOIN usuarios u ON u.id_usuario = v.id_usuario
            WHERE v.id_producto = :id
            ORDER BY v.fecha_valoracion DESC
        ");
        $stmt->execute([':id' => $id_producto]);
        $resenas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Nota media y total de valoraciones
        $stmtMedia = $conexion->prepare("
            SELECT ROUND(AVG(puntuacion), 1) AS media, COUNT(*) AS total
            FROM valoraciones
            WHERE id_producto = :id
        ");
        $stmtMedia->execute([':id' => $id_producto]);
        $stats = $stmtMedia->fetch(PDO::FETCH_ASSOC);

        // ¿El usuario actual ya valoró este producto?
        $ya_valoro = false;
        $ha_comprado = false;
        if (!empty($_SESSION['id_usuario'])) {
            $stmtYa = $conexion->prepare("
                SELECT id_valoracion FROM valoraciones
                WHERE id_usuario = :uid AND id_producto = :pid
                LIMIT 1
            ");
            $stmtYa->execute([':uid' => $_SESSION['id_usuario'], ':pid' => $id_producto]);
            $ya_valoro = (bool) $stmtYa->fetch();

            // ¿Ha comprado este producto alguna vez?
            $stmtCompra = $conexion->prepare("
                SELECT dp.id_producto
                FROM detalles_pedido dp
                JOIN pedidos p ON p.id_pedido = dp.id_pedido
                WHERE p.id_usuario = :uid AND dp.id_producto = :pid
                LIMIT 1
            ");
            $stmtCompra->execute([':uid' => $_SESSION['id_usuario'], ':pid' => $id_producto]);
            $ha_comprado = (bool) $stmtCompra->fetch();
        }

        echo json_encode([
            'resenas'     => $resenas,
            'media'       => $stats['media'] ?? null,
            'total'       => (int)($stats['total'] ?? 0),
            'ya_valoro'   => $ya_valoro,
            'ha_comprado' => $ha_comprado,
            'sesion'      => !empty($_SESSION['id_usuario'])
        ]);

    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// ── POST: guardar una nueva valoración ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Requiere sesión iniciada
    if (empty($_SESSION['id_usuario'])) {
        echo json_encode(['error' => 'Debes iniciar sesión para valorar.']);
        exit;
    }

    $id_producto = intval($_POST['id_producto'] ?? 0);
    $puntuacion  = intval($_POST['puntuacion']  ?? 0);
    $comentarios = trim($_POST['comentarios']   ?? '');
    $id_usuario  = (int) $_SESSION['id_usuario'];

    try {
        // Comprobar si ya existe una valoración de este usuario para este producto
        $stmtCheck = $conexion->prepare("
            SELECT id_valoracion FROM valoraciones
            WHERE id_usuario = :uid AND id_producto = :pid
            LIMIT 1
        ");
        $stmtCheck->execute([':uid' => $id_usuario, ':pid' => $id_producto]);

        if ($stmtCheck->fetch()) {
            echo json_encode(['error' => 'Ya has valorado este producto.']);
            exit;
        }

        // Insertar la nueva valoración
        $stmtIns = $conexion->prepare("
            INSERT INTO valoraciones (id_usuario, id_producto, puntuacion, comentarios)
            VALUES (:uid, :pid, :punt, :com)
        ");
        $stmtIns->execute([
            ':uid'  => $id_usuario,
            ':pid'  => $id_producto,
            ':punt' => $puntuacion,
            ':com'  => $comentarios ?: null
        ]);

        echo json_encode(['ok' => true, 'message' => '¡Valoración guardada!']);

    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>

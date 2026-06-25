<?php
// ==================== API RESERVAS ====================
// GET  → devuelve las reservas del usuario
// POST → guarda una nueva reserva (con dirección si se proporciona)

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (empty($_SESSION['id_usuario'])) {
    echo json_encode(['error' => 'Debes iniciar sesión para gestionar reservas.']);
    exit;
}

include('../conexion/conexion.php');

$id_usuario = (int) $_SESSION['id_usuario'];
$metodo = $_SERVER['REQUEST_METHOD'];

try {

    if ($metodo === 'DELETE') {
        // ── Cancelar reserva ─────────────────────────────────────────────────
        $id_reserva = intval($_GET['id'] ?? 0);

        if (!$id_reserva) {
            echo json_encode(['error' => 'ID de reserva no válido.']);
            exit;
        }

        // Solo puede cancelar sus propias reservas
        $stmt = $conexion->prepare("
            DELETE FROM reservas
            WHERE id_reserva = :id AND id_usuario = :uid
        ");
        $stmt->execute([':id' => $id_reserva, ':uid' => $id_usuario]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['ok' => true]);
        } else {
            echo json_encode(['error' => 'Reserva no encontrada o sin permisos.']);
        }
        exit;
    }

    if ($metodo === 'POST') {
        // ── Guardar reserva ──────────────────────────────────────────────────
        $nombre_juego     = trim($_POST['nombre_juego']    ?? '');
        $imagen_juego     = trim($_POST['imagen_juego']    ?? '');
        $fecha_estreno    = trim($_POST['fecha_estreno']   ?? '');
        $id_lanzamiento   = intval($_POST['id_lanzamiento'] ?? 0) ?: null; // FK (nullable)

        if (!$nombre_juego) {
            echo json_encode(['error' => 'Nombre del juego requerido.']);
            exit;
        }

        // ── Dirección (opcional: si viene del modal) ─────────────────────────
        $id_direccion_existente = intval($_POST['id_direccion_existente'] ?? 0);

        if ($id_direccion_existente > 0) {
            // Verificar que la dirección pertenece al usuario
            $stmtCheck = $conexion->prepare("
                SELECT id_direccion FROM direcciones
                WHERE id_direccion = :did AND id_usuario = :uid LIMIT 1
            ");
            $stmtCheck->execute([':did' => $id_direccion_existente, ':uid' => $id_usuario]);
            if (!$stmtCheck->fetch()) {
                echo json_encode(['error' => 'Dirección no válida.']);
                exit;
            }
        } elseif (!empty($_POST['calle'])) {
            // Nueva dirección desde el formulario
            $calle     = trim($_POST['calle']            ?? '');
            $ciudad    = trim($_POST['ciudad']           ?? '');
            $provincia = trim($_POST['provincia']        ?? '');
            $pais      = trim($_POST['pais']             ?? '');
            $cp        = trim($_POST['codigo_postal']    ?? '');
            $tel       = trim($_POST['telefono_contacto'] ?? '');

            if (empty($calle) || empty($ciudad) || empty($provincia) || empty($pais) || empty($cp)) {
                echo json_encode(['error' => 'Faltan campos de la dirección.']);
                exit;
            }

            $stmtDir = $conexion->prepare("
                INSERT INTO direcciones (id_usuario, calle, ciudad, provincia, pais, codigo_postal, telefono_contacto)
                VALUES (:uid, :calle, :ciudad, :provincia, :pais, :cp, :tel)
            ");
            $stmtDir->execute([
                ':uid'       => $id_usuario,
                ':calle'     => $calle,
                ':ciudad'    => $ciudad,
                ':provincia' => $provincia,
                ':pais'      => $pais,
                ':cp'        => $cp,
                ':tel'       => $tel,
            ]);
        }

        // ── Insertar reserva (INSERT IGNORE evita duplicados por UNIQUE KEY) ────
        $metodo_pago = trim($_POST['metodo_pago'] ?? 'Contrarembolso');
        $metodos_validos = ['Tarjeta', 'PayPal', 'Contrarembolso'];
        if (!in_array($metodo_pago, $metodos_validos)) $metodo_pago = 'Contrarembolso';

        $stmt = $conexion->prepare("
            INSERT IGNORE INTO reservas
                (id_usuario, id_lanzamiento, nombre_juego, imagen_juego, fecha_estreno, metodo_pago)
            VALUES
                (:uid, :id_lanz, :juego, :imagen, :estreno, :metodo_pago)
        ");
        $stmt->execute([
            ':uid'         => $id_usuario,
            ':id_lanz'     => $id_lanzamiento,
            ':juego'       => $nombre_juego,
            ':imagen'      => $imagen_juego,
            ':estreno'     => $fecha_estreno ?: null,
            ':metodo_pago' => $metodo_pago,
        ]);

        if ($stmt->rowCount() === 0) {
            echo json_encode(['info' => 'Ya tienes una reserva para este juego.']);
        } else {
            echo json_encode(['ok' => true, 'message' => '¡Reserva confirmada! Te avisaremos cuando salga ' . $nombre_juego . '.']);
        }

    } else {
        // ── Devolver reservas del usuario (GET) ──────────────────────────────
        $stmt = $conexion->prepare("
            SELECT id_reserva, id_lanzamiento, nombre_juego, imagen_juego,
                   fecha_estreno, fecha_reserva, metodo_pago, estado, motivo_cancelacion
            FROM reservas
            WHERE id_usuario = :uid
            ORDER BY fecha_reserva DESC
        ");
        $stmt->execute([':uid' => $id_usuario]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

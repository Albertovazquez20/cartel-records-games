<?php
// ==================== API PERFIL ====================
// GET  → devuelve datos del usuario logueado
// POST → actualiza nombre_usuario, email y/o contraseña

session_start();
header('Content-Type: application/json');

if (empty($_SESSION['id_usuario'])) {
    echo json_encode(['error' => 'Sesión no iniciada.']);
    exit;
}

include('../conexion/conexion.php');

$id_usuario = (int) $_SESSION['id_usuario'];

try {
    // ── GET: devolver datos actuales ─────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conexion->prepare("
            SELECT nombre_usuario, email FROM usuarios WHERE id_usuario = :uid
        ");
        $stmt->execute([':uid' => $id_usuario]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            echo json_encode(['error' => 'Usuario no encontrado.']);
            exit;
        }

        echo json_encode($usuario);
        exit;
    }

    // ── POST: actualizar datos ───────────────────────────────────────────────
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $nombre_nuevo = trim($_POST['nombre_usuario'] ?? '');
        $email_nuevo  = trim($_POST['email'] ?? '');
        $pass_actual  = $_POST['password_actual'] ?? '';
        $pass_nueva   = $_POST['password_nueva'] ?? '';

        if (empty($nombre_nuevo) || empty($email_nuevo)) {
            echo json_encode(['error' => 'El nombre y el email son obligatorios.']);
            exit;
        }

        // Comprobar si el nombre de usuario ya lo usa otro usuario
        $stmtCheck = $conexion->prepare("
            SELECT id_usuario FROM usuarios
            WHERE nombre_usuario = :nombre AND id_usuario != :uid
        ");
        $stmtCheck->execute([':nombre' => $nombre_nuevo, ':uid' => $id_usuario]);
        if ($stmtCheck->fetch()) {
            echo json_encode(['error' => 'Ese nombre de usuario ya está en uso.']);
            exit;
        }

        // Si quiere cambiar contraseña, validar la actual
        $nuevaContrasena = null;
        if (!empty($pass_nueva)) {
            if (empty($pass_actual)) {
                echo json_encode(['error' => 'Debes introducir tu contraseña actual para cambiarla.']);
                exit;
            }

            // Verificar contraseña actual
            $stmtPass = $conexion->prepare("SELECT contrasena FROM usuarios WHERE id_usuario = :uid");
            $stmtPass->execute([':uid' => $id_usuario]);
            $row = $stmtPass->fetch(PDO::FETCH_ASSOC);

            if (!password_verify($pass_actual, $row['contrasena'])) {
                echo json_encode(['error' => 'La contraseña actual no es correcta.']);
                exit;
            }

            if (strlen($pass_nueva) < 6) {
                echo json_encode(['error' => 'La nueva contraseña debe tener al menos 6 caracteres.']);
                exit;
            }

            $nuevaContrasena = password_hash($pass_nueva, PASSWORD_DEFAULT);
        }

        // Actualizar en la BD
        if ($nuevaContrasena) {
            $stmt = $conexion->prepare("
                UPDATE usuarios
                SET nombre_usuario = :nombre, email = :email, contrasena = :pass
                WHERE id_usuario = :uid
            ");
            $stmt->execute([
                ':nombre' => $nombre_nuevo,
                ':email'  => $email_nuevo,
                ':pass'   => $nuevaContrasena,
                ':uid'    => $id_usuario
            ]);
        } else {
            $stmt = $conexion->prepare("
                UPDATE usuarios
                SET nombre_usuario = :nombre, email = :email
                WHERE id_usuario = :uid
            ");
            $stmt->execute([
                ':nombre' => $nombre_nuevo,
                ':email'  => $email_nuevo,
                ':uid'    => $id_usuario
            ]);
        }

        // Actualizar sesión con el nuevo nombre
        $_SESSION['nombre_usuario'] = $nombre_nuevo;
        $_SESSION['email']          = $email_nuevo;

        echo json_encode(['ok' => true, 'nombre_usuario' => $nombre_nuevo]);
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>

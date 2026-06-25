<?php
// ==================== API DIRECCIONES ====================
// GET → devuelve las direcciones guardadas del usuario

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Sin sesión → array vacío (el JS lo interpreta como "sin direcciones")
if (empty($_SESSION['id_usuario'])) {
    echo json_encode([]);
    exit;
}

include('../conexion/conexion.php');

try {
    $stmt = $conexion->prepare("
        SELECT id_direccion, calle, ciudad, provincia, pais, codigo_postal, telefono_contacto
        FROM direcciones
        WHERE id_usuario = :uid
        ORDER BY id_direccion DESC
    ");
    $stmt->execute([':uid' => (int) $_SESSION['id_usuario']]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
